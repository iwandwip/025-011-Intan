import { doc, setDoc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { GLOBAL_SESSION_TYPES, GLOBAL_SESSION_STATES } from '../utils/globalStates';

const SYSTEM_STATUS_DOC = 'systemStatus/hardware';

export const initializeSystemStatus = async () => {
  try {
    if (!db) {
      throw new Error('Firestore is not initialized');
    }

    const systemRef = doc(db, SYSTEM_STATUS_DOC);
    const systemDoc = await getDoc(systemRef);

    if (!systemDoc.exists()) {
      await setDoc(systemRef, {
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
        ageYears: 0,
        ageMonths: 0,
        gender: '',
        weight: 0,
        height: 0,
        imt: 0,
        nutritionStatus: '',
        measurementComplete: false,
        
        rfid: '',
      });
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getSystemStatus = async () => {
  try {
    if (!db) {
      throw new Error('Firestore is not initialized');
    }

    const systemRef = doc(db, SYSTEM_STATUS_DOC);
    const systemDoc = await getDoc(systemRef);

    if (systemDoc.exists()) {
      return { success: true, data: systemDoc.data() };
    } else {
      await initializeSystemStatus();
      return { success: true, data: null };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const startGlobalSession = async (sessionType, userId, userName, additionalData = {}) => {
  try {
    if (!db) {
      throw new Error('Firestore is not initialized');
    }

    const systemRef = doc(db, SYSTEM_STATUS_DOC);
    const updateData = {
      isInUse: true,
      timeout: false,
      sessionType,
      currentUserId: userId,
      currentUserName: userName,
      startTime: new Date(),
      lastActivity: new Date(),
      ...additionalData
    };

    await updateDoc(systemRef, updateData);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const endGlobalSession = async () => {
  try {
    if (!db) {
      throw new Error('Firestore is not initialized');
    }

    const systemRef = doc(db, SYSTEM_STATUS_DOC);
    await updateDoc(systemRef, {
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
      ageYears: 0,
      ageMonths: 0,
      gender: '',
      weight: 0,
      height: 0,
      imt: 0,
      nutritionStatus: '',
      measurementComplete: false,
      
      rfid: '',
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const subscribeToSystemStatus = (callback) => {
  if (!db) {
    console.error('Firestore is not initialized');
    return () => {};
  }

  const systemRef = doc(db, SYSTEM_STATUS_DOC);
  return onSnapshot(systemRef, callback);
};

export const updateLastActivity = async () => {
  try {
    if (!db) {
      throw new Error('Firestore is not initialized');
    }

    const systemRef = doc(db, SYSTEM_STATUS_DOC);
    await updateDoc(systemRef, {
      lastActivity: new Date()
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const startWeighingSession = async (userId, userName, userRfid, selectionData, userProfile) => {
  return await startGlobalSession(
    GLOBAL_SESSION_TYPES.WEIGHING,
    userId,
    userName,
    {
      eatingPattern: selectionData.eatingPattern,
      childResponse: selectionData.childResponse,
      userRfid: userRfid,
      ageYears: userProfile.ageYears,
      ageMonths: userProfile.ageMonths,
      gender: userProfile.gender,
      weight: 0,
      height: 0,
      imt: 0,
      nutritionStatus: '',
      measurementComplete: false,
    }
  );
};

export const startRfidSession = async (userId, userName) => {
  return await startGlobalSession(
    GLOBAL_SESSION_TYPES.RFID,
    userId,
    userName,
    {
      rfid: '',
    }
  );
};