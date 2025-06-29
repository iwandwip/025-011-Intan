#include "Header.h"

void setup() {
  debug.begin();
  debug.useUserDefinedLogLevels();
  LOG_INFO = debug.createLogLevel("LOG_INFO");
  LOG_SENSOR = debug.createLogLevel("LOG_SENSOR");
  LOG_COMS = debug.createLogLevel("LOG_COMS");
  debug.enableLogLevel(LOG_COMS);
  usbSerial.begin(&Serial);
  task.initialize();
  task.setInitCoreID(1);
  task.createTask(10000, wifiTask);
  sensor.addModule("rfid", new RFID_Mfrc522(5, 27));
  sensor.addModule("ultrasonic", new UltrasonicSens(32, 33, 200, 1, 1, 1000, 10));
  sensor.addModule("loadcell", new HX711Sens(26, 25, HX711Sens::KG, 0.25, 5, 2000, 0.25));
  sensor.init([]() {
    auto loadCell = sensor.getModule<HX711Sens>("loadcell");
    preferences.begin("intan", false);
    float calibrationFactor = preferences.getFloat("calibration", -22.5);
    preferences.end();
    loadCell->setScale(calibrationFactor);
    loadCell->tare();
    Serial.printf("Load cell calibration: %.2f\n", calibrationFactor);
  });

  buzzer.toggleInit(100, 5);
}

void loop() {
  sensor.update([]() {
    String newRfid = sensor["rfid"].as<String>();
    weight = sensor["loadcell"];
    height = sensor["ultrasonic"];

    // height = poleHeight - height;
    // height = constrain(height, 0, poleHeight);
    // weightFilter.addMeasurement(weight);
    // weight = abs(weightFilter.getFilteredValue());
    // weight = weight < 1.0 ? 0.0 : weight;

    weight = round(weight * 100) / 100.0;
    height = round(height * 100) / 100.0;
    if (!newRfid.isEmpty() && mode != "idle") {
      rfid = newRfid;
      Serial.print("| rfid: ");
      Serial.print(rfid);
      Serial.println();
    }
  });

  // Serial.print("| weight: ");
  // Serial.print(weight);
  // Serial.print("| height: ");
  // Serial.print(height);
  // Serial.println();

  // debug.startPrint(LOG_SENSOR);
  // debug.continuePrint("weight", weight, LOG_SENSOR);
  // debug.continuePrint("height", height, LOG_SENSOR);
  // debug.endPrint(LOG_SENSOR, true);
  // usbSerial.receiveString(usbCommunicationCallback);

  DigitalIn::updateAll(&buttonDown, &buttonOk, DigitalIn::stop());
  DigitalOut::updateAll(&buzzer, DigitalOut::stop());
}
