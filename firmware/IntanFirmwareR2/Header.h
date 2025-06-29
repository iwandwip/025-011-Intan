#define ENABLE_MODULE_DIGITAL_INPUT
#define ENABLE_MODULE_DIGITAL_OUTPUT
#define ENABLE_MODULE_TASK_HANDLER
#define ENABLE_MODULE_TIMER_DURATION
#define ENABLE_MODULE_TIMER_TASK
#define ENABLE_MODULE_SERIAL_ENHANCED
#define ENABLE_MODULE_SERIAL_DEBUGGER_V2
#define ENABLE_MODULE_DATETIME_NTP_V2
#define ENABLE_MODULE_SH1106_MENU
#define ENABLE_MODULE_KNN

#define ENABLE_MODULE_FIREBASE_APPLICATION_V3
#define ENABLE_MODULE_FIREBASE_RTDB_V3
#define ENABLE_MODULE_FIREBASE_FIRESTORE_V3
#define ENABLE_MODULE_FIREBASE_MESSAGING_V3

#define ENABLE_SENSOR_MODULE
#define ENABLE_SENSOR_MODULE_UTILITY
#define ENABLE_SENSOR_RFID
#define ENABLE_SENSOR_ULTRASONIC
#define ENABLE_SENSOR_HX711

#include "Kinematrix.h"
#include "Preferences.h"
#include "WiFi.h"
#include "WiFiClientSecure.h"

////////// Utility //////////
const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 7 * 3600;  // Offset for WIB (UTC+7)
const int daylightOffset_sec = 0;

DateTimeNTPV2 dateTime(ntpServer, gmtOffset_sec, daylightOffset_sec);
TaskHandle task;
Preferences preferences;
FirebaseV3RTDB* firebase = nullptr;
FirebaseV3Firestore* firestore = nullptr;
FirebaseV3Messaging* messaging = nullptr;
WiFiClientSecure client;

////////// Sensor //////////
SensorModule sensor;
MovingAverageFilter weightFilter(10);

////////// Communication //////////
CustomLogLevel LOG_INFO;
CustomLogLevel LOG_SENSOR;
CustomLogLevel LOG_COMS;
SerialDebuggerV2 debug(115200);
EnhancedSerial usbSerial;

////////// Input Module //////////
DigitalIn buttonDown(-1);
DigitalIn buttonOk(-1);

////////// Output Module //////////
DigitalOut buzzer(LED_BUILTIN);  // LED_BUILTIN

////////// Global Utility Variable //////////
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

////////// Global System Variable //////////
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

struct CurrentSession {
  String pola_makan;
  String respon_anak;
  String usia_th;
  String usia_bl;
  String gender;
  String berat;
  String tinggi;
  String imt;
  String status_gizi;
};

String mode;

float poleHeight = 0.0;
float weight = 0.0;
float height = 0.0;
String rfid = "";