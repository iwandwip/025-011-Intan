#include <Arduino.h>
#include <WiFi.h>
#include "sh1106-menu.h"

// WiFi Configuration
const char *WIFI_SSID = "silenceAndSleep";
const char *WIFI_PASSWORD = "11111111";

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
bool wifiEnabled = false;
float temperatureValue = 23.5;
String ipAddress = "";

// Function prototypes
void listenSerialInput();
void initDisplayCallback();
void changeWifiState();
void changeBrightness();
void connectToWiFi();
void disconnectWiFi();
void showWiFiInfo();
void goBackToMain();
void printMenuHelp();

// Function implementations start here
void printMenuHelp() {
  Serial.println("\n--- Menu Navigation Help ---");
  Serial.println("u/up   : Move cursor up");
  Serial.println("d/down : Move cursor down");
  Serial.println("s/select: Select current menu item");
  Serial.println("b/back : Go back to previous menu");
  Serial.println("h/help : Show this help menu");
}

void initDisplayCallback() {
  // Optional initialization after display is set up
  Serial.println("Display initialized successfully!");
}

void goBackToMain() {
  // Reset to main menu
  display.clearMenu(mainMenu, wifiMenu, displayMenu, systemMenu, aboutMenu, nullptr);
}

void changeBrightness() {
  // Simple brightness control logic
  brightnessValue = (brightnessValue + 25) % 100;
  if (brightnessValue == 0) brightnessValue = 25;

  display.formatMenu(displayMenu, 1, "Brightness: %d%%", brightnessValue);
}

void disconnectWiFi() {
  WiFi.disconnect(true);
  wifiEnabled = false;
  ipAddress = "";

  display.clear();
  display.drawString(64, 20, "WiFi Disconnected");
  display.display();

  Serial.println("WiFi disconnected");
  delay(1000);
}

void connectToWiFi() {
  // Enhanced loading screen for WiFi connection
  display.clear();
  display.setTextAlignment(TEXT_ALIGN_CENTER);
  display.setFont(ArialMT_Plain_10);

  // Animated WiFi connection loading screen
  const int animationFrames = 20;
  const int wifiSymbolCenterX = 64;
  const int wifiSymbolCenterY = 32;

  for (int i = 0; i < animationFrames; i++) {
    display.clear();

    // Draw WiFi symbol with dynamic waves
    // Outer wave
    if (i % 4 == 0) {
      display.drawCircle(wifiSymbolCenterX, wifiSymbolCenterY, 20 + (i % 3));
    }
    if (i % 4 == 1) {
      display.drawCircle(wifiSymbolCenterX, wifiSymbolCenterY, 15 + (i % 3));
    }
    if (i % 4 == 2) {
      display.drawCircle(wifiSymbolCenterX, wifiSymbolCenterY, 10 + (i % 3));
    }

    // WiFi antenna base
    display.fillRect(wifiSymbolCenterX - 2, wifiSymbolCenterY + 10, 4, 10);

    // Text and connection details
    display.drawString(64, 55, "Connecting to WiFi");
    display.drawString(64, 10, WIFI_SSID);

    // Loading progress bar
    int progressWidth = map(i, 0, animationFrames - 1, 0, 100);
    display.drawRect(20, 48, 100, 4);
    display.fillRect(20, 48, progressWidth, 4);

    display.display();
    delay(100);
  }

  // Start WiFi connection
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    display.clear();

    // Draw connection attempt animation
    int waveRadius = 10 + (attempts % 3);
    display.drawCircle(wifiSymbolCenterX, wifiSymbolCenterY, waveRadius);
    display.drawCircle(wifiSymbolCenterX, wifiSymbolCenterY, waveRadius + 5);

    // WiFi antenna base
    display.fillRect(wifiSymbolCenterX - 2, wifiSymbolCenterY + 10, 4, 10);

    // Connection attempt text
    display.drawString(64, 10, "Connecting");
    display.drawString(64, 22, "Attempt: " + String(attempts + 1));

    // Progress bar
    int progressWidth = map(attempts, 0, 30, 0, 100);
    display.drawRect(20, 48, 100, 4);
    display.fillRect(20, 48, progressWidth, 4);

    display.display();
    delay(500);
    attempts++;
  }

  // Check connection result
  if (WiFi.status() == WL_CONNECTED) {
    wifiEnabled = true;
    ipAddress = WiFi.localIP().toString();

    // Success screen with connection details and animated checkmark
    for (int i = 0; i < 3; i++) {
      display.clear();

      // Animated checkmark
      int centerX = 64;
      int centerY = 32;

      // Outer circle
      display.drawCircle(centerX, centerY, 20);

      // Checkmark animation
      if (i > 0) {
        // First line of checkmark
        display.drawLine(centerX - 8, centerY, centerX - 2, centerY + 6);
      }
      if (i > 1) {
        // Second line of checkmark
        display.drawLine(centerX - 2, centerY + 6, centerX + 10, centerY - 8);
      }

      // Connection details
      display.setTextAlignment(TEXT_ALIGN_CENTER);
      display.drawString(centerX, 10, "WiFi Connected!");
      display.drawString(centerX, 55, "Network: " + String(WIFI_SSID));

      display.display();
      delay(500);
    }

    // Final success screen
    display.clear();
    display.drawString(64, 10, "WiFi Connected!");
    display.drawString(64, 25, "Network: " + String(WIFI_SSID));
    display.drawString(64, 40, "IP: " + ipAddress);
    display.display();

    Serial.println("\nWiFi connected successfully");
    Serial.println("Network: " + String(WIFI_SSID));
    Serial.println("IP address: " + ipAddress);
    Serial.println("Signal Strength: " + String(WiFi.RSSI()) + " dBm");
  } else {
    // Connection failed screen with animated error
    for (int i = 0; i < 3; i++) {
      display.clear();

      // Animated cross/error symbol
      int centerX = 64;
      int centerY = 32;

      // Outer circle
      display.drawCircle(centerX, centerY, 20);

      // Cross animation
      if (i > 0) {
        // First line of cross
        display.drawLine(centerX - 8, centerY - 8, centerX + 8, centerY + 8);
      }
      if (i > 1) {
        // Second line of cross
        display.drawLine(centerX - 8, centerY + 8, centerX + 8, centerY - 8);
      }

      // Error details
      display.setTextAlignment(TEXT_ALIGN_CENTER);
      display.drawString(centerX, 10, "WiFi Connect Failed");
      display.drawString(centerX, 55, "Check Settings");

      display.display();
      delay(500);
    }

    // Final error screen
    display.clear();
    display.drawString(64, 20, "WiFi Connect Failed");
    display.drawString(64, 35, "Check Settings");
    display.drawString(64, 50, "Retry or Reboot");
    display.display();

    Serial.println("\nWiFi connection failed");
    Serial.println("Possible issues:");
    Serial.println("- Incorrect SSID/Password");
    Serial.println("- Network out of range");
    Serial.println("- Temporary network issue");
    wifiEnabled = false;
  }

  // Show result for 3 seconds
  delay(3000);
}

void changeWifiState() {
  if (!wifiEnabled) {
    connectToWiFi();
  } else {
    disconnectWiFi();
  }

  // Update menu teks WiFi
  display.formatMenu(wifiMenu, 1, "WiFi: %s", wifiEnabled ? "ON" : "OFF");
}

void showWiFiInfo() {
  // Tampilkan informasi WiFi
  display.clear();
  display.setTextAlignment(TEXT_ALIGN_LEFT);
  display.drawString(0, 0, "WiFi Info:");
  display.drawString(0, 15, "SSID: " + String(WIFI_SSID));
  display.drawString(0, 30, "Status: " + String(wifiEnabled ? "Connected" : "Disconnected"));
  display.drawString(0, 45, "IP: " + ipAddress);
  display.display();

  // Tunggu input kembali
  Serial.println("Untuk kembali, ketik 'b'");
  while (!cursor.back) {
    listenSerialInput();
    delay(50);
  }
}

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

void setup() {
  Serial.begin(115200);
  Serial.println("SH1106 Menu Demo - WiFi Edition");

  // Print instructions for serial control
  printMenuHelp();

  // Initialize display
  display.initialize(true, initDisplayCallback);

  // Langsung connect ke WiFi
  connectToWiFi();

  // Create main menu with 4 items
  mainMenu = display.createMenu(4,
                                "WiFi",
                                "Display",
                                "System",
                                "About");

  // Create WiFi submenu with 3 items
  wifiMenu = display.createMenu(3,
                                "WiFi Settings",
                                "WiFi: OFF",
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

  // Handle WiFi menu selections
  display.onSelect(wifiMenu, "WiFi Settings", showWiFiInfo);
  display.onSelect(wifiMenu, "WiFi: OFF", changeWifiState);
  display.onSelect(wifiMenu, "WiFi: ON", changeWifiState);
  display.onSelect(wifiMenu, "Back", goBackToMain);

  // Handle Display menu selections
  display.onSelect(displayMenu, "Brightness: 75%", changeBrightness);
  display.onSelect(displayMenu, "Back", goBackToMain);

  delay(50);
}