////////// Display Functions for Mode-based System //////////

void initializeDisplayCallback() {
  displayMenu.clear();
  displayMenu.setFont(ArialMT_Plain_24);
  displayMenu.setTextAlignment(TEXT_ALIGN_CENTER);
  displayMenu.drawString(64, 0, "INTAN");
  displayMenu.setFont(ArialMT_Plain_10);
  displayMenu.drawString(64, 25, "Child Nutrition");
  displayMenu.drawString(64, 35, "Monitoring System");
  displayMenu.drawString(64, 55, "Starting...");
  displayMenu.display();
}

void displayMenuCallback() {
  // All display operations based on current system state
  switch (currentSystemState) {
    case SYSTEM_STARTUP:
      // Startup screen
      displayMenu.clear();
      displayMenu.setFont(ArialMT_Plain_24);
      displayMenu.setTextAlignment(TEXT_ALIGN_CENTER);
      displayMenu.drawString(64, 0, "INTAN");
      displayMenu.setFont(ArialMT_Plain_10);
      displayMenu.drawString(64, 25, "System Startup...");
      displayMenu.drawString(64, 35, "Mode-based System");
      displayMenu.display();
      break;
      
    case SYSTEM_IDLE:
      // Idle screen
      displayMenu.clear();
      displayMenu.setFont(ArialMT_Plain_24);
      displayMenu.setTextAlignment(TEXT_ALIGN_CENTER);
      displayMenu.drawString(64, 0, "IDLE");
      displayMenu.setFont(ArialMT_Plain_10);
      displayMenu.setTextAlignment(TEXT_ALIGN_LEFT);
      if (systemInitialized) {
        displayMenu.drawString(5, 20, "System Ready");
        displayMenu.drawString(5, 30, "RTDB Mode: " + currentRTDBMode);
      } else {
        displayMenu.drawString(5, 20, "Connecting...");
      }
      displayMenu.drawString(5, 45, "Tap RFID to Start");
      displayMenu.display();
      break;
      
    case SYSTEM_RFID_PAIRING:
      // Mode-based RFID pairing screen
      displayMenu.clear();
      displayMenu.setFont(ArialMT_Plain_16);
      displayMenu.setTextAlignment(TEXT_ALIGN_CENTER);
      displayMenu.drawString(64, 0, "RFID");
      displayMenu.drawString(64, 20, "PAIRING");
      displayMenu.setFont(ArialMT_Plain_10);
      displayMenu.drawString(64, 45, "Tap kartu RFID...");
      displayMenu.display();
      break;
      
    case SYSTEM_WEIGHING_SESSION:
      // Mode-based weighing screen
      displayMenu.clear();
      displayMenu.setFont(ArialMT_Plain_10);
      displayMenu.setTextAlignment(TEXT_ALIGN_LEFT);
      displayMenu.drawString(5, 0, "WEIGHING SESSION");
      displayMenu.drawString(5, 15, "User: " + currentSession.userName);
      
      String weightHeightStr = "W: " + String(currentWeight, 1) + " kg  H: " + String(currentHeight, 1) + " cm";
      displayMenu.drawString(5, 30, weightHeightStr);
      
      if (!currentRfidTag.isEmpty()) {
        displayMenu.drawString(5, 45, "RFID: " + currentRfidTag);
        
        // If RFID matched and measurements are valid
        if (currentWeight > 5.0 && currentHeight > 50.0) {
          // Measurement complete - calculate nutrition status
          String nutritionStatus = getNutritionStatusFromSession();
          
          displayMenu.drawString(5, 55, "Status: " + nutritionStatus);
          
          // Send results after a short delay
          static unsigned long measurementCompleteTime = 0;
          if (measurementCompleteTime == 0) {
            measurementCompleteTime = millis();
            systemBuzzer.toggleInit(100, 3);
          }
          
          if (millis() - measurementCompleteTime > 2000) {
            sendModeBasedWeighingResultsWiFi(currentWeight, currentHeight, nutritionStatus);
            measurementCompleteTime = 0;
            currentRfidTag = "";
          }
        }
      }
      displayMenu.display();
      break;
      
    case SYSTEM_QUICK_MEASURE:
      // Quick measure screen (legacy)
      displayMenu.clear();
      displayMenu.setFont(ArialMT_Plain_10);
      displayMenu.setTextAlignment(TEXT_ALIGN_LEFT);
      displayMenu.drawString(5, 0, "QUICK MEASURE");
      
      String weightStr = "Weight: " + String(currentWeight, 1) + " kg";
      displayMenu.drawString(5, 20, weightStr);
      
      String heightStr = "Height: " + String(currentHeight, 1) + " cm";
      displayMenu.drawString(5, 35, heightStr);
      
      if (currentWeight > 5.0 && currentHeight > 50.0) {
        float bmi = calculateBMI(currentWeight, currentHeight);
        String bmiStr = "BMI: " + String(bmi, 1) + " - " + getBMICategory(bmi);
        displayMenu.drawString(5, 50, bmiStr);
      }
      displayMenu.display();
      break;
      
    case SYSTEM_ADMIN_MODE:
      // Admin screen
      displayMenu.clear();
      displayMenu.setFont(ArialMT_Plain_16);
      displayMenu.setTextAlignment(TEXT_ALIGN_CENTER);
      displayMenu.drawString(64, 0, "ADMIN");
      displayMenu.setFont(ArialMT_Plain_10);
      displayMenu.setTextAlignment(TEXT_ALIGN_LEFT);
      displayMenu.drawString(5, 20, "1. Calibrate");
      displayMenu.drawString(5, 30, "2. Set Height Pole");
      displayMenu.drawString(5, 40, "3. System Info");
      displayMenu.drawString(5, 55, "Tap RFID to Exit");
      displayMenu.display();
      break;
      
    default:
      // Default to startup screen
      displayMenu.clear();
      displayMenu.setFont(ArialMT_Plain_24);
      displayMenu.setTextAlignment(TEXT_ALIGN_CENTER);
      displayMenu.drawString(64, 0, "INTAN");
      displayMenu.setFont(ArialMT_Plain_10);
      displayMenu.drawString(64, 25, "Please Wait...");
      displayMenu.display();
      break;
  }
  
  // Handle RFID detection for mode-based system
  if (!currentRfidTag.isEmpty() && systemInitialized) {
    if (currentRTDBMode == "pairing") {
      // RFID Pairing mode - send detected RFID
      sendModeBasedRFIDDetectionWiFi(currentRfidTag);
      systemBuzzer.toggleInit(100, 2);
      currentRfidTag = "";
    } 
    else if (currentRTDBMode == "idle") {
      // Check for admin card
      if (currentRfidTag == "ADMIN_CARD") {
        changeSystemState(SYSTEM_ADMIN_MODE);
        systemBuzzer.toggleInit(100, 3);
      }
      currentRfidTag = "";
    }
  }
}