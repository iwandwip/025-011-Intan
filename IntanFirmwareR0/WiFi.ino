#define FIREBASE_DATABASE_URL "https://intan-28dc8-default-rtdb.firebaseio.com/"
#define FIREBASE_PROJECT_ID "intan-28dc8"
#define FIREBASE_API_KEY "AIzaSyDPHpVgwHMWCvRdHHSlvopTHuXw0WgzVYI"
#define FIREBASE_USER_EMAIL "admin@gmail.com"
#define FIREBASE_USER_PASSWORD "admin123"
#define FIREBASE_CLIENT_EMAIL "firebase-adminsdk-fbsvc@intan-28dc8.iam.gserviceaccount.com"
#define FIREBASE_MSG_DEVICE_TOKEN "cJnjCBzORlawc7T2WvCq2L:APA91bEyoA65YjDAEU6Y_Mj6DQzw5KH_Svfs7ZoLv3Vdl-ZurpiN8BGi1R3qaOh1Ux_wNHacMHSGOfHuxxKQraLcWC-RowpmEvPQboZasgsWJQ_MWdS285Q"
const char PRIVATE_KEY[] PROGMEM = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCVl49X+xeXIIC3\nignigvgWSsqiSXq/i8q//Xexc11HRbcA9R133716qgMfrtxVCrmOBcdBTofHiOiK\niGF5hiSup7SGXnuYqj7zgnZjrCAtqTHnEJ/mOcHJbbJL0RdDYUmCHwaJ198c3Hy8\nyjnOM373ylRnhkujRXbNqFz+V04GPCJbvHbE0vtr811wKmiSmjhxXmhFZS/cbX6a\ng567X3e64Kq/YmEjbQDC1tl5zkGP9DUugBlQH8lguQBk4wCFeO6wB2lPNc4AcoRl\npmCLl1hQldxvRVNM/aMHOHmmxniNZN6S8AA71S4Ohn5TonYqteP1jVpeUnokmRKu\nTVl97lS/AgMBAAECggEAHh936QKR/Ie6A7uTQ/6VkH+dEFL1mc6/lCupR51wgiKi\nuFmjhnkSgbnsiRvAGIvhU50MQ7VZmC+UjBjsb/k4N8djjc9G2jYmGQkDaAzIKgmx\nF9N8L3Mf97zUM3o2UgYsNDylJ2rF7dzkbWvXehNalPE0T+h2ILmjM8ScfUb9WjnA\n6zqleaeZIusSPcZgaErSyjxkIZHD7E6sC+cmfcK2FYqH3H/2MusrMxsYEU8WRQB6\nU9w8JN3Kmi66t0MLaH5L7p+ewo4Yjn1iNgP5i5QrFeKkzG8UvcrSIU35MELprWGq\npjSkJySjmHMLxa9hyT6dpqy5lGyIF759tn9N2DB4UQKBgQDGefM+BJz5gxIKLGQF\nxpLntKGYnoUjqkZnrFgLzhgTy47q0icbjSuPrXTxgbqd8bmUSu5Ob4jfqIH4i3v+\nBSaF6K2cMYN+Ilg9Ijiffb9OJwQZrH09bpus4zpRq61oTuqGkn3Zb66D9QO1e/bl\nHAk/R4f2BP9g5XB9wOxUQrUeWQKBgQDA8pzh/t2/wFVm4SRKL9kWZ7/3SI/7KaoA\njYsQeYZmMxXSBlYf/slERJyaJ4qeDI1lE8hrDCjReN937tyR9gR1XqqlZ3ijdo4w\ndmxipqZ2ysZgD4EfdDRgettJq9WT6hGrb798XiWkM2ok83cL0Ttl0s/7wAlk7wgy\ncSvI5JWY1wKBgGgNSv56gKk2k+CNgSqd/ipHQmi2wmn+PMbhTY9yzqCiGRz2a9Y/\n3lSGxUZPkrx3G6mo1uJ8Cq/msazRw4FaxeVyJII8WwlnjAcQx8qlrAOW5Mlo6oeo\nUykCP3LNpC2JId7HMf8qU72OWBFvGfLnDdoE8DyERjZQUvc6iytphXaRAoGAfzDv\nnkLmZvsg0RrlU0pLbuuhrh9VWppSiN7Fp2yU3lYaskKfD6RjhO891JjwVdOsec8a\ntQZk+gEWPvdky4tD0SNAlpyo+Ai1HtlSBY4Z+gEd2EEgO13dESSr3dq6hjEsyLh3\noEJnyeBivk0IUu/wmeToWepzxueTnbzgwiN9Qi0CgYEAwOsLoS/NHtmX5Pb+zv7r\nf43162Nwo+DlrM1+tc4ZKdCbnSYxUOLZZm5JGAk0Kzg9arFEm1ijZFGNdt0z+hbk\nkhBsSAv94XBkA4xxCX4DLkybTse+WNdhBzh4aGFutWbpq7u73UH9G6/qCQrT5Lzk\nlR63HDAseusj6kxFOoj3j7k=\n-----END PRIVATE KEY-----\n";

void wifiTask() {
  task.setInitCoreID(1);
  task.createTask(10000, [](void *pvParameter) {
    menu.connectToWiFi("TIMEOSPACE", "1234Saja", 30);
    client.setInsecure();

    if (!dateTime.begin()) {
      Serial.println("Gagal memulai NTP Client!");
    }

    if (!firestore.begin(FIREBASE_API_KEY, FIREBASE_USER_EMAIL, FIREBASE_USER_PASSWORD, FIREBASE_PROJECT_ID)) {
      Serial.println("Firebase Firestore Error: " + firestore.getLastError());
      while (1) { delay(1000); }
    }

    Serial.println("Firebase Init Success");

    disableCore1WDT();
    buzzer.toggleInit(100, 2);

    for (;;) {
      firestore.loop();

      if (apiTestingSend) {
        apiRegisterAccount();
        apiTestingSend = false;
      }

      static uint32_t dateTimeNTPTimer;
      if (millis() - dateTimeNTPTimer >= 1000 && dateTime.update()) {
        // Serial.println(dateTime.getDateTimeString());
        dateTimeNTPTimer = millis();
      }

      if (firestore.isReady()) {
        static bool isInitialized = false;
        static uint32_t firestoreTimer;
        if (millis() - firestoreTimer >= 5000) {
          firestoreTimer = millis();
          String userResStr = firestore.getDocument("users", "", true);
          JsonDocument userDoc;
          deserializeJson(userDoc, userResStr);
          // serializeJsonPretty(userDoc, Serial);

          statusTimbang = false;
          for (JsonVariant fields : userDoc["documents"].as<JsonArray>()) {
            String userEmail = fields["fields"]["email"]["stringValue"].as<String>();
            String idStr = fields["fields"]["id"]["stringValue"].as<String>();
            if (userEmail == "admin@gmail.com") continue;
            if (!isInitialized) {
              JsonDocument initDoc;
              JsonObject fields = initDoc.createNestedObject("fields");
              JsonObject statusRfidField = fields.createNestedObject("statusRfid");
              statusRfidField["booleanValue"] = true;

              String initDocStr;
              serializeJson(initDoc, initDocStr);

              String updatePath = "users/" + idStr + "/arduinoConnection/timbang";
              Serial.println("JSON to send: " + initDocStr);

              String res = firestore.updateDocument(updatePath, initDocStr, "statusRfid", true);
              Serial.println("Update result: " + res);

              if (res.length() == 0 || res.indexOf("error") >= 0) {
                Serial.println("Error: " + firestore.getLastError());
              }
              continue;
            }
            String timbangPath = "users/" + idStr + "/arduinoConnection/timbang";
            String timbangStr = firestore.getDocument(timbangPath, "", true);
            JsonDocument timbangDoc;
            deserializeJson(timbangDoc, timbangStr);
            // serializeJsonPretty(timbangDoc, Serial);

            bool statusTimbangFirestore = timbangDoc["fields"]["statusRfid"]["booleanValue"];
            // if (statusTimbangFirestore) {
            //   statusTimbang = true;
            //   break;
            // }
            Serial.print("| userEmail: ");
            Serial.print(userEmail);
            Serial.print("| statusTimbangFirestore: ");
            Serial.print(statusTimbangFirestore);
            Serial.println();
          }
          isInitialized = true;
        }
      }
    }
  });
}

bool apiRegisterAccount() {
  if (WiFi.status() != WL_CONNECTED) return false;
  HTTPClient http;
  http.begin("https://api-tcoyjjfyla-et.a.run.app/register");
  http.addHeader("Content-Type", "application/json");

  userEmail = "testing_user" + String(userCount) + "@gmail.com";
  userPassword = "testing_password" + String(userCount);

  JsonDocument jsonDoc;
  jsonDoc["email"] = userEmail;
  jsonDoc["password"] = userPassword;
  jsonDoc["username"] = "testing_username" + String(userCount);
  jsonDoc["namaAnak"] = "namaAnak" + String(userCount);
  jsonDoc["birthdate"] = "2010-01-15T00:00:00.000Z";
  jsonDoc["gender"] = "perempuan";
  jsonDoc["rfid"] = uuidRFID;

  String requestBody;
  serializeJson(jsonDoc, requestBody);

  int httpResponseCode = http.POST(requestBody);
  if (httpResponseCode != 201) return false;
  String payload = http.getString();
  Serial.println(payload);
  http.end();
  return true;
}