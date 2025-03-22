/*
 * SH1106 Menu Demo
 * Demonstrasi semua metode UI SH1106Menu
 * 
 * Koneksi ke ESP32:
 * - SDA: 21
 * - SCL: 22
 */

#include <Wire.h>
#define ENABLE_MODULE_SH1106_MENU
#include "Kinematrix.h"

// Definisikan pin untuk ESP32
#define SDA_PIN 21
#define SCL_PIN 22

// Inisialisasi objek menu
SH1106Menu display(0x3c, SDA_PIN, SCL_PIN);

// Sample icon 8x8
const uint8_t wifiIcon[] PROGMEM = {
  0x00, 0x7e, 0x42, 0x3c, 0x18, 0x18, 0x00, 0x18
};

void setup() {
  // Inisialisasi Serial
  Serial.begin(115200);
  while (!Serial) {
    ;  // Tunggu port serial terhubung
  }

  // Inisialisasi display
  display.initialize(true);

  Serial.println();
  Serial.println("SH1106 Menu Demo");
  Serial.println("----------------");

  // Tampilkan splash screen awal
  display.renderSplashScreen("SH1106 Demo", "v1.0");
  delay(2000);

  // Tampilkan menu pilihan
  showMenu();
}

void loop() {
  if (Serial.available() > 0) {
    int choice = Serial.parseInt();
    Serial.read();  // Membersihkan newline/carriage return

    if (choice >= 1 && choice <= 17) {
      executeDemo(choice);
      delay(1000);
      showMenu();  // Kembali ke menu utama
    }
  }
}

void showMenu() {
  Serial.println();
  Serial.println("Pilih demo untuk ditampilkan:");
  Serial.println("1. Large Text");
  Serial.println("2. Splash Screen");
  Serial.println("3. Status Screen");
  Serial.println("4. Dual Value Screen");
  Serial.println("5. Countdown Screen");
  Serial.println("6. Icon Text Row");
  Serial.println("7. Centered Text");
  Serial.println("8. Metric Screen");
  Serial.println("9. Boxed Text");
  Serial.println("10. Battery Status");
  Serial.println("11. Signal Strength");
  Serial.println("12. Clock Display");
  Serial.println("13. Percentage Circle");
  Serial.println("14. Scrolling Text");
  Serial.println("15. Animated Loading");
  Serial.println("16. Toggle Switch");
  Serial.println("17. Notification");
  Serial.println();
  Serial.print("Masukkan pilihan (1-17): ");
}

void executeDemo(int choice) {
  Serial.println();

  switch (choice) {
    case 1:
      demoLargeText();
      break;
    case 2:
      demoSplashScreen();
      break;
    case 3:
      demoStatusScreen();
      break;
    case 4:
      demoDualValueScreen();
      break;
    case 5:
      demoCountdownScreen();
      break;
    case 6:
      demoIconTextRow();
      break;
    case 7:
      demoCenteredText();
      break;
    case 8:
      demoMetricScreen();
      break;
    case 9:
      demoBoxedText();
      break;
    case 10:
      demoBatteryStatus();
      break;
    case 11:
      demoSignalStrength();
      break;
    case 12:
      demoClock();
      break;
    case 13:
      demoPercentageCircle();
      break;
    case 14:
      demoScrollingText();
      break;
    case 15:
      demoAnimatedLoading();
      break;
    case 16:
      demoToggleSwitch();
      break;
    case 17:
      demoNotification();
      break;
    default:
      Serial.println("Pilihan tidak valid");
      break;
  }
}

// Demo 1: renderLargeText
void demoLargeText() {
  Serial.println("Demo: Large Text");

  // Demo dengan font besar dan kotak
  display.renderLargeText("28.5°C", 24, true);
  delay(2000);

  // Demo dengan font sedang tanpa kotak
  display.renderLargeText("Selamat Datang", 16, false);
  delay(2000);

  // Demo dengan font kecil dan kotak
  display.renderLargeText("Status: NORMAL", 10, true);
  delay(2000);
}

// Demo 2: renderSplashScreen
void demoSplashScreen() {
  Serial.println("Demo: Splash Screen");

  // Demo splash screen sederhana
  display.renderSplashScreen("Smart Device");
  delay(2000);

  // Demo dengan subtitle
  display.renderSplashScreen("Smart Device", "Version 1.0.2");
  delay(2000);

  // Demo dengan logo (menggunakan WiFi icon sebagai contoh)
  display.renderSplashScreen("Smart Device", "Version 1.0.2", wifiIcon);
  delay(2000);
}

// Demo 3: renderStatusScreen
void demoStatusScreen() {
  Serial.println("Demo: Status Screen");

  // Demo status sukses
  display.renderStatusScreen("WiFi Connection", "Connected", true);
  delay(2000);

  // Demo status gagal
  display.renderStatusScreen("WiFi Connection", "Failed", false);
  delay(2000);
}

// Demo 4: renderDualValueScreen
void demoDualValueScreen() {
  Serial.println("Demo: Dual Value Screen");

  // Demo dual value (suhu & kelembaban)
  display.renderDualValueScreen(
    "Environment",
    "Temperature",
    "28.5°C",
    "Humidity",
    "65%");
  delay(3000);
}

// Demo 5: renderCountdownScreen
void demoCountdownScreen() {
  Serial.println("Demo: Countdown Screen");

  // Demo countdown dengan progress bar
  display.renderCountdownScreen("Restarting In", 30, true);
  delay(2000);

  // Demo countdown tanpa progress bar
  display.renderCountdownScreen("Please Wait", 15, false);
  delay(2000);
}

// Demo 6: renderIconTextRow
void demoIconTextRow() {
  Serial.println("Demo: Icon Text Row");

  display.clear();

  // Demo beberapa baris dengan icon
  display.renderIconTextRow(5, wifiIcon, "WiFi: Connected", 8, 8);
  display.renderIconTextRow(20, wifiIcon, "BLE: Active", 8, 8);
  display.renderIconTextRow(35, wifiIcon, "Power: On", 8, 8);
  display.renderIconTextRow(50, nullptr, "No Icon Row");

  display.display();
  delay(3000);
}

// Demo 7: renderCenteredText
void demoCenteredText() {
  Serial.println("Demo: Centered Text");

  // Demo 1 baris teks
  display.renderCenteredText("Device Active");
  delay(2000);

  // Demo 2 baris teks
  display.renderCenteredText("Device Active", "Please Wait...");
  delay(2000);

  // Demo 3 baris teks
  display.renderCenteredText("Device Active", "Please Wait...", "10 seconds");
  delay(2000);
}

// Demo 8: renderMetricScreen
void demoMetricScreen() {
  Serial.println("Demo: Metric Screen");

  // Demo metrik dengan subtitle
  display.renderMetricScreen(
    "Temperature",
    "28.5",
    "°C",
    "Normal");
  delay(2000);

  // Demo metrik tanpa subtitle
  display.renderMetricScreen(
    "Water Level",
    "125",
    "cm");
  delay(2000);
}

// Demo 9: renderBoxedText
void demoBoxedText() {
  Serial.println("Demo: Boxed Text");

  // Demo 1 baris (font besar)
  const char* singleLine[] = { "TEMP: 28°C" };
  display.renderBoxedText(singleLine, 1);
  delay(2000);

  // Demo 2 baris (font sedang)
  const char* twoLines[] = { "Device Status", "NORMAL" };
  display.renderBoxedText(twoLines, 2);
  delay(2000);

  // Demo 3 baris (font kecil)
  const char* threeLines[] = { "Monitoring", "Temp: 28°C", "Humidity: 65%" };
  display.renderBoxedText(threeLines, 3);
  delay(2000);

  // Demo 4 baris (font kecil)
  const char* fourLines[] = { "System Monitor", "Temp: 28°C", "Humidity: 65%", "Air Quality: Good" };
  display.renderBoxedText(fourLines, 4);
  delay(2000);
}

// Demo 10: renderBatteryStatus
void demoBatteryStatus() {
  Serial.println("Demo: Battery Status");

  // Demo baterai rendah
  display.renderBatteryStatus(15);
  delay(2000);

  // Demo baterai sedang
  display.renderBatteryStatus(50);
  delay(2000);

  // Demo baterai penuh
  display.renderBatteryStatus(100);
  delay(2000);

  // Demo baterai charging
  display.renderBatteryStatus(75, true);
  delay(2000);
}

// Demo 11: renderSignalStrength
void demoSignalStrength() {
  Serial.println("Demo: Signal Strength");

  // Demo berbagai level sinyal
  for (int i = 0; i <= 4; i++) {
    display.renderSignalStrength(i, "WiFi-Home");
    delay(1000);
  }
}

// Demo 12: renderClock
void demoClock() {
  Serial.println("Demo: Clock Display");

  // Demo digital clock
  display.renderClock(14, 30);
  delay(2000);

  // Demo digital clock dengan detik
  display.renderClock(14, 30, 45);
  delay(2000);

  // Demo analog clock
  display.renderClock(14, 30, -1, true);
  delay(2000);

  // Demo analog clock dengan detik
  display.renderClock(14, 30, 45, true);
  delay(2000);
}

// Demo 13: renderPercentageCircle
void demoPercentageCircle() {
  Serial.println("Demo: Percentage Circle");

  // Demo berbagai persentase
  int percentages[] = { 0, 25, 50, 75, 100 };

  for (int i = 0; i < 5; i++) {
    // Demo dengan label
    display.renderPercentageCircle(percentages[i], "Complete");
    delay(1000);
  }
}

// Demo 14: renderScrollingText
void demoScrollingText() {
  Serial.println("Demo: Scrolling Text");

  // Demo teks panjang dengan scrolling
  display.renderScrollingText("This is a very long text message that will scroll across the OLED display to demonstrate the scrolling text feature", 25, 1);
}

// Demo 15: renderAnimatedLoading
void demoAnimatedLoading() {
  Serial.println("Demo: Animated Loading");

  // Demo animasi loading
  for (int i = 0; i < 24; i++) {
    display.renderAnimatedLoading(i);
    delay(100);
  }
}

// Demo 16: renderToggleSwitch
void demoToggleSwitch() {
  Serial.println("Demo: Toggle Switch");

  // Demo toggle switch (ON)
  display.renderToggleSwitch("WiFi", true);
  delay(2000);

  // Demo toggle switch (OFF)
  display.renderToggleSwitch("WiFi", false);
  delay(2000);

  // Demo beberapa toggle
  String features[] = { "WiFi", "Bluetooth", "GPS", "NFC" };
  bool states[] = { true, false, true, false };

  for (int i = 0; i < 4; i++) {
    display.renderToggleSwitch(features[i].c_str(), states[i]);
    delay(1000);
  }
}

// Demo 17: renderNotification
void demoNotification() {
  Serial.println("Demo: Notification");

  // Siapkan layar background
  display.clear();
  display.setTextAlignment(TEXT_ALIGN_CENTER);
  display.drawString(64, 32, "Background Screen");
  display.display();
  delay(1000);

  // Tampilkan notifikasi (3 detik)
  display.renderNotification("New Message Received");

  // Tampilkan notifikasi lain (2 detik)
  delay(500);
  display.renderNotification("Battery Low", 2000);
}