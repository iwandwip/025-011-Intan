/**
 * ESP32-Firebase Integration Framework for Intan App
 * 
 * This file documents the complete ESP32-Firebase integration patterns used in the
 * Intan child nutrition monitoring system. It demonstrates how the ESP32 hardware
 * communicates with Firebase Firestore for real-time session management, user
 * authentication, and measurement data storage.
 * 
 * System Overview:
 * - ESP32 acts as an IoT device that directly communicates with Firebase
 * - App and ESP32 coordinate through Firebase Firestore (no direct communication)
 * - Session management prevents multiple users from accessing hardware simultaneously
 * - Real-time data synchronization enables seamless user experience
 */

#include <Arduino.h>
#include <WiFi.h>
#include <FirebaseESP32.h>
#include <ArduinoJson.h>
#include <Preferences.h>

// Kinematrix Framework Modules (Custom Arduino Library)
#include <Kinematrix.h>
#include <modules/sensor/UltrasonicSens.h>
#include <modules/sensor/HX711Sens.h>
#include <modules/sensor/RFID_Mfrc522.h>
#include <modules/display/SH1106Menu.h>
#include <modules/comms/USBSerial.h>

/**
 * FIREBASE CONFIGURATION
 * These credentials allow ESP32 to authenticate as admin for direct Firebase access
 */
#define FIREBASE_DATABASE_URL "https://intan-680a4-default-rtdb.firebaseio.com/"
#define FIREBASE_PROJECT_ID "intan-680a4"
#define FIREBASE_API_KEY "AIzaSyDPHpVgwHMWCvRdHHSlvopTHuXw0WgzVYI"
#define FIREBASE_USER_EMAIL "admin@gmail.com"
#define FIREBASE_USER_PASSWORD "admin123"

/**
 * HARDWARE PIN CONFIGURATION
 * These pin mappings are specific to the custom ESP32 board design
 */
#define RFID_SS_PIN 5
#define RFID_RST_PIN 27
#define ULTRASONIC_TRIG_PIN 32
#define ULTRASONIC_ECHO_PIN 33
#define HX711_DOUT_PIN 26
#define HX711_SCK_PIN 25
#define BUTTON_OK_PIN 39
#define BUTTON_DOWN_PIN 36
#define BUZZER_PIN 4

/**
 * SYSTEM STATES
 * The ESP32 firmware uses a multi-level state machine for operation
 */
enum MeasurementState {
    MEASUREMENT_IDLE,           // Waiting for app to initiate session
    MEASUREMENT_VALIDATION,     // RFID validation required
    MEASUREMENT_SUCCESS,        // User validated, ready for measurements
    MEASUREMENT_SHOW_BMI,       // Manual mode or calibration
    MEASUREMENT_ADMIN,          // Admin functions
    MEASUREMENT_CONNECT_TO_FIREBASE // Initial connection
};

enum UserState {
    USER_IDLE,
    USER_GET_POLA_MAKAN,       // Get eating pattern (1-5 scale)
    USER_GET_RESPON_ANAK,      // Get child activity level (1-5 scale)
    USER_GET_WEIGHT,           // Measure weight
    USER_GET_HEIGHT,           // Measure height
    USER_VALIDATION_DATA,      // Confirm measurements
    USER_SEND_DATA             // Upload to Firebase
};

/**
 * USER DATA STRUCTURE
 * Represents user profile from Firebase
 */
struct UserAccount {
    String id;                 // Firebase document ID
    String email;
    String namaAnak;          // Child's name
    String namaOrtu;          // Parent's name
    String gender;            // "Laki-Laki" or "Perempuan"
    String rfid;              // RFID card UUID
    String birthdate;
    int ageYears;
    int ageMonths;
    String role;              // "student" or "teacher"
};

/**
 * MEASUREMENT DATA STRUCTURE
 * Data collected during weighing session
 */
struct MeasurementData {
    float weight;             // in kg
    float height;             // in cm
    float bmi;                // calculated BMI
    int polaMakan;            // Eating pattern (1-5)
    int responAnak;           // Activity level (1-5)
    String nutritionStatus;   // BMI classification
    String timestamp;
};

// Global objects
FirebaseData firebaseData;
FirebaseAuth auth;
FirebaseConfig config;
Kinematrix kinematrix;
SH1106Menu menu;
Preferences preferences;

// Sensor objects
UltrasonicSens* ultrasonicSensor;
HX711Sens* loadCell;
RFID_Mfrc522* rfidReader;

// State variables
MeasurementState measurementState = MEASUREMENT_IDLE;
UserState userState = USER_IDLE;
UserAccount currentUser;
MeasurementData currentMeasurement;

// Timing variables
unsigned long lastFirebasePoll = 0;
const unsigned long FIREBASE_POLL_INTERVAL = 5000; // 5 seconds

// Configuration
float heightPole = 199.0; // Height of the measurement pole in cm

/**
 * FIREBASE-APP COORDINATION PATTERN
 * 
 * The app and ESP32 coordinate through Firebase Firestore documents:
 * 
 * 1. App initiates session by setting user's statusRfid = false
 * 2. ESP32 detects this change and enters MEASUREMENT_VALIDATION state
 * 3. User taps RFID card on ESP32
 * 4. ESP32 validates RFID against user database
 * 5. If valid, ESP32 proceeds with measurement workflow
 * 6. ESP32 updates measurement data in Firebase
 * 7. App receives real-time updates via Firestore listeners
 */

/**
 * SESSION MANAGEMENT THROUGH FIREBASE
 * 
 * Global session coordination uses systemStatus/hardware document:
 * {
 *   isInUse: boolean,              // Hardware availability
 *   sessionType: "weighing"|"rfid", // Current session type
 *   currentUserId: string,         // User owning the session
 *   currentUserName: string,       // User name for display
 *   timeout: boolean,              // Session timeout flag
 *   
 *   // Weighing session fields
 *   eatingPattern: string,         // From app UI
 *   childResponse: string,         // From app UI
 *   userRfid: string,             // Expected RFID for validation
 *   weight: number,               // Measured by ESP32
 *   height: number,               // Measured by ESP32
 *   nutritionStatus: string,      // Calculated by app
 *   measurementComplete: boolean, // Completion flag
 *   
 *   // RFID pairing session fields
 *   rfid: string                  // New RFID card UUID
 * }
 */

void setup() {
    Serial.begin(115200);
    
    // Initialize hardware
    initializeHardware();
    
    // Connect to WiFi
    connectToWiFi();
    
    // Initialize Firebase
    initializeFirebase();
    
    // Create background task for Firebase communication
    xTaskCreatePinnedToCore(
        firebaseCommunicationTask,
        "Firebase Task",
        10000,
        NULL,
        1,
        NULL,
        1  // Run on Core 1
    );
}

void initializeHardware() {
    // Initialize Kinematrix framework
    kinematrix.begin();
    
    // Add sensor modules
    rfidReader = new RFID_Mfrc522(RFID_SS_PIN, RFID_RST_PIN);
    ultrasonicSensor = new UltrasonicSens(ULTRASONIC_TRIG_PIN, ULTRASONIC_ECHO_PIN);
    loadCell = new HX711Sens(HX711_DOUT_PIN, HX711_SCK_PIN);
    
    kinematrix.sensor.addModule("rfid", rfidReader);
    kinematrix.sensor.addModule("ultrasonic", ultrasonicSensor);
    kinematrix.sensor.addModule("loadcell", loadCell);
    
    // Initialize display
    menu.begin();
    menu.showLoadingScreen("Initializing...");
    
    // Load calibration data
    preferences.begin("intan", false);
    float calibrationFactor = preferences.getFloat("cal", -22.5);
    preferences.end();
    
    loadCell->setScale(calibrationFactor);
    loadCell->tare();
}

void connectToWiFi() {
    // WiFi credentials can be stored in preferences or hardcoded
    const char* ssid = "YOUR_WIFI_SSID";
    const char* password = "YOUR_WIFI_PASSWORD";
    
    WiFi.begin(ssid, password);
    
    menu.showLoadingScreen("Connecting to WiFi...");
    
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    
    Serial.println("\nWiFi Connected");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
}

void initializeFirebase() {
    // Configure Firebase
    config.api_key = FIREBASE_API_KEY;
    config.database_url = FIREBASE_DATABASE_URL;
    auth.user.email = FIREBASE_USER_EMAIL;
    auth.user.password = FIREBASE_USER_PASSWORD;
    
    Firebase.begin(&config, &auth);
    Firebase.reconnectWiFi(true);
    
    // Wait for authentication
    menu.showLoadingScreen("Connecting to Firebase...");
    
    while (!Firebase.ready()) {
        delay(100);
    }
    
    Serial.println("Firebase Connected");
}

/**
 * MAIN LOOP - Handles UI and sensor updates
 */
void loop() {
    // Update sensors
    kinematrix.sensor.update();
    
    // Handle current state
    switch (measurementState) {
        case MEASUREMENT_IDLE:
            handleIdleState();
            break;
            
        case MEASUREMENT_VALIDATION:
            handleValidationState();
            break;
            
        case MEASUREMENT_SUCCESS:
            handleMeasurementFlow();
            break;
            
        case MEASUREMENT_SHOW_BMI:
            handleManualMode();
            break;
            
        case MEASUREMENT_ADMIN:
            handleAdminMode();
            break;
    }
    
    // Handle button inputs
    handleButtonInputs();
    
    delay(10);
}

/**
 * FIREBASE COMMUNICATION TASK - Runs on Core 1
 * Polls Firebase for user data and session updates
 */
void firebaseCommunicationTask(void* parameter) {
    while (true) {
        if (millis() - lastFirebasePoll > FIREBASE_POLL_INTERVAL) {
            pollFirebaseUsers();
            lastFirebasePoll = millis();
        }
        delay(100);
    }
}

/**
 * FIREBASE USER POLLING
 * Fetches all users from Firestore and checks for active sessions
 */
void pollFirebaseUsers() {
    if (!Firebase.ready()) return;
    
    // Query all users from Firestore
    String usersPath = "users";
    
    if (Firebase.Firestore.getDocument(&firebaseData, FIREBASE_PROJECT_ID, "", 
                                       usersPath.c_str(), "", true)) {
        
        FirebaseJson json;
        json.setJsonData(firebaseData.payload().c_str());
        
        FirebaseJsonArray documents;
        json.get(json.parse(), "documents", documents);
        
        // Iterate through all users
        for (size_t i = 0; i < documents.size(); i++) {
            FirebaseJsonData userData;
            documents.get(userData, i);
            
            UserAccount user = parseUserAccount(userData);
            
            // Check if this user has an active session
            checkUserSession(user);
        }
    }
}

/**
 * USER SESSION CHECK
 * Checks if user has initiated a weighing session from the app
 */
void checkUserSession(const UserAccount& user) {
    // Path to user's Arduino connection status
    String statusPath = "users/" + user.id + "/arduinoConnection/timbang";
    
    if (Firebase.Firestore.getDocument(&firebaseData, FIREBASE_PROJECT_ID, "",
                                       statusPath.c_str())) {
        
        FirebaseJson json;
        json.setJsonData(firebaseData.payload().c_str());
        
        FirebaseJsonData statusRfid;
        json.get(json.parse(), "fields/statusRfid/booleanValue", statusRfid);
        
        bool isSessionRequested = !statusRfid.boolValue;
        
        // If session requested and we're idle, start validation
        if (isSessionRequested && measurementState == MEASUREMENT_IDLE) {
            currentUser = user;
            measurementState = MEASUREMENT_VALIDATION;
            Serial.println("Session requested for user: " + user.namaAnak);
        }
    }
}

/**
 * RFID VALIDATION STATE
 * Waits for user to tap their RFID card
 */
void handleValidationState() {
    menu.renderInfoScreen("Tempelkan Kartu RFID", currentUser.namaAnak.c_str());
    
    // Check for RFID tap
    String scannedRfid = kinematrix.sensor["rfid"].as<String>();
    
    if (!scannedRfid.isEmpty()) {
        if (scannedRfid == currentUser.rfid) {
            // Valid RFID - proceed to measurement
            measurementState = MEASUREMENT_SUCCESS;
            userState = USER_GET_POLA_MAKAN;
            
            // Update session status in Firebase
            updateSessionStatus(currentUser.id, true);
            
            // Buzzer feedback
            tone(BUZZER_PIN, 1000, 200);
            delay(200);
            tone(BUZZER_PIN, 1500, 200);
            
            Serial.println("RFID validated successfully");
        } else {
            // Invalid RFID
            menu.renderErrorScreen("RFID Tidak Cocok!");
            delay(2000);
            
            // Reset session
            measurementState = MEASUREMENT_IDLE;
            updateSessionStatus(currentUser.id, false);
        }
    }
}

/**
 * MEASUREMENT WORKFLOW
 * Sequential collection of measurement data
 */
void handleMeasurementFlow() {
    switch (userState) {
        case USER_GET_POLA_MAKAN:
            handleEatingPatternSelection();
            break;
            
        case USER_GET_RESPON_ANAK:
            handleActivityLevelSelection();
            break;
            
        case USER_GET_WEIGHT:
            handleWeightMeasurement();
            break;
            
        case USER_GET_HEIGHT:
            handleHeightMeasurement();
            break;
            
        case USER_VALIDATION_DATA:
            handleDataValidation();
            break;
            
        case USER_SEND_DATA:
            handleDataUpload();
            break;
    }
}

/**
 * WEIGHT MEASUREMENT
 * Uses HX711 load cell with filtering
 */
void handleWeightMeasurement() {
    menu.renderInfoScreen("Mengukur Berat Badan", "Silakan naik ke timbangan");
    
    // Get filtered weight reading
    float weight = kinematrix.sensor["loadcell"].as<float>();
    
    // Apply threshold
    if (weight < 1.0) weight = 0.0;
    
    currentMeasurement.weight = weight;
    
    // Display result
    String weightStr = String(weight, 1) + " kg";
    menu.renderInfoScreenCenter("Berat Badan", currentUser.namaAnak.c_str(),
                               currentUser.gender.c_str(), weightStr.c_str());
    
    delay(2000);
    userState = USER_GET_HEIGHT;
}

/**
 * HEIGHT MEASUREMENT
 * Uses ultrasonic sensor with pole height calculation
 */
void handleHeightMeasurement() {
    menu.renderInfoScreen("Mengukur Tinggi Badan", "Berdiri tegak di bawah sensor");
    
    // Get ultrasonic reading
    float distance = kinematrix.sensor["ultrasonic"].as<float>();
    
    // Calculate actual height
    float height = heightPole - distance;
    height = constrain(height, 0, heightPole);
    
    currentMeasurement.height = height;
    
    // Display result
    String heightStr = String(height, 0) + " cm";
    menu.renderInfoScreenCenter("Tinggi Badan", currentUser.namaAnak.c_str(),
                               currentUser.gender.c_str(), heightStr.c_str());
    
    delay(2000);
    
    // Calculate BMI
    calculateBMI();
    
    userState = USER_VALIDATION_DATA;
}

/**
 * BMI CALCULATION AND NUTRITION STATUS
 */
void calculateBMI() {
    float heightInMeters = currentMeasurement.height / 100.0;
    currentMeasurement.bmi = currentMeasurement.weight / (heightInMeters * heightInMeters);
    
    // Determine nutrition status based on BMI
    if (currentMeasurement.bmi < 16) {
        currentMeasurement.nutritionStatus = "gizi buruk";
    } else if (currentMeasurement.bmi < 18.5) {
        currentMeasurement.nutritionStatus = "gizi kurang";
    } else if (currentMeasurement.bmi < 25) {
        currentMeasurement.nutritionStatus = "gizi baik";
    } else if (currentMeasurement.bmi < 30) {
        currentMeasurement.nutritionStatus = "overweight";
    } else {
        currentMeasurement.nutritionStatus = "obesitas";
    }
}

/**
 * DATA UPLOAD TO FIREBASE
 * Creates new measurement document in user's subcollection
 */
void handleDataUpload() {
    menu.showLoadingScreen("Mengirim data...");
    
    // Create measurement document
    FirebaseJson content;
    content.set("fields/weight/doubleValue", currentMeasurement.weight);
    content.set("fields/height/integerValue", (int)currentMeasurement.height);
    content.set("fields/bmi/doubleValue", currentMeasurement.bmi);
    content.set("fields/polaMakan/integerValue", currentMeasurement.polaMakan);
    content.set("fields/responAnak/integerValue", currentMeasurement.responAnak);
    content.set("fields/nutritionStatus/stringValue", currentMeasurement.nutritionStatus);
    content.set("fields/timestamp/timestampValue", getTimestamp());
    
    // Upload to user's measurements subcollection
    String path = "userData/" + currentUser.id + "/data";
    
    if (Firebase.Firestore.createDocument(&firebaseData, FIREBASE_PROJECT_ID, "",
                                         path.c_str(), content.raw())) {
        menu.renderSuccessScreen("Data Berhasil Dikirim!");
        Serial.println("Measurement uploaded successfully");
        
        // Update user's latest weighing
        updateLatestWeighing();
        
        delay(3000);
    } else {
        menu.renderErrorScreen("Gagal Mengirim Data!");
        Serial.println("Upload failed: " + firebaseData.errorReason());
        delay(3000);
    }
    
    // Reset session
    resetSession();
}

/**
 * SESSION MANAGEMENT FUNCTIONS
 */
void updateSessionStatus(const String& userId, bool status) {
    FirebaseJson content;
    content.set("fields/statusRfid/booleanValue", status);
    
    String path = "users/" + userId + "/arduinoConnection/timbang";
    Firebase.Firestore.patchDocument(&firebaseData, FIREBASE_PROJECT_ID, "",
                                    path.c_str(), content.raw(), "statusRfid");
}

void resetSession() {
    // Clear session status
    updateSessionStatus(currentUser.id, false);
    
    // Reset states
    measurementState = MEASUREMENT_IDLE;
    userState = USER_IDLE;
    
    // Clear data
    currentUser = UserAccount();
    currentMeasurement = MeasurementData();
}

/**
 * GLOBAL SESSION COORDINATION
 * 
 * For RFID pairing sessions, the ESP32 monitors systemStatus/hardware document:
 * 1. App creates session with sessionType = "rfid"
 * 2. ESP32 detects session and waits for card tap
 * 3. ESP32 updates rfid field with card UUID
 * 4. App receives UUID and updates user profile
 * 5. Session is cleared by app
 */
void checkGlobalSessions() {
    String path = "systemStatus/hardware";
    
    if (Firebase.Firestore.getDocument(&firebaseData, FIREBASE_PROJECT_ID, "",
                                       path.c_str())) {
        
        FirebaseJson json;
        json.setJsonData(firebaseData.payload().c_str());
        
        FirebaseJsonData isInUse;
        json.get(json.parse(), "fields/isInUse/booleanValue", isInUse);
        
        if (isInUse.boolValue) {
            FirebaseJsonData sessionType;
            json.get(json.parse(), "fields/sessionType/stringValue", sessionType);
            
            if (sessionType.stringValue == "rfid") {
                handleRfidPairingSession(json);
            }
        }
    }
}

/**
 * This framework demonstrates the complete integration between:
 * - ESP32 hardware sensors (weight, height, RFID)
 * - Firebase Firestore for data persistence
 * - Real-time session coordination
 * - App-hardware communication patterns
 * 
 * The system ensures reliable, scalable IoT integration for
 * child nutrition monitoring in educational settings.
 */