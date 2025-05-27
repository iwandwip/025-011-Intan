import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
import { firestore } from '../firebaseConfig'; // Adjust the import path to your Firebase config

// Define the StatusGizi interface
export interface StatusGiziData {
  height: string;
  weight: string;
  statusGizi: string;
}

// Function to fetch nutrition data for a single user by ID
export const fetchStatusGiziByUserId = async (userId: string): Promise<StatusGiziData | null> => {
  try {
    const docRef = doc(firestore, `users/${userId}/arduinoConnection/statusGizi`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as StatusGiziData;
      return data;
    } else {
      console.log('No status gizi document exists for this user');
      return null;
    }
  } catch (error) {
    console.error('Error fetching status gizi data:', error);
    throw error;
  }
};

// Function to subscribe to real-time updates for a user's nutrition data
export const subscribeToStatusGiziUpdates = (
  userId: string,
  onUpdate: (data: StatusGiziData | null) => void
) => {
const docRef = doc(firestore, `users/${userId}/arduinoConnection/statusGizi`);
  
  // Create a snapshot listener
  const unsubscribe = onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as StatusGiziData;
        onUpdate(data);
      } else {
        console.log('No status gizi document exists for this user');
        onUpdate(null);
      }
    },
    (error) => {
      console.error('Error subscribing to status gizi updates:', error);
      onUpdate(null);
    }
  );

  // Return the unsubscribe function to clean up the listener when needed
  return unsubscribe;
};