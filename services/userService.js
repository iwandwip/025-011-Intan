import { doc, setDoc, getDoc, updateDoc, onSnapshot, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { calculateAge } from '../utils/ageCalculator';

export const createUserProfile = async (uid, profileData) => {
  try {
    if (!db) {
      throw new Error('Firestore is not initialized');
    }

    let userProfile;

    if (profileData.role === 'teacher' || profileData.isAdmin) {
      userProfile = {
        id: uid,
        email: profileData.email,
        name: profileData.name || 'Admin',
        role: 'teacher',
        isAdmin: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } else {
      const age = calculateAge(profileData.birthdate);

      userProfile = {
        id: uid,
        email: profileData.email,
        name: profileData.name,
        parentName: profileData.parentName,
        birthdate: profileData.birthdate,
        gender: profileData.gender,
        ageYears: age.years,
        ageMonths: age.months,
        rfid: '',
        latestWeighing: null,
        role: 'student',
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    await setDoc(doc(db, 'users', uid), userProfile);
    return { success: true, profile: userProfile };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserProfile = async (uid) => {
  try {
    if (!db) {
      throw new Error('Firestore is not initialized');
    }

    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const profile = docSnap.data();
      
      if (profile.role === 'teacher' || profile.isAdmin) {
        return { success: true, profile };
      }
      
      const age = calculateAge(profile.birthdate);
      if (profile.ageYears !== age.years || profile.ageMonths !== age.months) {
        await updateDoc(docRef, {
          ageYears: age.years,
          ageMonths: age.months,
          updatedAt: new Date()
        });
        
        profile.ageYears = age.years;
        profile.ageMonths = age.months;
      }
      
      return { success: true, profile };
    } else {
      return { success: false, error: 'User profile not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateUserProfile = async (uid, updates) => {
  try {
    if (!db) {
      throw new Error('Firestore is not initialized');
    }

    const updateData = { ...updates };
    
    if (updates.birthdate) {
      const age = calculateAge(updates.birthdate);
      updateData.ageYears = age.years;
      updateData.ageMonths = age.months;
    }
    
    updateData.updatedAt = new Date();

    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, updateData);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const removeUserRFID = async (uid) => {
  try {
    if (!db) {
      throw new Error('Firestore is not initialized');
    }

    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      rfid: '',
      updatedAt: new Date()
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const subscribeToUserProfile = (uid, callback) => {
  if (!db) {
    console.error('Firestore is not initialized');
    return () => {};
  }

  const userRef = doc(db, 'users', uid);
  return onSnapshot(userRef, callback);
};

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