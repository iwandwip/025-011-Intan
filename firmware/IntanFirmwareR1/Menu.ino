void displayMenuCallback() {
  // Update current state if there's a pending change
  if (needDisplayUpdate) {
    currentSystemState = pendingSystemState;
    needDisplayUpdate = false;
    Serial.print("| Display callback - state updated to: ");
    Serial.println(currentSystemState);
  }

  // Display based on current state (no mutex needed)
  switch (currentSystemState) {
    case SYSTEM_STARTUP:
      displayStartupScreen();
      break;
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
  }
}

void displayStartupScreen() {
  const char* startupLines[] = { "System Starting", "Please Wait...", "Connecting to WiFi" };
  displayMenu.renderBoxedText(startupLines, 3);
}

void displayIdleScreen() {
  if (!systemInitialized) {
    displayStartupScreen();
    return;
  }

  if (testingModeEnabled) {
    const char* idleLines[] = { "System Ready", "[TEST MODE]", "Use USB commands" };
    displayMenu.renderBoxedText(idleLines, 3);
  } else {
    const char* idleLines[] = { "System Ready", "Please select menu", "on your app" };
    displayMenu.renderBoxedText(idleLines, 3);
  }

  if (!currentRfidTag.isEmpty()) {
    forceFirebaseSync = true;
  }
}

void displayRFIDPairingScreen() {
  const char* pairingLines[] = { "RFID Pairing Mode", "Tap your RFID card", "to pair device" };
  displayMenu.renderBoxedText(pairingLines, 3);

  if (!currentRfidTag.isEmpty()) {
    const char* detectedLines[] = { "RFID Detected!", currentRfidTag.c_str(), "Processing..." };
    displayMenu.renderBoxedText(detectedLines, 3);
    statusLed.on();
  }
}

void displayWeighingScreen() {
  switch (currentWeighingState) {
    case WEIGHING_RFID_CONFIRMATION:
      displayWeighingRFIDConfirmation();
      break;
    case WEIGHING_GET_WEIGHT:
      displayWeighingGetWeight();
      break;
    case WEIGHING_GET_HEIGHT:
      displayWeighingGetHeight();
      break;
    case WEIGHING_VALIDATE_DATA:
      displayWeighingValidateData();
      break;
    case WEIGHING_SEND_DATA:
      displayWeighingSendData();
      break;
    case WEIGHING_COMPLETE:
      displayWeighingComplete();
      break;
    default:
      displayWeighingRFIDConfirmation();
      break;
  }
}

void displayWeighingRFIDConfirmation() {
  const char* confirmLines[] = { "Weighing Session", "Tap RFID to confirm", "your identity" };
  displayMenu.renderBoxedText(confirmLines, 3);

  if (!currentRfidTag.isEmpty() && currentRfidTag == currentSessionUser.rfidTag) {
    currentWeighingState = WEIGHING_GET_WEIGHT;
    systemBuzzer.toggleInit(100, 2);
    currentRfidTag = "";
  }
}

void displayWeighingGetWeight() {
  String weightStr = String(currentWeight, 1) + " Kg";
  if (testingModeEnabled) {
    weightStr += " [TEST]";
  }
  String patternInfo = "Pattern: " + getEatingPatternString(currentMeasurement.eatingPatternIndex);
  String responseInfo = "Response: " + getChildResponseString(currentMeasurement.childResponseIndex);

  const char* weightLines[] = { "Get Weight", weightStr.c_str(), patternInfo.c_str(), responseInfo.c_str() };
  displayMenu.renderBoxedText(weightLines, 4);

  if (confirmButton.isPressed()) {
    currentMeasurement.weight = currentWeight;
    currentWeighingState = WEIGHING_GET_HEIGHT;
    systemBuzzer.toggleInit(100, 1);
  }

  if (navigateButton.isLongPressed(2000)) {
    navigateButton.resetState();
    backToIdleState();
  }
}

void displayWeighingGetHeight() {
  String heightStr = String(currentHeight, 1) + " cm";
  if (testingModeEnabled) {
    heightStr += " [TEST]";
  }
  String childInfo = currentSessionUser.childName + " (" + currentSessionUser.gender + ")";

  const char* heightLines[] = { "Get Height", childInfo.c_str(), heightStr.c_str(), "Press OK to confirm" };
  displayMenu.renderBoxedText(heightLines, 4);

  if (confirmButton.isPressed()) {
    currentMeasurement.height = currentHeight;
    currentWeighingState = WEIGHING_VALIDATE_DATA;
    systemBuzzer.toggleInit(100, 1);
  }

  if (navigateButton.isLongPressed(2000)) {
    navigateButton.resetState();
    currentWeighingState = WEIGHING_GET_WEIGHT;
  }
}

void displayWeighingValidateData() {
  String weightInfo = "Weight: " + String(currentMeasurement.weight, 1) + " Kg";
  String heightInfo = "Height: " + String(currentMeasurement.height, 1) + " cm";

  // Use KNN for nutrition status prediction
  String nutritionStatus = getNutritionStatusFromSession();
  String statusInfo = "Status: " + nutritionStatus;

  const char* validateLines[] = { "Validate Data", weightInfo.c_str(), heightInfo.c_str(), statusInfo.c_str() };
  displayMenu.renderBoxedText(validateLines, 4);

  if (confirmButton.isPressed()) {
    currentWeighingState = WEIGHING_SEND_DATA;
    systemBuzzer.toggleInit(100, 1);
  }

  if (navigateButton.isLongPressed(2000)) {
    navigateButton.resetState();
    currentWeighingState = WEIGHING_GET_HEIGHT;
  }
}

void displayWeighingSendData() {
  const char* sendingLines[] = { "Sending Data", "to Server", "Please wait..." };
  displayMenu.renderBoxedText(sendingLines, 3);

  // Use KNN for nutrition status prediction
  String nutritionStatus = getNutritionStatusFromSession();
  String eatingPattern = getEatingPatternString(currentMeasurement.eatingPatternIndex);
  String childResponse = getChildResponseString(currentMeasurement.childResponseIndex);

  updateGlobalSessionData(
    currentMeasurement.weight,
    currentMeasurement.height,
    nutritionStatus,
    eatingPattern,
    childResponse);

  currentWeighingState = WEIGHING_COMPLETE;
}

void displayWeighingComplete() {
  const char* completeLines[] = { "Measurement", "Complete!", "Check your app" };
  displayMenu.renderBoxedText(completeLines, 3);

  static uint32_t completeTimer = millis();
  if (millis() - completeTimer > 3000) {
    backToIdleState();
  }
}

void displayQuickMeasureScreen() {
  static auto quickMeasureMenu = displayMenu.createMenu(4, "Measure", "Calibrate", "Tare", "Back");

  displayMenu.onSelect(quickMeasureMenu, "Measure", []() {
    float bmi = calculateBMI(currentWeight, currentHeight);
    String bmiCategory = getBMICategory(bmi);

    char weightBuffer[30], heightBuffer[30];
    sprintf(weightBuffer, "Weight: %6.2f Kg", currentWeight);
    sprintf(heightBuffer, "Height: %6.2f cm", currentHeight);

    const char* measureLines[] = { "Quick Measure", weightBuffer, heightBuffer, bmiCategory.c_str() };
    displayMenu.renderBoxedText(measureLines, 4);

    if (confirmButton.isPressed()) {
      displayMenu.clearMenu(quickMeasureMenu, displayMenu.end());
    }
  });

  displayMenu.onSelect(quickMeasureMenu, "Calibrate", []() {
    performLoadCellCalibration();
    displayMenu.clearMenu(quickMeasureMenu, displayMenu.end());
  });

  displayMenu.onSelect(quickMeasureMenu, "Tare", []() {
    performLoadCellTare();
    displayMenu.clearMenu(quickMeasureMenu, displayMenu.end());
  });

  displayMenu.onSelect(quickMeasureMenu, "Back", []() {
    backToIdleState();
    displayMenu.clearMenu(quickMeasureMenu, displayMenu.end());
  });

  displayMenu.showMenu(quickMeasureMenu);
}

void displayAdminScreen() {
  const char* adminLines[] = { "Admin Mode", "Hardware Ready", "Press button to exit" };
  displayMenu.renderBoxedText(adminLines, 3);

  if (confirmButton.isPressed()) {
    backToIdleState();
  }
}

void performLoadCellCalibration() {
  auto loadCell = sensorManager.getModule<HX711Sens>("loadcell");

  const char* step1Lines[] = { "Calibration", "Remove all objects", "from scale" };
  displayMenu.renderBoxedText(step1Lines, 3);
  loadCell->setScaleDelay(5000);

  const char* step2Lines[] = { "Calibration", "Place 2kg object", "on scale" };
  displayMenu.renderBoxedText(step2Lines, 3);
  loadCell->tareDelay(5000);

  float units = loadCell->getUnits(10);
  float calibrationFactor = loadCell->getCalibrateFactor(units, KG_TO_G(2));

  Serial.printf("Calibration factor: %.2f\n", calibrationFactor);

  devicePreferences.begin("intan", false);
  devicePreferences.putFloat("calibration", calibrationFactor);
  devicePreferences.end();

  loadCell->setScale(calibrationFactor);
  displayMenu.renderStatusScreen("Calibration", "Success", true);
  delay(3000);

  loadCell->tare();
}

void performLoadCellTare() {
  auto loadCell = sensorManager.getModule<HX711Sens>("loadcell");
  loadCell->tare();
  displayMenu.renderStatusScreen("Tare", "Success", true);
  delay(2000);
}

void backToIdleState() {
  changeSystemState(SYSTEM_IDLE);
  currentWeighingState = WEIGHING_IDLE;
  forceFirebaseSync = true;

  currentRfidTag = "";

  SessionUser emptyUser;
  currentSessionUser = emptyUser;

  MeasurementData emptyMeasurement;
  currentMeasurement = emptyMeasurement;

  systemBuzzer.toggleInit(100, 2);
}

void initializeDisplayCallback() {
  const char* initLines[] = { "INTAN SYSTEM", "Initializing...", "Please wait" };
  displayMenu.renderBoxedText(initLines, 3);
  delay(1000);
}