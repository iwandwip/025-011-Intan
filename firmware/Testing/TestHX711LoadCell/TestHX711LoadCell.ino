#define ENABLE_SENSOR_MODULE
#define ENABLE_SENSOR_MODULE_UTILITY
#define ENABLE_SENSOR_HX711

#include "Kinematrix.h"
#include "Preferences.h"

Preferences preferences;
SensorModule sensor;

MovingAverageFilter loadCellFilter(10);

float weight = 0.0;

void setup() {
  Serial.begin(115200);
  sensor.addModule("lCell", new HX711Sens(26, 25, HX711Sens::KG, 0.5, 5, 1000, 5.0));
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
    weight = sensor["lCell"];
    loadCellFilter.addMeasurement(weight);
    weight = abs(loadCellFilter.getFilteredValue());

    Serial.print("| weight: ");
    Serial.print(weight);
    Serial.println();
    // sensor.debug();
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
      float cal = loadCell->getCalibrateFactor(units, 2000);
      Serial.printf("| Cal Factor: %.2f\n", cal);

      preferences.begin("intan", false);
      preferences.putFloat("cal", cal);
      preferences.end();

      loadCell->setScale(cal);
      Serial.println("| Tare");
      delay(10000);

      loadCell->tare();
      Serial.println("| Done");
    } else if (incomingMsg == "PARAMS") {
      auto loadCell = sensor.getModule<HX711Sens>("lCell");
      Serial.println("| Konfigurasi Parameter Stabilitas");
      Serial.println("| Format: TOLERANCE,SAMPLES,TIME,THRESHOLD");
      Serial.println("| Contoh: 0.3,10,2000,10.0");

      while (!Serial.available()) {
        delay(100);
      }

      String params = Serial.readStringUntil('\n');
      params.trim();

      int commaIndex1 = params.indexOf(',');
      int commaIndex2 = params.indexOf(',', commaIndex1 + 1);
      int commaIndex3 = params.indexOf(',', commaIndex2 + 1);

      if (commaIndex1 > 0 && commaIndex2 > 0 && commaIndex3 > 0) {
        float tolerance = params.substring(0, commaIndex1).toFloat();
        int samples = params.substring(commaIndex1 + 1, commaIndex2).toInt();
        int time = params.substring(commaIndex2 + 1, commaIndex3).toInt();
        float threshold = params.substring(commaIndex3 + 1).toFloat();

        loadCell->setStabilityTolerance(tolerance);
        loadCell->setSampleCount(samples);
        loadCell->setStabilityTime(time);
        loadCell->setResetThreshold(threshold);

        Serial.println("| Parameter diperbarui");
        Serial.printf("| Toleransi: %.2f kg\n", tolerance);
        Serial.printf("| Sampel: %d\n", samples);
        Serial.printf("| Waktu: %d ms\n", time);
        Serial.printf("| Threshold: %.2f kg\n", threshold);
      } else {
        Serial.println("| Format tidak valid");
      }
    } else if (incomingMsg == "RESET") {
      auto loadCell = sensor.getModule<HX711Sens>("lCell");
      loadCell->resetLock();
      Serial.println("| Penguncian direset");
    }
  }
}