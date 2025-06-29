#define FIREBASE_DATABASE_URL "https://intan-680a4-default-rtdb.firebaseio.com/"
#define FIREBASE_PROJECT_ID "intan-680a4"
#define FIREBASE_API_KEY "AIzaSyDxodg_DD4n-DTdKqrMEJJX3bQHJyG3sKU"
#define FIREBASE_USER_EMAIL "admin@gmail.com"
#define FIREBASE_USER_PASSWORD "admin123"
#define FIREBASE_CLIENT_EMAIL "firebase-adminsdk-fbsvc@intan-680a4.iam.gserviceaccount.com"
#define FIREBASE_MSG_DEVICE_TOKEN "cJnjCBzORlawc7T2WvCq2L:APA91bEyoA65YjDAEU6Y_Mj6DQzw5KH_Svfs7ZoLv3Vdl-ZurpiN8BGi1R3qaOh1Ux_wNHacMHSGOfHuxxKQraLcWC-RowpmEvPQboZasgsWJQ_MWdS285Q"
const char PRIVATE_KEY[] PROGMEM = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDbDPY9vrAreUu8\njDhsqJ+5tU/4/K+m39+XuZhJcgxvqLqFkfXVXLyXpMvwi4lviqGPZKvyWKf5rpyZ\nH0ZGbGtqZarA6C1/yTLzTtA6E7uvg4rww7D2F0QhULDWlnHLPuAamB0v7sTUsbli\nTqeTMydLiGWuPNT5qsgSp9tvjPXPuQp4SDPDU353O9HjWnevoHZ9m5jkap769buc\nDn7ga12Uj/M5XKWk/lNruU5nJuA449+AYEpn5PQwptM5k7PAhS8Y1/t1smkdMZRz\nWarEQRbDTmysenbKzA9PlmJL6pGLaraolzzmMc6lAZeEQnFKk1xrqBIV4aEiDTGn\nidE8PcLPAgMBAAECggEAAS3K34xMPns+a3Bcurk4VTWEPK0KKAakjv5jhAwKha9G\nfDxWQlRdNCm5M7QTkF4U8qaKcqT8VpsJ72NGHnnoL0TC3Ue//Yx8LHTxGQZD0OFV\nxW1PNQT8z5pvnpc2YM/mDJhjCoUMmOO/mj7+TdJopQaijwGruRpWZ90sulOQKDSl\nRwKF15m5IoKjhc3XiDvDWtpszQew/zkQAjpCTr1GemJfesjgX7rvz6A+gVrwla3P\nPsx8l8DFJTTn6KOq0UtSQHOflV57CBso2FuHRqgcj3y+XocukIBVbuWVAaImZCmi\nS3Z2W2PyQNECgtvLM16TZYAm4XprL0neRhqq6rHlDQKBgQDufCk3TQXLzenK/YwH\nFkBW0PEzsIWGxbSiiOgtuizb9lnVe/60za/4PlZbqivzkqgVyXfLajnZtRz85KcY\nfXJ++J8Ce2PLSmksVdk2g8PWrs0Xd3Yp/AwRzeNcNTi6Y9biZDJYjcXlytxqkVpP\n8Zs0t+HAr/c1ci+AC0dhYbYcbQKBgQDrI2iWLhTRGjHDYtACpjJCQlRkZf84Jahl\nd8zO4WqKyEbCvf1nDr8f7O78+6uUWo0H+34pGJJI10QHvHgKMyjhivT+cvn5kcO5\naNtSYbbXAjw3pM7VTKC9Ft/C/ISwNvyOWQqg5EUfPwGhvRX2TU2/6ebwqnOMmTOA\ntELwrtQeqwKBgQC9FTI0h1v2F7+q0tZH9Ct06dqjieyES5KJX5T+VGMmzy6wpcvv\nnDlN0Fb1/Hk2eGvOQls5q3JMm11tYPje4O97njGsbRpVXxz+Kt66a0RFnXg8h9nn\nNdB3+U6vl/7vQSNpgdms/lMOe4XA9JevVLci2DwkYx/Uf0EL+2VP34HdDQKBgF5k\nr4aiZx7uOg3qrAB0QXbR89j+DS+4Blr9dc2TNlcSQT3KUWC+zcD+N459ZYq/syAC\nOMo8n/T33cqRQUsu8HlidCl1dJ5Ygs76phjzOxgjQJNB6Po9scVW2msHPikTWd23\nJwohuRHrFDeelaNzswOY3Wm9s3c8xS0ksD64oFTTAoGAG4EA8ixZ9ylC3QbWM0pe\nMwV6FVNzp4EYD6P5xIwi889aRT8j2E10Phxtq5Sa+DvtAFqRDHnmYsIRsKlNEmrF\n8b7p8GKrU1aOvZw2ieRA9SlzQEeeGFKkZM9kdXnY6FZIL91wdfROo0ed+XVmen2N\nGBVN3Ss41vN8n8i8pNZuyvc=\n-----END PRIVATE KEY-----\n";

void wifiTaskHandler() {
  wifiTask.setInitCoreID(1);
  wifiTask.createTask(10000, [](void *pvParameter) {
    Serial.println("WiFi Task starting on Core 1...");

    // Connect to WiFi
    displayMenu.connectToWiFi("TIMEOSPACE", "1234Saja", 30);
    displayMenu.showCircleLoading("Connecting WiFi", 50);
    wifiSecureClient.setInsecure();

    // Initialize NTP
    if (!dateTimeManager.begin()) {
      Serial.println("Failed to initialize NTP Client!");
    }

    // Initialize Firebase V3 Shared Application
    firebaseApp = FirebaseV3Application::getInstance();
    if (!firebaseApp->begin(FIREBASE_API_KEY, FIREBASE_USER_EMAIL, FIREBASE_USER_PASSWORD, FIREBASE_PROJECT_ID)) {
      Serial.println("CRITICAL ERROR: Firebase V3 Application initialization failed!");
      Serial.println("System cannot continue without Firebase - HALTING");
      while (1) { delay(1000); }  // HALT system if Firebase fails
    }
    Serial.println("Firebase V3 Application initialization successful");

    // Initialize RTDB with shared application
    rtdbClient = FirebaseV3RTDB(firebaseApp);
    if (!rtdbClient.begin(FIREBASE_DATABASE_URL)) {
      Serial.println("CRITICAL ERROR: Firebase V3 RTDB initialization failed!");
      Serial.println("System cannot continue without RTDB - HALTING");
      while (1) { delay(1000); }  // HALT system if RTDB fails
    }
    Serial.println("Firebase V3 RTDB initialization successful - Mode-based system active");

    // Initialize RTDB to idle mode
    rtdbClient.set("mode", "idle");
    currentRTDBMode = "idle";

    // Disable watchdog timers
    disableLoopWDT();
    disableCore0WDT();
    disableCore1WDT();

    // Signal system ready
    systemBuzzer.toggleInit(100, 2);
    changeSystemState(SYSTEM_IDLE);
    systemInitialized = true;

    // Main WiFi task loop
    for (;;) {
      // Update RTDB
      rtdbClient.loop();

      // Update date/time
      static uint32_t lastDateTimeUpdate = 0;
      if (millis() - lastDateTimeUpdate >= 1000 && dateTimeManager.update()) {
        lastDateTimeUpdate = millis();
      }

      // Check for RTDB mode changes
      if (rtdbClient.ready()) {
        String newMode = rtdbClient.getString("mode");

        if (!newMode.isEmpty() && newMode != currentRTDBMode) {
          Serial.println("RTDB Mode change: " + currentRTDBMode + " -> " + newMode);
          currentRTDBMode = newMode;

          // Handle mode change
          if (newMode == "idle") {
            // Switch to idle mode
            if (currentSession.isActive) {
              currentSession.isActive = false;
            }
            changeSystemState(SYSTEM_IDLE);
          } else if (newMode == "pairing") {
            // Switch to RFID pairing mode
            Serial.println("Mode-based RFID pairing started");
            changeSystemState(SYSTEM_RFID_PAIRING);
          } else if (newMode == "weighing") {
            // Switch to weighing mode
            Serial.println("Mode-based weighing session started");

            // Load weighing parameters from RTDB
            String polaMakan = rtdbClient.getString("weighing_mode/get/pola_makan");
            String responAnak = rtdbClient.getString("weighing_mode/get/respon_anak");
            String usiaTh = rtdbClient.getString("weighing_mode/get/usia_th");
            String usiaBl = rtdbClient.getString("weighing_mode/get/usia_bl");
            String gender = rtdbClient.getString("weighing_mode/get/gender");

            // Set session data
            currentSession.isActive = true;
            currentSession.sessionType = "weighing";
            currentSession.eatingPattern = polaMakan;
            currentSession.childResponse = responAnak;
            currentSession.gender = gender;
            currentSession.ageYears = usiaTh.toInt();
            currentSession.ageMonths = usiaBl.toInt();
            currentSession.measurementComplete = false;

            // Set measurement indices
            if (polaMakan == "Kurang") currentMeasurement.eatingPatternIndex = 0;
            else if (polaMakan == "Cukup") currentMeasurement.eatingPatternIndex = 1;
            else if (polaMakan == "Berlebih") currentMeasurement.eatingPatternIndex = 2;
            else currentMeasurement.eatingPatternIndex = 0;

            if (responAnak == "Pasif") currentMeasurement.childResponseIndex = 0;
            else if (responAnak == "Sedang") currentMeasurement.childResponseIndex = 1;
            else if (responAnak == "Aktif") currentMeasurement.childResponseIndex = 2;
            else currentMeasurement.childResponseIndex = 0;

            Serial.println("Mode-based weighing data loaded:");
            Serial.println("  Pola Makan: " + polaMakan);
            Serial.println("  Respon Anak: " + responAnak);
            Serial.println("  Usia: " + usiaTh + "th " + usiaBl + "bl");
            Serial.println("  Gender: " + gender);

            changeSystemState(SYSTEM_WEIGHING_SESSION);
          }
        }

        // Handle RFID detection for mode-based system
        if (!currentRfidTag.isEmpty()) {
          if (currentRTDBMode == "pairing") {
            // RFID Pairing mode - send detected RFID
            Serial.println("Mode-based RFID pairing: " + currentRfidTag);
            rtdbClient.set("pairing_mode", currentRfidTag);
            systemBuzzer.toggleInit(100, 2);
            currentRfidTag = "";
          } else if (currentRTDBMode == "weighing") {
            // Weighing mode - validate RFID and proceed
            Serial.println("Mode-based weighing RFID validation: " + currentRfidTag);
            systemBuzzer.toggleInit(100, 3);
            currentRfidTag = "";
          } else if (currentRTDBMode == "idle") {
            // Idle mode - check for admin card
            if (currentRfidTag == "ADMIN_CARD") {
              changeSystemState(SYSTEM_ADMIN_MODE);
              systemBuzzer.toggleInit(100, 3);
            }
            currentRfidTag = "";
          }
        }
      }

      vTaskDelay(pdMS_TO_TICKS(100));
    }
  });
}

// External function implementations that are called from other files
void sendModeBasedWeighingResultsWiFi(float weight, float height, String nutritionStatus) {
  if (!firebaseApp || !rtdbClient.ready()) {
    Serial.println("Firebase V3 not ready for sending results");
    return;
  }
  float imt = calculateIMT(weight, height);
  Serial.println("Sending mode-based weighing results...");
  Serial.println("Weight: " + String(weight, 1) + " kg");
  Serial.println("Height: " + String(height, 1) + " cm");
  Serial.println("IMT: " + String(imt, 1));
  Serial.println("Nutrition Status: " + nutritionStatus);

  // Send results using direct RTDB updates
  rtdbClient.set("weighing_mode/set/pola_makan", currentSession.eatingPattern);
  rtdbClient.set("weighing_mode/set/respon_anak", currentSession.childResponse);
  rtdbClient.set("weighing_mode/set/usia_th", String(currentSession.ageYears));
  rtdbClient.set("weighing_mode/set/usia_bl", String(currentSession.ageMonths));
  rtdbClient.set("weighing_mode/set/gender", currentSession.gender);
  rtdbClient.set("weighing_mode/set/berat", String(weight, 1));
  rtdbClient.set("weighing_mode/set/tinggi", String(height, 1));
  rtdbClient.set("weighing_mode/set/imt", String(imt, 1));
  rtdbClient.set("weighing_mode/set/status_gizi", nutritionStatus);

  Serial.println("Mode-based results sent successfully");
  Serial.println("All fields sent to Firebase RTDB:");
  Serial.println("- berat: " + String(weight, 1));
  Serial.println("- tinggi: " + String(height, 1));
  Serial.println("- status_gizi: " + nutritionStatus);

  // Reset measurement data
  currentMeasurement.weight = 0.0;
  currentMeasurement.height = 0.0;
}

void sendModeBasedRFIDDetectionWiFi(String rfidCode) {
  if (!firebaseApp || !rtdbClient.ready()) {
    Serial.println("Firebase V3 not ready for RFID detection");
    return;
  }
  Serial.println("Sending mode-based RFID detection: " + rfidCode);
  rtdbClient.set("pairing_mode", rfidCode);
  // System will return to idle when app completes the pairing
}
