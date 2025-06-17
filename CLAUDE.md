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
eas build --platform ios --profile production
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

## Notes

- No testing framework is currently configured
- No linting/formatting tools are set up
- The project uses Expo managed workflow
- Hardware firmware is in the `firmware/` directory and requires Arduino IDE