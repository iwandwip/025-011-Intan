import { collection, doc, addDoc, getDocs, query, orderBy, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { generateRandomMeasurement } from '../utils/dataGenerator';

export const addMeasurement = async (userId, measurementData) => {
  try {
    if (!db) {
      throw new Error('Firestore is not initialized');
    }

    const userDataRef = collection(db, 'users', userId, 'data');
    const docRef = await addDoc(userDataRef, {
      ...measurementData,
      dateTime: new Date(),
      createdAt: new Date()
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserMeasurements = async (userId) => {
  try {
    if (!db) {
      throw new Error('Firestore is not initialized');
    }

    const userDataRef = collection(db, 'users', userId, 'data');
    const q = query(userDataRef, orderBy('dateTime', 'desc'));
    const querySnapshot = await getDocs(q);

    const measurements = [];
    querySnapshot.forEach((doc) => {
      measurements.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return { success: true, data: measurements };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateMeasurement = async (userId, measurementId, updateData) => {
  try {
    if (!db) {
      throw new Error('Firestore is not initialized');
    }

    const measurementRef = doc(db, 'users', userId, 'data', measurementId);
    await updateDoc(measurementRef, {
      ...updateData,
      updatedAt: new Date()
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteMeasurement = async (userId, measurementId) => {
  try {
    if (!db) {
      throw new Error('Firestore is not initialized');
    }

    const measurementRef = doc(db, 'users', userId, 'data', measurementId);
    await deleteDoc(measurementRef);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const generateRandomData = async (userId) => {
  try {
    if (!db) {
      throw new Error('Firestore is not initialized');
    }

    const userDataRef = collection(db, 'users', userId, 'data');
    const promises = [];

    for (let i = 0; i < 5; i++) {
      const randomData = generateRandomMeasurement();
      promises.push(
        addDoc(userDataRef, {
          ...randomData,
          dateTime: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)),
          createdAt: new Date()
        })
      );
    }

    await Promise.all(promises);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};