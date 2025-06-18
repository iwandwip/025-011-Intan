#define FIREBASE_DATABASE_URL "https://intan-680a4-default-rtdb.firebaseio.com/"
#define FIREBASE_PROJECT_ID "intan-680a4"
#define FIREBASE_API_KEY "AIzaSyDxodg_DD4n-DTdKqrMEJJX3bQHJyG3sKU"
#define FIREBASE_USER_EMAIL "admin@gmail.com"
#define FIREBASE_USER_PASSWORD "admin123"
#define FIREBASE_CLIENT_EMAIL "firebase-adminsdk-fbsvc@intan-680a4.iam.gserviceaccount.com"
#define FIREBASE_MSG_DEVICE_TOKEN "cJnjCBzORlawc7T2WvCq2L:APA91bEyoA65YjDAEU6Y_Mj6DQzw5KH_Svfs7ZoLv3Vdl-ZurpiN8BGi1R3qaOh1Ux_wNHacMHSGOfHuxxKQraLcWC-RowpmEvPQboZasgsWJQ_MWdS285Q"
const char PRIVATE_KEY[] PROGMEM = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCVl49X+xeXIIC3\nignigvgWSsqiSXq/i8q//Xexc11HRbcA9R133716qgMfrtxVCrmOBcdBTofHiOiK\niGF5hiSup7SGXnuYqj7zgnZjrCAtqTHnEJ/mOcHJbbJL0RdDYUmCHwaJ198c3Hy8\nyjnOM373ylRnhkujRXbNqFz+V04GPCJbvHbE0vtr811wKmiSmjhxXmhFZS/cbX6a\ng567X3e64Kq/YmEjbQDC1tl5zkGP9DUugBlQH8lguQBk4wCFeO6wB2lPNc4AcoRl\npmCLl1hQldxvRVNM/aMHOHmmxniNZN6S8AA71S4Ohn5TonYqteP1jVpeUnokmRKu\nTVl97lS/AgMBAAECggEAHh936QKR/Ie6A7uTQ/6VkH+dEFL1mc6/lCupR51wgiKi\nuFmjhnkSgbnsiRvAGIvhU50MQ7VZmC+UjBjsb/k4N8djjc9G2jYmGQkDaAzIKgmx\nF9N8L3Mf97zUM3o2UgYsNDylJ2rF7dzkbWvXehNalPE0T+h2ILmjM8ScfUb9WjnA\n6zqleaeZIusSPcZgaErSyjxkIZHD7E6sC+cmfcK2FYqH3H/2MusrMxsYEU8WRQB6\nU9w8JN3Kmi66t0MLaH5L7p+ewo4Yjn1iNgP5i5QrFeKkzG8UvcrSIU35MELprWGq\npjSkJySjmHMLxa9hyT6dpqy5lGyIF759tn9N2DB4UQKBgQDGefM+BJz5gxIKLGQF\nxpLntKGYnoUjqkZnrFgLzhgTy47q0icbjSuPrXTxgbqd8bmUSu5Ob4jfqIH4i3v+\nBSaF6K2cMYN+Ilg9Ijiffb9OJwQZrH09bpus4zpRq61oTuqGkn3Zb66D9QO1e/bl\nHAk/R4f2BP9g5XB9wOxUQrUeWQKBgQDA8pzh/t2/wFVm4SRKL9kWZ7/3SI/7KaoA\njYsQeYZmMxXSBlYf/slERJyaJ4qeDI1lE8hrDCjReN937tyR9gR1XqqlZ3ijdo4w\ndmxipqZ2ysZgD4EfdDRgettJq9WT6hGrb798XiWkM2ok83cL0Ttl0s/7wAlk7wgy\ncSvI5JWY1wKBgGgNSv56gKk2k+CNgSqd/ipHQmi2wmn+PMbhTY9yzqCiGRz2a9Y/\n3lSGxUZPkrx3G6mo1uJ8Cq/msazRw4FaxeVyJII8WwlnjAcQx8qlrAOW5Mlo6oeo\nUykCP3LNpC2JId7HMf8qU72OWBFvGfLnDdoE8DyERjZQUvc6iytphXaRAoGAfzDv\nnkLmZvsg0RrlU0pLbuuhrh9VWppSiN7Fp2yU3lYaskKfD6RjhO891JjwVdOsec8a\ntQZk+gEWPvdky4tD0SNAlpyo+Ai1HtlSBY4Z+gEd2EEgO13dESSr3dq6hjEsyLh3\noEJnyeBivk0IUu/wmeToWepzxueTnbzgwiN9Qi0CgYEAwOsLoS/NHtmX5Pb+zv7r\nf43162Nwo+DlrM1+tc4ZKdCbnSYxUOLZZm5JGAk0Kzg9arFEm1ijZFGNdt0z+hbk\nkhBsSAv94XBkA4xxCX4DLkybTse+WNdhBzh4aGFutWbpq7u73UH9G6/qCQrT5Lzk\nlR63HDAseusj6kxFOoj3j7k=\n-----END PRIVATE KEY-----\n";

void wifiTaskHandler() {
  wifiTask.setInitCoreID(1);
  wifiTask.createTask(10000, [](void* pvParameter) {
    Serial.println("WiFi Task starting on Core 1...");

    displayMenu.connectToWiFi("TIMEOSPACE", "1234Saja", 30);
    displayMenu.showCircleLoading("Connecting WiFi", 50);
    wifiSecureClient.setInsecure();

    if (!dateTimeManager.begin()) {
      Serial.println("Failed to initialize NTP Client!");
    }

    if (!firestoreClient.begin(FIREBASE_API_KEY, FIREBASE_USER_EMAIL, FIREBASE_USER_PASSWORD, FIREBASE_PROJECT_ID)) {
      Serial.println("Firebase Firestore Error: " + firestoreClient.getLastError());
      while (1) { delay(1000); }
    }

    Serial.println("Firebase initialization successful");

    disableLoopWDT();
    disableCore0WDT();
    disableCore1WDT();

    systemBuzzer.toggleInit(100, 2);
    changeSystemState(SYSTEM_IDLE);
    systemInitialized = true;

    for (;;) {
      firestoreClient.loop();
      updateDateTime();
      processGlobalSession();
      vTaskDelay(pdMS_TO_TICKS(100));
    }
  });
}

void updateDateTime() {
  static uint32_t lastUpdate = 0;
  if (millis() - lastUpdate >= 1000 && dateTimeManager.update()) {
    lastUpdate = millis();
  }
}

void processGlobalSession() {
  if (!firestoreClient.isReady()) return;

  static uint32_t lastSync = 0;
  if (millis() - lastSync >= 5000 || forceFirebaseSync) {
    forceFirebaseSync = false;
    lastSync = millis();

    String sessionResponse = firestoreClient.getDocument("systemStatus/hardware", "", true);
    JsonDocument sessionDoc;
    deserializeJson(sessionDoc, sessionResponse);

    if (!sessionDoc.containsKey("fields")) {
      return;
    }

    processSessionData(sessionDoc);

    if (!currentSession.isActive) {
      handleRFIDDetection();
    }
  }
}

void processSessionData(JsonDocument& sessionDoc) {
  bool isInUse = sessionDoc["fields"]["isInUse"]["booleanValue"].as<bool>();

  if (xSemaphoreTake(stateMutex, pdMS_TO_TICKS(100)) == pdTRUE) {
    if (isInUse) {
      currentSession.isActive = true;
      currentSession.sessionType = sessionDoc["fields"]["sessionType"]["stringValue"].as<String>();
      currentSession.userId = sessionDoc["fields"]["currentUserId"]["stringValue"].as<String>();
      currentSession.userName = sessionDoc["fields"]["currentUserName"]["stringValue"].as<String>();

      if (currentSession.sessionType == "weighing") {
        handleWeighingSession(sessionDoc);
      } else if (currentSession.sessionType == "rfid") {
        handleRFIDPairingSession();
      }
    } else {
      if (currentSession.isActive) {
        currentSession.isActive = false;
        changeSystemState(SYSTEM_IDLE);
      }
    }
    xSemaphoreGive(stateMutex);
  }
}

void handleWeighingSession(JsonDocument& sessionDoc) {
  String userRfid = sessionDoc["fields"]["userRfid"]["stringValue"].as<String>();
  currentSession.eatingPattern = sessionDoc["fields"]["eatingPattern"]["stringValue"].as<String>();
  currentSession.childResponse = sessionDoc["fields"]["childResponse"]["stringValue"].as<String>();
  currentSession.measurementComplete = sessionDoc["fields"]["measurementComplete"]["booleanValue"].as<bool>();

  if (!currentSession.measurementComplete) {
    loadUserDataForSession(currentSession.userId, userRfid);
    changeSystemState(SYSTEM_WEIGHING_SESSION);
  }
}

void handleRFIDPairingSession() {
  changeSystemState(SYSTEM_RFID_PAIRING);

  if (xSemaphoreTake(dataReadyMutex, pdMS_TO_TICKS(10)) == pdTRUE) {
    if (!currentRfidTag.isEmpty()) {
      updateGlobalSessionRFID(currentRfidTag);
      currentRfidTag = "";
    }
    xSemaphoreGive(dataReadyMutex);
  }
}

void loadUserDataForSession(String userId, String rfidTag) {
  String userResponse = firestoreClient.getDocument("users/" + userId, "", true);
  JsonDocument userDoc;
  deserializeJson(userResponse, userResponse);

  if (userDoc.containsKey("fields")) {
    currentSessionUser.userId = userId;
    currentSessionUser.childName = userDoc["fields"]["namaAnak"]["stringValue"].as<String>();
    currentSessionUser.gender = userDoc["fields"]["gender"]["stringValue"].as<String>();
    currentSessionUser.rfidTag = rfidTag;
    currentSessionUser.email = userDoc["fields"]["email"]["stringValue"].as<String>();
    currentSessionUser.userName = userDoc["fields"]["username"]["stringValue"].as<String>();
    currentSessionUser.birthDate = userDoc["fields"]["birthdate"]["stringValue"].as<String>();
    currentSessionUser.userRole = userDoc["fields"]["role"]["stringValue"].as<String>();

    currentMeasurement.eatingPatternIndex = getEatingPatternIndex(currentSession.eatingPattern);
    currentMeasurement.childResponseIndex = getChildResponseIndex(currentSession.childResponse);
  }
}

void handleRFIDDetection() {
  if (xSemaphoreTake(dataReadyMutex, pdMS_TO_TICKS(10)) == pdTRUE) {
    if (!currentRfidTag.isEmpty()) {
      String usersResponse = firestoreClient.getDocument("users", "", true);
      JsonDocument usersDoc;
      deserializeJson(usersDoc, usersResponse);

      for (JsonVariant user : usersDoc["documents"].as<JsonArray>()) {
        String userRfid = user["fields"]["rfid"]["stringValue"].as<String>();
        String userEmail = user["fields"]["email"]["stringValue"].as<String>();

        if (userRfid == currentRfidTag) {
          if (userEmail == "admin@gmail.com") {
            changeSystemState(SYSTEM_ADMIN_MODE);
          } else {
            changeSystemState(SYSTEM_QUICK_MEASURE);
          }
          systemBuzzer.toggleInit(100, 3);
          currentRfidTag = "";
          break;
        }
      }
    }
    xSemaphoreGive(dataReadyMutex);
  }
}

void updateGlobalSessionData(float weightValue, float heightValue, String nutritionStatus, String eatingPattern, String childResponse) {
  JsonDocument updateDoc;
  JsonObject fields = updateDoc.createNestedObject("fields");

  JsonObject weightField = fields.createNestedObject("weight");
  weightField["doubleValue"] = weightValue;

  JsonObject heightField = fields.createNestedObject("height");
  heightField["doubleValue"] = heightValue;

  JsonObject nutritionField = fields.createNestedObject("nutritionStatus");
  nutritionField["stringValue"] = nutritionStatus;

  JsonObject eatingField = fields.createNestedObject("eatingPattern");
  eatingField["stringValue"] = eatingPattern;

  JsonObject responseField = fields.createNestedObject("childResponse");
  responseField["stringValue"] = childResponse;

  JsonObject completeField = fields.createNestedObject("measurementComplete");
  completeField["booleanValue"] = true;

  JsonObject activityField = fields.createNestedObject("lastActivity");
  activityField["timestampValue"] = dateTimeManager.getISOString();

  String updateDocStr;
  serializeJson(updateDoc, updateDocStr);

  firestoreClient.updateDocument("systemStatus/hardware", updateDocStr, "weight,height,nutritionStatus,eatingPattern,childResponse,measurementComplete,lastActivity", true);
}

void updateGlobalSessionRFID(String rfidValue) {
  JsonDocument updateDoc;
  JsonObject fields = updateDoc.createNestedObject("fields");

  JsonObject rfidField = fields.createNestedObject("rfid");
  rfidField["stringValue"] = rfidValue;

  String updateDocStr;
  serializeJson(updateDoc, updateDocStr);

  firestoreClient.updateDocument("systemStatus/hardware", updateDocStr, "rfid", true);
}


int getEatingPatternIndex(String pattern) {
  if (pattern == "Kurang") return 0;
  if (pattern == "Cukup") return 1;
  if (pattern == "Berlebih") return 2;
  return 0;
}

int getChildResponseIndex(String response) {
  if (response == "Pasif") return 0;
  if (response == "Sedang") return 1;
  if (response == "Aktif") return 2;
  return 0;
}

String getEatingPatternString(int index) {
  if (index == 0) return "Kurang";
  if (index == 1) return "Cukup";
  if (index == 2) return "Berlebih";
  return "Kurang";
}

String getChildResponseString(int index) {
  if (index == 0) return "Pasif";
  if (index == 1) return "Sedang";
  if (index == 2) return "Aktif";
  return "Pasif";
}
