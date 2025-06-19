# PAIRING SESSION - Dokumentasi Alur

## Overview
Pairing session adalah proses untuk menghubungkan kartu RFID dengan profil pengguna dalam sistem. Session ini memungkinkan admin untuk mendaftarkan kartu RFID baru ke pengguna tertentu.

## Tujuan
- Mendaftarkan kartu RFID fisik ke profil pengguna
- Memberikan nomor urut RFID untuk identifikasi
- Menyimpan data pairing ke database Firebase

## Alur Lengkap Pairing Session

### 1. Inisiasi Session (Dari Aplikasi)
```
📱 Admin App → Firebase (systemStatus/hardware)
```

**Langkah:**
1. Admin login ke aplikasi
2. Pilih pengguna yang akan dipasangkan RFID
3. Tekan tombol "Pair RFID" 
4. Aplikasi memanggil `startRfidSession(userId, userName)`

**Data yang dikirim ke Firebase:**
```javascript
{
  isInUse: true,
  sessionType: 'rfid',
  currentUserId: userId,
  currentUserName: userName,
  startTime: new Date(),
  lastActivity: new Date(),
  rfid: '', // Kosong, menunggu dari ESP32
  timeout: false
}
```

### 2. Deteksi Session (ESP32 Simulator)
```
🤖 ESP32 Simulator ← Firebase (systemStatus/hardware)
```

**Kondisi Trigger:**
- `isInUse: true`
- `sessionType: 'rfid'`
- `rfid: ''` (masih kosong)

**Aksi ESP32:**
1. Mendeteksi perubahan pada global session
2. Memulai timer timeout (5 menit)
3. Mensimulasikan proses scanning RFID
4. Generate RFID code random (8 karakter hex)

### 3. Generate RFID (ESP32 Simulator)
```
🤖 ESP32 Simulator → Firebase (systemStatus/hardware)
```

**Proses:**
1. Generate RFID code (contoh: "A1B2C3D4")
2. Simulasi delay 2-5 detik
3. Update Firebase dengan RFID code

**Data yang diupdate:**
```javascript
{
  rfid: "A1B2C3D4", // Generated code
  lastActivity: new Date()
}
```

### 4. Konfirmasi Pairing (Aplikasi)
```
📱 Admin App ← Firebase (systemStatus/hardware)
```

**Proses:**
1. Aplikasi mendeteksi `rfid` field terisi
2. Menampilkan `RFIDNumberModal` dengan:
   - RFID code yang di-generate
   - Input field untuk nomor RFID (001, 002, dst)
   - Tombol konfirmasi/batal

**User Action:**
- Admin memasukkan nomor urut RFID
- Konfirmasi pairing

### 5. Penyimpanan Data (Aplikasi)
```
📱 Admin App → Firebase (users/{userId})
```

**Data yang disimpan:**
```javascript
// Update user profile
{
  rfid: "A1B2C3D4",
  rfidNumber: "001",
  lastUpdated: new Date()
}
```

### 6. Cleanup Session (Aplikasi)
```
📱 Admin App → Firebase (systemStatus/hardware)
```

**Reset global session:**
```javascript
{
  isInUse: false,
  sessionType: '',
  currentUserId: '',
  currentUserName: '',
  startTime: null,
  lastActivity: null,
  rfid: '',
  timeout: false
}
```

## Diagram Alur

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   ADMIN     │    │  FIREBASE   │    │    ESP32    │
│    APP      │    │   GLOBAL    │    │  SIMULATOR  │
│             │    │   SESSION   │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       │ Start RFID Session│                   │
       ├──────────────────→│                   │
       │                   │   Detect Session  │
       │                   │←──────────────────┤
       │                   │                   │
       │                   │  Generate RFID    │
       │                   │←──────────────────┤
       │   RFID Generated  │                   │
       │←──────────────────┤                   │
       │                   │                   │
       │ Confirm Pairing   │                   │
       ├──────────────────→│                   │
       │                   │                   │
       │ Save to User      │                   │
       ├──────────────────→│                   │
       │                   │                   │
       │ Reset Session     │                   │
       ├──────────────────→│                   │
       │                   │                   │
```

## Skenario Error

### 1. Timeout Session
**Kondisi:** Session aktif lebih dari 5 menit tanpa aktivitas
**Aksi ESP32:**
```javascript
{
  isInUse: false,
  timeout: true,
  // Reset semua field lainnya
}
```

### 2. Session Dibatalkan
**Kondisi:** Admin membatalkan proses pairing
**Aksi App:**
- Reset global session
- Tidak menyimpan data ke user profile

### 3. ESP32 Simulator Offline
**Kondisi:** ESP32 tidak merespon
**Aksi App:**
- Menampilkan pesan timeout
- Otomatis reset session setelah periode tertentu

## Penggunaan Simulator

### Mode Auto-Listener
```bash
npm test
# Pilih: 📡 Mulai Auto-Listener
# ESP32 akan otomatis merespon session dari aplikasi
```

### Mode Manual
```bash
npm test
# Pilih: 🎯 Simulasi Pairing RFID
# Generate RFID manual tanpa menunggu session dari app
```

## Konfigurasi

### Timeout Setting
- **RFID Session**: 5 menit
- **Retry Attempts**: 3x
- **Generate Delay**: 2-5 detik (random)

### RFID Format
- **Length**: 8 karakter
- **Format**: Hexadecimal (A-F, 0-9)
- **Example**: "A1B2C3D4", "FF00AB12"

## Troubleshooting

### Problem: RFID tidak ter-generate
**Solution:**
1. Cek koneksi Firebase
2. Pastikan ESP32 simulator running
3. Cek log untuk error authentication

### Problem: Session timeout terus-menerus
**Solution:**
1. Cek network latency
2. Increase timeout duration
3. Restart ESP32 simulator

### Problem: Duplicate RFID
**Solution:**
1. RFID code di-generate random, kemungkinan duplicate sangat kecil
2. Jika terjadi, restart session dan coba lagi
3. Implementasi collision detection di masa depan

## Monitoring

### Log ESP32 Simulator
```
🔧 RFID Pairing Session Started
👤 User: John Doe (user123)
⏳ Simulating RFID scan... (3250ms)
✅ RFID Card Detected: A1B2C3D4
📤 RFID data sent to Firestore
🎉 RFID Pairing Complete!
```

### Log Aplikasi
```
Starting RFID session for user: John Doe
Waiting for RFID from hardware...
RFID received: A1B2C3D4
Showing confirmation modal...
Pairing confirmed with number: 001
RFID saved to user profile
Session cleanup complete
```