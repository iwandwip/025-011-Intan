import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

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