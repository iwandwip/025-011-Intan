#define FIREBASE_DATABASE_URL "https://intan-680a4-default-rtdb.firebaseio.com/"
#define FIREBASE_PROJECT_ID "intan-680a4"
#define FIREBASE_API_KEY "AIzaSyDxodg_DD4n-DTdKqrMEJJX3bQHJyG3sKU"
#define FIREBASE_USER_EMAIL "admin@gmail.com"
#define FIREBASE_USER_PASSWORD "admin123"
#define FIREBASE_CLIENT_EMAIL "firebase-adminsdk-fbsvc@intan-680a4.iam.gserviceaccount.com"
#define FIREBASE_MSG_DEVICE_TOKEN "cJnjCBzORlawc7T2WvCq2L:APA91bEyoA65YjDAEU6Y_Mj6DQzw5KH_Svfs7ZoLv3Vdl-ZurpiN8BGi1R3qaOh1Ux_wNHacMHSGOfHuxxKQraLcWC-RowpmEvPQboZasgsWJQ_MWdS285Q"
const char PRIVATE_KEY[] PROGMEM = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDbE0XOrU00qix3\nZiSspJ/TwKJ+AHKBhV4jdj6g6F58DGnYYElN+ow2wC2vrTvcxkFy6cTjdYiy18d5\nWn0omQU5R3B4lzW9X9q4AxTGyIn6ffEprAdOGeo44hpBQ2mitcvbW9cWI6pv1KCw\ncUkFVhdynWapd2bAC1OZ02jboeacfvYCzVijRknsLXFngW4Z08rywE3g70k/mchR\nnEhXCWuSAZRbVtY6pPAeEDJioRYeJzBB6sbryN76om+XIQioAKCkeco7MTwQ5FL/\nZIzMf384eUjUbP9gXJGAGe5J6I+RFQN+9MUEkSdbPTJc4H5CTx7R8YFiTxvM6KFZ\ngKCtK06lAgMBAAECggEAMPEISljbA6X00yPFk7AfaJ4DbyTIb/kMg92ZtjbTTOE1\nEDrKhZowktayHioUUokT/AkPjEUoqdOc45Z8mYI98YLtNHOLdOgiI7PEg3gvov9Z\nzhZ5d1BAzD5u4R+fTNNSXIoS7gY/wEX/NAvK5V9LU7aoRbnAAa1GGvpo1ZBAxbsJ\ndvUGqhubXR96Z/E7TCVaHWj6L4LORrBNhoLpBqgPvfpa46m3yPWnnYMQVUB0d+aM\nOQrEJW2tOlSHCoLXIpkRKto7YCwERd8iASdEvYLf/H4xmHaK541YZZ18tl5FI5sl\n2xUc8CBf/UCcRCGYNRoMK1c4iV16n7Lfyb3aptceAQKBgQD1iGv1yc7G/VN1F6uO\n2wIPHdTYXB9BQdlB7Evg6WzU6ujFywGjyIJEltBmvbWidYViUboq9oVcnjOpe/zk\n2YtBVnkq3lYIkcqIz4ToPa3oivKDeDpTW33+EPVTafZym6XhZG8U/kgKiFLVsmtK\nCx3fL3BOU7T5YHymqy37ACStJQKBgQDkahxTkKvjghi/fb2C1G2k6bDEvEaRFWY6\nWypCb+sOCmSx2lY4iUupoxLcgwmH+GGqsgNNSft599PU3ODu44ZI1nMThuay175K\nzX9WJA+m8zgWE9wG0VYa8diyPMrMMm9MzF06A1wv1jWtzSsUGcck27WR0Pd4aZAh\nRwJmpbQjgQKBgF7zYsyqPky1qpCdlrqn9yPhZW5GMdAKpvnXZ4CSxIOSVHIpD3lH\nERl1OSKCOruYtvxOnq/+pZQrmc7xI9tcRX3+8tyhHqQxvSErHzqwn5BOK3qsA+I4\nf4DBDh4z3Bp2FrATJuH3c+Se02nQla0Mn4Cv175yoInPxmStzhpC8+wBAoGAHm70\n7z1raZi/62O5iGD9aueoIc5kKJiNUmErNEbtLqW73OaWbln8ttF/hdn/vxodCT1G\nq1mcJBgdJVN4tNuj3LiWBJgIzPNp61WODdAoNbpaUra6rj3eFyD6GmV3L9XYdocU\nNNKVydnktQ+NGdSFcCfF/XO2RVjrV0O60ipp4gECgYEA3z/CIpmYtSpxhIth4I8T\nK0kp50oHncVy2tr8zOmZCoErFaQrTaFHvMBlJe48JDMDxqoigU1sxRvGrYY37HvO\nLNWFDGgXZaghTr9E+yvIOrrXnK1hieDqZxpf5JstFPX/4UFByfvnx+7TV3/eB8b8\nCuVxmJ8C4wGBxY2Gy/Y4vtY=\n-----END PRIVATE KEY-----\n";

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

    // Initialize RTDB for mode-based system (REQUIRED)
    if (!rtdbClient.begin(rtdbWifiClient, FIREBASE_DATABASE_URL, FIREBASE_API_KEY, FIREBASE_USER_EMAIL, FIREBASE_USER_PASSWORD)) {
      Serial.println("CRITICAL ERROR: Firebase RTDB initialization failed!");
      Serial.println("Error: " + rtdbClient.getError());
      Serial.println("System cannot continue without RTDB - HALTING");
      while (1) { delay(1000); }  // HALT system if RTDB fails
    }
    Serial.println("Firebase RTDB initialization successful - Mode-based system active");

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
  if (!rtdbClient.ready()) {
    Serial.println("RTDB not ready for sending results");
    return;
  }
  float imt = calculateIMT(weight, height);
  Serial.println("Sending mode-based weighing results...");
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

  // Reset measurement data
  currentMeasurement.weight = 0.0;
  currentMeasurement.height = 0.0;
}

void sendModeBasedRFIDDetectionWiFi(String rfidCode) {
  if (!rtdbClient.ready()) {
    Serial.println("RTDB not ready for RFID detection");
    return;
  }
  Serial.println("Sending mode-based RFID detection: " + rfidCode);
  rtdbClient.set("pairing_mode", rfidCode);
  // System will return to idle when app completes the pairing
}
