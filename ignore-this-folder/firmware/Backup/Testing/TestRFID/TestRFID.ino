#define ENABLE_SENSOR_MODULE
#define ENABLE_SENSOR_MODULE_UTILITY
#define ENABLE_SENSOR_RFID

#include "Kinematrix.h"

SensorModule sensor;

void setup() {
  Serial.begin(115200);
  sensor.addModule("rfid", new RFID_Mfrc522(5, 27));
  sensor.init();
}

void loop() {
  sensor.update([]() {
    String uuid = sensor["rfid"].as<String>();
    if (!uuid.isEmpty()) {
      Serial.println(uuid);
    }
  });
}
