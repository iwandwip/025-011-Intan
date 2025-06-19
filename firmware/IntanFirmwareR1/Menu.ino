
void displayMenuCallback() {
  if (needDisplayUpdate) {
    currentSystemState = pendingSystemState;
    needDisplayUpdate = false;
    Serial.print("| Display callback - state updated to: ");
    Serial.println(currentSystemState);
  }
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
  const char *startupLines[] = { "SISTEM DIMULAI", "MOHON TUNGGU...", "KONEKSI KE WIFI" };
  displayMenu.renderBoxedText(startupLines, 3);
}

void displayIdleScreen() {
  if (!systemInitialized) {
    displayStartupScreen();
    return;
  }
  if (testingModeEnabled) {
    const char *idleLines[] = { "SISTEM SIAP", "[MODE TEST]", "GUNAKAN USB" };
    displayMenu.renderBoxedText(idleLines, 3);
  } else {
    const char *idleLines[] = { "SISTEM SIAP", "PILIH MENU DI", "APLIKASI ANDA" };
    displayMenu.renderBoxedText(idleLines, 3);
  }
  if (!currentRfidTag.isEmpty()) {
    forceFirebaseSync = true;
  }
}

void displayRFIDPairingScreen() {
  const char *pairingLines[] = { "MODE PAIRING RFID", "TAP KARTU RFID", "UNTUK PAIRING" };
  displayMenu.renderBoxedText(pairingLines, 3);
  if (!currentRfidTag.isEmpty()) {
    const char *detectedLines[] = { "RFID TERDETEKSI!", currentRfidTag.c_str(), "MEMPROSES..." };
    displayMenu.renderBoxedText(detectedLines, 3);
    statusLed.on();
    Serial.println("| RFID tag detected in pairing mode, updating session");
    updateGlobalSessionRFID(currentRfidTag);
    currentRfidTag = "";
    backToIdleState();
  }
}

void displayWeighingScreen() {
  switch (currentWeighingState) {
    case WEIGHING_RFID_CONFIRMATION:
      displayWeighingRFIDConfirmation();
      break;
    case WEIGHING_RFID_CONFIRM_WAIT:
      displayWeighingRFIDConfirmWait();
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
  static bool timerInitialized = false;
  if (!timerInitialized) {
    rfidConfirmationStartTime = millis();
    timerInitialized = true;
  }
  unsigned long timeRemaining = RFID_TIMEOUT_MS - (millis() - rfidConfirmationStartTime);
  if (millis() - rfidConfirmationStartTime > RFID_TIMEOUT_MS) {
    timerInitialized = false;
    backToIdleState();
    return;
  }
  String timeoutMsg = "TIMEOUT: " + String(timeRemaining / 1000) + "S";
  const char *confirmLines[] = { "SESI PENIMBANGAN", "TAP RFID UNTUK", "KONFIRMASI", timeoutMsg.c_str() };
  displayMenu.renderBoxedText(confirmLines, 4);
  if (!currentRfidTag.isEmpty()) {
    timerInitialized = false;
    if (currentRfidTag == currentSessionUser.rfidTag) {
      currentWeighingState = WEIGHING_RFID_CONFIRM_WAIT;
      systemBuzzer.toggleInit(100, 2);
      currentRfidTag = "";
    } else {
      displayWeighingRFIDError();
      systemBuzzer.toggleInit(200, 3);
      currentRfidTag = "";
      delay(3000);
      backToIdleState();
    }
  }
}

void displayWeighingRFIDError() {
  const char *errorLines[] = { "RFID SALAH!", "AKSES DITOLAK", "SESI AKAN RESET", "DALAM 3 DETIK..." };
  displayMenu.renderBoxedText(errorLines, 4);
}

void displayWeighingRFIDConfirmWait() {
  String userInfo = "PENGGUNA: " + currentSessionUser.childName;
  userInfo.toUpperCase();
  const char *confirmLines[] = { "RFID TERKONFIRMASI!", userInfo.c_str(), "TEKAN OK UNTUK", "MULAI TIMBANG" };
  displayMenu.renderBoxedText(confirmLines, 4);
  if (confirmButton.isReleased()) {
    confirmButton.resetState();
    delay(500);
    currentWeighingState = WEIGHING_GET_WEIGHT;
    systemBuzzer.toggleInit(100, 1);
  }
  if (navigateButton.isLongPressed(2000)) {
    navigateButton.resetState();
    backToIdleState();
  }
}

void displayWeighingGetWeight() {
  String weightStr = String(currentWeight, 2) + " KG";
  if (testingModeEnabled) {
    weightStr += " [TEST]";
  }
  String patternInfo = "POLA: " + getEatingPatternString(currentMeasurement.eatingPatternIndex);
  patternInfo.toUpperCase();
  String responseInfo = "RESPON: " + getChildResponseString(currentMeasurement.childResponseIndex);
  responseInfo.toUpperCase();
  const char *weightLines[] = { "MENGUKUR BERAT", weightStr.c_str(), patternInfo.c_str(), "TEKAN OK KONFIRMASI" };
  displayMenu.renderBoxedText(weightLines, 4);
  if (confirmButton.isReleased()) {
    confirmButton.resetState();
    delay(500);
    Serial.printf("| Weight confirmed: currentWeight=%.1f, storing to currentMeasurement\n", currentWeight);
    currentMeasurement.weight = round(currentWeight * 100) / 100.0;
    Serial.printf("| Stored weight: currentMeasurement.weight=%.1f\n", currentMeasurement.weight);
    currentWeighingState = WEIGHING_GET_HEIGHT;
    systemBuzzer.toggleInit(100, 1);
  }
  if (navigateButton.isLongPressed(2000)) {
    navigateButton.resetState();
    backToIdleState();
  }
}

void displayWeighingGetHeight() {
  String heightStr = String(currentHeight, 2) + " CM";
  if (testingModeEnabled) {
    heightStr += " [TEST]";
  }
  String childInfo = currentSessionUser.childName + " (" + currentSessionUser.gender + ")";
  childInfo.toUpperCase();
  const char *heightLines[] = { "MENGUKUR TINGGI", childInfo.c_str(), heightStr.c_str(), "TEKAN OK KONFIRMASI" };
  displayMenu.renderBoxedText(heightLines, 4);
  if (confirmButton.isReleased()) {
    confirmButton.resetState();
    delay(500);
    Serial.printf("| Height confirmed: currentHeight=%.1f, storing to currentMeasurement\n", currentHeight);
    currentMeasurement.height = round(currentHeight * 100) / 100.0;
    Serial.printf("| Stored height: currentMeasurement.height=%.1f\n", currentMeasurement.height);
    Serial.printf("| Current stored values: weight=%.1f, height=%.1f\n", currentMeasurement.weight, currentMeasurement.height);
    currentWeighingState = WEIGHING_VALIDATE_DATA;
    systemBuzzer.toggleInit(100, 1);
  }
  if (navigateButton.isLongPressed(2000)) {
    navigateButton.resetState();
    currentWeighingState = WEIGHING_GET_WEIGHT;
  }
}

void displayWeighingValidateData() {
  String weightInfo = "BERAT: " + String(currentMeasurement.weight, 1) + " KG";
  String heightInfo = "TINGGI: " + String(currentMeasurement.height, 1) + " CM";
  String nutritionStatus = getNutritionStatusFromSession();
  String statusInfo = "Status: " + nutritionStatus;
  const char *validateLines[] = { "MENGHITUNG...", weightInfo.c_str(), heightInfo.c_str(), "TEKAN OK KIRIM" };
  displayMenu.renderBoxedText(validateLines, 4);
  if (confirmButton.isReleased()) {
    confirmButton.resetState();
    delay(500);
    currentWeighingState = WEIGHING_SEND_DATA;
    systemBuzzer.toggleInit(100, 1);
  }
  if (navigateButton.isLongPressed(2000)) {
    navigateButton.resetState();
    currentWeighingState = WEIGHING_GET_HEIGHT;
  }
}

void displayWeighingSendData() {
  static bool dataSent = false;
  static uint32_t sendStartTime = 0;

  if (!dataSent) {
    const char *sendingLines[] = { "MENGIRIM DATA", "KE SERVER", "MOHON TUNGGU..." };
    displayMenu.renderBoxedText(sendingLines, 3);

    if (sendStartTime == 0) {
      sendStartTime = millis();
      Serial.println("| Starting data send process...");
    }

    String nutritionStatus = getNutritionStatusFromSession();
    String eatingPattern = getEatingPatternString(currentMeasurement.eatingPatternIndex);
    String childResponse = getChildResponseString(currentMeasurement.childResponseIndex);

    Serial.println("| Attempting to send measurement data...");
    Serial.printf("| Final check before send: weight=%.2f, height=%.2f\n", currentMeasurement.weight, currentMeasurement.height);
    Serial.printf("| Current sensor values: currentWeight=%.2f, currentHeight=%.2f\n", currentWeight, currentHeight);
    Serial.printf("| Nutrition: %s, Pattern: %s, Response: %s\n", nutritionStatus.c_str(), eatingPattern.c_str(), childResponse.c_str());

    // Double-check values before sending
    if (currentMeasurement.weight <= 0.0 || currentMeasurement.height <= 0.0) {
      Serial.println("| WARNING: Invalid measurement data detected!");
      Serial.printf("| Attempting to use current sensor values instead: %.2f kg, %.2f cm\n", currentWeight, currentHeight);
      if (currentWeight > 0.0 && currentHeight > 0.0) {
        updateGlobalSessionData(currentWeight, currentHeight, nutritionStatus, eatingPattern, childResponse);
      } else {
        Serial.println("| ERROR: Both stored and current sensor values are invalid!");
        const char *errorLines[] = { "DATA ERROR!", "PENGUKURAN GAGAL", "COBA LAGI" };
        displayMenu.renderBoxedText(errorLines, 3);
        delay(3000);
        currentWeighingState = WEIGHING_GET_WEIGHT;
        return;
      }
    } else {
      updateGlobalSessionData(
        currentMeasurement.weight,
        currentMeasurement.height,
        nutritionStatus,
        eatingPattern,
        childResponse);
    }

    dataSent = true;
    Serial.println("| Data send completed, transitioning to complete state");
    currentWeighingState = WEIGHING_COMPLETE;
  }

  // Timeout protection - if stuck for more than 15 seconds, force complete
  if (millis() - sendStartTime > 15000) {
    Serial.println("| TIMEOUT: Forcing completion after 15 seconds");
    dataSent = true;
    currentWeighingState = WEIGHING_COMPLETE;
  }

  // Reset static variables when leaving this state
  if (currentWeighingState != WEIGHING_SEND_DATA) {
    dataSent = false;
    sendStartTime = 0;
  }
}

void displayWeighingComplete() {
  const char *completeLines[] = { "PENGUKURAN", "SELESAI!", "CEK APLIKASI ANDA" };
  displayMenu.renderBoxedText(completeLines, 3);

  static uint32_t completeTimer = 0;
  static bool timerInitialized = false;

  if (!timerInitialized) {
    completeTimer = millis();
    timerInitialized = true;
    Serial.println("| Weighing complete - starting 3 second timer");
  }

  if (millis() - completeTimer > 3000) {
    Serial.println("| 3 seconds elapsed, returning to idle state");
    timerInitialized = false;
    backToIdleState();
  }
}

void displayQuickMeasureScreen() {
  static auto quickMeasureMenu = displayMenu.createMenu(4, "UKUR", "KALIBRASI", "TARE", "KEMBALI");
  displayMenu.onSelect(quickMeasureMenu, "UKUR", []() {
    float bmi = calculateBMI(currentWeight, currentHeight);
    String bmiCategory = getBMICategory(bmi);
    char weightBuffer[30], heightBuffer[30];
    sprintf(weightBuffer, "BERAT: %6.2f KG", currentWeight);
    sprintf(heightBuffer, "TINGGI: %6.2f CM", currentHeight);
    const char *measureLines[] = { "UKUR CEPAT", weightBuffer, heightBuffer, bmiCategory.c_str() };
    displayMenu.renderBoxedText(measureLines, 4);
    if (confirmButton.isReleased()) {
      confirmButton.resetState();
      delay(500);
      displayMenu.clearMenu(quickMeasureMenu, displayMenu.end());
    }
  });
  displayMenu.onSelect(quickMeasureMenu, "KALIBRASI", []() {
    performLoadCellCalibration();
    displayMenu.clearMenu(quickMeasureMenu, displayMenu.end());
  });
  displayMenu.onSelect(quickMeasureMenu, "TARE", []() {
    performLoadCellTare();
    displayMenu.clearMenu(quickMeasureMenu, displayMenu.end());
  });
  displayMenu.onSelect(quickMeasureMenu, "KEMBALI", []() {
    backToIdleState();
    displayMenu.clearMenu(quickMeasureMenu, displayMenu.end());
  });
  displayMenu.showMenu(quickMeasureMenu);
}

void displayAdminScreen() {
  const char *adminLines[] = { "MODE ADMIN", "HARDWARE SIAP", "TEKAN TOMBOL KELUAR" };
  displayMenu.renderBoxedText(adminLines, 3);
  if (confirmButton.isReleased()) {
    confirmButton.resetState();
    delay(500);
    backToIdleState();
  }
}

void performLoadCellCalibration() {
  auto loadCell = sensorManager.getModule<HX711Sens>("loadcell");
  const char *step1Lines[] = { "KALIBRASI", "LEPAS SEMUA OBJEK", "DARI TIMBANGAN" };
  displayMenu.renderBoxedText(step1Lines, 3);
  loadCell->setScaleDelay(5000);
  const char *step2Lines[] = { "KALIBRASI", "LETAKKAN OBJEK 2KG", "DI TIMBANGAN" };
  displayMenu.renderBoxedText(step2Lines, 3);
  loadCell->tareDelay(5000);
  float units = loadCell->getUnits(10);
  float calibrationFactor = loadCell->getCalibrateFactor(units, KG_TO_G(2));
  Serial.printf("Calibration factor: %.2f\n", calibrationFactor);
  devicePreferences.begin("intan", false);
  devicePreferences.putFloat("calibration", calibrationFactor);
  devicePreferences.end();
  loadCell->setScale(calibrationFactor);
  displayMenu.renderStatusScreen("KALIBRASI", "BERHASIL", true);
  delay(3000);
  loadCell->tare();
}

void performLoadCellTare() {
  auto loadCell = sensorManager.getModule<HX711Sens>("loadcell");
  loadCell->tare();
  displayMenu.renderStatusScreen("TARE", "BERHASIL", true);
  delay(2000);
}

void backToIdleState() {
  changeSystemState(SYSTEM_IDLE);
  currentWeighingState = WEIGHING_IDLE;
  forceFirebaseSync = true;
  currentRfidTag = "";
  SessionUser emptyUser;
  currentSessionUser = emptyUser;
  // Don't reset currentMeasurement here - it's reset in updateGlobalSessionData after successful send
  systemBuzzer.toggleInit(100, 2);
}

void initializeDisplayCallback() {
  const char *initLines[] = { "SISTEM INTAN", "MENGINISIALISASI...", "MOHON TUNGGU" };
  displayMenu.renderBoxedText(initLines, 3);
  delay(1000);
}