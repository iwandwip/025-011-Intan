import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    serverTimestamp, 
    query, 
    where, 
    orderBy 
  } from 'firebase/firestore';
  import { firestore } from '../firebaseConfig';

  export interface User {
    id: string;
    email: string;
    username: string;
    namaAnak: string;
}

  export const getAllUsers = async (): Promise<User[]> => {
    try {
      // Query the users collection
      const usersCollectionRef = collection(firestore, 'users');
      const usersQuery = query(usersCollectionRef, where('role', '==', 'user'));
      const usersSnapshot = await getDocs(usersQuery);
      // Map the documents to UserData objects
      const users: User[] = usersSnapshot.docs.map((doc) => {
        const userData = doc.data();
        return {
          id: doc.id,
          email: userData.email || '',
          username: userData.username || 'Unknown User',
        //   password: userData.password || '',
        //   rfid: userData.rfid || '',
        //   role: userData.role || '',
          namaAnak: userData.namaAnak,
        //   birthdate: userData.birthdate,
        //   gender: userData.gender
        };
      });
      return users;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  };
  