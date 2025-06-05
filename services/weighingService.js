import { doc, updateDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { WEIGHING_STATES } from '../utils/weighingStates';

export const startWeighingSession = async (userId, selectionData) => {
  try {
    if (!db) {
      throw new Error('Firestore is not initialized');
    }

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      weighingSession: {
        state: WEIGHING_STATES.WAITING,
        timestamp: new Date(),
        eatingPattern: selectionData.eatingPattern,
        childResponse: selectionData.childResponse,
        rfid: '',
      },
      updatedAt: new Date()
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const resetWeighingSession = async (userId) => {
  try {
    if (!db) {
      throw new Error('Firestore is not initialized');
    }

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      weighingSession: {
        state: WEIGHING_STATES.IDLE,
        timestamp: null,
        eatingPattern: '',
        childResponse: '',
        rfid: '',
        resultData: null,
      },
      updatedAt: new Date()
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateWeighingState = async (userId, newState, additionalData = {}) => {
  try {
    if (!db) {
      throw new Error('Firestore is not initialized');
    }

    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const currentSession = userDoc.data().weighingSession || {};
    
    await updateDoc(userRef, {
      weighingSession: {
        ...currentSession,
        state: newState,
        timestamp: new Date(),
        ...additionalData,
      },
      updatedAt: new Date()
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const completeWeighingSession = async (userId, measurementData) => {
  try {
    if (!db) {
      throw new Error('Firestore is not initialized');
    }

    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const currentSession = userDoc.data().weighingSession || {};
    
    const completeData = {
      weight: measurementData.weight,
      height: measurementData.height,
      nutritionStatus: measurementData.nutritionStatus,
      eatingPattern: currentSession.eatingPattern,
      childResponse: currentSession.childResponse,
      dateTime: new Date(),
    };

    await updateDoc(userRef, {
      weighingSession: {
        state: WEIGHING_STATES.COMPLETED,
        timestamp: new Date(),
        resultData: completeData,
        eatingPattern: currentSession.eatingPattern,
        childResponse: currentSession.childResponse,
        rfid: currentSession.rfid || '',
      },
      latestWeighing: completeData,
      updatedAt: new Date()
    });

    return { success: true, data: completeData };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getLatestWeighing = async (userId) => {
  try {
    if (!db) {
      throw new Error('Firestore is not initialized');
    }

    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const latestWeighing = userDoc.data().latestWeighing;
    
    if (!latestWeighing) {
      return { success: false, error: 'No weighing data found' };
    }

    return { success: true, data: latestWeighing };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const subscribeToWeighingSession = (userId, callback) => {
  if (!db) {
    console.error('Firestore is not initialized');
    return () => {};
  }

  const userRef = doc(db, 'users', userId);
  return onSnapshot(userRef, callback);
};

export const getWeighingSession = async (userId) => {
  try {
    if (!db) {
      throw new Error('Firestore is not initialized');
    }

    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const weighingSession = userDoc.data().weighingSession;
    
    return { 
      success: true, 
      data: weighingSession || { state: WEIGHING_STATES.IDLE } 
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};