# Arduino Project Structure Guide

## Overview
Panduan lengkap untuk mengorganisir Arduino project menggunakan struktur multi-file yang optimal dan memanfaatkan keunggulan Arduino IDE.

## Arduino Project File Hierarchy

### Konsep Dasar
Arduino IDE menggunakan sistem kompilasi unik yang menggabungkan semua file `.ino` dalam satu folder menjadi satu sketch tunggal:

```
Header.h → ProjectName.ino → Module1.ino → Module2.ino → ...
```

### Urutan Kompilasi
1. **Header.h** - Konfigurasi dan deklarasi global (dibaca pertama)
2. **ProjectName.ino** - File utama dengan nama sesuai folder (entry point)
3. **File .ino lainnya** - Module terpisah (otomatis ter-link)

## File Structure Best Practices

### 1. **Header.h** - Global Configuration
```cpp
#ifndef PROJECT_HEADER_H
#define PROJECT_HEADER_H

// === Library Includes ===
#include "Arduino.h"
#include "WiFi.h"
// ... other libraries

// === Module Defines ===
#define ENABLE_WIFI
#define ENABLE_DISPLAY
#define ENABLE_SENSORS

// === Global Constants ===
const int LED_PIN = 2;
const char* WIFI_SSID = "MyWiFi";

// === Data Structures ===
struct SystemConfig {
  bool wifiEnabled;
  int displayBrightness;
  // ... other config
};

// === Global Variables ===
SystemConfig config;
bool systemInitialized = false;

// === Function Declarations (Optional) ===
// Hanya diperlukan jika ada circular dependencies
void criticalFunction();

#endif
```

### 2. **ProjectName.ino** - Main Entry Point
```cpp
void setup() {
  Serial.begin(115200);
  
  // Initialize components
  initializeHardware();
  initializeWiFi();
  initializeDisplay();
  
  systemInitialized = true;
  Serial.println("System ready");
}

void loop() {
  // Main program loop
  handleSensors();
  updateDisplay();
  processCommands();
  
  delay(100);
}
```

### 3. **Module Files** - Separated by Function

#### **Hardware.ino** - Hardware Management
```cpp
void initializeHardware() {
  pinMode(LED_PIN, OUTPUT);
  // Initialize other hardware
}

void handleSensors() {
  // Read sensors
  // Process sensor data
}
```

#### **WiFi.ino** - Network Operations
```cpp
void initializeWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
}

void sendData(String data) {
  // Send data over WiFi
}
```

#### **Display.ino** - Display Management
```cpp
void initializeDisplay() {
  // Initialize display
}

void updateDisplay() {
  // Update display content
}
```

## Key Advantages of Arduino Structure

### ✅ Automatic Function Linking
```cpp
// Di ProjectName.ino bisa langsung panggil:
initializeWiFi();      // dari WiFi.ino
updateDisplay();       // dari Display.ino
handleSensors();       // dari Hardware.ino
```

### ✅ No Function Prototypes Needed
Arduino IDE otomatis mendeteksi semua fungsi di file `.ino` dalam folder yang sama.

### ✅ Global Variable Sharing
Variabel yang dideklarasikan di `Header.h` dapat diakses dari semua file `.ino`:
```cpp
// Di semua file .ino:
if (systemInitialized) {
  config.displayBrightness = 100;
}
```

### ✅ Modular Organization
Setiap file `.ino` dapat fokus pada satu aspek fungsionalitas.

## Common File Organization Patterns

### Pattern 1: By Hardware Component
```
ProjectName/
├── Header.h
├── ProjectName.ino
├── Sensors.ino
├── Display.ino
├── Motors.ino
├── Communication.ino
└── Utils.ino
```

### Pattern 2: By System Layer
```
ProjectName/
├── Header.h
├── ProjectName.ino
├── Hardware.ino
├── Network.ino
├── Application.ino
├── UserInterface.ino
└── Debug.ino
```

### Pattern 3: By Feature
```
ProjectName/
├── Header.h
├── ProjectName.ino
├── DataCollection.ino
├── DataProcessing.ino
├── DataTransmission.ino
├── UserCommands.ino
└── SystemMaintenance.ino
```

## Development Guidelines

### ✅ Best Practices
1. **Use Header.h for globals** - Semua variabel global, konstanta, dan includes
2. **One responsibility per file** - Setiap file `.ino` satu fungsi utama
3. **Descriptive naming** - Nama file yang jelas sesuai fungsinya
4. **Consistent coding style** - Gunakan naming convention yang konsisten
5. **Minimal main file** - Keep ProjectName.ino simple dan clean
6. **Comment extensively** - Dokumentasi yang jelas di setiap file

### ❌ Common Mistakes
1. **Duplicate includes** - Jangan include library yang sama di multiple files
2. **Circular dependencies** - Hindari fungsi yang saling memanggil secara circular
3. **Too many globals** - Jangan berlebihan dengan global variables
4. **Mixed responsibilities** - Jangan campur fungsi yang tidak related
5. **Deep nesting** - Hindari struktur folder yang terlalu dalam

## Advanced Techniques

### Conditional Compilation
```cpp
// Di Header.h
#define ENABLE_DEBUG
#define ENABLE_WIFI

// Di file .ino
#ifdef ENABLE_DEBUG
void debugPrint(String message) {
  Serial.println(message);
}
#endif

#ifdef ENABLE_WIFI
void initializeWiFi() {
  // WiFi initialization
}
#endif
```

### State Management
```cpp
// Di Header.h
enum SystemState {
  STARTUP,
  IDLE,
  PROCESSING,
  ERROR
};

SystemState currentState = STARTUP;

// Di ProjectName.ino
void loop() {
  switch (currentState) {
    case STARTUP:
      handleStartup();
      break;
    case IDLE:
      handleIdle();
      break;
    // ... other states
  }
}
```

### Configuration Management
```cpp
// Di Header.h
struct ProjectConfig {
  // Hardware config
  int ledPin;
  int buttonPin;
  
  // Network config
  String wifiSSID;
  String wifiPassword;
  
  // Application config
  int sensorReadInterval;
  bool debugMode;
};

extern ProjectConfig config;

// Di Config.ino
ProjectConfig config = {
  .ledPin = 2,
  .buttonPin = 4,
  .wifiSSID = "MyWiFi",
  .wifiPassword = "MyPassword",
  .sensorReadInterval = 1000,
  .debugMode = true
};
```

## Testing and Debugging

### Serial Debug Pattern
```cpp
// Di Debug.ino
void debugInit() {
  #ifdef ENABLE_DEBUG
  Serial.begin(115200);
  while (!Serial) delay(10);
  #endif
}

void debugPrint(String module, String message) {
  #ifdef ENABLE_DEBUG
  Serial.println("[" + module + "] " + message);
  #endif
}

// Usage di file lain:
debugPrint("WiFi", "Connecting to network...");
```

### Command Interface Pattern
```cpp
// Di Commands.ino
void handleSerialCommand() {
  if (Serial.available()) {
    String command = Serial.readString();
    command.trim();
    
    if (command == "status") {
      printSystemStatus();
    } else if (command == "restart") {
      ESP.restart();
    } else if (command.startsWith("set ")) {
      handleSetCommand(command);
    }
  }
}
```

## Platform-Specific Considerations

### ESP32/ESP8266 Projects
- Gunakan `Preferences` library untuk persistent storage
- Manfaatkan multiple cores dengan `xTaskCreatePinnedToCore`
- Implement proper WiFi event handling

### Arduino Uno/Nano Projects  
- Perhatikan memory limitations
- Gunakan `PROGMEM` untuk string constants
- Optimize global variable usage

### Arduino Mega Projects
- Manfaatkan multiple serial ports
- Gunakan timer interrupts untuk precise timing
- Implement modular sensor arrays

## Project Templates

### IoT Sensor Project
```
IoTSensor/
├── Header.h              // Globals, configs, includes
├── IoTSensor.ino        // Main setup/loop
├── Sensors.ino          // Sensor reading logic
├── WiFi.ino             // Network connectivity
├── DataProcessing.ino   // Data filtering/processing
├── CloudUpload.ino      // Data transmission
├── Display.ino          // Local display updates
└── Commands.ino         // Serial command interface
```

### Control System Project
```
ControlSystem/
├── Header.h             // System configuration
├── ControlSystem.ino    // Main control loop
├── Inputs.ino          // Input processing
├── Logic.ino           // Control algorithms
├── Outputs.ino         // Output control
├── Safety.ino          // Safety checks
├── Communication.ino   // External communication
└── Diagnostics.ino     // System diagnostics
```

Struktur ini memungkinkan development yang scalable, maintainable, dan mudah di-debug, sambil memanfaatkan sepenuhnya keunggulan Arduino IDE.