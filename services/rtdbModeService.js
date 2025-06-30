import { rtdb } from './firebase';
import { ref, onValue, set, get, off } from 'firebase/database';

if (!rtdb) {
  console.error('Realtime Database is not initialized');
}

// ======================
// CORE MODE MANAGEMENT
// ======================
export const setMode = async (mode) => {
  try {
    await set(ref(rtdb, 'mode'), mode);
    return { success: true };
  } catch (error) {
    console.error('Error setting mode:', error);
    return { success: false, error: error.message };
  }
};

export const getMode = async () => {
  try {
    const snapshot = await get(ref(rtdb, 'mode'));
    return snapshot.val() || 'idle';
  } catch (error) {
    console.error('Error getting mode:', error);
    return 'idle';
  }
};

export const subscribeToMode = (callback) => {
  if (!rtdb) {
    console.error('RTDB not initialized');
    return () => {};
  }
  
  const modeRef = ref(rtdb, 'mode');
  const unsubscribe = onValue(modeRef, (snapshot) => {
    const mode = snapshot.val() || 'idle';
    callback(mode);
  });
  
  return () => off(modeRef, 'value', unsubscribe);
};

export const resetToIdle = async () => {
  try {
    await set(ref(rtdb, 'mode'), 'idle');
    await set(ref(rtdb, 'pairing_mode'), '');
    await set(ref(rtdb, 'weighing_mode'), {
      get: { 
        pola_makan: '', 
        respon_anak: '', 
        usia_th: '', 
        usia_bl: '', 
        gender: '' 
      },
      set: { 
        pola_makan: '', 
        respon_anak: '', 
        usia_th: '', 
        usia_bl: '', 
        gender: '', 
        berat: '', 
        tinggi: '', 
        imt: '', 
        status_gizi: '' 
      }
    });
    return { success: true };
  } catch (error) {
    console.error('Error resetting to idle:', error);
    return { success: false, error: error.message };
  }
};

// ======================
// RFID PAIRING
// ======================
export const startRFIDPairing = async () => {
  try {
    await set(ref(rtdb, 'mode'), 'pairing');
    await set(ref(rtdb, 'pairing_mode'), '');
    return { success: true };
  } catch (error) {
    console.error('Error starting RFID pairing:', error);
    return { success: false, error: error.message };
  }
};

export const subscribeToRFIDDetection = (callback) => {
  if (!rtdb) {
    console.error('RTDB not initialized');
    return () => {};
  }
  
  const pairingRef = ref(rtdb, 'pairing_mode');
  const unsubscribe = onValue(pairingRef, (snapshot) => {
    const rfidCode = snapshot.val();
    if (rfidCode && rfidCode !== '') {
      callback(rfidCode);
    }
  });
  
  return () => off(pairingRef, 'value', unsubscribe);
};

export const completePairingSession = async () => {
  try {
    await set(ref(rtdb, 'pairing_mode'), '');
    await set(ref(rtdb, 'mode'), 'idle');
    return { success: true };
  } catch (error) {
    console.error('Error completing pairing session:', error);
    return { success: false, error: error.message };
  }
};

// ======================
// WEIGHING SESSION
// ======================
export const startWeighingSession = async (sessionData) => {
  try {
    // Set mode first
    await set(ref(rtdb, 'mode'), 'weighing');
    
    // Set input parameters for ESP32
    await set(ref(rtdb, 'weighing_mode/get'), {
      pola_makan: sessionData.polaMakan || sessionData.eatingPattern,
      respon_anak: sessionData.responAnak || sessionData.childResponse,
      usia_th: sessionData.usiaTh ? sessionData.usiaTh.toString() : sessionData.ageYears?.toString() || '',
      usia_bl: sessionData.usiaBl ? sessionData.usiaBl.toString() : sessionData.ageMonths?.toString() || '',
      gender: sessionData.gender
    });
    
    // Clear results from previous session
    await set(ref(rtdb, 'weighing_mode/set'), {
      pola_makan: '', 
      respon_anak: '', 
      usia_th: '', 
      usia_bl: '', 
      gender: '',
      berat: '', 
      tinggi: '', 
      imt: '', 
      status_gizi: ''
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error starting weighing session:', error);
    return { success: false, error: error.message };
  }
};

export const subscribeToWeighingResults = (callback) => {
  if (!rtdb) {
    console.error('RTDB not initialized');
    return () => {};
  }
  
  const resultsRef = ref(rtdb, 'weighing_mode/set');
  const unsubscribe = onValue(resultsRef, (snapshot) => {
    const results = snapshot.val();
    console.log('Weighing results received:', results);
    
    if (results && results.berat && results.tinggi && results.status_gizi) {
      console.log('All required fields present:', {
        berat: results.berat,
        tinggi: results.tinggi,
        status_gizi: results.status_gizi
      });
      callback(results);
    } else {
      console.log('Missing required fields. Current results:', results);
      if (results) {
        console.log('Field check:', {
          has_berat: !!results.berat,
          has_tinggi: !!results.tinggi,
          has_status_gizi: !!results.status_gizi
        });
      }
    }
  });
  
  return () => off(resultsRef, 'value', unsubscribe);
};

export const completeWeighingSession = async () => {
  try {
    await set(ref(rtdb, 'weighing_mode'), {
      get: { 
        pola_makan: '', 
        respon_anak: '', 
        usia_th: '', 
        usia_bl: '', 
        gender: '' 
      },
      set: { 
        pola_makan: '', 
        respon_anak: '', 
        usia_th: '', 
        usia_bl: '', 
        gender: '',
        berat: '', 
        tinggi: '', 
        imt: '', 
        status_gizi: '' 
      }
    });
    await set(ref(rtdb, 'mode'), 'idle');
    return { success: true };
  } catch (error) {
    console.error('Error completing weighing session:', error);
    return { success: false, error: error.message };
  }
};

// ======================
// UTILITY FUNCTIONS
// ======================
export const isSystemIdle = async () => {
  try {
    const mode = await getMode();
    return mode === 'idle';
  } catch (error) {
    console.error('Error checking if system is idle:', error);
    return false;
  }
};

export const getCurrentSystemState = async () => {
  try {
    const mode = await getMode();
    const pairingSnapshot = await get(ref(rtdb, 'pairing_mode'));
    const weighingSnapshot = await get(ref(rtdb, 'weighing_mode'));
    
    return {
      mode,
      pairingMode: pairingSnapshot.val(),
      weighingMode: weighingSnapshot.val()
    };
  } catch (error) {
    console.error('Error getting system state:', error);
    return {
      mode: 'idle',
      pairingMode: null,
      weighingMode: null
    };
  }
};

// ======================
// LOAD CELL TARE
// ======================
export const startLoadCellTare = async () => {
  try {
    await set(ref(rtdb, 'mode'), 'tare');
    await set(ref(rtdb, 'tare_mode/get'), {
      command: 'start'
    });
    await set(ref(rtdb, 'tare_mode/set'), {
      status: ''
    });
    return { success: true };
  } catch (error) {
    console.error('Error starting tare:', error);
    return { success: false, error: error.message };
  }
};

export const subscribeToTareStatus = (callback) => {
  if (!rtdb) {
    console.error('RTDB not initialized');
    return () => {};
  }
  
  const tareRef = ref(rtdb, 'tare_mode/set/status');
  return onValue(tareRef, (snapshot) => {
    const status = snapshot.val();
    if (status) {
      callback(status);
    }
  });
};

export const completeTareSession = async () => {
  try {
    await set(ref(rtdb, 'tare_mode'), {
      get: { command: '' },
      set: { status: '' }
    });
    await set(ref(rtdb, 'mode'), 'idle');
    return { success: true };
  } catch (error) {
    console.error('Error completing tare session:', error);
    return { success: false, error: error.message };
  }
};

// ======================
// LOAD CELL CALIBRATION
// ======================
export const startLoadCellCalibration = async (knownWeight) => {
  try {
    await set(ref(rtdb, 'mode'), 'calibration');
    await set(ref(rtdb, 'calibration_mode/get'), {
      command: 'start',
      known_weight: knownWeight.toString()
    });
    await set(ref(rtdb, 'calibration_mode/set'), {
      status: ''
    });
    return { success: true };
  } catch (error) {
    console.error('Error starting calibration:', error);
    return { success: false, error: error.message };
  }
};

export const subscribeToCalibrationStatus = (callback) => {
  if (!rtdb) {
    console.error('RTDB not initialized');
    return () => {};
  }
  
  const calibrationRef = ref(rtdb, 'calibration_mode/set/status');
  return onValue(calibrationRef, (snapshot) => {
    const status = snapshot.val();
    if (status) {
      callback(status);
    }
  });
};

export const completeCalibrationSession = async () => {
  try {
    await set(ref(rtdb, 'calibration_mode'), {
      get: { command: '', known_weight: '' },
      set: { status: '' }
    });
    await set(ref(rtdb, 'mode'), 'idle');
    return { success: true };
  } catch (error) {
    console.error('Error completing calibration session:', error);
    return { success: false, error: error.message };
  }
};

// ======================
// ULTRASONIC CALIBRATION
// ======================
export const startUltrasonicCalibration = async (poleHeight) => {
  try {
    await set(ref(rtdb, 'mode'), 'ultrasonic_calibration');
    await set(ref(rtdb, 'ultrasonic_calibration_mode/get'), {
      command: 'start',
      pole_height: poleHeight.toString()
    });
    await set(ref(rtdb, 'ultrasonic_calibration_mode/set'), {
      status: ''
    });
    return { success: true };
  } catch (error) {
    console.error('Error starting ultrasonic calibration:', error);
    return { success: false, error: error.message };
  }
};

export const subscribeToUltrasonicCalibrationStatus = (callback) => {
  if (!rtdb) {
    console.error('RTDB not initialized');
    return () => {};
  }
  
  const ultrasonicRef = ref(rtdb, 'ultrasonic_calibration_mode/set/status');
  return onValue(ultrasonicRef, (snapshot) => {
    const status = snapshot.val();
    if (status) {
      callback(status);
    }
  });
};

export const completeUltrasonicCalibrationSession = async () => {
  try {
    await set(ref(rtdb, 'ultrasonic_calibration_mode'), {
      get: { command: '', pole_height: '' },
      set: { status: '' }
    });
    await set(ref(rtdb, 'mode'), 'idle');
    return { success: true };
  } catch (error) {
    console.error('Error completing ultrasonic calibration session:', error);
    return { success: false, error: error.message };
  }
};

// ======================
// SYSTEM MONITORING
// ======================
export const subscribeToSystemState = (callback) => {
  if (!rtdb) {
    console.error('RTDB not initialized');
    return () => {};
  }
  
  const unsubscribes = [];
  
  // Subscribe to mode changes
  const modeRef = ref(rtdb, 'mode');
  unsubscribes.push(onValue(modeRef, () => {
    getCurrentSystemState().then(callback);
  }));
  
  // Subscribe to pairing mode changes
  const pairingRef = ref(rtdb, 'pairing_mode');
  unsubscribes.push(onValue(pairingRef, () => {
    getCurrentSystemState().then(callback);
  }));
  
  // Subscribe to weighing mode changes
  const weighingRef = ref(rtdb, 'weighing_mode');
  unsubscribes.push(onValue(weighingRef, () => {
    getCurrentSystemState().then(callback);
  }));
  
  return () => {
    unsubscribes.forEach(unsub => unsub());
  };
};

// ======================
// ERROR HANDLING
// ======================
export const handleSystemError = async (error) => {
  console.error('System error:', error);
  
  try {
    // Reset to safe state
    await resetToIdle();
    return { success: true, message: 'System has been reset' };
  } catch (resetError) {
    console.error('Error resetting system:', resetError);
    return { success: false, error: 'Failed to reset system' };
  }
};