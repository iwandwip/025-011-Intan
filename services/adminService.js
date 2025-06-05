import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export const getAllUsers = async () => {
  try {
    if (!db) {
      throw new Error('Firestore is not initialized');
    }

    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const users = [];
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData.role === 'student') {
        users.push({
          id: doc.id,
          ...userData
        });
      }
    });

    return { success: true, data: users };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserWithMeasurements = async (userId) => {
  try {
    if (!db) {
      throw new Error('Firestore is not initialized');
    }

    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();

    const measurementsRef = collection(db, 'users', userId, 'data');
    const measurementsQuery = query(measurementsRef, orderBy('dateTime', 'desc'));
    const measurementsSnapshot = await getDocs(measurementsQuery);

    const measurements = [];
    measurementsSnapshot.forEach((doc) => {
      measurements.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return {
      success: true,
      data: {
        user: { id: userDoc.id, ...userData },
        measurements
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};