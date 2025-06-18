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
    Serial.printf("Testing Mode: %s\n", testingModeEnabled ? "ON" : "OFF");
    if (testingModeEnabled) {
      Serial.printf("Test RFID: %s\n", testRfidTag.c_str());
      Serial.printf("Test Weight: %.2f Kg\n", testWeight);
      Serial.printf("Test Height: %.2f cm\n", testHeight);
    }
  }

  if (commandHeader == "CALIBRATE") {
    performLoadCellCalibration();
  }

  if (commandHeader == "TARE") {
    performLoadCellTare();
  }

  // Testing Mode Commands
  if (commandHeader == "TEST_MODE") {
    if (commandValue == "ON" || commandValue == "1" || commandValue == "ENABLE") {
      testingModeEnabled = true;
      Serial.println("Testing Mode: ENABLED");
      Serial.println("You can now set manual values:");
      Serial.println("  TEST_RFID#<rfid_value>");
      Serial.println("  TEST_WEIGHT#<weight_kg>");
      Serial.println("  TEST_HEIGHT#<height_cm>");
    } else if (commandValue == "OFF" || commandValue == "0" || commandValue == "DISABLE") {
      testingModeEnabled = false;
      testRfidTag = "";
      testWeight = 0.0;
      testHeight = 0.0;
      Serial.println("Testing Mode: DISABLED");
    } else {
      Serial.printf("Testing Mode is currently: %s\n", testingModeEnabled ? "ON" : "OFF");
    }
  }

  if (commandHeader == "TEST_RFID") {
    if (testingModeEnabled) {
      testRfidTag = commandValue;
      Serial.printf("Test RFID set to: %s\n", testRfidTag.c_str());
    } else {
      Serial.println("Error: Testing mode is not enabled. Use TEST_MODE#ON first.");
    }
  }

  if (commandHeader == "TEST_WEIGHT") {
    if (testingModeEnabled) {
      float newWeight = commandValue.toFloat();
      if (newWeight >= 0 && newWeight <= 200) {
        testWeight = newWeight;
        Serial.printf("Test Weight set to: %.2f Kg\n", testWeight);
      } else {
        Serial.println("Error: Weight must be between 0-200 Kg");
      }
    } else {
      Serial.println("Error: Testing mode is not enabled. Use TEST_MODE#ON first.");
    }
  }

  if (commandHeader == "TEST_HEIGHT") {
    if (testingModeEnabled) {
      float newHeight = commandValue.toFloat();
      if (newHeight >= 0 && newHeight <= 250) {
        testHeight = newHeight;
        Serial.printf("Test Height set to: %.2f cm\n", testHeight);
      } else {
        Serial.println("Error: Height must be between 0-250 cm");
      }
    } else {
      Serial.println("Error: Testing mode is not enabled. Use TEST_MODE#ON first.");
    }
  }

  if (commandHeader == "HELP" || commandHeader == "?") {
    Serial.println("=== Available USB Commands ===");
    Serial.println("Basic Commands:");
    Serial.println("  R or RESTART - Restart the system");
    Serial.println("  STATUS - Show system status");
    Serial.println("  SYNC - Force Firebase sync");
    Serial.println("Configuration:");
    Serial.println("  HEIGHT_POLE#<value> - Set height pole (cm)");
    Serial.println("  STATE#<IDLE|PAIRING|WEIGHING|ADMIN> - Change system state");
    Serial.println("Calibration:");
    Serial.println("  CALIBRATE - Start load cell calibration");
    Serial.println("  TARE - Tare the load cell");
    Serial.println("Testing Mode:");
    Serial.println("  TEST_MODE#<ON|OFF> - Enable/disable testing mode");
    Serial.println("  TEST_RFID#<value> - Set manual RFID (testing mode only)");
    Serial.println("  TEST_WEIGHT#<kg> - Set manual weight (testing mode only)");
    Serial.println("  TEST_HEIGHT#<cm> - Set manual height (testing mode only)");
    Serial.println("================================");
  }
}