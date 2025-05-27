import * as React from 'react';
import { View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { useEffect, useState } from 'react';
import { Weight, Ruler, Award, Database, Save, RefreshCw, ChevronLeft } from "lucide-react-native";
import { subscribeToStatusGiziUpdates, fetchStatusGiziByUserId, StatusGiziData } from '../../../api/status-gizi'; // Update this path
import { getAuth } from 'firebase/auth';
import { addHealthRecord } from '../../../api/health'; // Add this import
import Toast from 'react-native-toast-message'; // Add this for notifications
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StatusGizi() {
  const auth = getAuth();
  const user = auth.currentUser;

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [nutritionData, setNutritionData] = useState<StatusGiziData>({
    weight: '',
    height: '',
    statusGizi: ''
  });

  // Function to fetch nutrition data from Firestore
  const fetchNutritionData = async () => {
    if (!user?.uid) {
      console.error('No user ID available');
      return;
    }

    setIsLoading(true);
    
    try {
      const data = await fetchStatusGiziByUserId(user.uid);
      
      if (data) {
        setNutritionData({
          weight: data.weight || '',
          height: data.height || '',
          statusGizi: data.statusGizi || ''
        });
        setDataLoaded(true);
      } else {
        console.log('No nutrition data found');
      }
    } catch (error) {
      console.error('Error fetching nutrition data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Set up real-time subscription when component mounts
  useEffect(() => {
    if (user?.uid) {
      // Subscribe to real-time updates
      const unsubscribe = subscribeToStatusGiziUpdates(user.uid, (data) => {
        if (data) {
          setNutritionData({
            weight: data.weight || '',
            height: data.height || '',
            statusGizi: data.statusGizi || ''
          });
          setDataLoaded(true);
        }
      });

      // Clean up subscription on component unmount
      return () => unsubscribe();
    }
  }, [user]);

  const handleSave = async () => {
    if (!user?.uid) {
      console.error('No user ID available');
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'User ID not found'
      });
      return;
    }

    // Check if we have the required data
    if (!nutritionData.weight || !nutritionData.height || !nutritionData.statusGizi) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fetch the nutrition data first'
      });
      return;
    }

    setIsLoading(true);
    try {
      // Prepare the health record data
      const healthData = {
        createdAt: new Date().toISOString(),
        weight: nutritionData.weight,
        height: nutritionData.height,
        statusGizi: nutritionData.statusGizi
      };

      // Add the health record
      await addHealthRecord(user.uid, healthData);

      // Show success message
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Health record saved successfully'
      });
      router.push({
        pathname: '/(root)/(user)/list-data',
        params: { 
          refresh: Date.now() // Add this timestamp
        }
      });
      // Navigate back or to another screen if needed
    } catch (error) {
      console.error('Error saving health record:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to save health record'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 p-4">
        <View className="flex-row items-center p-4 border-b border-gray-200 bg-white">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2"
          >
            <ChevronLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-lg font-bold mr-10">
            Status Gizi
          </Text>
        </View>

        {/* Main Content */}
        <View className="flex-1 justify-between">
          <View>
            {/* Data Fetching Button */}
            <Card className="mb-4">
              <CardContent className="p-4">
                <TouchableOpacity
                  className="bg-blue-100 p-4 rounded-lg flex-row items-center justify-center"
                  onPress={fetchNutritionData}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#3B82F6" />
                  ) : (
                    <Database size={20} color="#3B82F6" />
                  )}
                  <Text className="ml-2 text-blue-800 font-medium">
                    {isLoading ? 'Mengambil Data...' : 'Ambil Data BB dan TB'}
                  </Text>
                </TouchableOpacity>
              </CardContent>
            </Card>

            {/* Nutrition Status Display */}
            {dataLoaded && nutritionData.weight && nutritionData.height && (
              <Card className="mb-4 shadow-sm">
                <CardHeader className="bg-pink-50 rounded-t-lg">
                  <CardTitle className="text-center text-pink-800 text-lg">Status Gizi Anak</CardTitle>
                </CardHeader>
                <CardContent className="bg-pink-100 p-5">
                  <View className="flex-row items-center mb-4">
                    <View className="w-10 h-10 bg-pink-200 rounded-full items-center justify-center">
                      <Weight size={20} color="#D1446B" />
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="text-sm text-pink-700">Berat</Text>
                      <Text className="text-lg font-semibold text-pink-900">{nutritionData.weight}</Text>
                    </View>
                  </View>
                  
                  <View className="flex-row items-center mb-4">
                    <View className="w-10 h-10 bg-pink-200 rounded-full items-center justify-center">
                      <Ruler size={20} color="#D1446B" />
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="text-sm text-pink-700">Tinggi</Text>
                      <Text className="text-lg font-semibold text-pink-900">{nutritionData.height}</Text>
                    </View>
                  </View>
                  
                  <View className="h-px bg-pink-200 my-3" />
                  
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-pink-200 rounded-full items-center justify-center">
                      <Award size={20} color="#D1446B" />
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="text-sm text-pink-700">Status Gizi</Text>
                      <Text className="text-lg font-semibold text-pink-900">{nutritionData.statusGizi}</Text>
                    </View>
                  </View>
                </CardContent>
                <CardFooter className="bg-pink-50 p-3 rounded-b-lg">
                  <Button 
                    variant="outline" 
                    className="flex-row items-center justify-center border-pink-300"
                    onPress={handleSave}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <View className="flex-row items-center">
                        <ActivityIndicator size="small" color="#D1446B" />
                        <Text className="ml-2 text-pink-700">Saving...</Text>
                      </View>
                    ) : (
                      <>
                        <Save size={16} className="mr-2 text-pink-700" />
                        <Text className="text-pink-700">Save Data</Text>
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}