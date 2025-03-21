#define ENABLE_SENSOR_MODULE
#define ENABLE_SENSOR_MODULE_UTILITY
#define ENABLE_SENSOR_HX711

#include "Kinematrix.h"
#include "Preferences.h"

Preferences preferences;
SensorModule sensor;

void setup() {
  Serial.begin(115200);
  sensor.addModule("lCell", new HX711Sens(26, 13, HX711Sens::KG));
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
}

void loop() {
  calibrateLoadcell();
  sensor.update([]() {
    sensor.debug();
  });
}

void calibrateLoadcell() {
  if (Serial.available()) {
    String incomingMsg = Serial.readStringUntil('\n');
    incomingMsg.trim();
    if (incomingMsg == "CAL") {
      auto loadCell = sensor.getModule<HX711Sens>("lCell");
      Serial.println("| Hilangkan Semua Objek");
      loadCell->setScaleDelay(10000);
      Serial.println("| Letakan Objek Terukur");
      loadCell->tareDelay(10000);

      float units = loadCell->getUnits(10);
      float cal = loadCell->getCalibrateFactor(units, 2000);  // 2 Kg
      Serial.printf("| Cal Factor: %.2f\n", cal);

      preferences.begin("intan", false);
      preferences.putFloat("cal", cal);
      preferences.end();

      loadCell->setScale(cal);
      Serial.println("| Tare");
      delay(10000);

      loadCell->tare();
      Serial.println("| Done");
    }
  }
}
