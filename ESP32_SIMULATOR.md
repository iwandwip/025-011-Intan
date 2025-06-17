# ESP32 SIMULATOR - Dokumentasi

## Overview
ESP32 Simulator adalah aplikasi Node.js yang mensimulasikan perilaku perangkat IoT ESP32 untuk keperluan development dan testing. Simulator ini menggantikan hardware fisik dengan implementasi software yang realistic.

## Tujuan
- **Development**: Testing aplikasi tanpa hardware fisik
- **Debugging**: Mudah debug dan monitoring session flow
- **Testing**: Simulasi berbagai skenario dan edge cases
- **Demo**: Presentasi sistem tanpa ketergantungan hardware

## Arsitektur

### Core Components
1. **Firebase Integration**: Koneksi real-time ke Firestore
2. **Session Management**: Handler untuk berbagai tipe session
3. **Interactive Menu**: Inquirer-based UI untuk kontrol manual
4. **Auto Listener**: Mode otomatis untuk response aplikasi
5. **Data Generation**: Random data generator untuk testing

### Technology Stack
- **Node.js**: Runtime environment
- **Firebase SDK**: Database connectivity
- **Inquirer.js**: Interactive CLI interface
- **ES6 Modules**: Modern JavaScript features

## Installation & Setup

### Prerequisites
```bash
npm install firebase inquirer
```

### Authentication
```javascript
// Hardcoded admin credentials
email: 'admin@gmail.com'
password: 'admin123'
```

### Configuration
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDxodg_DD4n-DTdKqrMEJJX3bQHJyG3sKU",
  authDomain: "intan-680a4.firebaseapp.com",
  projectId: "intan-680a4",
  // ... other config
};
```

## Usage

### Starting Simulator
```bash
# Windows
npm test

# Alternative
node .\testing\esp32-simulator.js
```

### Main Menu Options
```
╔══════════════════════════════════════╗
║         ESP32 SIMULATOR MENU         ║
╚══════════════════════════════════════╝

🎯 Simulasi Pairing RFID
⚖️  Simulasi Ambil Data (Timbang)
📡 Mulai Auto-Listener
⏹️  Stop Auto-Listener
📊 Lihat Status System
🔄 Reset System
❌ Exit
```

## Operational Modes

### 1. Auto-Listener Mode
**Purpose:** Menunggu dan merespon session dari aplikasi
**Activation:** Menu → 📡 Mulai Auto-Listener
**Behavior:**
- Listen perubahan di `systemStatus/hardware`
- Auto-response sesuai session type
- Realistic timing dan delays
- 80% RFID match rate untuk testing

**Usage:**
```bash
📡 Memulai Auto-Listener...
✅ Auto-Listener aktif - menunggu session dari aplikasi
💡 Tekan Ctrl+C untuk kembali ke menu

# Wait for app to start session...
🔧 RFID Pairing Session Started
👤 User: John Doe (user123)
⏳ Simulating RFID scan... (3250ms)
✅ RFID Card Detected: A1B2C3D4
```

### 2. Manual Simulation Mode

#### A. Manual RFID Pairing
**Purpose:** Generate RFID tanpa menunggu aplikasi
**Activation:** Menu → 🎯 Simulasi Pairing RFID

**Process:**
1. Generate random RFID code
2. Simpan ke `systemStatus/hardware`
3. Aplikasi dapat detect dan gunakan untuk pairing

**Output:**
```
🎯 SIMULASI PAIRING RFID
═══════════════════════════════════

📱 Generating RFID code: A1B2C3D4
✅ RFID code berhasil disimpan ke Firestore
💡 Aplikasi dapat menggunakan RFID ini untuk pairing
```

#### B. Manual Weighing Simulation
**Purpose:** Simulasi pengukuran dengan kontrol manual
**Activation:** Menu → ⚖️ Simulasi Ambil Data (Timbang)

**Process:**
1. Ambil daftar RFID terdaftar dari database
2. User pilih RFID via inquirer
3. Cek session aktif untuk data pola makan/respon
4. Generate random measurement
5. Simpan hasil ke Firebase

**Flow:**
```
⚖️  SIMULASI PROSES TIMBANG
═══════════════════════════════════

📋 Mengambil daftar RFID terdaftar...
✅ Ditemukan 3 RFID terdaftar

? Pilih pengguna berdasarkan RFID:
❯ John Doe (A1B2C3D4) - Card #001
  Jane Smith (FF00AB12) - Card #002
  Bob Johnson (12345678) - Card #003

👤 Pengguna dipilih: John Doe
🔑 RFID: A1B2C3D4

📡 Menggunakan data dari session aktif:
   🍽️  Pola Makan: cukup
   🏃 Respon Anak: aktif

⏳ Memulai simulasi pengukuran...

✅ HASIL PENGUKURAN:
   👤 Pengguna: John Doe
   🔑 RFID: A1B2C3D4
   🍽️  Pola Makan: cukup
   🏃 Respon Anak: aktif
   ⚖️  Berat: 23.4 kg
   📏 Tinggi: 110 cm
   📊 Status Gizi: sehat
```

### 3. System Management

#### A. Status Monitoring
**Purpose:** Lihat status system real-time
**Activation:** Menu → 📊 Lihat Status System

**Information Displayed:**
```
📊 STATUS SYSTEM
═══════════════════════════════════

🔌 Status: 🟢 AKTIF / 🔴 TIDAK AKTIF
📡 Listener: 🟢 AKTIF / 🔴 TIDAK AKTIF
🎯 Session Type: weighing / rfid / Tidak ada
👤 Current User: John Doe / Tidak ada
🔑 User RFID: A1B2C3D4 / Tidak ada
📱 Generated RFID: FF00AB12 / Tidak ada
⚖️  Weight: 23.4 kg
📏 Height: 110 cm
📊 Status Gizi: sehat / Belum diukur
⏰ Last Activity: 17/06/2025, 11:45:23
⚠️  Timeout: 🟢 TIDAK / 🟡 YA
```

#### B. System Reset
**Purpose:** Reset semua data session
**Activation:** Menu → 🔄 Reset System

**Process:**
1. Konfirmasi user (Y/N)
2. Reset semua field di `systemStatus/hardware`
3. Cleanup timers dan listeners

## Data Generation

### RFID Generation
```javascript
const generateRandomRFID = () => {
  const characters = 'ABCDEF0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result; // Example: "A1B2C3D4"
};
```

### Weight Generation
```javascript
const generateRandomWeight = () => {
  return parseFloat((Math.random() * (45 - 15) + 15).toFixed(1));
  // Range: 15.0 - 45.0 kg (1 decimal)
};
```

### Height Generation
```javascript
const generateRandomHeight = () => {
  return Math.floor(Math.random() * (130 - 90) + 90);
  // Range: 90 - 130 cm (integer)
};
```

### Nutrition Status Calculation
```javascript
const calculateNutritionStatus = (weight, height) => {
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  
  if (bmi < 18.5) {
    return Math.random() > 0.7 ? 'tidak sehat' : 'sehat';
  } else if (bmi >= 18.5 && bmi < 25) {
    return 'sehat';
  } else if (bmi >= 25 && bmi < 30) {
    return Math.random() > 0.5 ? 'tidak sehat' : 'sehat';
  } else {
    return 'obesitas';
  }
};
```

## Session Handling

### RFID Pairing Session
```javascript
startRFIDSession(sessionData) {
  console.log(`🔧 RFID Pairing Session Started`);
  console.log(`👤 User: ${sessionData.currentUserName}`);
  
  // Start timeout timer (5 minutes)
  this.startTimeoutTimer('rfid', 5);
  
  // Simulate RFID scan with delay
  const delay = getRandomDelay(); // 2-5 seconds
  setTimeout(() => {
    this.completeRFIDPairing();
  }, delay);
}
```

### Weighing Session
```javascript
startWeighingSession(sessionData) {
  console.log(`⚖️  Weighing Session Started`);
  console.log(`👤 User: ${sessionData.currentUserName}`);
  console.log(`🔑 Expected RFID: ${sessionData.userRfid}`);
  
  // Start timeout timer (10 minutes)
  this.startTimeoutTimer('weighing', 10);
  
  // Wait for RFID tap
  setTimeout(() => {
    this.simulateRfidTapAndWeighing();
  }, getRandomDelay());
}
```

### RFID Validation
```javascript
const simulateRfidTap = (expectedRfid) => {
  const shouldMatch = Math.random() > 0.2; // 80% match rate
  
  if (shouldMatch && expectedRfid) {
    return expectedRfid; // Correct RFID
  } else {
    return generateRandomRFID(); // Wrong RFID
  }
};
```

## Timing Configuration

### Delays
```javascript
const getRandomDelay = () => {
  return Math.floor(Math.random() * (5000 - 2000) + 2000);
  // Range: 2-5 seconds
};
```

### Timeouts
```javascript
const TIMEOUTS = {
  rfid: 5 * 60 * 1000,      // 5 minutes
  weighing: 10 * 60 * 1000  // 10 minutes
};
```

## Error Simulation

### RFID Mismatch (20% chance)
```javascript
if (tappedRfid !== expectedRfid) {
  console.log(`❌ RFID Mismatch! Expected: ${expectedRfid}, Got: ${tappedRfid}`);
  console.log(`🚨 Access denied - wrong RFID card`);
  await this.resetSessionWithError();
}
```

### Timeout Handling
```javascript
async handleTimeout() {
  console.log('🚨 Session timed out - resetting hardware state');
  
  await updateDoc(this.systemStatusRef, {
    isInUse: false,
    timeout: true,
    // Reset other fields...
  });
}
```

## Logging & Monitoring

### Console Output Format
```javascript
// Success logs
console.log('✅ Authentication successful');
console.log('📤 RFID data sent to Firestore');
console.log('🎉 RFID Pairing Complete!');

// Error logs  
console.error('❌ Failed to initialize:', error.message);
console.error('❌ Firestore listener error:', error);

// Process logs
console.log('⏳ Simulating RFID scan... (3250ms)');
console.log('📊 Measurement Results:');
console.log('🔄 Session reset due to RFID mismatch');
```

### Session Tracking
```javascript
// Track current session state
{
  currentSession: sessionData,
  isProcessing: boolean,
  timeoutTimer: NodeJS.Timeout,
  processingTimer: NodeJS.Timeout
}
```

## Development Features

### Hot Reload Support
- Restart simulator untuk update code
- Session state preserved di Firebase
- No data loss during development

### Debug Mode
```javascript
// Enhanced logging
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('🐛 Debug:', sessionData);
  console.log('🐛 Timer:', this.timeoutTimer);
}
```

### Test Data Generation
```javascript
// Consistent test data
const TEST_USERS = [
  { name: 'John Doe', rfid: 'A1B2C3D4' },
  { name: 'Jane Smith', rfid: 'FF00AB12' },
  { name: 'Bob Johnson', rfid: '12345678' }
];
```

## Production Considerations

### Environment Variables
```javascript
const PRODUCTION_CONFIG = {
  FIREBASE_TIMEOUT: 30000,
  MAX_RETRY_ATTEMPTS: 5,
  LOG_LEVEL: 'info',
  RFID_MATCH_RATE: 1.0 // 100% in production
};
```

### Error Reporting
```javascript
// Send errors to monitoring service
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  // Report to error tracking service
  simulator.shutdown();
});
```

### Performance Monitoring
```javascript
// Track operation timing
const start = Date.now();
await performOperation();
const duration = Date.now() - start;
console.log(`⏱️  Operation took ${duration}ms`);
```

## Troubleshooting

### Common Issues

#### Inquirer Error: "inquirer.prompt is not a function"
**Cause:** ES module compatibility issue
**Solution:** Dynamic import implemented
```javascript
let inquirer;
(async () => {
  inquirer = await import('inquirer');
})();

// Use: inquirer.default.prompt()
```

#### Firebase Connection Error
**Cause:** Network/credentials issue
**Solution:** Check config and network
```javascript
try {
  await signInWithEmailAndPassword(auth, email, password);
} catch (error) {
  console.error('❌ Authentication failed:', error.message);
}
```

#### Session Stuck
**Cause:** Timer not cleared properly
**Solution:** Proper cleanup
```javascript
stopCurrentSession() {
  if (this.timeoutTimer) {
    clearTimeout(this.timeoutTimer);
    this.timeoutTimer = null;
  }
  // Clear other timers...
}
```

### Debug Commands

#### Check Simulator State
```javascript
console.log('Simulator state:', {
  isAuthenticated: this.isAuthenticated,
  isListening: this.isListening,
  isProcessing: this.isProcessing,
  currentSession: this.currentSession
});
```

#### Manual Session Reset
```javascript
// Force reset via menu
Menu → 🔄 Reset System → Confirm

// Or programmatically
await this.resetSessionWithError();
```

## Future Enhancements

### Multi-Device Support
- Simulate multiple ESP32 devices
- Device-specific sessions
- Load balancing

### Advanced Error Simulation
- Network latency simulation
- Intermittent connection issues  
- Hardware failure scenarios

### Performance Analytics
- Session success/failure rates
- Response time metrics
- Usage pattern analysis

### Integration Testing
- Automated test scenarios
- Regression testing
- Load testing capabilities