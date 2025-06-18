// ===== WEIGHING STATE MACHINE =====
// Clean, event-driven approach for weighing process

// Global state variables definitions - declared as extern in Header.h
WeighingFlowState currentFlowState = FLOW_IDLE;
String flowEvent = "";
uint32_t lastSensorUpdate = 0;
uint32_t lastEventCheck = 0;
bool flowDataReady = false;

// Data structure instances - declared as extern in Header.h
FlowUserData flowUser;
FlowMeasurementData flowMeasurement;

// ===== STATE MACHINE MAIN HANDLER =====
void handleWeighingStateMachine() {
  // Check for events from app every 100ms
  if (millis() - lastEventCheck >= 100) {
    checkAppEvents();
    lastEventCheck = millis();
  }

  // Handle current state
  switch (currentFlowState) {
    case FLOW_IDLE:
      handleIdleState();
      break;

    case FLOW_WAIT_RFID:
      handleWaitRfidState();
      break;

    case FLOW_WEIGHING:
      handleWeighingState();
      break;

    case FLOW_HEIGHT:
      handleHeightState();
      break;

    case FLOW_CALCULATING:
      handleCalculatingState();
      break;

    case FLOW_COMPLETE:
      handleCompleteState();
      break;

    case FLOW_ERROR:
      handleErrorState();
      break;
  }

  // Update real-time sensor data every 500ms
  if (millis() - lastSensorUpdate >= 500) {
    updateRealTimeSensors();
    lastSensorUpdate = millis();
  }
}

// ===== EVENT CHECKER =====
void checkAppEvents() {
  if (!firestoreClient.isReady()) return;

  // Get current event from Firestore
  String sessionResponse = firestoreClient.getDocument("systemStatus/hardware", "", false);
  JsonDocument sessionDoc;
  deserializeJson(sessionDoc, sessionResponse);

  if (sessionDoc.containsKey("fields")) {
    String newEvent = sessionDoc["fields"]["weighingEvent"]["stringValue"].as<String>();

    if (newEvent != flowEvent && !newEvent.isEmpty()) {
      flowEvent = newEvent;
      Serial.printf("| Event received: %s\n", flowEvent.c_str());
      processEvent(flowEvent);
    }
  }
}

// ===== EVENT PROCESSOR =====
void processEvent(String event) {
  Serial.printf("| Processing event: %s in state: %d\n", event.c_str(), currentFlowState);

  if (event == "start_weighing") {
    if (currentFlowState == FLOW_IDLE) {
      loadUserDataFromFirestore();
      changeFlowState(FLOW_WAIT_RFID);
    }
  } else if (event == "continue_weight") {
    if (currentFlowState == FLOW_WEIGHING) {
      flowMeasurement.weight = currentWeight;
      Serial.printf("| Weight confirmed: %.1f kg\n", flowMeasurement.weight);
      changeFlowState(FLOW_HEIGHT);
    }
  } else if (event == "continue_height") {
    if (currentFlowState == FLOW_HEIGHT) {
      flowMeasurement.height = currentHeight;
      Serial.printf("| Height confirmed: %.1f cm\n", flowMeasurement.height);
      changeFlowState(FLOW_CALCULATING);
    }
  } else if (event == "cancel") {
    Serial.println("| Cancel event - resetting to idle");
    resetToIdle();
  }

  // Clear event after processing
  clearEvent();
}

// ===== STATE HANDLERS =====
void handleIdleState() {
  // Nothing to do, waiting for start_weighing event
}

void handleWaitRfidState() {
  // Display RFID waiting message
  displayRFIDWaiting();

  // Check for RFID tap
  if (!currentRfidTag.isEmpty()) {
    if (currentRfidTag == flowUser.userRfid) {
      Serial.println("| RFID verified successfully");
      systemBuzzer.toggleInit(100, 2);
      sendAppUpdate("rfid_verified", "weighing");
      changeFlowState(FLOW_WEIGHING);
    } else {
      Serial.println("| RFID mismatch - resetting to idle");
      systemBuzzer.toggleInit(200, 3);
      sendAppUpdate("rfid_failed", "idle");
      resetToIdle();
    }
    currentRfidTag = "";
  }
}

void handleWeighingState() {
  // Display weighing screen
  displayStateMachineWeighingScreen();

  // Real-time weight data sudah dikirim via updateRealTimeSensors()
  // Waiting for continue_weight event from app
}

void handleHeightState() {
  // Display height screen
  displayHeightScreen();

  // Real-time height data sudah dikirim via updateRealTimeSensors()
  // Waiting for continue_height event from app
}

void handleCalculatingState() {
  // Display calculating screen
  displayCalculatingScreen();

  // Calculate IMT first
  flowMeasurement.imt = calculateIMT(flowMeasurement.weight, flowMeasurement.height);

  // Calculate nutrition status using KNN with current measurement data
  currentMeasurement.weight = flowMeasurement.weight;
  currentMeasurement.height = flowMeasurement.height;
  currentMeasurement.eatingPatternIndex = getEatingPatternIndex(flowUser.eatingPattern);
  currentMeasurement.childResponseIndex = getChildResponseIndex(flowUser.childResponse);

  String nutritionStatus = getNutritionStatusFromSession();
  flowMeasurement.nutritionStatus = nutritionStatus;

  Serial.printf("| Calculation complete: IMT=%.2f, Status=%s\n",
                flowMeasurement.imt, nutritionStatus.c_str());

  // Send final data to app
  sendFinalMeasurementData();
  changeFlowState(FLOW_COMPLETE);
}

void handleCompleteState() {
  // Display completion screen
  displayCompleteScreen();

  // Auto reset to idle after 3 seconds
  static uint32_t completeTime = millis();
  if (millis() - completeTime > 3000) {
    resetToIdle();
  }
}

void handleErrorState() {
  // Display error and reset
  Serial.println("| Error state - resetting to idle");
  resetToIdle();
}

// ===== STATE CHANGE HANDLER =====
void changeFlowState(WeighingFlowState newState) {
  Serial.printf("| State change: %d → %d\n", currentFlowState, newState);
  currentFlowState = newState;
  forceFirebaseSync = true;

  // Update display immediately
  switch (newState) {
    case FLOW_WAIT_RFID:
      changeSystemState(SYSTEM_WEIGHING_SESSION);
      currentWeighingState = WEIGHING_RFID_CONFIRMATION;
      break;
    case FLOW_WEIGHING:
      currentWeighingState = WEIGHING_GET_WEIGHT;
      break;
    case FLOW_HEIGHT:
      currentWeighingState = WEIGHING_GET_HEIGHT;
      break;
    case FLOW_CALCULATING:
      currentWeighingState = WEIGHING_SEND_DATA;
      break;
    case FLOW_COMPLETE:
      currentWeighingState = WEIGHING_COMPLETE;
      break;
    default:
      currentWeighingState = WEIGHING_IDLE;
      break;
  }
}

// ===== UTILITY FUNCTIONS =====
void resetToIdle() {
  changeFlowState(FLOW_IDLE);
  changeSystemState(SYSTEM_IDLE);
  currentWeighingState = WEIGHING_IDLE;

  // Clear data
  flowUser = FlowUserData();
  flowMeasurement = FlowMeasurementData();
  flowEvent = "";

  // Clear Firestore state
  sendAppUpdate("reset", "idle");

  Serial.println("| Reset to idle complete");
}

void loadUserDataFromFirestore() {
  // Get current session data from Firestore
  String sessionResponse = firestoreClient.getDocument("systemStatus/hardware", "", false);
  JsonDocument sessionDoc;
  deserializeJson(sessionDoc, sessionResponse);

  if (sessionDoc.containsKey("fields")) {
    flowUser.userId = sessionDoc["fields"]["currentUserId"]["stringValue"].as<String>();
    flowUser.userName = sessionDoc["fields"]["currentUserName"]["stringValue"].as<String>();
    flowUser.userRfid = sessionDoc["fields"]["userRfid"]["stringValue"].as<String>();
    flowUser.eatingPattern = sessionDoc["fields"]["eatingPattern"]["stringValue"].as<String>();
    flowUser.childResponse = sessionDoc["fields"]["childResponse"]["stringValue"].as<String>();
    flowUser.gender = sessionDoc["fields"]["gender"]["stringValue"].as<String>();
    flowUser.ageYears = sessionDoc["fields"]["ageYears"]["integerValue"].as<int>();
    flowUser.ageMonths = sessionDoc["fields"]["ageMonths"]["integerValue"].as<int>();

    Serial.printf("| User data loaded: %s (%s)\n", flowUser.userName.c_str(), flowUser.userRfid.c_str());

    // Also load into legacy structures for compatibility
    currentSession.userId = flowUser.userId;
    currentSession.userName = flowUser.userName;
    currentSession.eatingPattern = flowUser.eatingPattern;
    currentSession.childResponse = flowUser.childResponse;
    currentSession.gender = flowUser.gender;
    currentSession.ageYears = flowUser.ageYears;
    currentSession.ageMonths = flowUser.ageMonths;

    currentSessionUser.userId = flowUser.userId;
    currentSessionUser.childName = flowUser.userName;
    currentSessionUser.rfidTag = flowUser.userRfid;
    currentSessionUser.gender = flowUser.gender;
    currentSessionUser.ageYears = flowUser.ageYears;
    currentSessionUser.ageMonths = flowUser.ageMonths;
  }
}

void sendAppUpdate(String status, String appStep) {
  JsonDocument updateDoc;
  JsonObject fields = updateDoc.createNestedObject("fields");

  JsonObject statusField = fields.createNestedObject("weighingStatus");
  statusField["stringValue"] = status;

  JsonObject stepField = fields.createNestedObject("currentStep");
  stepField["stringValue"] = appStep;

  JsonObject activityField = fields.createNestedObject("lastActivity");
  activityField["timestampValue"] = dateTimeManager.getISO8601Time();

  String updateDocStr;
  serializeJson(updateDoc, updateDocStr);
  firestoreClient.updateDocument("systemStatus/hardware", updateDocStr, "weighingStatus,currentStep,lastActivity", false);

  Serial.printf("| App update sent: status=%s, step=%s\n", status.c_str(), appStep.c_str());
}

void clearEvent() {
  JsonDocument updateDoc;
  JsonObject fields = updateDoc.createNestedObject("fields");
  JsonObject eventField = fields.createNestedObject("weighingEvent");
  eventField["stringValue"] = "";

  String updateDocStr;
  serializeJson(updateDoc, updateDocStr);
  firestoreClient.updateDocument("systemStatus/hardware", updateDocStr, "weighingEvent", false);
}

void updateRealTimeSensors() {
  if (currentFlowState != FLOW_WEIGHING && currentFlowState != FLOW_HEIGHT) {
    return;  // Only send real-time data during weighing and height states
  }

  JsonDocument updateDoc;
  JsonObject fields = updateDoc.createNestedObject("fields");

  JsonObject weightField = fields.createNestedObject("realTimeWeight");
  weightField["doubleValue"] = currentWeight;

  JsonObject heightField = fields.createNestedObject("realTimeHeight");
  heightField["doubleValue"] = currentHeight;

  String updateDocStr;
  serializeJson(updateDoc, updateDocStr);
  firestoreClient.updateDocument("systemStatus/hardware", updateDocStr, "realTimeWeight,realTimeHeight", false);
}

void sendFinalMeasurementData() {
  Serial.println("| ===== SENDING FINAL MEASUREMENT DATA =====");
  Serial.printf("| Weight: %.1f kg, Height: %.1f cm\n", flowMeasurement.weight, flowMeasurement.height);
  Serial.printf("| IMT: %.2f, Status: %s\n", flowMeasurement.imt, flowMeasurement.nutritionStatus.c_str());
  Serial.printf("| Eating: %s, Response: %s\n", flowUser.eatingPattern.c_str(), flowUser.childResponse.c_str());

  // BLOCKING APPROACH for critical final data
  int retryCount = 0;
  bool updateSuccess = false;

  while (!updateSuccess && retryCount < 5) {
    JsonDocument updateDoc;
    JsonObject fields = updateDoc.createNestedObject("fields");

    // Final measurement data
    JsonObject weightField = fields.createNestedObject("weight");
    weightField["doubleValue"] = flowMeasurement.weight;

    JsonObject heightField = fields.createNestedObject("height");
    heightField["doubleValue"] = flowMeasurement.height;

    JsonObject imtField = fields.createNestedObject("imt");
    imtField["doubleValue"] = flowMeasurement.imt;

    JsonObject nutritionField = fields.createNestedObject("nutritionStatus");
    nutritionField["stringValue"] = flowMeasurement.nutritionStatus;

    JsonObject eatingField = fields.createNestedObject("eatingPattern");
    eatingField["stringValue"] = flowUser.eatingPattern;

    JsonObject responseField = fields.createNestedObject("childResponse");
    responseField["stringValue"] = flowUser.childResponse;

    JsonObject completeField = fields.createNestedObject("measurementComplete");
    completeField["booleanValue"] = true;

    JsonObject statusField = fields.createNestedObject("weighingStatus");
    statusField["stringValue"] = "measurement_complete";

    JsonObject activityField = fields.createNestedObject("lastActivity");
    activityField["timestampValue"] = dateTimeManager.getISO8601Time();

    String updateDocStr;
    serializeJson(updateDoc, updateDocStr);
    Serial.printf("| Final Data Attempt %d - Sending to Firestore:\n", retryCount + 1);
    Serial.println(updateDocStr);

    updateSuccess = firestoreClient.updateDocument("systemStatus/hardware", updateDocStr, "weight,height,imt,nutritionStatus,eatingPattern,childResponse,measurementComplete,weighingStatus,lastActivity", false);
    Serial.printf("| Final data update result: %s\n", updateSuccess ? "SUCCESS" : "FAILED");

    if (!updateSuccess) {
      retryCount++;
      // Responsive waiting instead of delay
      uint32_t waitStart = millis();
      while (millis() - waitStart < 1000) {
        firestoreClient.loop();
        yield();
      }
    }
  }

  if (updateSuccess) {
    forceFirebaseSync = true;
    // Responsive waiting for critical final data propagation
    uint32_t waitStart = millis();
    while (millis() - waitStart < 3000) {
      firestoreClient.loop();
      yield();
    }
    Serial.println("| ===== FINAL MEASUREMENT DATA SENT SUCCESSFULLY =====");
  } else {
    Serial.println("| ===== FAILED TO SEND FINAL MEASUREMENT DATA =====");
  }
}

// ===== DISPLAY FUNCTIONS =====
void displayRFIDWaiting() {
  const char *waitLines[] = { "MENUNGGU RFID", "TAP KARTU ANDA", "UNTUK MULAI" };
  displayMenu.renderBoxedText(waitLines, 3);
}

void displayStateMachineWeighingScreen() {
  String weightStr = String(currentWeight, 1) + " KG";
  const char *weightLines[] = { "MENGUKUR BERAT", weightStr.c_str(), "KONFIRMASI DI", "APLIKASI" };
  displayMenu.renderBoxedText(weightLines, 4);
}

void displayHeightScreen() {
  String heightStr = String(currentHeight, 1) + " CM";
  const char *heightLines[] = { "MENGUKUR TINGGI", heightStr.c_str(), "KONFIRMASI DI", "APLIKASI" };
  displayMenu.renderBoxedText(heightLines, 4);
}

void displayCalculatingScreen() {
  const char *calcLines[] = { "MENGHITUNG", "STATUS GIZI", "MOHON TUNGGU..." };
  displayMenu.renderBoxedText(calcLines, 3);
}

void displayCompleteScreen() {
  const char *completeLines[] = { "PENGUKURAN", "SELESAI!", "CEK APLIKASI" };
  displayMenu.renderBoxedText(completeLines, 3);
}