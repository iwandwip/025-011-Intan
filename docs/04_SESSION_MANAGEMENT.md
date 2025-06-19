# SESSION MANAGEMENT - Dokumentasi Sistem

## Overview
Session Management adalah sistem koordinasi antara aplikasi mobile dan hardware ESP32 untuk mengelola akses bersama ke perangkat IoT. Sistem ini memastikan hanya satu user yang dapat menggunakan hardware pada satu waktu.

## Arsitektur

### Global Session Document
**Location:** `systemStatus/hardware` di Firestore
**Purpose:** Central coordination point untuk semua session types

```javascript
{
  // Session Control
  isInUse: boolean,           // Hardware sedang digunakan
  sessionType: string,        // 'rfid' | 'weighing' | ''
  currentUserId: string,      // ID pengguna aktif
  currentUserName: string,    // Nama pengguna aktif
  
  // Timing
  startTime: Date,           // Waktu mulai session
  lastActivity: Date,        // Aktivitas terakhir
  timeout: boolean,          // Flag timeout
  
  // Session-specific Data
  userRfid: string,          // RFID pengguna (weighing)
  eatingPattern: string,     // Data pola makan (weighing)
  childResponse: string,     // Data respon anak (weighing)
  rfid: string,             // Generated RFID (pairing)
  weight: number,           // Hasil pengukuran (weighing)
  height: number,           // Hasil pengukuran (weighing)
  nutritionStatus: string,  // Status gizi (weighing)
  measurementComplete: boolean // Flag selesai ukur (weighing)
}
```

## Session Types

### 1. RFID Pairing Session
**Type:** `rfid`
**Duration:** 5 menit
**Purpose:** Mendaftarkan kartu RFID ke user profile

### 2. Weighing Session  
**Type:** `weighing`
**Duration:** 10 menit
**Purpose:** Melakukan pengukuran berat/tinggi badan

## Session Lifecycle

### 1. Session Initiation
```javascript
// App starts session
await startGlobalSession(sessionType, userId, userName, sessionData)
```

**Common Fields:**
```javascript
{
  isInUse: true,
  sessionType: type,
  currentUserId: userId,
  currentUserName: userName,
  startTime: new Date(),
  lastActivity: new Date(),
  timeout: false
}
```

### 2. Hardware Detection
```javascript
// ESP32 detects session change
onSnapshot(systemStatusRef, (doc) => {
  const data = doc.data();
  if (data.isInUse && !this.isProcessing) {
    this.handleSessionChange(data);
  }
});
```

### 3. Session Processing
- ESP32 melakukan task sesuai session type
- Update `lastActivity` secara berkala
- Set completion flags sesuai kebutuhan

### 4. Session Completion
```javascript
// App detects completion
if (sessionData.measurementComplete || sessionData.rfid) {
  await handleCompletion(sessionData);
}
```

### 5. Session Cleanup
```javascript
// Reset all session data
await endGlobalSession();
```

## State Diagram

```
     ┌─────────┐
     │  IDLE   │◄─────────────┐
     └─────────┘              │
          │                   │
          │ Start Session     │
          ▼                   │
     ┌─────────┐              │
     │ ACTIVE  │              │
     └─────────┘              │
          │                   │
          │ Processing        │
          ▼                   │
     ┌─────────┐              │
     │PROCESSING│             │
     └─────────┘              │
          │                   │
          │ Complete/Error    │
          ▼                   │
     ┌─────────┐              │
     │CLEANUP  │──────────────┘
     └─────────┘
```

## Concurrency Control

### Single User Access
```javascript
// Check if hardware is in use
const canStart = await checkHardwareAvailability();
if (!canStart) {
  throw new Error('Hardware sedang digunakan oleh user lain');
}
```

### Session Queue (Future Enhancement)
```javascript
// Proposed queue system
const queuePosition = await addToQueue(userId, sessionType);
await waitForTurn(queuePosition);
```

## Timeout Management

### Auto Timeout
```javascript
// ESP32 sets timeout timer
const timeoutMs = sessionType === 'rfid' ? 5 * 60 * 1000 : 10 * 60 * 1000;
setTimeout(() => {
  this.handleTimeout();
}, timeoutMs);
```

### Timeout Handler
```javascript
async handleTimeout() {
  await updateDoc(systemStatusRef, {
    isInUse: false,
    timeout: true,
    // Reset other fields
  });
}
```

### App Timeout Detection
```javascript
// App detects timeout
if (sessionData.timeout) {
  showTimeoutMessage();
  resetSessionState();
}
```

## Error Handling

### Network Errors
```javascript
try {
  await updateSession(data);
} catch (error) {
  // Retry with exponential backoff
  await retryWithBackoff(() => updateSession(data));
}
```

### Hardware Errors
```javascript
// ESP32 error handling
catch (error) {
  console.error('Hardware error:', error);
  await resetSessionWithError();
}
```

### App Errors
```javascript
// App error handling
catch (error) {
  await endGlobalSession();
  showErrorMessage(error.message);
}
```

## Monitoring & Logging

### Session Events
```javascript
const sessionEvents = [
  'SESSION_STARTED',
  'SESSION_PROCESSING', 
  'SESSION_COMPLETED',
  'SESSION_TIMEOUT',
  'SESSION_ERROR',
  'SESSION_RESET'
];
```

### Metrics Collection
```javascript
// Track session statistics
{
  sessionType: 'weighing',
  duration: 15000, // ms
  success: true,
  userId: 'user123',
  timestamp: new Date(),
  errorCode: null
}
```

## Security Considerations

### User Authentication
```javascript
// Verify user has permission
const canAccessHardware = await checkUserPermissions(userId);
if (!canAccessHardware) {
  throw new Error('Unauthorized hardware access');
}
```

### Session Validation
```javascript
// Validate session ownership
if (sessionData.currentUserId !== requestingUserId) {
  throw new Error('Session belongs to different user');
}
```

### Data Sanitization
```javascript
// Sanitize session data
const cleanData = sanitizeSessionData(rawSessionData);
await updateSession(cleanData);
```

## Performance Optimization

### Real-time Listeners
```javascript
// Efficient listener management
let listener = null;

function startListening() {
  if (!listener) {
    listener = onSnapshot(systemStatusRef, handleChange);
  }
}

function stopListening() {
  if (listener) {
    listener();
    listener = null;
  }
}
```

### Batch Updates
```javascript
// Batch multiple field updates
await updateDoc(systemStatusRef, {
  weight: 23.4,
  height: 110,
  nutritionStatus: 'sehat',
  measurementComplete: true,
  lastActivity: new Date()
});
```

### Caching Strategy
```javascript
// Cache session state locally
const sessionCache = new Map();

function getCachedSession(userId) {
  return sessionCache.get(userId);
}

function setCachedSession(userId, sessionData) {
  sessionCache.set(userId, sessionData);
}
```

## Testing Strategy

### Unit Tests
- Session state transitions
- Timeout handling
- Error scenarios
- Data validation

### Integration Tests
- App ↔ Firebase communication
- ESP32 ↔ Firebase communication  
- End-to-end session flows

### Load Testing
- Multiple concurrent session attempts
- High frequency updates
- Network failure scenarios

## Future Enhancements

### 1. Session Queue System
- Multiple users can queue for hardware
- Estimated wait time display
- Automatic session handoff

### 2. Session Persistence
- Resume interrupted sessions
- Local backup during network outages
- Conflict resolution

### 3. Advanced Monitoring
- Real-time session dashboard
- Performance analytics
- Usage patterns analysis

### 4. Multi-Hardware Support
- Multiple ESP32 devices
- Load balancing
- Device-specific sessions

## Configuration

### Environment Variables
```javascript
const SESSION_CONFIG = {
  RFID_TIMEOUT: 5 * 60 * 1000,     // 5 minutes
  WEIGHING_TIMEOUT: 10 * 60 * 1000, // 10 minutes
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,               // 1 second
  CLEANUP_INTERVAL: 60 * 1000      // 1 minute
};
```

### Firebase Security Rules
```javascript
// Firestore rules for session management
match /systemStatus/hardware {
  allow read, write: if request.auth != null 
    && request.auth.uid in resource.data.allowedUsers;
}
```

## Troubleshooting Guide

### Common Issues

#### Session Stuck in Active State
**Symptoms:** `isInUse: true` tidak berubah
**Solutions:**
1. Manual session reset via admin
2. Restart ESP32 simulator
3. Check Firebase connectivity

#### Multiple Sessions Conflict
**Symptoms:** Data corruption, unexpected behavior
**Solutions:**
1. Implement proper locking mechanism
2. Add session validation
3. Clear conflicting sessions

#### Timeout Not Working
**Symptoms:** Session tidak auto-reset
**Solutions:**
1. Verify timer implementation
2. Check system clock synchronization
3. Review timeout configuration

### Debug Commands

#### Check Active Session
```javascript
const session = await getDoc(doc(db, 'systemStatus', 'hardware'));
console.log('Active session:', session.data());
```

#### Force Reset Session
```javascript
await updateDoc(doc(db, 'systemStatus', 'hardware'), {
  isInUse: false,
  sessionType: '',
  currentUserId: '',
  currentUserName: '',
  // ... reset all fields
});
```

#### Session History Query
```javascript
// Future: Session history collection
const history = await getDocs(
  query(
    collection(db, 'sessionHistory'),
    orderBy('startTime', 'desc'),
    limit(10)
  )
);
```