#define ENABLE_MODULE_DIGITAL_INPUT
#define ENABLE_MODULE_DIGITAL_OUTPUT
#define ENABLE_MODULE_TASK_HANDLER
#define ENABLE_MODULE_TIMER_DURATION
#define ENABLE_MODULE_TIMER_TASK
#define ENABLE_MODULE_SERIAL_HARD
#define ENABLE_MODULE_DATETIME_NTP_V2
#define ENABLE_MODULE_FIREBASE_RTDB_V3
#define ENABLE_MODULE_SH1106_MENU
#define ENABLE_MODULE_KNN

#define ENABLE_SENSOR_MODULE
#define ENABLE_SENSOR_MODULE_UTILITY
#define ENABLE_SENSOR_RFID
#define ENABLE_SENSOR_ULTRASONIC
#define ENABLE_SENSOR_HX711

#include "Kinematrix.h"
#include "Preferences.h"
#include "WiFi.h"
#include "WiFiClientSecure.h"
#include "HTTPClient.h"

#define KG_TO_G(x) x * 1000.f
#define G_TO_KG(x) x / 1000.f

////////// System Configuration //////////
const char *NTP_SERVER = "pool.ntp.org";
const long GMT_OFFSET_SEC = 7 * 3600;  // Offset for WIB (UTC+7)
const int DAYLIGHT_OFFSET_SEC = 0;

////////// Core System Objects //////////
DateTimeNTPV2 dateTimeManager(NTP_SERVER, GMT_OFFSET_SEC, DAYLIGHT_OFFSET_SEC);
TaskHandle wifiTask;
Preferences devicePreferences;
// FirebaseV3Firestore firestoreClient;  // Removed - using only RTDB
WiFiClientSecure wifiSecureClient;

////////// Mode-based RTDB Integration - Firebase V3 Shared App //////////
FirebaseV3Application *firebaseApp;
FirebaseV3RTDB rtdbClient;
WiFiClient rtdbWifiClient;

////////// Sensor Management //////////
SensorModule sensorManager;
MovingAverageFilter weightFilter(10);

////////// Communication //////////
HardSerial serialCommunication;

////////// User Input //////////
DigitalIn confirmButton(39);
DigitalIn navigateButton(36);

////////// Display & Feedback //////////
SH1106Menu displayMenu(0x3C, 21, 22);
DigitalOut systemBuzzer(2);
DigitalOut statusLed(4);


////////// User Account Data Structure //////////
struct SessionUser {
  String userId;
  String childName;
  String rfidTag;
  String gender;
  int ageYears;
  int ageMonths;
};

SessionUser currentSessionUser;

////////// System State Management //////////
enum SystemState {
  SYSTEM_STARTUP,
  SYSTEM_IDLE,
  SYSTEM_RFID_PAIRING,
  SYSTEM_WEIGHING_SESSION,
  SYSTEM_QUICK_MEASURE,
  SYSTEM_ADMIN_MODE,
};

////////// Mode-based System Variables //////////
String currentRTDBMode = "idle";
unsigned long lastModeCheck = 0;
const unsigned long MODE_CHECK_INTERVAL = 1000;

enum WeighingState {
  WEIGHING_IDLE,
  WEIGHING_RFID_CONFIRMATION,
  WEIGHING_RFID_CONFIRM_WAIT,
  WEIGHING_GET_WEIGHT,
  WEIGHING_GET_HEIGHT,
  WEIGHING_VALIDATE_DATA,
  WEIGHING_SEND_DATA,
  WEIGHING_COMPLETE,
};

volatile SystemState currentSystemState = SYSTEM_STARTUP;
volatile SystemState pendingSystemState = SYSTEM_STARTUP;
volatile bool needDisplayUpdate = true;
volatile WeighingState currentWeighingState = WEIGHING_IDLE;

////////// System Runtime Variables //////////
String currentRfidTag = "";
uint32_t lastFirebaseSync = 0;
bool forceFirebaseSync = true;
bool systemInitialized = false;

////////// Testing Mode Variables //////////
bool testingModeEnabled = false;
String testRfidTag = "";
float testWeight = 0.0;
float testHeight = 0.0;

////////// Session Management //////////
struct ActiveSession {
  String sessionType;
  String userId;
  String userName;
  String eatingPattern;
  String childResponse;
  String gender;
  int ageYears;
  int ageMonths;
  bool isActive;
  bool measurementComplete;
};

ActiveSession currentSession;

////////// Measurement Data Structure //////////
struct MeasurementData {
  float weight;
  float height;
  int eatingPatternIndex;
  int childResponseIndex;
};

MeasurementData currentMeasurement;

////////// Selection Options //////////
const char *EATING_PATTERN_OPTIONS[] = { "Kurang", "Cukup", "Berlebih" };
const char *EATING_PATTERN_DESCRIPTIONS[] = {
  "Sehari Makan Dibawah Kategori Cukup",
  "Sehari Makan 3x + Snack 2x",
  "Sehari Makan Lebih dari Kategori Cukup"
};

const char *CHILD_RESPONSE_OPTIONS[] = { "Pasif", "Sedang", "Aktif" };
const char *CHILD_RESPONSE_DESCRIPTIONS[] = {
  "Anak Tidak Aktif Bergerak Cenderung Cuek dengan Sekitar",
  "Anak Biasa Saja Tidak Terlalu Aktif",
  "Anak Aktif Secara Fisik dan Cepat Tanggap"
};

const int EATING_PATTERN_COUNT = 3;
const int CHILD_RESPONSE_COUNT = 3;

int selectedEatingPattern = 0;
int selectedChildResponse = 0;

////////// Timeout Configuration //////////
const unsigned long RFID_TIMEOUT_MS = 30000;
unsigned long rfidConfirmationStartTime = 0;

////////// Enums for KNN Data Encoding //////////
enum Gender {
  PEREMPUAN = 0,
  LAKI_LAKI = 1
};

enum PolaMakan {
  KURANG = 0,
  CUKUP = 1,
  BERLEBIH = 2
};

enum ResponAnak {
  PASIF = 0,
  SEDANG = 1,
  AKTIF = 2
};

enum StatusGizi {
  GIZI_BURUK = 0,
  GIZI_KURANG = 1,
  GIZI_BAIK = 2,
  OVERWEIGHT = 3,
  OBESITAS = 4
};

////////// Function Declarations //////////

// KNN.ino functions
float calculateIMT(float weight, float height);
float calculateBMI(float weight, float height);
String getBMICategory(float bmi);
String getNutritionStatusFromSession();

// WiFi.ino Firebase functions (external interfaces only)
void sendModeBasedWeighingResultsWiFi(float weight, float height, String nutritionStatus);
void sendModeBasedRFIDDetectionWiFi(String rfidCode);

// USBComs.ino functions
void performLoadCellCalibration();
void performLoadCellTare();

////////// Sensor Configuration & Data //////////
float SENSOR_HEIGHT_POLE = 199.0;
volatile float currentWeight = 0.0;
volatile float currentHeight = 0.0;
volatile bool newSensorData = false;

// Calibration request flags
bool requestCalibration = false;
bool requestTare = false;

// Inline function for state change
inline void changeSystemState(SystemState newState) {
  pendingSystemState = newState;
  needDisplayUpdate = true;
  Serial.printf("State change requested to: %d\n", newState);
}