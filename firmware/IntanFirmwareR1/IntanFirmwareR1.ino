#include "Header.h"

void setup() {
  // Initialize serial communication
  serialCommunication.begin(&Serial, 115200);
  Serial.println("=== INTAN System Starting ===");

  // Load device preferences
  devicePreferences.begin("intan", false);
  SENSOR_HEIGHT_POLE = devicePreferences.getFloat("heightPole", 199.0);
  devicePreferences.end();
  Serial.printf("Height pole: %.1f cm\n", SENSOR_HEIGHT_POLE);

  // Initialize display
  displayMenu.flipVertical(true);
  displayMenu.initialize(true, initializeDisplayCallback, true);

  // Initialize sensor modules
  sensorManager.addModule("rfid", new RFID_Mfrc522(5, 27));
  sensorManager.addModule("ultrasonic", new UltrasonicSens(32, 33, 200, 1, 1, 1000, 10));
  sensorManager.addModule("loadcell", new HX711Sens(26, 25, HX711Sens::KG, 0.25, 5, 2000, 0.25));
  sensorManager.init([]() {
    auto loadCell = sensorManager.getModule<HX711Sens>("loadcell");
    devicePreferences.begin("intan", false);
    float calibrationFactor = devicePreferences.getFloat("calibration", -22.5);
    devicePreferences.end();
    loadCell->setScale(calibrationFactor);
    loadCell->tare();
    Serial.printf("Load cell calibration: %.2f\n", calibrationFactor);
  });

  // Initialize KNN
  initKNNMethods();

  // Initialize WiFi task
  wifiTask.initialize(wifiTaskHandler);

  // System ready signal
  systemBuzzer.toggleInit(100, 5);
  Serial.println("=== System Ready ===");
}

void loop() {
  // Update sensor data
  if (testingModeEnabled) {
    currentRfidTag = testRfidTag;
    currentWeight = testWeight;
    currentHeight = testHeight;
    newSensorData = true;
  } else {
    sensorManager.update([]() {
      String newRfidTag = sensorManager["rfid"].as<String>();
      float rawWeight = sensorManager["loadcell"];
      float rawHeight = sensorManager["ultrasonic"];
      rawHeight = SENSOR_HEIGHT_POLE - rawHeight;
      rawHeight = constrain(rawHeight, 0, SENSOR_HEIGHT_POLE);
      weightFilter.addMeasurement(rawWeight);
      rawWeight = abs(weightFilter.getFilteredValue());
      rawWeight = rawWeight < 1.0 ? 0.0 : rawWeight;
      currentRfidTag = newRfidTag;
      // Limit to 2 decimal places
      currentWeight = round(rawWeight * 100) / 100.0;
      currentHeight = round(rawHeight * 100) / 100.0;
      newSensorData = true;
      if (!currentRfidTag.isEmpty()) {
        Serial.print("| currentRfidTag: ");
        Serial.print(currentRfidTag);
        Serial.println();
      }
    });
  }

  // Handle user input
  MenuCursor cursor{
    .up = false,
    .down = navigateButton.isPressed(),
    .select = confirmButton.isReleased(),
    .back = false,
    .show = true
  };
  displayMenu.onListen(&cursor, displayMenuCallback);

  // Update display interface
  if (needDisplayUpdate) {
    currentSystemState = pendingSystemState;
    needDisplayUpdate = false;
    Serial.print("| State updated to: ");
    Serial.println(currentSystemState);
  }
  displayMenuCallback();

  // Mode-based system is now fully handled in WiFi.ino wifiTaskHandler()

  // Handle serial commands
  serialCommunication.receive(handleUSBCommand);

  // Update digital inputs/outputs
  DigitalIn::updateAll(&confirmButton, &navigateButton, DigitalIn::stop());
  DigitalOut::updateAll(&systemBuzzer, DigitalOut::stop());

  // Handle calibration requests
  if (requestCalibration) {
    auto loadCell = sensorManager.getModule<HX711Sens>("loadcell");
    if (loadCell) {
      loadCell->tare();
      Serial.println("Load cell tared for calibration");
    }
    requestCalibration = false;
  }

  if (requestTare) {
    auto loadCell = sensorManager.getModule<HX711Sens>("loadcell");
    if (loadCell) {
      loadCell->tare();
      Serial.println("Load cell tared successfully");
    }
    requestTare = false;
  }
}