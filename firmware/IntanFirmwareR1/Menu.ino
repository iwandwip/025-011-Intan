
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
      Serial.println("| RFID verification SUCCESS - starting app-controlled weighing");
      currentWeighingState = WEIGHING_RFID_CONFIRM_WAIT;
      systemBuzzer.toggleInit(100, 2);
      // Start app-controlled weighing flow
      startAppControlledWeighing();
      currentRfidTag = "";
      forceFirebaseSync = true; // Extra force sync
    } else {
      displayWeighingRFIDError();
      systemBuzzer.toggleInit(200, 3);
      // Set RFID verification failed flag
      setRFIDVerificationFailed();
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
  const char *confirmLines[] = { "RFID TERKONFIRMASI!", userInfo.c_str(), "MENUNGGU APLIKASI", "UNTUK LANJUT..." };
  displayMenu.renderBoxedText(confirmLines, 4);
  forceFirebaseSync = true; // Force sync when RFID confirmed and waiting for app
}

void displayWeighingGetWeight() {
  String weightStr = String(currentWeight, 1) + " KG";
  if (testingModeEnabled) {
    weightStr += " [TEST]";
  }
  String patternInfo = "POLA: " + getEatingPatternString(currentMeasurement.eatingPatternIndex);
  patternInfo.toUpperCase();
  String responseInfo = "RESPON: " + getChildResponseString(currentMeasurement.childResponseIndex);
  responseInfo.toUpperCase();
  const char *weightLines[] = { "MENGUKUR BERAT", weightStr.c_str(), "KONFIRMASI DI", "APLIKASI ANDA" };
  displayMenu.renderBoxedText(weightLines, 4);
}

void displayWeighingGetHeight() {
  String heightStr = String(currentHeight, 1) + " CM";
  if (testingModeEnabled) {
    heightStr += " [TEST]";
  }
  String childInfo = currentSessionUser.childName + " (" + currentSessionUser.gender + ")";
  childInfo.toUpperCase();
  const char *heightLines[] = { "MENGUKUR TINGGI", childInfo.c_str(), heightStr.c_str(), "KONFIRMASI DI APLIKASI" };
  displayMenu.renderBoxedText(heightLines, 4);
}

void displayWeighingValidateData() {
  String weightInfo = "BERAT: " + String(currentMeasurement.weight, 1) + " KG";
  String heightInfo = "TINGGI: " + String(currentMeasurement.height, 1) + " CM";
  String nutritionStatus = getNutritionStatusFromSession();
  String statusInfo = "Status: " + nutritionStatus;
  const char *validateLines[] = { "MENGHITUNG...", weightInfo.c_str(), heightInfo.c_str(), "KONFIRMASI DI APLIKASI" };
  displayMenu.renderBoxedText(validateLines, 4);
}

// Global variable for processing timer
uint32_t processingStartTime = 0;

void displayWeighingSendData() {
  const char *sendingLines[] = { "MENGHITUNG STATUS", "GIZI DENGAN K-NN", "DAPAT DIBATALKAN", "DI APLIKASI" };
  displayMenu.renderBoxedText(sendingLines, 4);
  
  // Add delay to show processing
  if (processingStartTime == 0) {
    processingStartTime = millis();
    forceFirebaseSync = true; // Force sync when processing starts
  }
  
  // Process for 3 seconds to show calculation
  if (millis() - processingStartTime >= 3000) {
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
    processingStartTime = 0; // Reset for next time
  }
}

void displayWeighingComplete() {
  const char *completeLines[] = { "PENGUKURAN", "SELESAI!", "CEK APLIKASI ANDA" };
  displayMenu.renderBoxedText(completeLines, 3);
  static uint32_t completeTimer = millis();
  if (millis() - completeTimer > 3000) {
    forceFirebaseSync = true; // Force sync before returning to idle
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
    if (confirmButton.isPressed()) {
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
  if (confirmButton.isPressed()) {
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
  MeasurementData emptyMeasurement;
  currentMeasurement = emptyMeasurement;
  systemBuzzer.toggleInit(100, 2);
  // Reset any static timers
  resetProcessingTimer();
}

void resetProcessingTimer() {
  // Reset processing timer when session is cancelled
  processingStartTime = 0;
  Serial.println("| Processing timer reset due to cancellation");
}

void initializeDisplayCallback() {
  const char *initLines[] = { "SISTEM INTAN", "MENGINISIALISASI...", "MOHON TUNGGU" };
  displayMenu.renderBoxedText(initLines, 3);
  delay(1000);
}