import { collection, getDocs, query, orderBy, doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { db, auth } from './firebase';

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

export const getAllUsersWithMeasurements = async () => {
  try {
    if (!db) {
      throw new Error('Firestore is not initialized');
    }

    const usersResult = await getAllUsers();
    if (!usersResult.success) {
      throw new Error(usersResult.error);
    }

    const usersWithMeasurements = [];

    for (const user of usersResult.data) {
      const measurementsRef = collection(db, 'users', user.id, 'data');
      const measurementsQuery = query(measurementsRef, orderBy('dateTime', 'desc'));
      const measurementsSnapshot = await getDocs(measurementsQuery);

      const measurements = [];
      measurementsSnapshot.forEach((doc) => {
        measurements.push({
          id: doc.id,
          ...doc.data()
        });
      });

      usersWithMeasurements.push({
        user,
        measurements
      });
    }

    return { success: true, data: usersWithMeasurements };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateUserProfile = async (userId, updateData) => {
  try {
    if (!db) {
      throw new Error('Firestore is not initialized');
    }

    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    await updateDoc(userRef, {
      ...updateData,
      updatedAt: new Date()
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteUserAccount = async (userId) => {
  try {
    if (!db) {
      throw new Error('Firestore is not initialized');
    }

    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const measurementsRef = collection(db, 'users', userId, 'data');
    const measurementsSnapshot = await getDocs(measurementsRef);

    const deletePromises = [];
    measurementsSnapshot.forEach((doc) => {
      deletePromises.push(deleteDoc(doc.ref));
    });

    await Promise.all(deletePromises);

    await deleteDoc(userRef);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};