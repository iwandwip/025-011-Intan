//NOTES:PROD
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';
import { loginUser } from 'app/api/auth_remote_data_service';

const Page = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing login
    async function checkExistingLogin() {
      try {
        // Get user data from AsyncStorage
        const userDataString = await AsyncStorage.getItem('userData');
        
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          
          // Check if login is still valid (not expired)
          if (userData.expirationTime) {
            const expirationTime = new Date(userData.expirationTime);
            const now = new Date();
            
            if (now < expirationTime) {
              await loginUser(userData.email, userData.password);
              // Login is still valid, redirect to appropriate screen
              if (userData.role === 'admin') {
                router.push('/(root)/(admin)/profile');
              } else {
                router.push('/(root)/(user)/profile');
              }
            } else {
              // Login expired, remove it
              await AsyncStorage.removeItem('userData');
              router.push('/(auth)/signin');
            }
          } else {
            router.push('/(auth)/signin');
          }
        } else {
          router.push('/(auth)/signin');
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        // In case of error, default to login screen
        router.push('/(auth)/signin');
      } finally {
        setIsLoading(false);
      }
    }
    
    checkExistingLogin();
  }, [router]);

  // Show loading indicator while checking login status
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  // Return null since navigation will be handled by router.push
  return null;
}

export default Page;