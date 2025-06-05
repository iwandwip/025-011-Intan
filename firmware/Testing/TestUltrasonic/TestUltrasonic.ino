#define ENABLE_SENSOR_MODULE
#define ENABLE_SENSOR_MODULE_UTILITY
#define ENABLE_SENSOR_ULTRASONIC

#include "Kinematrix.h"

SensorModule sensor;

void setup() {
  Serial.begin(115200);
  sensor.addModule("sonar", new UltrasonicSens(32, 33));
  sensor.init();
}

void loop() {
  sensor.update([]() {
    sensor.debug();
  });
}
