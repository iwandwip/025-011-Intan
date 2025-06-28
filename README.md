# Intan - Child Nutrition Monitoring System

**Sistem Penentuan Status Gizi Anak dengan Integrasi IoT ESP32**

A React Native/Expo mobile application that integrates with ESP32 IoT hardware for automated child nutrition monitoring through weight and height measurements with machine learning-based nutrition status classification.

## 🚀 Features

- **📱 Mobile App**: React Native/Expo cross-platform application
- **🔧 IoT Integration**: ESP32 hardware with multiple sensors
- **🎯 RFID Identification**: Automatic user recognition
- **⚖️ Automated Measurements**: Weight and height sensors
- **🧠 ML Classification**: K-NN and Decision Tree algorithms
- **📊 Real-time Sync**: Firebase integration for live data
- **👥 Multi-user Support**: Sophisticated session management
- **📄 PDF Reports**: Exportable measurement history
- **🔐 Admin Panel**: User management and system monitoring

## 🏗️ Architecture

### Technology Stack

**Frontend/Mobile**
- React Native 0.79.3 with Expo 53.0.10
- Expo Router for file-based navigation
- Firebase SDK 10.14.0
- React Native SVG with custom illustrations

**Backend/Database**
- Firebase Authentication
- Firestore for real-time data
- Firebase Admin SDK for ESP32

**Hardware/IoT**
- ESP32 microcontroller
- MFRC522 RFID reader
- HX711 load cell (weight)
- HC-SR04 ultrasonic sensor (height)
- SH1106 OLED display

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │    Firebase     │    │   ESP32 IoT     │
│  (React Native) │◄──►│   (Firestore)   │◄──►│   (Hardware)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
    ┌────▼────┐             ┌────▼────┐             ┌────▼────┐
    │ User UI │             │ Session │             │ Sensors │
    │ Auth    │             │ Coord   │             │ ML Algo │
    │ Reports │             │ Data    │             │ Display │
    └─────────┘             └─────────┘             └─────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Expo CLI
- Android Studio (for Android development)
- Arduino IDE (for ESP32 firmware)
- Firebase project setup

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd 025-011-Intan
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   ```bash
   npm run android    # Android
   npm run ios        # iOS
   npm run web        # Web browser
   ```

### Development Commands

```bash
# Development
npm start              # Start Expo dev server
npm run clear          # Clear cache and restart
npm run test           # Run ESP32 simulator

# Build & Deploy
eas build --platform android --profile preview     # APK build
eas build --platform android --profile production  # Production build

# Utilities
npm run cleanup        # Firebase data cleanup
npm run clean          # Remove node_modules
npm run reinstall      # Clean reinstall
```

## 📁 Project Structure

```
├── app/                    # Expo Router screens
│   ├── (admin)/           # Admin-only screens
│   ├── (auth)/            # Authentication flow
│   ├── (tabs)/            # Main app navigation
│   └── _layout.jsx        # Root layout
├── components/            # Reusable UI components
│   ├── auth/              # Authentication components
│   ├── illustrations/     # Custom SVG graphics
│   └── ui/                # UI components & modals
├── services/              # Business logic layer
│   ├── authService.js     # Authentication
│   ├── dataService.js     # Data operations
│   ├── weighingService.js # Measurement sessions
│   └── globalSessionService.js # Hardware coordination
├── contexts/              # React Context providers
├── firmware/              # ESP32 Arduino code
│   ├── IntanFirmwareR1/   # Main firmware
│   └── Libraries/         # Custom sensor libraries
├── utils/                 # Helper functions
├── docs/                  # Documentation
└── testing/               # ESP32 simulator
```

## 🔧 ESP32 Hardware Setup

### Required Components

- ESP32 development board
- MFRC522 RFID reader module
- HX711 load cell amplifier + load cell
- HC-SR04 ultrasonic distance sensor
- SH1106 OLED display (128x64)
- Digital buttons for navigation
- Buzzer and status LED

### Wiring Diagram

```
ESP32 Pin | Component
----------|----------
5, 27     | MFRC522 RFID
32, 33    | HC-SR04 Ultrasonic
26, 25    | HX711 Load Cell
SDA, SCL  | SH1106 OLED
```

### Firmware Installation

1. **Open Arduino IDE**
2. **Install ESP32 board support**
3. **Open `firmware/IntanFirmwareR1/IntanFirmwareR1.ino`**
4. **Configure WiFi and Firebase credentials in `Header.h`**
5. **Upload to ESP32**

## 🔥 Firebase Configuration

### Firestore Database Structure

```
├── users/                  # User profiles
├── userData/              # Measurement data
├── globalSessions/        # Hardware coordination
└── systemStatus/          # System monitoring
```

### Setup Firebase

1. **Create Firebase project**: `intan-680a4`
2. **Enable Firestore Database**
3. **Setup Firebase Authentication**
4. **Configure security rules**
5. **Generate service account for ESP32**

## 📱 App Features

### User Features
- **Authentication**: Email/password login and registration
- **Profile Management**: Personal information and settings
- **Measurement Sessions**: Guided weighing process with RFID
- **Data History**: View past measurements and trends
- **PDF Export**: Generate and share measurement reports

### Admin Features
- **User Management**: View and manage all users
- **System Monitoring**: Hardware status and session coordination
- **Data Overview**: System-wide statistics and analytics

## 🧠 Machine Learning

### Nutrition Status Classification

The system implements two ML algorithms on the ESP32:

**K-NN Algorithm**
- Input features: Weight, Height, Age, Gender, Eating Pattern
- Output: 5 nutrition status categories
- Real-time classification on ESP32

**Decision Tree**
- Alternative classification method
- Trained on nutrition datasets
- Embedded in firmware

**Status Categories:**
1. Gizi Buruk (Severe Malnutrition)
2. Gizi Kurang (Underweight)
3. Gizi Baik (Normal)
4. Gizi Lebih (Overweight)
5. Obesitas (Obese)

## 🔄 Global Session Management

### Innovation: Multi-user Hardware Coordination

The system's key innovation is sophisticated real-time coordination allowing multiple users to safely share a single ESP32 device:

**Session Types:**
- `WEIGHING`: Active measurement session
- `RFID`: RFID pairing session

**Session States:**
- `IDLE`: Hardware available
- `ACTIVE`: Session in progress
- `TIMEOUT`: Session expired
- `COMPLETED`: Session finished

**Coordination Features:**
- Real-time session locking
- Automatic timeout management
- Queue system for multiple users
- Graceful session cleanup

## 📊 Development Tools

### ESP32 Simulator
Test hardware integration without physical device:
```bash
npm run test
```

### Firebase Cleanup
Utility for cleaning test data:
```bash
npm run cleanup
```

### Build Configuration
- **Development**: Development client support
- **Preview**: APK generation for testing
- **Production**: Auto-increment versioning

## 📚 Documentation

Comprehensive documentation available in `docs/`:

- **GLOBAL_SESSION.md**: Session management details
- **BUILD_APK.md**: Build and deployment guide
- **ESP32_FIRESTORE_TROUBLESHOOTING.md**: Hardware integration help

## 🔒 Security Considerations

- Firebase Authentication with email/password
- Service account for ESP32 Firebase access
- Admin role detection and authorization
- Protected routes with AuthGuard
- Secure hardware communication

## 🚧 Known Limitations

- Single ESP32 device per location
- Indonesian language only
- No offline support
- Portrait orientation only
- Hardcoded admin email detection

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes following existing patterns
4. Test with ESP32 simulator
5. Submit pull request

## 📄 License

This project is developed for child nutrition monitoring research and educational purposes.

## 🆘 Support

For issues and questions:
- Check documentation in `docs/`
- Review troubleshooting guides
- Submit issues with detailed descriptions

---

**Built with ❤️ for child nutrition monitoring and research**