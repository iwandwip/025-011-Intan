#include "Header.h"

void setup() {
  usbSerial.begin(&Serial, 115200);

  preferences.begin("intan", false);
  userNumber = preferences.getULong("userNumber", 0);
  preferences.end();

  Serial.print("| userNumber: ");
  Serial.print(userNumber);
  Serial.println();

  menu.flipVertical(true);
  menu.initialize(true, initDisplayCallback, true);
  // task.initialize(wifiTask);

  sensor.addModule("rfid", new RFID_Mfrc522(5, 27));
  sensor.addModule("sonar", new UltrasonicSens(32, 33, 200, 1, 1, 1000, 10));
  sensor.addModule("lCell", new HX711Sens(26, 25, HX711Sens::KG, 0.25, 5, 2000, 0.25));
  sensor.init([]() {
    auto loadCell = sensor.getModule<HX711Sens>("lCell");
    preferences.begin("intan", false);
    float cal = preferences.getFloat("cal", -22.5);
    preferences.end();
    loadCell->setScale(cal);
    loadCell->tare();

    Serial.print("| cal: ");
    Serial.print(cal);
    Serial.println();
  });
  buzzer.toggleInit(100, 5);
}

void loop() {
  sensor.update([]() {
    uuidRFIDNow = sensor["rfid"].as<String>();
    weight = sensor["lCell"];
    height = sensor["sonar"];
    height = heightPole - height;
    height = constrain(height, 0, heightPole);

    loadCellFilter.addMeasurement(weight);
    weight = abs(loadCellFilter.getFilteredValue());
    weight = weight < 1.0 ? 0.0 : weight;
    // sensor.debug();

    // weight = random(40, 50);
    // height = random(150, 165);

    Serial.print("| height: ");
    Serial.print(height);
    Serial.println();
  });

  MenuCursor cursor{
    .up = false,
    .down = buttonDown.isPressed(),
    .select = buttonOk.isPressed(),
    .back = false,
    .show = true
  };
  menu.onListen(&cursor, lcdMenuCallbackCustom);
  usbSerial.receive(usbCommunicationTask);

  DigitalIn::updateAll(&buttonOk, &buttonDown, DigitalIn::stop());
  DigitalOut::updateAll(&buzzer, DigitalOut::stop());
}

float calculateBMI(float weight, float height) {
  float bmi = weight / ((height / 100) * (height / 100));
  bmi = (isinf(bmi) || isnan(bmi)) ? 0.0 : bmi;
  return bmi;
}
