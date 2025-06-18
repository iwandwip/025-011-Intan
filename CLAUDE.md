# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native/Expo application for child nutrition monitoring ("Penentuan Status Gizi Anak") that integrates with ESP32 IoT hardware for automated weight and height measurements.

## Technology Stack

- **React Native** 0.79.3 with **Expo** 53.0.10
- **Expo Router** for file-based routing
- **Firebase** for authentication, Firestore database, and real-time data sync
- **ESP32** firmware for IoT integration (weight/height sensors, RFID, OLED display)

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
npm run test:esp32

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
- `app/` - Screen components organized by Expo Router conventions
  - `(admin)/` - Admin-only screens
  - `(auth)/` - Authentication screens (login, register, forgot-password)
  - `(tabs)/` - Main app tabs (home, timbang, data-recap, edit-profile)
- `components/` - Reusable UI components and illustrations
- `services/` - Business logic and Firebase integrations
- `contexts/` - React Context providers (AuthContext)
- `firmware/` - ESP32 Arduino code for IoT devices
- `utils/` - Helper functions and state management

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
users/
  [userId]/
    - profile data
    - measurements history

globalSessions/
  timbangDevice/
    - isInUse, currentUserId, sessionData
    - Coordinates hardware access

userData/
  [userId]/
    data/
      [dataId]/
        - weight, height, timestamp, etc.
```

## Important Implementation Details

1. **Authentication Flow** - Uses Firebase Auth with email/password. AuthContext provides user state across the app.

2. **Hardware Integration** - ESP32 communicates with Firebase directly using WiFi. The app coordinates sessions through globalSessions collection.

3. **Data Persistence** - All user measurements are stored in Firestore under userData collection with user-specific subcollections.

4. **PDF Export** - Uses expo-print to generate measurement reports that can be shared.

5. **SVG Support** - Configured with react-native-svg-transformer for custom illustrations.

6. **Nutrition Status Calculation** - Implements K-NN and Decision Tree algorithms for determining child nutrition status based on weight/height measurements.

## Development Notes

### Project Configuration
- **Expo Managed Workflow**: Uses Expo's managed workflow with EAS Build
- **New Architecture**: Enabled for React Native 0.79.3
- **No Testing Framework**: No automated testing is currently configured
- **No Linting**: No ESLint or formatting tools are set up
- **SVG Support**: Configured with `react-native-svg-transformer`

### Hardware Development
- **Arduino IDE Required**: ESP32 firmware development requires Arduino IDE
- **Kinematrix Framework**: Custom Arduino framework for ESP32 development
- **Firebase Admin SDK**: Hardware uses service account for Firebase access
- **Hardware Testing**: Individual component test firmware available in `firmware/Testing/`
- **ESP32 Simulator**: JavaScript-based simulator available for testing hardware integration (`npm run test:esp32`)

### Firebase Configuration
- **Project ID**: `intan-680a4`
- **Admin Email**: `admin@gmail.com` (hardcoded admin detection)
- **Service Account**: Required for ESP32 hardware integration
- **Real-time Database**: Not used, only Firestore

### Deployment
- **EAS Build**: Used for building production apps
- **Android Package**: `com.intan.intanapp`
- **Preview Profile**: Generates APK files for testing
- **Production Profile**: Auto-increment version numbers

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
- **ESP32_SIMULATOR.md**: Hardware simulation documentation