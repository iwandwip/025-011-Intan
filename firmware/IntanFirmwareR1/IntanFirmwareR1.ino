#include "Header.h"

void setup() {
  serialCommunication.begin(&Serial, 115200);
  Serial.println("=== INTAN System Starting ===");

  stateMutex = xSemaphoreCreateMutex();
  dataReadyMutex = xSemaphoreCreateMutex();
  displayUpdateMutex = xSemaphoreCreateMutex();
  
  if (!stateMutex || !dataReadyMutex || !displayUpdateMutex) {
    Serial.println("ERROR: Failed to create mutexes!");
    while(1) delay(1000);
  }

  devicePreferences.begin("intan", false);
  SENSOR_HEIGHT_POLE = devicePreferences.getFloat("heightPole", 199.0);
  devicePreferences.end();

  Serial.printf("Height pole: %.1f cm\n", SENSOR_HEIGHT_POLE);

  displayMenu.flipVertical(true);
  displayMenu.initialize(true, initializeDisplayCallback, true);
  
  initializeSensorModules();
  
  wifiTask.initialize(wifiTaskHandler);
  
  systemBuzzer.toggleInit(100, 5);
  Serial.println("=== System Ready ===");
}

void loop() {
  updateSensorData();
  
  handleUserInput();
  
  updateDisplayInterface();
  
  serialCommunication.receive(handleUSBCommand);

  DigitalIn::updateAll(&confirmButton, &navigateButton, DigitalIn::stop());
  DigitalOut::updateAll(&systemBuzzer, DigitalOut::stop());
}

void initializeSensorModules() {
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
}

void updateSensorData() {
  sensorManager.update([]() {
    if (xSemaphoreTake(dataReadyMutex, pdMS_TO_TICKS(10)) == pdTRUE) {
      String newRfidTag = sensorManager["rfid"].as<String>();
      float rawWeight = sensorManager["loadcell"];
      float rawHeight = sensorManager["ultrasonic"];
      
      rawHeight = SENSOR_HEIGHT_POLE - rawHeight;
      rawHeight = constrain(rawHeight, 0, SENSOR_HEIGHT_POLE);
      
      weightFilter.addMeasurement(rawWeight);
      rawWeight = abs(weightFilter.getFilteredValue());
      rawWeight = rawWeight < 1.0 ? 0.0 : rawWeight;
      
      currentRfidTag = newRfidTag;
      currentWeight = rawWeight;
      currentHeight = rawHeight;
      newSensorData = true;
      
      xSemaphoreGive(dataReadyMutex);
    }
  });
}

void handleUserInput() {
  MenuCursor cursor{
    .up = false,
    .down = navigateButton.isPressed(),
    .select = confirmButton.isPressed(),
    .back = false,
    .show = true
  };
  
  if (xSemaphoreTake(displayUpdateMutex, pdMS_TO_TICKS(5)) == pdTRUE) {
    displayMenu.onListen(&cursor, displayMenuCallback);
    xSemaphoreGive(displayUpdateMutex);
  }
}

void updateDisplayInterface() {
  if (xSemaphoreTake(stateMutex, pdMS_TO_TICKS(5)) == pdTRUE) {
    switch (currentSystemState) {
      case SYSTEM_IDLE:
        displayIdleScreen();
        break;
      case SYSTEM_RFID_PAIRING:
        displayRFIDPairingScreen();
        break;
      case SYSTEM_WEIGHING_SESSION:
        displayWeighingScreen();
        break;
      case SYSTEM_QUICK_MEASURE:
        displayQuickMeasureScreen();
        break;
      case SYSTEM_ADMIN_MODE:
        displayAdminScreen();
        break;
      default:
        displayStartupScreen();
        break;
    }
    xSemaphoreGive(stateMutex);
  }
}

float calculateBMI(float weight, float height) {
  if (height <= 0 || weight <= 0) return 0.0;
  float bmi = weight / ((height / 100) * (height / 100));
  return (isinf(bmi) || isnan(bmi)) ? 0.0 : bmi;
}

String getBMICategory(float bmi) {
  if (bmi < 18.5) return "Kurang";
  else if (bmi >= 18.5 && bmi < 24.9) return "Ideal";
  else if (bmi >= 25 && bmi < 29.9) return "Lebih";
  else return "Obesitas";
}

void changeSystemState(SystemState newState) {
  if (xSemaphoreTake(stateMutex, pdMS_TO_TICKS(100)) == pdTRUE) {
    currentSystemState = newState;
    Serial.printf("State changed to: %d\n", newState);
    xSemaphoreGive(stateMutex);
  }
}