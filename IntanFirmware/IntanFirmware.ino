#include "Header.h"

void setup() {
  usbSerial.begin(&Serial, 115200);
  task.initialize(wifiTask);

  sensor.addModule("rfid", new RFID_Mfrc522(5, 27));
  sensor.addModule("sonar", new UltrasonicSens(32, 33));
  sensor.addModule("lCell", new HX711Sens(25, 26, HX711Sens::KG));
  sensor.init([]() {
    auto loadCell = sensor.getModule<HX711Sens>("lCell");
    preferences.begin("intan", false);
    float cal = preferences.getFloat("cal", -22.5);
    loadCell->setScale(cal);
    loadCell->tare();
    preferences.end();

    Serial.print("| cal: ");
    Serial.print(cal);
    Serial.println();
  });
  buzzer.toggleInit(100, 5);
}

void loop() {
  sensor.update([]() {
    String uuid = sensor["rfid"].as<String>();
    if (!uuid.isEmpty()) {
      sensor.debug();
    }
  });
  usbSerial.receive(usbCommunicationTask);

  DigitalIn::updateAll(&buttonDown, &buttonOk, DigitalIn::stop());
  DigitalOut::updateAll(&buzzer, DigitalOut::stop());
}
