import * as React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CreditCard, Utensils, ThumbsUp } from "lucide-react-native";
import { ScrollView } from 'react-native-gesture-handler';
import { 
  getArduinoData, 
  setStatusRfidToFalse, 
  listenToStatusRfid, 
  startRfidScanProcess 
} from '../../../api/arduinoConnection';
import { Skeleton } from '~/components/ui/skeleton';
import { getAuth } from 'firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';

// Add type for unsubscribe function
type UnsubscribeFunction = () => void;

export default function Timbang() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [rfidScanned, setRfidScanned] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const auth = getAuth()
  const userId = auth.currentUser?.uid || ""
  const [childData, setChildData] = useState({
    polaMakan: '',
    responAnak: ''
  });
  const [unsubscribe, setUnsubscribe] = useState<UnsubscribeFunction | null>(null);
  // Fetch initial data when component mounts
  useEffect(() => {
      fetchArduinoData();

    
    // Cleanup function to unsubscribe when component unmounts
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [unsubscribe]);

  // Function to fetch initial Arduino data
  const fetchArduinoData = async () => {
    setIsLoadingData(true);
    try {
      const data = await getArduinoData(userId);
      if (data) {
        setChildData({
          polaMakan: data.PolaMakanAnak || '',
          responAnak: data.ResponAnak || ''
        });
      }
    } catch (error) {
      console.error("Error fetching Arduino data:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Handle RFID scanning with Firebase
  // const handleScanRfid = async () => {

  //   setIsLoading(true);
    
  //   try {
  //     // First set statusRfid to false
  //     await setStatusRfidToFalse();
      
  //     // Start listening for changes in statusRfid
  //     const unsub = listenToStatusRfid((isTrue) => {
  //       if (isTrue) {
  //         setIsLoading(false);
  //         setRfidScanned(true);
          
  //         // Fetch updated data
  //         fetchArduinoData();
          
  //         // Navigate to status-gizi page
  //         router.push('/(root)/status-gizi');
          
  //         // Unsubscribe from the listener
  //         if (unsub) {
  //           unsub();
  //         }
  //       }
  //     });
      
  //     // Save unsubscribe function
  //     setUnsubscribe(unsub);
  //   } catch (error) {
  //     console.error("Error in RFID scan process:", error);
  //     setIsLoading(false);
  //   }
  // };

  // Alternative implementation using the combined function
  
  const handleScanRfid = async () => {
    setIsLoading(true);
    
    // Add a timeout to prevent indefinite loading
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        console.log("RFID scan timed out");
        // Show an error message to the user
        alert("RFID scan timed out. Please try again.");
      }
    }, 15000); // 15 seconds timeout
    
    try {
      const unsub = await startRfidScanProcess(userId, (isTrue, data) => {
        // Clear the timeout since we got a response
        clearTimeout(timeoutId);
        
        console.log("Callback in component:", isTrue);
        
        if (data && data.error) {
          // Handle error from the listener
          setIsLoading(false);
          alert(`Error: ${data.error}`);
          return;
        }
        
        if (isTrue) {
          // Update state in a more reliable way
          if (data) {
            setChildData({
              polaMakan: data.PolaMakanAnak || '',
              responAnak: data.ResponAnak || ''
            });
          }
          
          // Set loading to false first
          setIsLoading(false);
          setRfidScanned(true);
          
          // Use setTimeout to ensure state updates before navigation
          setTimeout(() => {
            router.push('/(root)/(user)/timbang/status-gizi');
          }, 100);
        }
      });
      
      // Save unsubscribe function with proper typing
      setUnsubscribe(() => unsub);
    } catch (error) {
      // Clear the timeout since we got an error
      clearTimeout(timeoutId);
      
      console.error("Error in RFID scan process:", error);
      setIsLoading(false);
      alert(`Error: ${error.message}`);
    }
  };
  

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 p-4">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-center">Halaman Timbang</Text>
        </View>
        <ScrollView>
       
          <Card className="mb-4">
            <CardContent className="p-4">
              <View className="bg-pink-100 rounded-lg p-4 mb-4">
                {isLoadingData ? (
                  // Skeleton Loading UI
                  <>
                    <View className="flex-row items-center mb-2 gap-2">
                      <Utensils size={20} color="#D1446B" className="mr-2" />
                      <Text className="text-base font-semibold">Pola Makan Anak:</Text>
                    </View>
                    <View className="items-center">
                      <Skeleton className="h-6 w-3/4 rounded-full mb-4" />
                    </View>
                    
                    <View className="h-px bg-pink-200 my-3" />
                    
                    <View className="flex-row items-center mb-2 gap-2">
                      <ThumbsUp size={20} color="#D1446B" className="mr-2" />
                      <Text className="text-base font-semibold">Respon Anak:</Text>
                    </View>
                    <View className="items-center">
                      <Skeleton className="h-6 w-3/4 rounded-full" />
                    </View>
                  </>
                ) : (
                  // Actual Content
                  <>
                    <View className="flex-row items-center mb-2 gap-2">
                      <Utensils size={20} color="#D1446B" className="mr-2" />
                      <Text className="text-base font-semibold">Pola Makan Anak:</Text>
                    </View>
                    <Text className="text-lg text-center">{childData.polaMakan || 'Belum ada data'}</Text>
                    
                    <View className="h-px bg-pink-200 my-3" />
                    
                    <View className="flex-row items-center mb-2 gap-2">
                      <ThumbsUp size={20} color="#D1446B" className="mr-2" />
                      <Text className="text-base font-semibold">Respon Anak:</Text>
                    </View>
                    <Text className="text-lg text-center">{childData.responAnak || 'Belum ada data'}</Text>
                  </>
                )}
              </View>
            </CardContent>
          </Card>

          <Card className="mb-4">
            <CardContent className="p-6 items-center">
            <View className="w-full aspect-square max-w-xs bg-blue-100 rounded-xl items-center justify-center p-6 mb-6" style={{ height: 200 }}>                
              {isLoading ? (
                  <View>
                    <ActivityIndicator size="large" color="#000000" />
                    <Text className="text-blue-800 text-center text-lg mt-4">
                      Menunggu Tap Kartu...
                    </Text>
                  </View>
                ) : (
                  <View className="items-center">
                    <CreditCard size={60} color="#3B82F6" className="mb-4" />
                    <Text className="text-blue-800 text-center text-lg">
                      Silahkan Tap{'\n'}Kartu RFID{'\n'}Anda
                    </Text>
                  </View>
                )}
              </View>
              
              <Button 
                className={`w-full ${isLoading ? 'bg-gray-400' : 'bg-blue-500'}`}
                onPress={handleScanRfid}
                disabled={isLoading}
              >
                <View className="flex-row items-center">
                  {isLoading ? (
                    <Text className="text-white">Menunggu Tap Kartu...</Text>
                  ) : (
                    <Text className="text-white">Scan RFID</Text>
                  )}
                </View>
              </Button>
              {isLoading && (
                <Button 
                  className="w-full mt-4 bg-red-500"
                  onPress={() => {
                    setIsLoading(false);
                    if (unsubscribe) {
                      unsubscribe();
                      setUnsubscribe(null);
                    }
                  }}
                >
                  <View className="flex-row items-center">
                    <Text className="text-white">Cancel Scan</Text>
                  </View>
                </Button>
              )}
            </CardContent>
          </Card>
        

        {/* You can add additional content or information here */}
        <Card className="mt-4">
          <CardContent className="p-4">
            <Text className="text-sm text-gray-500 text-center">
              Tempelkan kartu RFID pada perangkat untuk melihat data anak. 
              Pastikan kartu sudah terdaftar dalam sistem.
            </Text>
          </CardContent>
        </Card>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}