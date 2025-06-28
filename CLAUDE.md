# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **React Native/Expo application** for child nutrition monitoring ("Penentuan Status Gizi Anak") that integrates with **ESP32 IoT hardware** for automated weight and height measurements. The system uses machine learning algorithms (K-NN and Decision Tree) to determine child nutrition status and features sophisticated real-time hardware coordination between multiple users.

## Technology Stack

### Frontend/Mobile App
- **React Native** 0.79.3 with **Expo** 53.0.10 (New Architecture enabled)
- **Expo Router** 5.1.0 for file-based routing with grouped routes
- **Firebase SDK** 10.14.0 for authentication and Firestore
- **React Native SVG** 15.11.2 with transformer for custom illustrations
- **Expo Print** for PDF report generation
- **AsyncStorage** for local data persistence

### Backend/Database
- **Firebase Authentication** for user management
- **Firestore** for real-time data synchronization
- **Firebase Admin SDK** 13.4.0 for ESP32 integration

### Hardware/IoT
- **ESP32** microcontroller with custom firmware
- **Arduino IDE** for firmware development
- **Custom Kinematrix Framework** for sensor management
- **MFRC522** RFID reader for user identification
- **HX711** load cell for weight measurement
- **HC-SR04** ultrasonic sensor for height measurement
- **SH1106** OLED display 128x64 for UI

## Common Development Commands

```bash
# Start development server
npm start

# Platform-specific development
npm run android     # Run on Android
npm run ios        # Run on iOS  
npm run web        # Run in web browser

# Clear cache and restart
npm run clear

# Test ESP32 simulator
npm run test

# Build for deployment (using EAS)
eas build --platform android --profile preview
eas build --platform android --profile production

# Utility commands
npm run cleanup     # Run Firebase cleanup script
npm run clean      # Remove node_modules and package-lock.json
npm run reinstall  # Clean and reinstall dependencies
```

## Architecture

### Directory Structure
```
├── app/                    # Expo Router screens (file-based routing)
│   ├── (admin)/           # Admin-only screens (all-users, user-detail)
│   ├── (auth)/            # Authentication screens (login, register, forgot-password)
│   ├── (tabs)/            # Main app tabs (index, timbang, data-recap, edit-profile)
│   ├── _layout.jsx        # Root layout with AuthGuard and ErrorBoundary
│   └── index.jsx          # Entry point router
├── components/            # Reusable UI components
│   ├── auth/              # Authentication components (AuthForm)
│   ├── illustrations/     # Custom SVG illustrations
│   └── ui/                # UI components (Button, Input, Modals, etc.)
├── services/              # Business logic and Firebase integrations
├── contexts/              # React Context providers (AuthContext)
├── firmware/              # ESP32 Arduino code for IoT devices
│   ├── IntanFirmwareR1/   # Main firmware with ML algorithms
│   ├── Libraries/         # Custom sensor and Firebase libraries
│   └── Backup/            # Legacy firmware versions
├── utils/                 # Helper functions and state management
├── constants/             # App constants (Colors, etc.)
├── assets/                # Static assets
├── docs/                  # Comprehensive documentation
├── testing/               # ESP32 simulator and test utilities
└── firebase-cleanup/      # Firebase data cleanup utilities
```

### Key Patterns

1. **Global Session Management** - Coordinates shared IoT hardware access between multiple users using Firebase Firestore. See GLOBAL_SESSION.md for detailed documentation.

2. **Service Layer Pattern** - All Firebase operations are abstracted into service modules:
   - `authService.js` - Authentication operations
   - `dataService.js` - User data CRUD operations
   - `weighingService.js` - Measurement session management
   - `globalSessionService.js` - Hardware coordination
   - `adminService.js` - Admin user management operations
   - `userService.js` - User profile operations
   - `pdfService.js` - PDF report generation

3. **Real-time Updates** - Uses Firebase listeners (onSnapshot) for live data synchronization between app and hardware.

### Firebase Structure

```
├── users/                      # User profiles and settings
│   └── [userId]/
│       ├── profile data (name, birth date, etc.)
│       └── measurements history
├── userData/                   # Detailed measurement data
│   └── [userId]/
│       └── data/
│           └── [dataId]/       # Individual measurements
│               ├── weight, height, timestamp
│               ├── nutritionStatus, bmi
│               └── session metadata
├── globalSessions/             # Hardware coordination
│   └── timbangDevice/
│       ├── isInUse, currentUserId
│       ├── sessionData, sessionType
│       ├── measurementData
│       └── timeout management
└── systemStatus/               # System monitoring
    └── hardware/               # ESP32 status and coordination
```

### ESP32 Firmware Architecture

#### Sensor Configuration
```cpp
// Main sensor modules in firmware
sensorManager.addModule("rfid", new RFID_Mfrc522(5, 27));
sensorManager.addModule("ultrasonic", new UltrasonicSens(32, 33, 200, 1, 1, 1000, 10));
sensorManager.addModule("loadcell", new HX711Sens(26, 25, HX711Sens::KG, 0.25, 5, 2000, 0.25));
```

#### ML Algorithm Implementation
- **K-NN Algorithm**: Implemented in `KNN.ino` for nutrition status classification
- **Decision Tree**: Alternative classification method
- **Input Features**: Weight, Height, Age, Gender, Eating Pattern, Child Response
- **Output Categories**: 5 nutrition status levels (Gizi Buruk, Kurang, Baik, Overweight, Obesitas)

## Important Implementation Details

1. **Authentication Flow** - Uses Firebase Auth with email/password. AuthContext provides user state across the app. Admin detection via hardcoded `admin@gmail.com` or role property.

2. **Hardware Integration** - ESP32 communicates with Firebase directly using WiFi and service account authentication. The app coordinates sessions through globalSessions collection for real-time hardware sharing.

3. **Data Persistence** - All user measurements are stored in Firestore under userData collection with user-specific subcollections. Uses AsyncStorage for local app state.

4. **PDF Export** - Uses expo-print to generate measurement reports that can be shared via expo-sharing.

5. **SVG Support** - Configured with react-native-svg-transformer for custom scalable illustrations.

6. **Nutrition Status Calculation** - Implements K-NN and Decision Tree algorithms on ESP32 firmware for real-time nutrition status determination.

7. **Global Session Management** - Sophisticated coordination system allowing multiple users to safely share single ESP32 hardware device with session types (WEIGHING, RFID) and timeout management.

8. **Component Architecture** - Uses ErrorBoundary for error handling, AuthGuard for route protection, and comprehensive modal system for user interactions.

9. **Real-time Synchronization** - Firebase onSnapshot listeners provide live updates between mobile app and ESP32 hardware.

10. **Build Configuration** - EAS Build with development, preview (APK), and production profiles. Auto-increment versioning for production builds.

## Development Notes

### Project Configuration
- **Expo Managed Workflow**: Uses Expo 53.0.10 with EAS Build
- **New Architecture**: Enabled for React Native 0.79.3
- **No Testing Framework**: No automated testing is currently configured
- **No Linting**: No ESLint or formatting tools are set up
- **SVG Support**: Configured with `react-native-svg-transformer`
- **Metro Configuration**: Custom config with crypto alias for React Native compatibility

### Hardware Development
- **Arduino IDE Required**: ESP32 firmware development requires Arduino IDE
- **Kinematrix Framework**: Custom Arduino framework for ESP32 development
- **Firebase Admin SDK**: Hardware uses service account for Firebase access
- **Hardware Testing**: Individual component test firmware available in `firmware/Testing/`
- **ESP32 Simulator**: JavaScript-based simulator available for testing hardware integration (`npm run test`)
- **Custom Libraries**: Comprehensive sensor libraries in `firmware/Libraries/`

### Firebase Configuration
- **Project ID**: `intan-680a4`
- **Auth Domain**: `intan-680a4.firebaseapp.com`
- **Admin Email**: `admin@gmail.com` (hardcoded admin detection)
- **Service Account**: Required for ESP32 hardware integration
- **Real-time Database**: Not used, only Firestore
- **Persistence**: AsyncStorage for React Native

### Deployment
- **EAS Build**: Used for building production apps
- **EAS Project ID**: `72b9e452-49a2-495e-8504-3f1e4f45c59c`
- **Android Package**: `com.intan.intanapp`
- **Preview Profile**: Generates APK files for testing
- **Production Profile**: Auto-increment version numbers
- **Development Profile**: Supports development client

### Known Limitations
- **Single Hardware Device**: System designed for one ESP32 device per location
- **Indonesian Only**: No internationalization support
- **No Offline Support**: Requires internet connection for all operations
- **Admin Email Hardcoded**: Admin detection relies on specific email address
- **Portrait Only**: App locked to portrait orientation
- **No Web Support**: While technically runnable on web, designed for mobile only

### Documentation Files
- **GLOBAL_SESSION.md**: Detailed global session management documentation
- **SESSION_MANAGEMENT.md**: Session coordination patterns
- **WEIGHING_SESSION.md**: Weighing workflow documentation
- **PAIRING_SESSION.md**: RFID pairing process
- **BUILD_APK.md**: Build and deployment instructions
- **ESP32_FIRESTORE_TROUBLESHOOTING.md**: Firebase integration troubleshooting

## Key Features & Capabilities

### Core Features
- **Real-time Hardware Coordination**: Multiple users sharing single ESP32 device via sophisticated session management
- **RFID User Identification**: Automatic user recognition with MFRC522 reader
- **Automated Measurements**: Weight (HX711) and height (HC-SR04) via sensors
- **ML-based Nutrition Assessment**: K-NN and Decision Tree algorithms running on ESP32
- **PDF Report Generation**: Measurement history exports with expo-print
- **Admin Panel**: Comprehensive user management and system monitoring
- **Real-time Data Sync**: Firebase listeners for live updates between app and hardware

### Security & Authentication
- **Firebase Authentication**: Email/password with role-based access control
- **Admin Role Detection**: Hardcoded admin@gmail.com or role property
- **Protected Routes**: AuthGuard component for route protection
- **Service Account**: Secure ESP32 Firebase integration

### Data Flow Architecture
1. **User Authentication** → Firebase Auth
2. **Session Coordination** → Global Session Management (Firestore)
3. **Hardware Communication** → ESP32 ↔ Firebase (real-time)
4. **Data Processing** → ML algorithms on ESP32 firmware
5. **Data Storage** → Firestore collections with user-specific subcollections
6. **Real-time Updates** → Firebase onSnapshot listeners

## Notable Implementation Patterns

### Global Session Management Innovation
Sophisticated system for coordinating shared IoT hardware across multiple users using Firebase Firestore as a real-time coordination layer. Features session types (WEIGHING, RFID), timeout management, and concurrent user handling.

### Service Layer Architecture
All Firebase operations abstracted into service modules with consistent patterns, error handling, and real-time listener management.

### Component-Based UI Architecture
Comprehensive component system with ErrorBoundary, AuthGuard, modal system, and custom SVG illustrations.

### Expo Router Integration
Modern file-based routing with grouped routes for different user roles: (auth), (tabs), (admin).