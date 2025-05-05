#include "Header.h"

void setup() {
  usbSerial.begin(&Serial, 115200);

  preferences.begin("intan", false);
  userCount = preferences.getULong("userCount", 0);
  preferences.end();

  Serial.print("| userCount: ");
  Serial.print(userCount);
  Serial.println();

  menu.flipVertical(true);
  menu.initialize(true, initDisplayCallback, true);
  task.initialize(wifiTask);

  sensor.addModule("rfid", new RFID_Mfrc522(5, 27));
  sensor.addModule("sonar", new UltrasonicSens(32, 33));
  sensor.addModule("lCell", new HX711Sens(26, 25, HX711Sens::KG, 0.5, 5, 1000, 5.0));
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
    uuidRFID = sensor["rfid"].as<String>();
    weight = sensor["lCell"];
    height = sensor["sonar"];
    height = 0.0;

    loadCellFilter.addMeasurement(weight);
    weight = abs(loadCellFilter.getFilteredValue());
    weight = weight < 1.0 ? 0.0 : weight;
    // sensor.debug();

    Serial.print("| weight: ");
    Serial.print(weight);
    Serial.println();
  });

  MenuCursor cursor{
    .up = false,
    .down = buttonDown.isPressed(),
    .select = buttonOk.isPressed(),
    .back = false,
    .show = true
  };
  menu.onListen(&cursor, lcdMenuCallback);
  usbSerial.receive(usbCommunicationTask);

  DigitalIn::updateAll(&buttonOk, &buttonDown, DigitalIn::stop());
  DigitalOut::updateAll(&buzzer, DigitalOut::stop());
}
