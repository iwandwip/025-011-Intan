void handleUSBCommand(const String& receivedData) {
  String data = receivedData;
  String commandHeader = serialCommunication.getStrData(receivedData, 0, "#");
  String commandValue = serialCommunication.getStrData(receivedData, 1, "#");

  Serial.printf("USB Command: %s\n", receivedData.c_str());

  if (isDigit(data[0]) || isDigit(data[1])) {
    return;
  }

  commandHeader.toUpperCase();
  
  if (commandHeader == "R" || commandHeader == "RESTART") {
    Serial.println("System restart requested");
    ESP.restart();
  }
  
  if (commandHeader == "HEIGHT_POLE") {
    float newHeight = commandValue.toFloat();
    if (newHeight > 0 && newHeight < 300) {
      SENSOR_HEIGHT_POLE = newHeight;
      devicePreferences.begin("intan", false);
      devicePreferences.putFloat("heightPole", SENSOR_HEIGHT_POLE);
      devicePreferences.end();
      Serial.printf("Height pole updated to: %.1f cm\n", SENSOR_HEIGHT_POLE);
    }
  }
  
  
  if (commandHeader == "STATE") {
    if (commandValue == "IDLE") {
      changeSystemState(SYSTEM_IDLE);
    } else if (commandValue == "PAIRING") {
      changeSystemState(SYSTEM_RFID_PAIRING);
    } else if (commandValue == "WEIGHING") {
      changeSystemState(SYSTEM_WEIGHING_SESSION);
    } else if (commandValue == "ADMIN") {
      changeSystemState(SYSTEM_ADMIN_MODE);
    }
  }
  
  if (commandHeader == "SYNC" || commandHeader == "FORCE_SYNC") {
    forceFirebaseSync = true;
    Serial.println("Forced Firebase sync");
  }
  
  if (commandHeader == "STATUS") {
    Serial.printf("System State: %d\n", currentSystemState);
    Serial.printf("Weighing State: %d\n", currentWeighingState);
    Serial.printf("Weight: %.2f Kg\n", currentWeight);
    Serial.printf("Height: %.2f cm\n", currentHeight);
    Serial.printf("RFID: %s\n", currentRfidTag.c_str());
    Serial.printf("System Initialized: %s\n", systemInitialized ? "Yes" : "No");
    Serial.printf("Active Session: %s\n", currentSession.isActive ? "Yes" : "No");
  }
  
  if (commandHeader == "CALIBRATE") {
    performLoadCellCalibration();
  }
  
  if (commandHeader == "TARE") {
    performLoadCellTare();
  }
  
  
  
}