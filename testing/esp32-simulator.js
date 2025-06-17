const { initializeApp } = require('firebase/app');
const { getFirestore, doc, onSnapshot, updateDoc, setDoc, getDoc, collection, getDocs, query, where } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// Dynamic import untuk inquirer (ES module)
let inquirer;
(async () => {
  inquirer = await import('inquirer');
})();

const firebaseConfig = {
  apiKey: "AIzaSyDxodg_DD4n-DTdKqrMEJJX3bQHJyG3sKU",
  authDomain: "intan-680a4.firebaseapp.com",
  projectId: "intan-680a4",
  storageBucket: "intan-680a4.firebasestorage.app",
  messagingSenderId: "177772813515",
  appId: "1:177772813515:web:5e07dc23cf8cb03bee0f4e",
  measurementId: "G-FHEDWPGDEV"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const generateRandomRFID = () => {
  const characters = 'ABCDEF0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const generateRandomWeight = () => {
  return parseFloat((Math.random() * (45 - 15) + 15).toFixed(1));
};

const generateRandomHeight = () => {
  return Math.floor(Math.random() * (130 - 90) + 90);
};

const calculateNutritionStatus = (weight, height) => {
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  
  if (bmi < 16) {
    return 'gizi buruk';
  } else if (bmi >= 16 && bmi < 18.5) {
    return 'gizi kurang';
  } else if (bmi >= 18.5 && bmi < 25) {
    return 'gizi baik';
  } else if (bmi >= 25 && bmi < 30) {
    return 'overweight';
  } else {
    return 'obesitas';
  }
};

const generateWeighingData = () => {
  const weight = generateRandomWeight();
  const height = generateRandomHeight();
  const nutritionStatus = calculateNutritionStatus(weight, height);
  
  return { weight, height, nutritionStatus };
};

const getRandomDelay = () => {
  return Math.floor(Math.random() * (5000 - 2000) + 2000);
};

const simulateRfidTap = (expectedRfid) => {
  const shouldMatch = Math.random() > 0.2;
  
  if (shouldMatch && expectedRfid) {
    return expectedRfid;
  } else {
    return generateRandomRFID();
  }
};

class ESP32Simulator {
  constructor() {
    this.systemStatusRef = doc(db, 'systemStatus', 'hardware');
    this.currentSession = null;
    this.timeoutTimer = null;
    this.processingTimer = null;
    this.isProcessing = false;
    this.isAuthenticated = false;
    this.isListening = false;
    this.listener = null;
  }

  async initialize() {
    try {
      console.log('🔐 Authenticating...');
      await signInWithEmailAndPassword(auth, 'admin@gmail.com', 'admin123');
      this.isAuthenticated = true;
      console.log('✅ Authentication successful');
      
      await this.ensureSystemStatusExists();
      
      console.log('🤖 ESP32 Simulator Initialized');
      console.log('💡 Note: 80% chance RFID will match, 20% chance mismatch for testing');
      console.log('⏳ Loading menu system...\n');
      
      // Wait for inquirer to load
      let attempts = 0;
      while (!inquirer && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      await this.showMainMenu();
    } catch (error) {
      console.error('❌ Failed to initialize:', error.message);
      process.exit(1);
    }
  }

  async showMainMenu() {
    console.clear();
    console.log('╔══════════════════════════════════════╗');
    console.log('║         ESP32 SIMULATOR MENU         ║');
    console.log('╚══════════════════════════════════════╝\n');

    const choices = [
      { name: '🎯 Simulasi Pairing RFID', value: 'pairing' },
      { name: '⚖️  Simulasi Ambil Data (Timbang)', value: 'weighing' },
      { name: '📡 Mulai Auto-Listener', value: 'auto' },
      { name: '⏹️  Stop Auto-Listener', value: 'stop' },
      { name: '📊 Lihat Status System', value: 'status' },
      { name: '🔄 Reset System', value: 'reset' },
      { name: '❌ Exit', value: 'exit' }
    ];

    try {
      if (!inquirer) {
        console.log('⚠️  Inquirer belum loaded, menggunakan mode auto-listener...');
        await this.startAutoListener();
        return;
      }

      const { action } = await inquirer.default.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'Pilih aksi yang ingin dilakukan:',
          choices: choices
        }
      ]);

      await this.handleMenuAction(action);
    } catch (error) {
      if (error.isTtyError) {
        console.log('⚠️  Terminal tidak mendukung interaksi, menggunakan mode auto-listener...');
        await this.startAutoListener();
      } else {
        console.error('❌ Menu error:', error.message);
        process.exit(1);
      }
    }
  }

  async handleMenuAction(action) {
    switch (action) {
      case 'pairing':
        await this.simulateRFIDPairing();
        break;
      case 'weighing':
        await this.simulateWeighingProcess();
        break;
      case 'auto':
        await this.startAutoListener();
        break;
      case 'stop':
        await this.stopAutoListener();
        break;
      case 'status':
        await this.showSystemStatus();
        break;
      case 'reset':
        await this.resetSystem();
        break;
      case 'exit':
        this.shutdown();
        break;
      default:
        console.log('❌ Aksi tidak dikenal');
        await this.showMainMenu();
    }
  }

  async startAutoListener() {
    console.log('📡 Memulai Auto-Listener...');
    this.startListening();
    console.log('✅ Auto-Listener aktif - menunggu session dari aplikasi');
    console.log('💡 Tekan Ctrl+C untuk kembali ke menu\n');
    
    // Set up interrupt handler untuk kembali ke menu
    const originalHandler = process.listeners('SIGINT');
    process.removeAllListeners('SIGINT');
    
    process.once('SIGINT', async () => {
      console.log('\n⏹️  Menghentikan Auto-Listener...');
      this.stopListening();
      
      // Restore original handlers
      originalHandler.forEach(handler => {
        process.on('SIGINT', handler);
      });
      
      await this.showMainMenu();
    });
  }

  async stopAutoListener() {
    console.log('⏹️  Menghentikan Auto-Listener...');
    this.stopListening();
    console.log('✅ Auto-Listener dihentikan');
    
    setTimeout(async () => {
      await this.showMainMenu();
    }, 1000);
  }

  async simulateRFIDPairing() {
    console.log('\n🎯 SIMULASI PAIRING RFID');
    console.log('═══════════════════════════════════\n');
    
    console.log('⏳ Menunggu admin memulai sesi pairing RFID...');
    console.log('💡 Silakan buka aplikasi admin dan tekan tombol "📱 Pasang RFID" pada halaman detail pengguna.');
    
    // Wait for RFID pairing session to be started from the admin app
    await this.waitForRFIDPairingSession();
  }
  
  async waitForRFIDPairingSession() {
    return new Promise((resolve) => {
      const checkInterval = setInterval(async () => {
        try {
          const sessionDoc = await getDoc(this.systemStatusRef);
          if (sessionDoc.exists()) {
            const sessionData = sessionDoc.data();
            
            // Check if there's an active RFID pairing session started by admin
            if (sessionData.isInUse && 
                sessionData.sessionType === 'rfid' && 
                sessionData.currentUserId && 
                sessionData.currentUserId !== 'simulator' &&
                (!sessionData.rfid || sessionData.rfid === '')) {
              
              clearInterval(checkInterval);
              
              console.log('\n✅ Sesi pairing RFID dimulai dari aplikasi admin!');
              console.log('\n📡 Data dari session aktif:');
              console.log(`   👤 User: ${sessionData.currentUserName} (${sessionData.currentUserId})`);
              
              // Now start the actual RFID generation process
              await this.startActualRFIDPairing(sessionData);
              resolve();
            }
          }
        } catch (error) {
          console.error('❌ Error checking RFID session:', error.message);
        }
      }, 1000); // Check every second
      
      // Add timeout after 5 minutes
      setTimeout(() => {
        clearInterval(checkInterval);
        console.log('\n⏰ Timeout: Admin tidak memulai sesi pairing dalam 5 menit');
        console.log('💡 Kembali ke menu utama...\n');
        this.waitForEnter().then(() => resolve());
      }, 300000); // 5 minutes timeout
    });
  }
  
  async startActualRFIDPairing(sessionData) {
    console.log('\n⏳ Memulai simulasi pairing RFID...');
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing time
    
    const rfidCode = generateRandomRFID();
    console.log(`📱 Generated RFID code: ${rfidCode}`);
    
    try {
      await updateDoc(this.systemStatusRef, {
        rfid: rfidCode,
        lastActivity: new Date()
      });
      
      console.log('\n✅ HASIL PAIRING RFID:');
      console.log(`   👤 Pengguna: ${sessionData.currentUserName}`);
      console.log(`   🔑 RFID Code: ${rfidCode}`);
      console.log('\n📤 RFID code berhasil disimpan ke Firestore');
      console.log('💡 Aplikasi admin akan mendeteksi RFID ini dan menyelesaikan proses pairing\n');
      
    } catch (error) {
      console.error('❌ Gagal menyimpan RFID:', error.message);
    }
    
    await this.waitForEnter();
  }

  async simulateWeighingProcess() {
    console.log('\n⚖️  SIMULASI PROSES TIMBANG');
    console.log('═══════════════════════════════════\n');
    
    // Get registered RFIDs
    console.log('📋 Mengambil daftar RFID terdaftar...');
    const registeredRFIDs = await this.getRegisteredRFIDs();
    
    if (registeredRFIDs.length === 0) {
      console.log('❌ Tidak ada RFID yang terdaftar');
      console.log('💡 Silakan daftarkan RFID terlebih dahulu melalui aplikasi\n');
      await this.waitForEnter();
      return;
    }
    
    console.log(`✅ Ditemukan ${registeredRFIDs.length} RFID terdaftar\n`);
    
    // Select RFID
    const { selectedUser } = await inquirer.default.prompt([
      {
        type: 'list',
        name: 'selectedUser',
        message: 'Pilih pengguna berdasarkan RFID:',
        choices: registeredRFIDs.map(user => ({
          name: user.displayName,
          value: user
        }))
      }
    ]);
    
    console.log(`\n👤 Pengguna dipilih: ${selectedUser.userName}`);
    console.log(`🔑 RFID: ${selectedUser.rfid}`);
    
    console.log('\n⏳ Menunggu pengguna menekan tombol "Mulai Timbang" di aplikasi...');
    console.log('💡 Silakan buka aplikasi dan tekan tombol "🎯 Ambil Data" untuk memulai sesi penimbangan.');
    
    // Wait for weighing session to be started from the app
    await this.waitForWeighingSession(selectedUser);
  }
  
  async waitForWeighingSession(selectedUser) {
    return new Promise((resolve) => {
      const checkInterval = setInterval(async () => {
        try {
          const sessionDoc = await getDoc(this.systemStatusRef);
          if (sessionDoc.exists()) {
            const sessionData = sessionDoc.data();
            
            // Check if there's an active weighing session for this user
            if (sessionData.isInUse && 
                sessionData.sessionType === 'weighing' && 
                sessionData.userRfid === selectedUser.rfid &&
                !sessionData.measurementComplete) {
              
              clearInterval(checkInterval);
              
              console.log('\n✅ Sesi penimbangan dimulai dari aplikasi!');
              console.log('\n📡 Data dari session aktif:');
              console.log(`   🍽️  Pola Makan: ${sessionData.eatingPattern}`);
              console.log(`   🏃 Respon Anak: ${sessionData.childResponse}`);
              
              // Now start the actual weighing process
              await this.startActualWeighing(selectedUser, sessionData);
              resolve();
            }
          }
        } catch (error) {
          console.error('❌ Error checking session:', error.message);
        }
      }, 1000); // Check every second
      
      // Add timeout after 5 minutes
      setTimeout(() => {
        clearInterval(checkInterval);
        console.log('\n⏰ Timeout: Pengguna tidak memulai sesi dalam 5 menit');
        console.log('💡 Kembali ke menu utama...\n');
        this.waitForEnter().then(() => resolve());
      }, 300000); // 5 minutes timeout
    });
  }
  
  async startActualWeighing(selectedUser, sessionData) {
    console.log('\n⏳ Memulai simulasi pengukuran...');
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing time
    
    const measurementData = generateWeighingData();
    
    try {
      await updateDoc(this.systemStatusRef, {
        weight: measurementData.weight,
        height: measurementData.height,
        nutritionStatus: measurementData.nutritionStatus,
        measurementComplete: true,
        lastActivity: new Date()
      });
      
      console.log('\n✅ HASIL PENGUKURAN:');
      console.log(`   👤 Pengguna: ${selectedUser.userName}`);
      console.log(`   🔑 RFID: ${selectedUser.rfid}`);
      console.log(`   🍽️  Pola Makan: ${sessionData.eatingPattern}`);
      console.log(`   🏃 Respon Anak: ${sessionData.childResponse}`);
      console.log(`   ⚖️  Berat: ${measurementData.weight} kg`);
      console.log(`   📏 Tinggi: ${measurementData.height} cm`);
      console.log(`   📊 Status Gizi: ${measurementData.nutritionStatus}`);
      console.log('\n📤 Data berhasil disimpan ke Firestore');
      console.log('💡 Aplikasi akan mendeteksi data ini dan menyimpannya ke riwayat pengguna\n');
      
    } catch (error) {
      console.error('❌ Gagal menyimpan data pengukuran:', error.message);
    }
    
    await this.waitForEnter();
  }

  async showSystemStatus() {
    console.log('\n📊 STATUS SYSTEM');
    console.log('═══════════════════════════════════\n');
    
    try {
      const docSnap = await getDoc(this.systemStatusRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        console.log(`🔌 Status: ${data.isInUse ? '🟢 AKTIF' : '🔴 TIDAK AKTIF'}`);
        console.log(`📡 Listener: ${this.isListening ? '🟢 AKTIF' : '🔴 TIDAK AKTIF'}`);
        console.log(`🎯 Session Type: ${data.sessionType || 'Tidak ada'}`);
        console.log(`👤 Current User: ${data.currentUserName || 'Tidak ada'}`);
        console.log(`🔑 User RFID: ${data.userRfid || 'Tidak ada'}`);
        console.log(`📱 Generated RFID: ${data.rfid || 'Tidak ada'}`);
        console.log(`⚖️  Weight: ${data.weight || 0} kg`);
        console.log(`📏 Height: ${data.height || 0} cm`);
        console.log(`📊 Status Gizi: ${data.nutritionStatus || 'Belum diukur'}`);
        console.log(`⏰ Last Activity: ${data.lastActivity ? new Date(data.lastActivity.seconds * 1000).toLocaleString() : 'Tidak ada'}`);
        console.log(`⚠️  Timeout: ${data.timeout ? '🟡 YA' : '🟢 TIDAK'}`);
        
      } else {
        console.log('❌ Dokumen system status tidak ditemukan');
      }
    } catch (error) {
      console.error('❌ Gagal mengambil status system:', error.message);
    }
    
    console.log('\n');
    await this.waitForEnter();
  }

  async resetSystem() {
    console.log('\n🔄 RESET SYSTEM');
    console.log('═══════════════════════════════════\n');
    
    const { confirm } = await inquirer.default.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Apakah Anda yakin ingin mereset system status?',
        default: false
      }
    ]);
    
    if (!confirm) {
      console.log('❌ Reset dibatalkan');
      await this.waitForEnter();
      return;
    }
    
    try {
      await updateDoc(this.systemStatusRef, {
        isInUse: false,
        timeout: false,
        sessionType: '',
        currentUserId: '',
        currentUserName: '',
        startTime: null,
        lastActivity: null,
        eatingPattern: '',
        childResponse: '',
        userRfid: '',
        weight: 0,
        height: 0,
        nutritionStatus: '',
        measurementComplete: false,
        rfid: '',
      });
      
      console.log('✅ System status berhasil direset');
      
    } catch (error) {
      console.error('❌ Gagal mereset system:', error.message);
    }
    
    console.log('\n');
    await this.waitForEnter();
  }

  async getRegisteredRFIDs() {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('rfid', '!=', ''));
      const querySnapshot = await getDocs(q);
      
      const rfidList = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.rfid && userData.name) {
          rfidList.push({
            rfid: userData.rfid,
            rfidNumber: userData.rfidNumber || 'N/A',
            userName: userData.name,
            userId: doc.id,
            displayName: `${userData.name} (${userData.rfid}) - Card #${userData.rfidNumber || 'N/A'}`
          });
        }
      });
      
      return rfidList;
    } catch (error) {
      console.error('❌ Gagal mengambil daftar RFID:', error.message);
      return [];
    }
  }

  async waitForEnter() {
    await inquirer.default.prompt([
      {
        type: 'input',
        name: 'continue',
        message: 'Tekan Enter untuk kembali ke menu...',
      }
    ]);
    
    await this.showMainMenu();
  }

  async ensureSystemStatusExists() {
    const docSnap = await getDoc(this.systemStatusRef);
    if (!docSnap.exists()) {
      await setDoc(this.systemStatusRef, {
        isInUse: false,
        timeout: false,
        sessionType: '',
        currentUserId: '',
        currentUserName: '',
        startTime: null,
        lastActivity: null,
        eatingPattern: '',
        childResponse: '',
        userRfid: '',
        weight: 0,
        height: 0,
        nutritionStatus: '',
        measurementComplete: false,
        rfid: '',
      });
      console.log('✅ System status document created');
    }
  }

  startListening() {
    if (this.isListening) return;
    
    this.listener = onSnapshot(this.systemStatusRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        this.handleSessionChange(data);
      }
    }, (error) => {
      console.error('❌ Firestore listener error:', error);
    });
    
    this.isListening = true;
  }

  stopListening() {
    if (this.listener) {
      this.listener();
      this.listener = null;
    }
    this.isListening = false;
  }

  handleSessionChange(sessionData) {
    if (!sessionData.isInUse) {
      this.stopCurrentSession();
      return;
    }

    if (this.isProcessing) {
      return;
    }

    if (sessionData.sessionType === 'rfid' && !sessionData.rfid) {
      this.startRFIDSession(sessionData);
    } else if (sessionData.sessionType === 'weighing' && !sessionData.measurementComplete) {
      this.startWeighingSession(sessionData);
    }
  }

  startRFIDSession(sessionData) {
    console.log(`🔧 RFID Pairing Session Started`);
    console.log(`👤 User: ${sessionData.currentUserName} (${sessionData.currentUserId})`);
    
    this.currentSession = sessionData;
    this.isProcessing = true;
    
    this.startTimeoutTimer('rfid', 5);
    
    const delay = getRandomDelay();
    console.log(`⏳ Simulating RFID scan... (${delay}ms)`);
    
    this.processingTimer = setTimeout(async () => {
      await this.completeRFIDPairing();
    }, delay);
  }

  async completeRFIDPairing() {
    if (!this.currentSession) return;

    const rfidCode = generateRandomRFID();
    console.log(`✅ RFID Card Detected: ${rfidCode}`);
    
    try {
      await updateDoc(this.systemStatusRef, {
        rfid: rfidCode,
        lastActivity: new Date()
      });
      
      console.log(`📤 RFID data sent to Firestore`);
      console.log(`🎉 RFID Pairing Complete!\n`);
      
    } catch (error) {
      console.error('❌ Failed to update RFID:', error.message);
    }
    
    this.isProcessing = false;
  }

  startWeighingSession(sessionData) {
    console.log(`⚖️  Weighing Session Started`);
    console.log(`👤 User: ${sessionData.currentUserName} (${sessionData.currentUserId})`);
    console.log(`🍽️  Eating Pattern: ${sessionData.eatingPattern}`);
    console.log(`🏃 Child Response: ${sessionData.childResponse}`);
    console.log(`🔑 Expected RFID: ${sessionData.userRfid}`);
    
    this.currentSession = sessionData;
    this.isProcessing = true;
    
    this.startTimeoutTimer('weighing', 10);
    
    const delay = getRandomDelay();
    console.log(`⏳ Waiting for RFID tap... (${delay}ms)`);
    
    this.processingTimer = setTimeout(async () => {
      await this.simulateRfidTapAndWeighing();
    }, delay);
  }

  async simulateRfidTapAndWeighing() {
    if (!this.currentSession) return;

    const tappedRfid = simulateRfidTap(this.currentSession.userRfid);
    console.log(`📱 RFID Tapped: ${tappedRfid}`);
    
    if (tappedRfid !== this.currentSession.userRfid) {
      console.log(`❌ RFID Mismatch! Expected: ${this.currentSession.userRfid}, Got: ${tappedRfid}`);
      console.log(`🚨 Access denied - wrong RFID card`);
      
      try {
        await this.resetSessionWithError();
      } catch (error) {
        console.error('❌ Failed to reset session:', error.message);
      }
      
      this.isProcessing = false;
      return;
    }

    console.log(`✅ RFID Match! Starting measurement...`);
    
    const measurementDelay = getRandomDelay();
    console.log(`⏳ Simulating measurement... (${measurementDelay}ms)`);
    
    setTimeout(async () => {
      await this.completeWeighing();
    }, measurementDelay);
  }

  async completeWeighing() {
    if (!this.currentSession) return;

    const measurementData = generateWeighingData();
    console.log(`📊 Measurement Results:`);
    console.log(`   Weight: ${measurementData.weight} kg`);
    console.log(`   Height: ${measurementData.height} cm`);
    console.log(`   Status: ${measurementData.nutritionStatus}`);
    
    try {
      await updateDoc(this.systemStatusRef, {
        weight: measurementData.weight,
        height: measurementData.height,
        nutritionStatus: measurementData.nutritionStatus,
        measurementComplete: true,
        lastActivity: new Date()
      });
      
      console.log(`📤 Measurement data sent to Firestore`);
      console.log(`🎉 Weighing Complete!\n`);
      
    } catch (error) {
      console.error('❌ Failed to update measurement:', error.message);
    }
    
    this.isProcessing = false;
  }

  async resetSessionWithError() {
    await updateDoc(this.systemStatusRef, {
      isInUse: false,
      timeout: false,
      sessionType: '',
      currentUserId: '',
      currentUserName: '',
      startTime: null,
      lastActivity: null,
      eatingPattern: '',
      childResponse: '',
      userRfid: '',
      weight: 0,
      height: 0,
      nutritionStatus: '',
      measurementComplete: false,
      rfid: '',
    });
    
    console.log('🔄 Session reset due to RFID mismatch\n');
  }

  startTimeoutTimer(sessionType, timeoutMinutes) {
    const timeoutMs = timeoutMinutes * 60 * 1000;
    
    this.timeoutTimer = setTimeout(async () => {
      console.log(`⏰ Session timeout (${timeoutMinutes} minutes)`);
      await this.handleTimeout();
    }, timeoutMs);
  }

  async handleTimeout() {
    console.log('🚨 Session timed out - resetting hardware state');
    
    try {
      await updateDoc(this.systemStatusRef, {
        isInUse: false,
        timeout: true,
        sessionType: '',
        currentUserId: '',
        currentUserName: '',
        startTime: null,
        lastActivity: null,
        eatingPattern: '',
        childResponse: '',
        userRfid: '',
        weight: 0,
        height: 0,
        nutritionStatus: '',
        measurementComplete: false,
        rfid: '',
      });
      
      console.log('✅ Hardware state reset due to timeout\n');
      
    } catch (error) {
      console.error('❌ Failed to reset state:', error.message);
    }
    
    this.stopCurrentSession();
  }

  stopCurrentSession() {
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }
    
    if (this.processingTimer) {
      clearTimeout(this.processingTimer);
      this.processingTimer = null;
    }
    
    this.currentSession = null;
    this.isProcessing = false;
  }

  shutdown() {
    console.log('\n🛑 Shutting down ESP32 Simulator...');
    this.stopCurrentSession();
    this.stopListening();
    console.log('✅ Simulator shutdown complete');
    process.exit(0);
  }
}

const simulator = new ESP32Simulator();

process.on('SIGINT', () => {
  simulator.shutdown();
});

process.on('SIGTERM', () => {
  simulator.shutdown();
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  simulator.shutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  simulator.shutdown();
});

simulator.initialize().catch((error) => {
  console.error('❌ Simulator failed to start:', error);
  process.exit(1);
});