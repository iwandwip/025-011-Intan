#include <ArduinoJson.h>
#include <FirebaseESP32.h>
#include <WiFi.h>
...

    FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

bool isSessionActive = false;
bool isProcessing = false;
String currentSessionType = "";
String currentUserId = "";
String expectedRfid = "";
unsigned long lastCheckTime = 0;
const unsigned long CHECK_INTERVAL = 2000;

void setup() {
  Serial.begin(115200);

  WiFi.begin("WIFI_SSID", "WIFI_PASSWORD");
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("WiFi Connected");

  config.database_url = "https://your-project.firebaseio.com";
  config.api_key = "your-api-key";
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  Serial.println("Firebase Connected");
}

void loop() {
  if (millis() - lastCheckTime > CHECK_INTERVAL) {
    if (Firebase.RTDB.getJSON(&fbdo, "/systemStatus/hardware")) {
      FirebaseJson json = fbdo.jsonObject();

      bool isInUse;
      json.get("isInUse", isInUse);

      if (isInUse) {
        String sessionType;
        json.get("sessionType", sessionType);

        if (sessionType == "rfid") {
          String rfidValue;
          json.get("rfid", rfidValue);

          if (rfidValue == "" && !isProcessing) {
            Serial.println("RFID Pairing Session Started");
            isProcessing = true;

            delay(3000);

            String randomRfid = "";
            for (int i = 0; i < 8; i++) {
              randomRfid += String(random(0, 16), HEX);
            }
            randomRfid.toUpperCase();

            Firebase.RTDB.setString(&fbdo, "/systemStatus/hardware/rfid", randomRfid);
            Firebase.RTDB.setString(&fbdo, "/systemStatus/hardware/lastActivity", "timestamp");

            Serial.println("RFID Sent: " + randomRfid);
            isProcessing = false;
          }
        }

        else if (sessionType == "weighing") {
          bool measurementComplete;
          json.get("measurementComplete", measurementComplete);

          if (!measurementComplete && !isProcessing) {
            String userRfid;
            json.get("userRfid", userRfid);

            Serial.println("Weighing Session Started");
            Serial.println("Expected RFID: " + userRfid);
            isProcessing = true;

            delay(2000);
            Serial.println("Waiting for RFID tap...");

            delay(3000);
            String tappedRfid = userRfid;

            if (random(0, 10) < 2) {
              tappedRfid = "WRONGRFID";
            }

            Serial.println("RFID Tapped: " + tappedRfid);

            if (tappedRfid == userRfid) {
              Serial.println("RFID Match! Starting measurement...");

              delay(2000);

              float weight = random(150, 450) / 10.0;
              int height = random(90, 130);

              float bmi = weight / ((height / 100.0) * (height / 100.0));
              String nutritionStatus = "sehat";

              if (bmi < 18.5) {
                nutritionStatus = "tidak sehat";
              } else if (bmi >= 25 && bmi < 30) {
                nutritionStatus = "tidak sehat";
              } else if (bmi >= 30) {
                nutritionStatus = "obesitas";
              }

              Firebase.RTDB.setFloat(&fbdo, "/systemStatus/hardware/weight", weight);
              Firebase.RTDB.setInt(&fbdo, "/systemStatus/hardware/height", height);
              Firebase.RTDB.setString(&fbdo, "/systemStatus/hardware/nutritionStatus", nutritionStatus);
              Firebase.RTDB.setBool(&fbdo, "/systemStatus/hardware/measurementComplete", true);
              Firebase.RTDB.setString(&fbdo, "/systemStatus/hardware/lastActivity", "timestamp");

              Serial.println("Weight: " + String(weight) + " kg");
              Serial.println("Height: " + String(height) + " cm");
              Serial.println("Status: " + nutritionStatus);
              Serial.println("Measurement Complete!");

            } else {
              Serial.println("RFID Mismatch! Resetting session...");

              Firebase.RTDB.setBool(&fbdo, "/systemStatus/hardware/isInUse", false);
              Firebase.RTDB.setBool(&fbdo, "/systemStatus/hardware/timeout", false);
              Firebase.RTDB.setString(&fbdo, "/systemStatus/hardware/sessionType", "");
              Firebase.RTDB.setString(&fbdo, "/systemStatus/hardware/currentUserId", "");
              Firebase.RTDB.setString(&fbdo, "/systemStatus/hardware/currentUserName", "");
              Firebase.RTDB.setString(&fbdo, "/systemStatus/hardware/userRfid", "");
              Firebase.RTDB.setFloat(&fbdo, "/systemStatus/hardware/weight", 0);
              Firebase.RTDB.setInt(&fbdo, "/systemStatus/hardware/height", 0);
              Firebase.RTDB.setString(&fbdo, "/systemStatus/hardware/nutritionStatus", "");
              Firebase.RTDB.setBool(&fbdo, "/systemStatus/hardware/measurementComplete", false);
              Firebase.RTDB.setString(&fbdo, "/systemStatus/hardware/rfid", "");
            }

            isProcessing = false;
          }
        }
      }
    }

    lastCheckTime = millis();
  }

  delay(100);
}