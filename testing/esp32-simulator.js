const { initializeApp } = require('firebase/app');
const { getFirestore, doc, onSnapshot, updateDoc, setDoc, getDoc } = require('firebase/firestore');
const { getAuth, signInAnonymously } = require('firebase/auth');

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
  }

  async initialize() {
    try {
      console.log('🔐 Authenticating...');
      await signInAnonymously(auth);
      this.isAuthenticated = true;
      console.log('✅ Authentication successful');
      
      await this.ensureSystemStatusExists();
      this.startListening();
      
      console.log('🤖 ESP32 Simulator Started');
      console.log('📡 Listening for global session changes...');
      console.log('💡 Note: 80% chance RFID will match, 20% chance mismatch for testing\n');
    } catch (error) {
      console.error('❌ Failed to initialize:', error.message);
      process.exit(1);
    }
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
    onSnapshot(this.systemStatusRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        this.handleSessionChange(data);
      }
    }, (error) => {
      console.error('❌ Firestore listener error:', error);
    });
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
    console.log('🛑 Shutting down ESP32 Simulator...');
    this.stopCurrentSession();
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

simulator.initialize().catch((error) => {
  console.error('❌ Simulator failed to start:', error);
  process.exit(1);
});