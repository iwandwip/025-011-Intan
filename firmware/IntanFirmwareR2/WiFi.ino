#define FIREBASE_DATABASE_URL "https://intan-680a4-default-rtdb.firebaseio.com/"
#define FIREBASE_PROJECT_ID "intan-680a4"
#define FIREBASE_API_KEY "AIzaSyDxodg_DD4n-DTdKqrMEJJX3bQHJyG3sKU"
#define FIREBASE_USER_EMAIL "admin@gmail.com"
#define FIREBASE_USER_PASSWORD "admin123"
#define FIREBASE_CLIENT_EMAIL "firebase-adminsdk-fbsvc@intan-680a4.iam.gserviceaccount.com"
#define FIREBASE_MSG_DEVICE_TOKEN "cJnjCBzORlawc7T2WvCq2L:APA91bEyoA65YjDAEU6Y_Mj6DQzw5KH_Svfs7ZoLv3Vdl-ZurpiN8BGi1R3qaOh1Ux_wNHacMHSGOfHuxxKQraLcWC-RowpmEvPQboZasgsWJQ_MWdS285Q"
const char FIREBASE_PRIVATE_KEY[] PROGMEM = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDbDPY9vrAreUu8\njDhsqJ+5tU/4/K+m39+XuZhJcgxvqLqFkfXVXLyXpMvwi4lviqGPZKvyWKf5rpyZ\nH0ZGbGtqZarA6C1/yTLzTtA6E7uvg4rww7D2F0QhULDWlnHLPuAamB0v7sTUsbli\nTqeTMydLiGWuPNT5qsgSp9tvjPXPuQp4SDPDU353O9HjWnevoHZ9m5jkap769buc\nDn7ga12Uj/M5XKWk/lNruU5nJuA449+AYEpn5PQwptM5k7PAhS8Y1/t1smkdMZRz\nWarEQRbDTmysenbKzA9PlmJL6pGLaraolzzmMc6lAZeEQnFKk1xrqBIV4aEiDTGn\nidE8PcLPAgMBAAECggEAAS3K34xMPns+a3Bcurk4VTWEPK0KKAakjv5jhAwKha9G\nfDxWQlRdNCm5M7QTkF4U8qaKcqT8VpsJ72NGHnnoL0TC3Ue//Yx8LHTxGQZD0OFV\nxW1PNQT8z5pvnpc2YM/mDJhjCoUMmOO/mj7+TdJopQaijwGruRpWZ90sulOQKDSl\nRwKF15m5IoKjhc3XiDvDWtpszQew/zkQAjpCTr1GemJfesjgX7rvz6A+gVrwla3P\nPsx8l8DFJTTn6KOq0UtSQHOflV57CBso2FuHRqgcj3y+XocukIBVbuWVAaImZCmi\nS3Z2W2PyQNECgtvLM16TZYAm4XprL0neRhqq6rHlDQKBgQDufCk3TQXLzenK/YwH\nFkBW0PEzsIWGxbSiiOgtuizb9lnVe/60za/4PlZbqivzkqgVyXfLajnZtRz85KcY\nfXJ++J8Ce2PLSmksVdk2g8PWrs0Xd3Yp/AwRzeNcNTi6Y9biZDJYjcXlytxqkVpP\n8Zs0t+HAr/c1ci+AC0dhYbYcbQKBgQDrI2iWLhTRGjHDYtACpjJCQlRkZf84Jahl\nd8zO4WqKyEbCvf1nDr8f7O78+6uUWo0H+34pGJJI10QHvHgKMyjhivT+cvn5kcO5\naNtSYbbXAjw3pM7VTKC9Ft/C/ISwNvyOWQqg5EUfPwGhvRX2TU2/6ebwqnOMmTOA\ntELwrtQeqwKBgQC9FTI0h1v2F7+q0tZH9Ct06dqjieyES5KJX5T+VGMmzy6wpcvv\nnDlN0Fb1/Hk2eGvOQls5q3JMm11tYPje4O97njGsbRpVXxz+Kt66a0RFnXg8h9nn\nNdB3+U6vl/7vQSNpgdms/lMOe4XA9JevVLci2DwkYx/Uf0EL+2VP34HdDQKBgF5k\nr4aiZx7uOg3qrAB0QXbR89j+DS+4Blr9dc2TNlcSQT3KUWC+zcD+N459ZYq/syAC\nOMo8n/T33cqRQUsu8HlidCl1dJ5Ygs76phjzOxgjQJNB6Po9scVW2msHPikTWd23\nJwohuRHrFDeelaNzswOY3Wm9s3c8xS0ksD64oFTTAoGAG4EA8ixZ9ylC3QbWM0pe\nMwV6FVNzp4EYD6P5xIwi889aRT8j2E10Phxtq5Sa+DvtAFqRDHnmYsIRsKlNEmrF\n8b7p8GKrU1aOvZw2ieRA9SlzQEeeGFKkZM9kdXnY6FZIL91wdfROo0ed+XVmen2N\nGBVN3Ss41vN8n8i8pNZuyvc=\n-----END PRIVATE KEY-----\n";

void wifiTask(void* pvParameter) {
  // WiFi.begin("TIMEOSPACE", "1234Saja");
  WiFi.begin("silenceAndSleep", "11111111");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("IP: " + WiFi.localIP().toString());
  client.setInsecure();

  if (!dateTime.begin()) {
    Serial.println("Gagal memulai NTP Client!");
  }

  FirebaseV3Application::getInstance()->setTime(dateTime.now());
  if (!FirebaseV3Application::getInstance()->begin(FIREBASE_CLIENT_EMAIL, FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY)) {
    Serial.println("Failed to initialize Firebase Application");
    while (1) { delay(1000); }
  }

  firebase = new FirebaseV3RTDB(FirebaseV3Application::getInstance());
  firestore = new FirebaseV3Firestore(FirebaseV3Application::getInstance());
  messaging = new FirebaseV3Messaging(FirebaseV3Application::getInstance());

  firebase->begin(FIREBASE_DATABASE_URL);
  firestore->begin(FIREBASE_PROJECT_ID);
  messaging->begin(FIREBASE_PROJECT_ID);

  Serial.println("Firebase Init Success");

  disableCore1WDT();
  buzzer.toggleInit(100, 2);

  JsonDocument documentData;
  String documentDataStr;
  String resultStr;

  for (;;) {
    FirebaseV3Application::getInstance()->loop();
    if (firebase) firebase->loop();
    if (firestore) firestore->loop();
    if (messaging) messaging->loop();

    static uint32_t dateTimeNTPTimer;
    if (millis() - dateTimeNTPTimer >= 1000 && dateTime.update()) {
      // Serial.println(dateTime.getDateTimeString());
      dateTimeNTPTimer = millis();
    }

    static uint32_t firebaseRTDBTimer;
    if (millis() - firebaseRTDBTimer >= 2000 && firebase->ready()) {  // FIREBASE_RTDB_START
      // firebase->set("/test/float", random(100) + 3.14159, 2);
      mode = firebase->getString("/mode");
      if (mode == "idle") {
        //
      } else if (mode == "pairing") {
        if (!rfid.isEmpty()) {
          firebase->set("/pairing_mode", rfid);
          rfid = "";
        }
      } else if (mode == "weighing") {
        //
      } else if (mode == "tare") {
        String command = firebase->getString("/tare_mode/get/command");
        if (command == "start") {
          performLoadCellTare();
          firebase->set("/tare_mode/set/status", "completed");
        }
      } else if (mode == "calibration") {
        String command = firebase->getString("/calibration_mode/get/command");
        float known_weight = firebase->getString("/calibration_mode/get/known_weight").toFloat();
        if (command == "start") {
          performLoadCellCalibration(known_weight / 1000.f);
          firebase->set("/calibration_mode/set/status", "completed");
        }
      }
      firebaseRTDBTimer = millis();
    }  // FIREBASE_RTDB_END
  }
}