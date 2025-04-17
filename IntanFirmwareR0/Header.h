#define ENABLE_MODULE_DIGITAL_INPUT
#define ENABLE_MODULE_DIGITAL_OUTPUT
#define ENABLE_MODULE_TASK_HANDLER
#define ENABLE_MODULE_TIMER_DURATION
#define ENABLE_MODULE_TIMER_TASK
#define ENABLE_MODULE_SERIAL_HARD
#define ENABLE_MODULE_DATETIME_NTP_V2
#define ENABLE_MODULE_FIREBASE_RTDB_V2
#define ENABLE_MODULE_FIREBASE_FIRESTORE_V2
#define ENABLE_MODULE_FIREBASE_MESSAGING_V2
#define ENABLE_MODULE_SH1106_MENU

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

////////// Utility //////////
const char *ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 7 * 3600;  // Offset for WIB (UTC+7)
const int daylightOffset_sec = 0;

DateTimeNTPV2 dateTime(ntpServer, gmtOffset_sec, daylightOffset_sec);
TaskHandle task;
Preferences preferences;
FirebaseV2RTDB firebase;
FirebaseV2Firestore firestore;
FirebaseV2Messaging messaging;
WiFiClientSecure client;

////////// Sensor //////////
SensorModule sensor;

////////// Communication //////////
HardSerial usbSerial;

////////// Input Module //////////
DigitalIn buttonOk(39);
DigitalIn buttonDown(36);

////////// Output Module //////////
SH1106Menu menu(0x3C, 21, 22);
DigitalOut buzzer(2);
DigitalOut ledRed(4);
DigitalOut ledGreen(16);
DigitalOut ledYellow(17);

////////// Global Variable //////////
bool firebaseEnable = false;

enum FirebaseRTDBState {
  RTDB_IDLE,
  RTDB_SET_VALUE,
  RTDB_SET_VALUE_JSON,
  RTDB_SET_VALUE_PERIODIC,
  RTDB_GET_VALUE,
  RTDB_GET_VALUE_JSON,
  RTDB_GET_VALUE_PERIODIC,
};

enum FirebaseFirestoreState {
  FIRESTORE_IDE,
  FIRESTORE_CREATE,
  FIRESTORE_READ,
  FIRESTORE_UPDATE,
  FIRESTORE_DELETE,
};

enum FirebaseMessagingState {
  MESSAGING_IDLE,
  MESSAGING_SEND,
};

FirebaseRTDBState firebaseRTDBState = RTDB_IDLE;
FirebaseFirestoreState firebaseFirestoreState = FIRESTORE_IDE;
FirebaseMessagingState firebaseMessagingState = MESSAGING_IDLE;

bool apiTestingSend = false;
uint32_t userCount = 0;
String userEmail = "";
String userPassword = "";
String uuidRFID = "";

float weight = 0.0;
float height = 0.0;