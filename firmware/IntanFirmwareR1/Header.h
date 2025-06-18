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
const char* ntpServer = "pool.ntp.org";
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
MovingAverageFilter loadCellFilter(10);

////////// Communication //////////
HardSerial usbSerial;

////////// Input Module //////////
DigitalIn buttonOk(39);
DigitalIn buttonDown(36);

////////// Output Module //////////
SH1106Menu menu(0x3C, 21, 22);
DigitalOut buzzer(4);  // 2
DigitalOut ledRed(4);
DigitalOut ledGreen(16);
DigitalOut ledYellow(17);

////////// Firebase State //////////
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

////////// Firebase User Account //////////

struct UserAcc {
  String birthdate;
  String email;
  String password;
  String gender;
  String id;
  String namaAnak;
  String rfid;
  String role;
  String username;
};

UserAcc userAccValid;
UserAcc userAccShowBMI;
UserAcc userAccAdmin;
UserAcc userAccRegister;

////////// State Management //////////

enum MeasurementState {
  MEASUREMENT_IDLE,
  MEASUREMENT_VALIDATION,
  MEASUREMENT_SUCCESS,
  MEASUREMENT_SHOW_BMI,
  MEASUREMENT_ADMIN,
  MEASUREMENT_FORGOT_ACCOUNT,
  MEASUREMENT_CONNECT_TO_FIREBASE,
};

enum AdminState {
  ADMIN_IDLE,
  ADMIN_REGISTER,
  ADMIN_FORGOT_ACCOUNT,
};

enum UserState {
  USER_IDLE,
  USER_GET_POLA_MAKAN,
  USER_GET_RESPON_ANAK,
  USER_GET_WEIGHT,
  USER_GET_HEIGHT,
  USER_VALIDATION_DATA,
  USER_SEND_DATA,
};

int measurementState = MEASUREMENT_CONNECT_TO_FIREBASE;
int adminState = ADMIN_IDLE;
int userState = USER_IDLE;

////////// System Variable //////////

String uuidRFIDNow = "";
uint32_t userNumber = 0;
uint32_t firestoreGetDataTimer = 0;
bool isStatusRFIDInitialize = false;
bool firestoreGetDataForce = true;

////////// User Data //////////

struct UserMeasurementData {
  float weight;
  float height;
  float bmi;
  int polaMakan;
  int responAnak;
};

UserMeasurementData userData;

const char* polaMakanOption[] = { "Kurang", "Cukup", "Berlebih" };
const char* polaMakanExt[] = { "Sehari Makan Dibawah Kategori Cukup", "Sehari Makan 3x + Snack 2x", "Sehari Makan Lebih dari Kategori Cukup" };

const char* responAnakOption[] = { "Pasif", "Sedang", "Aktif" };
const char* responAnakExt[] = { "Anak Tidak Aktif Bergerak Cenderung Cuek dengan Sekitar", "Anak Biasa Saja Tidak Terlalu Aktif", "Anak Aktif Secara Fisik dan Cepat Tanggap" };

int polaMakanNumOptions = 3;
int polaMakanSelectedOption = 0;

int responAnakNumOptions = 3;
int responAnakSelectedOption = 0;

////////// Sensor Data //////////

float heightPole = 199.0;
float weight = 0.0;
float height = 0.0;
float bmi = 0.0;