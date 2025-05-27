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
    orderBy, 
    Timestamp 
  } from 'firebase/firestore';
  import { firestore } from '../firebaseConfig';
  import { Health } from '~/types/health';

  // Define Health interface based on your Firestore data structure

  
  /**
   * Get all health records for a specific user
   * @param userId User ID to fetch health records for
   * @returns Promise with array of health records
   */
  export const getHealthRecords = async (userId: string): Promise<Health[]> => {
    try {
        
      // Query health records subcollection for the specified user
      const healthsCollectionRef = collection(firestore, 'users', userId, 'healths');
      const healthsQuery = query(healthsCollectionRef, orderBy('createdAt', 'desc'));
      const healthSnapshot = await getDocs(healthsQuery);
      
      // Map the documents to Health objects
      const healthRecords: Health[] = healthSnapshot.docs.map((doc) => {
        const data = doc.data();
        
        // Handle Firestore timestamp conversion if needed
        let createdAt = data.createdAt;
        if (createdAt && typeof createdAt.toDate === 'function') {
          createdAt = createdAt.toDate().toISOString();
        }
        
        return {
          id: doc.id,
          createdAt,
          height: data.height || '',
          weight: data.weight || '',
          statusGizi: data.statusGizi || '',
        };
      });
      
      return healthRecords;
    } catch (error) {
      console.error(`Error getting health records for user ${userId}:`, error);
      throw error;
    }
  };
  
  /**
   * Get a specific health record
   * @param userId User ID
   * @param healthId Health record ID
   * @returns Promise with health record data
   */
  export const getHealthRecord = async (userId: string, healthId: string): Promise<Health | null> => {
    try {
      const healthDocRef = doc(firestore, 'users', userId, 'healths', healthId);
      const healthDoc = await getDoc(healthDocRef);
      
      if (!healthDoc.exists()) {
        return null;
      }
      
      const data = healthDoc.data();
      
      // Handle Firestore timestamp conversion if needed
      let createdAt = data?.createdAt;
      if (createdAt && typeof createdAt.toDate === 'function') {
        createdAt = createdAt.toDate().toISOString();
      }
      
      return {
        id: healthDoc.id,
        createdAt,
        height: data?.height || '',
        weight: data?.weight || '',
        statusGizi: data?.statusGizi || '',
      };
    } catch (error) {
      console.error(`Error getting health record ${healthId} for user ${userId}:`, error);
      throw error;
    }
  };
  
  /**
   * Add a new health record
   * @param userId User ID to add health record for
   * @param healthData Health data to save
   * @returns Promise with the created health record ID
   */
  export const addHealthRecord = async (userId: string, healthData: Omit<Health, 'id'>): Promise<string> => {
    try {
      // Ensure createdAt is a Firestore timestamp if it's not already
      const data = { ...healthData };
     
      
      // Add document to the healths subcollection
      const healthsCollectionRef = collection(firestore, 'users', userId, 'healths');
      const healthRef = await addDoc(healthsCollectionRef, data);
      
      return healthRef.id;
    } catch (error) {
      console.error(`Error adding health record for user ${userId}:`, error);
      throw error;
    }
  };
  
  /**
   * Update a health record
   * @param userId User ID
   * @param healthId Health record ID to update
   * @param healthData Updated health data
   */
  export const updateHealthRecord = async (
    userId: string, 
    healthId: string, 
    healthData: Partial<Omit<Health, 'id'>>
  ): Promise<void> => {
    try {
      // Handle createdAt if it's being updated
      const data = { ...healthData };
      
      
      const healthDocRef = doc(firestore, 'users', userId, 'healths', healthId);
      await updateDoc(healthDocRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error(`Error updating health record ${healthId} for user ${userId}:`, error);
      throw error;
    }
  };
  
  /**
   * Delete a health record
   * @param userId User ID
   * @param healthId Health record ID to delete
   */
  export const deleteHealthRecord = async (userId: string, healthId: string): Promise<void> => {
    try {
      const healthDocRef = doc(firestore, 'users', userId, 'healths', healthId);
      await deleteDoc(healthDocRef);
    } catch (error) {
      console.error(`Error deleting health record ${healthId} for user ${userId}:`, error);
      throw error;
    }
  };