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

  // Skip complex state machine to avoid heap corruption
  // Use simple direct approach instead

  // Session handling for operations
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

void processSessionData(JsonDocument &sessionDoc) {
  bool isInUse = sessionDoc["fields"]["isInUse"]["booleanValue"].as<bool>();
  if (isInUse) {
    currentSession.isActive = true;
    currentSession.sessionType = sessionDoc["fields"]["sessionType"]["stringValue"].as<String>();
    currentSession.userId = sessionDoc["fields"]["currentUserId"]["stringValue"].as<String>();
    currentSession.userName = sessionDoc["fields"]["currentUserName"]["stringValue"].as<String>();
    Serial.print("| Parsed sessionType: '");
    Serial.print(currentSession.sessionType);
    Serial.print("' length: ");
    Serial.println(currentSession.sessionType.length());
    if (currentSession.sessionType == "weighing") {
      Serial.println("| Entering weighing session");
      handleWeighingSession(sessionDoc);
    } else if (currentSession.sessionType == "rfid") {
      Serial.println("| Entering RFID pairing session");
      handleRFIDPairingSession();
    } else {
      Serial.print("| Unknown session type: ");
      Serial.println(currentSession.sessionType);
    }
  } else {
    if (currentSession.isActive) {
      currentSession.isActive = false;
      changeSystemState(SYSTEM_IDLE);
    }
  }
}

void handleWeighingSession(JsonDocument &sessionDoc) {
  String userRfid = sessionDoc["fields"]["userRfid"]["stringValue"].as<String>();
  currentSession.eatingPattern = sessionDoc["fields"]["eatingPattern"]["stringValue"].as<String>();
  currentSession.childResponse = sessionDoc["fields"]["childResponse"]["stringValue"].as<String>();
  currentSession.gender = sessionDoc["fields"]["gender"]["stringValue"].as<String>();
  currentSession.ageYears = sessionDoc["fields"]["ageYears"]["integerValue"].as<int>();
  currentSession.ageMonths = sessionDoc["fields"]["ageMonths"]["integerValue"].as<int>();
  currentSession.measurementComplete = sessionDoc["fields"]["measurementComplete"]["booleanValue"].as<bool>();

  // Handle event-driven weighing using weighingEvent and weighingStatus
  String weighingEvent = sessionDoc["fields"]["weighingEvent"]["stringValue"].as<String>();
  String weighingStatus = sessionDoc["fields"]["weighingStatus"]["stringValue"].as<String>();
  
  if (!weighingEvent.isEmpty() || !weighingStatus.isEmpty()) {
    Serial.printf("| Event-driven weighing: event=%s, status=%s\n", weighingEvent.c_str(), weighingStatus.c_str());
    handleEventDrivenWeighing(weighingEvent, weighingStatus, userRfid);
  } else if (!currentSession.measurementComplete) {
    Serial.println("| Standard weighing mode");
    loadUserDataForSession(currentSession.userId, userRfid);
    changeSystemState(SYSTEM_WEIGHING_SESSION);
  }
}

void handleEventDrivenWeighing(String weighingEvent, String weighingStatus, String userRfid) {
  static String lastEvent = "";
  static String lastStatus = "";

  // Load user data if not already loaded
  if (currentSessionUser.userId.isEmpty()) {
    loadUserDataForSession(currentSession.userId, userRfid);
    changeSystemState(SYSTEM_WEIGHING_SESSION);
    currentWeighingState = WEIGHING_RFID_CONFIRMATION;
    forceFirebaseSync = true;
    return;  // Wait for RFID verification first
  }

  // Update sensor data every 2 seconds instead of 500ms to reduce load
  static uint32_t lastSensorUpdate = 0;
  if (millis() - lastSensorUpdate >= 2000) {
    updateRealTimeSensorData();
    lastSensorUpdate = millis();
  }

  // Process event changes first (higher priority)  
  if (weighingEvent != lastEvent && !weighingEvent.isEmpty()) {
    Serial.printf("| EVENT: %s\n", weighingEvent.c_str());
    
    if (weighingEvent == "continue_weight") {
      Serial.printf("| Weight confirmed: %.1f kg\n", currentWeight);
      currentMeasurement.weight = currentWeight;
      sendAppStatusUpdate("height");
      currentWeighingState = WEIGHING_GET_HEIGHT;
    }
    else if (weighingEvent == "continue_height") {
      Serial.printf("| Height confirmed: %.1f cm\n", currentHeight);
      currentMeasurement.height = currentHeight;
      sendAppStatusUpdate("calculating");
      currentWeighingState = WEIGHING_SEND_DATA;
    }
    else if (weighingEvent == "cancel") {
      Serial.println("| Cancel event - reset to idle");
      backToIdleState();
      return;
    }
    
    // Clear the event - simple approach
    clearWeighingEvent();
    lastEvent = weighingEvent;
  }

  // Process status changes
  if (weighingStatus != lastStatus && !weighingStatus.isEmpty()) {
    Serial.printf("| STATUS: %s\n", weighingStatus.c_str());
    
    if (weighingStatus == "waiting_rfid") {
      currentWeighingState = WEIGHING_RFID_CONFIRMATION;
    }
    else if (weighingStatus == "weighing") {
      currentWeighingState = WEIGHING_GET_WEIGHT;
    }
    else if (weighingStatus == "height") {
      currentWeighingState = WEIGHING_GET_HEIGHT;
    }
    else if (weighingStatus == "calculating") {
      currentWeighingState = WEIGHING_SEND_DATA;
    }
    
    lastStatus = weighingStatus;
  }

  changeSystemState(SYSTEM_WEIGHING_SESSION);
}

void updateRealTimeSensorData() {
  // SIMPLE APPROACH - no static timing check, called externally
  JsonDocument updateDoc;
  JsonObject fields = updateDoc.createNestedObject("fields");

  JsonObject realTimeWeightField = fields.createNestedObject("realTimeWeight");
  realTimeWeightField["doubleValue"] = currentWeight;

  JsonObject realTimeHeightField = fields.createNestedObject("realTimeHeight");
  realTimeHeightField["doubleValue"] = currentHeight;

  JsonObject activityField = fields.createNestedObject("lastActivity");
  activityField["timestampValue"] = dateTimeManager.getISO8601Time();

  String updateDocStr;
  serializeJson(updateDoc, updateDocStr);
  firestoreClient.updateDocument("systemStatus/hardware", updateDocStr, "realTimeWeight,realTimeHeight,lastActivity", true);

  // Clear immediately to free memory
  updateDoc.clear();
}

void clearWeighingEvent() {
  Serial.println("| clearWeighingEvent() called - SIMPLE approach");

  JsonDocument updateDoc;
  JsonObject fields = updateDoc.createNestedObject("fields");
  JsonObject eventField = fields.createNestedObject("weighingEvent");
  eventField["stringValue"] = "";

  String updateDocStr;
  serializeJson(updateDoc, updateDocStr);
  firestoreClient.updateDocument("systemStatus/hardware", updateDocStr, "weighingEvent", false);
  
  forceFirebaseSync = true;
  Serial.println("| Weighing event cleared");
  
  // Clear immediately
  updateDoc.clear();
}

void sendAppStatusUpdate(String status) {
  Serial.printf("| sendAppStatusUpdate() called with status: %s\n", status.c_str());

  JsonDocument updateDoc;
  JsonObject fields = updateDoc.createNestedObject("fields");
  JsonObject statusField = fields.createNestedObject("weighingStatus");
  statusField["stringValue"] = status;
  JsonObject activityField = fields.createNestedObject("lastActivity");
  activityField["timestampValue"] = dateTimeManager.getISO8601Time();

  String updateDocStr;
  serializeJson(updateDoc, updateDocStr);
  firestoreClient.updateDocument("systemStatus/hardware", updateDocStr, "weighingStatus,lastActivity", false);
  
  forceFirebaseSync = true;
  Serial.printf("| App status updated to: %s\n", status.c_str());
  
  // Clear immediately  
  updateDoc.clear();
}

// Function removed - now using sendAppStatusUpdate("calculating") instead

void handleRFIDPairingSession() {
  Serial.println("| handleRFIDPairingSession() called - changing to SYSTEM_RFID_PAIRING");
  changeSystemState(SYSTEM_RFID_PAIRING);
}

void loadUserDataForSession(String userId, String rfidTag) {
  String userResponse = firestoreClient.getDocument("users/" + userId, "", true);
  JsonDocument userDoc;
  deserializeJson(userDoc, userResponse);
  if (userDoc.containsKey("fields")) {
    currentSessionUser.userId = userId;
    currentSessionUser.childName = userDoc["fields"]["name"]["stringValue"].as<String>();
    currentSessionUser.gender = currentSession.gender;
    currentSessionUser.ageYears = currentSession.ageYears;
    currentSessionUser.ageMonths = currentSession.ageMonths;
    currentSessionUser.rfidTag = rfidTag;
    currentMeasurement.eatingPatternIndex = getEatingPatternIndex(currentSession.eatingPattern);
    currentMeasurement.childResponseIndex = getChildResponseIndex(currentSession.childResponse);
  }
}

void handleRFIDDetection() {
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
}

void updateGlobalSessionData(float weightValue, float heightValue, String nutritionStatus, String eatingPattern, String childResponse) {
  float imt = calculateIMT(weightValue, heightValue);

  Serial.println("| ===== FINAL DATA UPDATE - SIMPLE =====");
  Serial.printf("| Weight: %.1f, Height: %.1f, IMT: %.2f\n", weightValue, heightValue, imt);
  Serial.printf("| Nutrition: %s, Eating: %s, Response: %s\n",
                nutritionStatus.c_str(), eatingPattern.c_str(), childResponse.c_str());

  // SINGLE ATTEMPT - no loops to avoid heap corruption
  JsonDocument updateDoc;
  JsonObject fields = updateDoc.createNestedObject("fields");
  JsonObject weightField = fields.createNestedObject("weight");
  weightField["doubleValue"] = weightValue;
  JsonObject heightField = fields.createNestedObject("height");
  heightField["doubleValue"] = heightValue;
  JsonObject imtField = fields.createNestedObject("imt");
  imtField["doubleValue"] = imt;
  JsonObject nutritionField = fields.createNestedObject("nutritionStatus");
  nutritionField["stringValue"] = nutritionStatus;
  JsonObject eatingField = fields.createNestedObject("eatingPattern");
  eatingField["stringValue"] = eatingPattern;
  JsonObject responseField = fields.createNestedObject("childResponse");
  responseField["stringValue"] = childResponse;
  JsonObject completeField = fields.createNestedObject("measurementComplete");
  completeField["booleanValue"] = true;
  JsonObject statusField = fields.createNestedObject("weighingStatus");
  statusField["stringValue"] = "measurement_complete";
  JsonObject activityField = fields.createNestedObject("lastActivity");
  activityField["timestampValue"] = dateTimeManager.getISO8601Time();

  String updateDocStr;
  serializeJson(updateDoc, updateDocStr);
  Serial.println("| Sending final data to Firestore:");

  bool updateSuccess = firestoreClient.updateDocument("systemStatus/hardware", updateDocStr, "weight,height,imt,nutritionStatus,eatingPattern,childResponse,measurementComplete,weighingStatus,lastActivity", false);
  Serial.printf("| Final data result: %s\n", updateSuccess ? "SUCCESS" : "FAILED");

  if (updateSuccess) {
    forceFirebaseSync = true;
    Serial.println("| ===== MEASUREMENT COMPLETED =====");
  } else {
    Serial.println("| ===== FAILED TO COMPLETE MEASUREMENT =====");
  }
  
  // Clear immediately
  updateDoc.clear();
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

void startEventDrivenWeighing() {
  Serial.println("| startEventDrivenWeighing() called - ULTRA SIMPLE approach");

  // Just do the update and trust Firestore - no verification loops
  JsonDocument updateDoc;
  JsonObject fields = updateDoc.createNestedObject("fields");
  JsonObject statusField = fields.createNestedObject("weighingStatus");
  statusField["stringValue"] = "weighing";
  JsonObject stepField = fields.createNestedObject("currentStep");
  stepField["stringValue"] = "weighing";
  JsonObject activityField = fields.createNestedObject("lastActivity");
  activityField["timestampValue"] = dateTimeManager.getISO8601Time();

  String updateDocStr;
  serializeJson(updateDoc, updateDocStr);
  Serial.println("| Sending weighing status update to Firestore:");
  Serial.println(updateDocStr);

  bool updateSuccess = firestoreClient.updateDocument("systemStatus/hardware", updateDocStr, "weighingStatus,currentStep,lastActivity", false);
  Serial.printf("| Firestore update result: %s\n", updateSuccess ? "SUCCESS" : "FAILED");

  // Clear immediately
  updateDoc.clear();
  
  if (updateSuccess) {
    forceFirebaseSync = true;
    Serial.println("| ===== WEIGHING STATUS UPDATE SENT - TRUSTING FIRESTORE =====");
    
    // Just wait a moment for propagation
    delay(2000);
    Serial.println("| Waited 2 seconds for Firestore propagation");
  } else {
    Serial.println("| Failed to update weighing status");
  }
}

void setRFIDVerificationFailed() {
  JsonDocument updateDoc;
  JsonObject fields = updateDoc.createNestedObject("fields");
  JsonObject failedField = fields.createNestedObject("rfidVerificationFailed");
  failedField["booleanValue"] = true;
  String updateDocStr;
  serializeJson(updateDoc, updateDocStr);
  firestoreClient.updateDocument("systemStatus/hardware", updateDocStr, "rfidVerificationFailed", true);
  forceFirebaseSync = true;
  Serial.println("| RFID verification failed - notifying app");
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
