#include <Arduino.h>
#include "sh1106-menu.h"

// Create Menu instance with I2C address 0x3C, SDA on pin 21, SCL on pin 22
SH1106Menu display(0x3C, 21, 22);

// Initialize cursor to control menu navigation
MenuCursor cursor = { false, false, false, false, true };

// Menu properties declarations
MenuProperties *mainMenu;
MenuProperties *wifiMenu;
MenuProperties *displayMenu;
MenuProperties *systemMenu;
MenuProperties *aboutMenu;

// Placeholder values
int brightnessValue = 75;
bool wifiEnabled = true;
float temperatureValue = 23.5;

// Function prototypes
void listenSerialInput();
void initDisplayCallback();
void changeWifiState();
void changeBrightness();
void showTemperature(MenuCursor *cursor);
void goBackToMain();
void printMenuHelp();

void setup() {
  Serial.begin(115200);
  Serial.println("SH1106 Menu Demo - No Header Version");

  // Print instructions for serial control
  printMenuHelp();

  // Initialize display
  display.initialize(true, initDisplayCallback);

  // Create main menu with 4 items (tanpa "Main Menu" sebagai header)
  mainMenu = display.createMenu(4,
                                "WiFi",
                                "Display",
                                "System",
                                "About");

  // Create WiFi submenu with 3 items
  wifiMenu = display.createMenu(3,
                                "WiFi Settings",
                                "WiFi: ON",
                                "Back");

  // Create display submenu with 3 items
  displayMenu = display.createMenu(3,
                                   "Display Settings",
                                   "Brightness: 75%",
                                   "Back");

  // Create system menu with 2 items
  systemMenu = display.createMenu(2,
                                  "System Info",
                                  "Back");

  // Create about menu with 2 items
  aboutMenu = display.createMenu(2,
                                 "About Device",
                                 "Back");

  // Format menu items based on current state
  display.formatMenu(wifiMenu, 1, "WiFi: %s", wifiEnabled ? "ON" : "OFF");
  display.formatMenu(displayMenu, 1, "Brightness: %d%%", brightnessValue);
}

void loop() {
  // Listen for serial commands instead of button presses
  display.onListen(&cursor, listenSerialInput);

  // Display main menu when no option is selected
  display.showMenu(mainMenu);

  // Handle main menu selections - WiFi
  display.onSelect(
    mainMenu, "WiFi", []() {
      // This code runs when WiFi is clicked
      display.formatMenu(wifiMenu, 1, "WiFi: %s", wifiEnabled ? "ON" : "OFF");
    },
    [](MenuCursor *cursor) {
      // This code runs while WiFi menu item is active
      display.showMenu(wifiMenu);
    });

  // Handle main menu selections - Display
  display.onSelect(
    mainMenu, "Display", nullptr,
    [](MenuCursor *cursor) {
      display.formatMenu(displayMenu, 1, "Brightness: %d%%", brightnessValue);
      display.showMenu(displayMenu);
    });

  // Handle main menu selections - System
  display.onSelect(
    mainMenu, "System", nullptr,
    [](MenuCursor *cursor) {
      // Use the new renderInfoScreen function
      String tempStr = "Temp: " + String(temperatureValue) + "C";
      String uptimeStr = "Uptime: " + String(millis() / 1000) + "s";
      String memoryStr = "Memory: " + String(ESP.getFreeHeap() / 1024) + "KB";

      display.renderInfoScreen("System Info", tempStr.c_str(), uptimeStr.c_str(), memoryStr.c_str());

      // Wait for back command
      Serial.println("Untuk kembali ke menu utama, ketik 'b'");
      while (!cursor->back) {
        listenSerialInput();
        delay(50);
      }
      // DO NOT reset cursor->back here, let menu system handle it
    });

  // Handle main menu selections - About
  display.onSelect(
    mainMenu, "About", nullptr,
    [](MenuCursor *cursor) {
      // Use the new renderInfoScreen function
      display.renderInfoScreen("About Device", "Model: ESP32", "FW: v1.0.0", "SN: 12345678");

      // Wait for back command
      Serial.println("Untuk kembali ke menu utama, ketik 'b'");
      while (!cursor->back) {
        listenSerialInput();
        delay(50);
      }
      // DO NOT reset cursor->back here, let menu system handle it
    });

  // Handle WiFi menu selections
  display.onSelect(wifiMenu, "WiFi: ON", changeWifiState);
  display.onSelect(wifiMenu, "WiFi: OFF", changeWifiState);
  display.onSelect(wifiMenu, "Back", goBackToMain);

  // Handle display menu selections
  display.onSelect(displayMenu, "Brightness: 75%", changeBrightness);
  display.onSelect(displayMenu, "Back", goBackToMain);

  // Add a small delay
  delay(50);
}

// Print help menu untuk serial control
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

// Callback functions
void listenSerialInput() {
  // Reset cursor flags
  cursor.up = false;
  cursor.down = false;
  cursor.select = false;
  cursor.back = false;

  // Check if serial data is available
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

  // Draw border for splash screen
  display.drawRect(0, 0, 128, 64);

  // Title with inverted colors
  display.setColor(WHITE);
  display.fillRect(0, 0, 128, 15);
  display.setColor(BLACK);
  display.setTextAlignment(TEXT_ALIGN_CENTER);
  display.setFont(ArialMT_Plain_10);
  display.drawString(64, 3, "SH1106 MENU");

  // Loading text (vertically centered)
  display.setColor(WHITE);
  display.drawString(64, 25, "Loading...");

  // Progress bar with border
  display.drawRect(24, 40, 80, 10);
  display.fillRect(24, 40, 80, 10);

  display.display();
  delay(1000);  // Show splash screen for 1 second
}

void changeWifiState() {
  wifiEnabled = !wifiEnabled;
  display.formatMenu(wifiMenu, 1, "WiFi: %s", wifiEnabled ? "ON" : "OFF");
  Serial.println("WiFi status diubah: " + String(wifiEnabled ? "ON" : "OFF"));
}

void changeBrightness() {
  // Cycle through brightness values: 25% -> 50% -> 75% -> 100% -> 25%
  brightnessValue = (brightnessValue + 25) % 125;
  if (brightnessValue == 0) brightnessValue = 25;

  // Update menu text
  display.formatMenu(displayMenu, 1, "Brightness: %d%%", brightnessValue);
  Serial.println("Brightness diubah: " + String(brightnessValue) + "%");

  // Set actual brightness
  uint8_t oledBrightness = map(brightnessValue, 0, 100, 0, 255);
  display.setBrightness(oledBrightness);
}

void goBackToMain() {
  cursor.back = true;
}