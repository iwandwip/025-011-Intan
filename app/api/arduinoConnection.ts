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
    Timestamp,
    onSnapshot
  } from 'firebase/firestore';
  import { firestore } from '../firebaseConfig';

  // const userId = "Og45WY55CERFiLfXu8y0p8wzfEv2"
  /**
   * Get Arduino data from Firestore
   * @param userId - User ID from Firebase Auth
   * @returns Promise with PolaMakanAnak and ResponAnak data
   */
  export const getArduinoData = async (userId : string) => {
    try {
      const docRef = doc(firestore, `users/${userId}/arduinoConnection/timbang`);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        return data;
      } else {
        console.log("No arduino data found for this user!");
        return null;
      }
    } catch (error) {
      console.error("Error getting arduino data:", error);
      throw error;
    }
  };
  
  /**
   * Set statusRfid to false to initiate scanning process
   * @param userId - User ID from Firebase Auth
   * @returns Promise that resolves when update is complete
   */
  export const setStatusRfidToFalse = async (userId : string) => {
    try {
      const docRef = doc(firestore, `users/${userId}/arduinoConnection/timbang`);
      await updateDoc(docRef, {
        statusRfid: false
      });
      console.log("Status RFID set to false");
      return true;
    } catch (error) {
      console.error("Error updating status:", error);
      throw error;
    }
  };
  
  /**
   * Listen for changes to statusRfid field
   * @param userId - User ID from Firebase Auth
   * @param callback - Function to call when status changes
   * @returns Unsubscribe function
   */
  export const listenToStatusRfid = (userId : string, callback: (isTrue: boolean) => void) => {
    const docRef = doc(firestore, `users/${userId}/arduinoConnection/timbang`);
    
    const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        const isStatusTrue = data.statusRfid === true;
        
        callback(isStatusTrue);
        
        // Note: We don't automatically unsubscribe here so that the component
        // can control when to stop listening
      } else {
        console.log("Document doesn't exist!");
      }
    }, (error) => {
      console.error("Error listening to status changes:", error);
    });
    
    // Return the unsubscribe function so the component can stop listening when needed
    return unsubscribe;
  };
  
  /**
   * Combined function to set statusRfid to false and listen for it to become true
   * @param userId - User ID from Firebase Auth
   * @param callback - Function to call with update status and data
   * @returns Promise with unsubscribe function
   */
  export const startRfidScanProcess = async (userId : string, callback: (isTrue: boolean, data?: any) => void) => {
    try {
      // First set status to false
      await setStatusRfidToFalse(userId).catch(err => {
        console.warn("Failed to set RFID status to false, but continuing:", err);
      });
      
      console.log("Start Listening");
      
      // Then listen for changes with error handling
      const unsubscribe = onSnapshot(
        doc(firestore, `users/${userId}/arduinoConnection/timbang`), 
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            const isStatusTrue = data.statusRfid === true;
            console.log("Status Rfid:", isStatusTrue);
            
            // Only trigger callback if status is true
            if (isStatusTrue) {
              callback(true, data);
            }
          } else {
            console.log("No such document!");
          }
        }, 
        (error) => {
          console.error("Error listening to status changes:", error);
          // Notify the UI about the error
          callback(false, { error: error.message });
        }
      );
      
      return unsubscribe;
    } catch (error) {
      console.error("Error in RFID scan process:", error);
      // Notify the UI about the error
      callback(false, { error: error.message });
      throw error;
    }
  };