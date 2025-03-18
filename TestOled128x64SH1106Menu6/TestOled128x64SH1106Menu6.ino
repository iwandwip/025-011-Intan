#include <Arduino.h>
#include "sh1106-menu.h"

const char *ssid = "TIMEOSPACE";
const char *password = "1234Saja";

SH1106Menu display(0x3C, 21, 22);
MenuCursor cursor = { false, false, false, false, true };

MenuProperties *mainMenu;
MenuProperties *displayMenu;
MenuProperties *systemMenu;
MenuProperties *aboutMenu;
MenuProperties *loadingMenu;
MenuProperties *uiDemoMenu;

int brightnessValue = 75;
float temperatureValue = 23.5;
char inputBuffer[MAX_BUFF_LEN] = "";

void listenSerialInput();
void initDisplayCallback();
void changeBrightness();
void goBackToMain();
void printMenuHelp();
void testLoadingFunctions();
void showCircleLoadingDemo();
void showBarLoadingDemo();
void showToastDemo();
void showConfirmationDemo();
void showBarChartDemo();
void showLineChartDemo();
void showScrollableTextDemo();
void showSliderDemo();
void showTextInputDemo();

void setup() {
  Serial.begin(115200);
  Serial.println("SH1106 Menu Demo - Extended Version");

  printMenuHelp();
  display.initialize(true, initDisplayCallback);

  // Connect to WiFi
  display.connectToWiFi(ssid, password, 15);

  // Create all menus
  mainMenu = display.createMenu(5, "Display", "System", "Loading Demos", "UI Demos", "About");
  displayMenu = display.createMenu(3, "Display Settings", "Brightness: 75%", "Back");
  systemMenu = display.createMenu(2, "System Info", "Back");
  loadingMenu = display.createMenu(3, "Circle Loading", "Bar Loading", "Back");
  uiDemoMenu = display.createMenu(8, "Toast", "Confirmation", "Bar Chart", "Line Chart",
                                  "Scrollable Text", "Slider", "Text Input", "Back");
  aboutMenu = display.createMenu(2, "About Device", "Back");

  display.formatMenu(displayMenu, 1, "Brightness: %d%%", brightnessValue);
}

void loop() {
  display.onListen(&cursor, listenSerialInput);
  display.showMenu(mainMenu);

  // Main menu selections
  display.onSelect(
    mainMenu, "Display", nullptr,
    [](MenuCursor *cursor) {
      display.formatMenu(displayMenu, 1, "Brightness: %d%%", brightnessValue);
      display.showMenu(displayMenu);
    });

  display.onSelect(
    mainMenu, "System", nullptr,
    [](MenuCursor *cursor) {
      String tempStr = "Temp: " + String(temperatureValue) + "C";
      String uptimeStr = "Uptime: " + String(millis() / 1000) + "s";
      String wifiStr = "WiFi: " + display.getWiFiStatus();

      display.renderInfoScreen("System Info", tempStr.c_str(), uptimeStr.c_str(), wifiStr.c_str());

      Serial.println("Untuk kembali ke menu utama, ketik 'b'");
      while (!cursor->back) {
        listenSerialInput();
        delay(50);
      }
    });

  display.onSelect(
    mainMenu, "Loading Demos", nullptr,
    [](MenuCursor *cursor) {
      display.showMenu(loadingMenu);
    });

  display.onSelect(
    mainMenu, "UI Demos", nullptr,
    [](MenuCursor *cursor) {
      display.showMenu(uiDemoMenu);
    });

  display.onSelect(
    mainMenu, "About", nullptr,
    [](MenuCursor *cursor) {
      String ipText = "IP: " + display.getIPAddress();
      display.renderInfoScreen("About Device", "Model: ESP32", ipText.c_str(), "FW: v1.0.0");

      Serial.println("Untuk kembali ke menu utama, ketik 'b'");
      while (!cursor->back) {
        listenSerialInput();
        delay(50);
      }
    });

  // Display menu selections
  display.onSelect(displayMenu, "Brightness: 75%", changeBrightness);
  display.onSelect(displayMenu, "Back", goBackToMain);

  // Loading demos menu selections
  display.onSelect(loadingMenu, "Circle Loading", showCircleLoadingDemo);
  display.onSelect(loadingMenu, "Bar Loading", showBarLoadingDemo);
  display.onSelect(loadingMenu, "Back", goBackToMain);

  // UI Demo menu selections
  display.onSelect(uiDemoMenu, "Toast", showToastDemo);
  display.onSelect(uiDemoMenu, "Confirmation", showConfirmationDemo);
  display.onSelect(uiDemoMenu, "Bar Chart", showBarChartDemo);
  display.onSelect(uiDemoMenu, "Line Chart", showLineChartDemo);
  display.onSelect(uiDemoMenu, "Scrollable Text", showScrollableTextDemo);
  display.onSelect(uiDemoMenu, "Slider", showSliderDemo);
  display.onSelect(uiDemoMenu, "Text Input", showTextInputDemo);
  display.onSelect(uiDemoMenu, "Back", goBackToMain);

  delay(50);
}

void showCircleLoadingDemo() {
  display.clear();
  display.setTextAlignment(TEXT_ALIGN_CENTER);
  display.setFont(ArialMT_Plain_10);
  display.drawString(64, 10, "Circle Loading Demo");
  display.drawString(64, 25, "Press 'b' to cancel");
  display.display();
  delay(1000);

  int frame = 0;
  unsigned long lastFrameTime = millis();
  bool running = true;

  while (running) {
    // Check for back button
    if (Serial.available() > 0) {
      String command = Serial.readStringUntil('\n');
      command.trim();
      command.toLowerCase();
      if (command == "b" || command == "back") {
        running = false;
      }
    }

    // Update animation frame with controlled timing
    if (millis() - lastFrameTime >= 150) {
      display.showCircleLoading("Circle Loading", frame);
      frame = (frame + 1) % 24;  // 24 frames for a full cycle
      lastFrameTime = millis();
    }

    delay(10);  // Small delay to prevent CPU hogging
  }

  cursor.back = true;
}

void showBarLoadingDemo() {
  display.clear();
  display.setTextAlignment(TEXT_ALIGN_CENTER);
  display.setFont(ArialMT_Plain_10);
  display.drawString(64, 10, "Bar Loading Demo");
  display.drawString(64, 25, "Press 'b' to cancel");
  display.display();
  delay(1000);

  int progress = 0;
  unsigned long lastUpdateTime = millis();
  bool running = true;

  while (running) {
    // Check for back button
    if (Serial.available() > 0) {
      String command = Serial.readStringUntil('\n');
      command.trim();
      command.toLowerCase();
      if (command == "b" || command == "back") {
        running = false;
      }
    }

    // Update loading bar with controlled timing
    if (millis() - lastUpdateTime >= 100) {
      display.showLoadingBar("Progress Loading", progress);
      progress = (progress + 2) % 101;  // 0-100%
      lastUpdateTime = millis();
    }

    delay(10);  // Small delay to prevent CPU hogging
  }

  cursor.back = true;
}

void showToastDemo() {
  display.showToast("Ini adalah Toast!", 2000);
  delay(500);  // Short delay after toast
  display.showToast("Toast lain...", 1500);
  delay(500);
  display.showToast("Toast ketiga", 1000);
}

void showConfirmationDemo() {
  bool result = display.showConfirmation("Konfirmasi", "Apakah Anda yakin?");

  // Show toast with the result
  if (result) {
    display.showToast("Ya dipilih", 2000);
  } else {
    display.showToast("Tidak dipilih", 2000);
  }
}

void showBarChartDemo() {
  int values[6] = { 10, 25, 45, 30, 60, 15 };
  display.drawBarChart("Bar Chart Demo", values, 6, 60);

  // Wait for back button
  cursor.back = false;
  Serial.println("Untuk kembali, ketik 'b'");
  while (!cursor.back) {
    listenSerialInput();
    delay(50);
  }
}

void showLineChartDemo() {
  int values[8] = { 20, 35, 15, 55, 40, 60, 25, 45 };
  display.drawLineChart("Line Chart Demo", values, 8, 0, 60);

  // Wait for back button
  cursor.back = false;
  Serial.println("Untuk kembali, ketik 'b'");
  while (!cursor.back) {
    listenSerialInput();
    delay(50);
  }
}

void showScrollableTextDemo() {
  const char *longText = "Ini adalah contoh teks panjang yang dapat di-scroll. "
                         "Anda bisa menggunakan tombol up/down untuk menggeser teks ini. "
                         "Library SH1106Menu menyediakan beberapa fungsi UI yang berguna "
                         "untuk membuat antarmuka pada display OLED. Seperti yang Anda lihat, "
                         "teks ini cukup panjang untuk membutuhkan scrolling.\n\n"
                         "Tombol navigasi:\n"
                         "- UP/DOWN: Scroll teks\n"
                         "- BACK: Kembali ke menu\n\n"
                         "Terima kasih telah mencoba demo ini!";

  display.showScrollableText("Teks Scrollable", longText);
}

void showSliderDemo() {
  int value = display.showSlider("Atur Nilai", 0, 100, 50);

  // Show the result
  char resultMessage[24];
  sprintf(resultMessage, "Nilai: %d", value);
  display.showToast(resultMessage, 2000);
}

void showTextInputDemo() {
  // Clear input buffer first
  memset(inputBuffer, 0, MAX_BUFF_LEN);

  // Show text input screen
  display.showTextInput("Masukkan Teks", inputBuffer, MAX_BUFF_LEN);

  // Show the input result
  if (strlen(inputBuffer) > 0) {
    char resultMessage[MAX_BUFF_LEN + 8];
    sprintf(resultMessage, "Input: %s", inputBuffer);
    display.clear();
    display.setTextAlignment(TEXT_ALIGN_CENTER);
    display.drawString(64, 20, "Teks Dimasukkan:");
    display.drawString(64, 35, inputBuffer);
    display.display();

    // Wait for back button
    cursor.back = false;
    Serial.println("Untuk kembali, ketik 'b'");
    while (!cursor.back) {
      listenSerialInput();
      delay(50);
    }
  } else {
    display.showToast("Input dibatalkan", 2000);
  }
}

void testLoadingFunctions() {
  // Demo for time-based loading bar
  display.showLoadingBarTimed("Time-Based Loading", 3);

  // Demo for progress-based loading bar
  for (int i = 0; i <= 100; i += 5) {
    display.showLoadingBar("Progress Loading", i);
    delay(100);
  }

  // Demo for circular loading
  display.clear();
  display.setTextAlignment(TEXT_ALIGN_CENTER);
  display.setFont(ArialMT_Plain_10);
  display.drawString(64, 10, "Circle Loading Demo");
  display.display();
  delay(1000);

  // Demonstrating circle loading animation
  for (int frame = 0; frame < 24; frame++) {
    display.showCircleLoading("Circle Loading", frame);
    delay(150);  // Adjust speed of animation
  }

  // Show completion
  display.clear();
  display.setTextAlignment(TEXT_ALIGN_CENTER);
  display.setFont(ArialMT_Plain_10);
  display.drawString(64, 20, "Loading Complete!");
  display.display();
  delay(1000);
}

void printMenuHelp() {
  Serial.println("==================================");
  Serial.println("KONTROL MENU DENGAN SERIAL INPUT:");
  Serial.println("==================================");
  Serial.println("u atau up     = Navigasi ke atas");
  Serial.println("d atau down   = Navigasi ke bawah");
  Serial.println("s atau select = Pilih menu");
  Serial.println("b atau back   = Kembali");
  Serial.println("h atau help   = Tampilkan bantuan");
  Serial.println("==================================");
}

void listenSerialInput() {
  cursor.up = false;
  cursor.down = false;
  cursor.select = false;
  cursor.back = false;

  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    command.toLowerCase();

    if (command == "u" || command == "up") {
      cursor.up = true;
      Serial.println("-> UP");
    } else if (command == "d" || command == "down") {
      cursor.down = true;
      Serial.println("-> DOWN");
    } else if (command == "s" || command == "select") {
      cursor.select = true;
      Serial.println("-> SELECT");
    } else if (command == "b" || command == "back") {
      cursor.back = true;
      Serial.println("-> BACK");
    } else if (command == "h" || command == "help") {
      printMenuHelp();
    } else {
      Serial.println("Perintah tidak dikenal. Ketik 'help' untuk bantuan.");
    }
  }
}

void initDisplayCallback() {
  display.clear();
  display.drawRect(0, 0, 128, 64);
  display.setColor(WHITE);
  display.fillRect(0, 0, 128, 15);
  display.setColor(BLACK);
  display.setTextAlignment(TEXT_ALIGN_CENTER);
  display.setFont(ArialMT_Plain_10);
  display.drawString(64, 3, "SH1106 MENU");
  display.setColor(WHITE);
  display.drawString(64, 25, "Loading...");
  display.drawRect(24, 40, 80, 10);
  display.fillRect(24, 40, 80, 10);
  display.display();
  delay(1000);
}

void changeBrightness() {
  brightnessValue = (brightnessValue + 25) % 125;
  if (brightnessValue == 0) brightnessValue = 25;

  display.formatMenu(displayMenu, 1, "Brightness: %d%%", brightnessValue);
  Serial.println("Brightness diubah: " + String(brightnessValue) + "%");

  uint8_t oledBrightness = map(brightnessValue, 0, 100, 0, 255);
  display.setBrightness(oledBrightness);
}

void goBackToMain() {
  cursor.back = true;
}