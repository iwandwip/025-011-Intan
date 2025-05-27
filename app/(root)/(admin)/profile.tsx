import * as React from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Settings, User, Mail, Key, CreditCard, UserCircle, Baby, Calendar, Users } from "lucide-react-native";
import { Card, CardHeader, CardTitle, CardDescription } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import { Info } from '~/lib/icons/Info';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Skeleton } from '~/components/ui/skeleton';
import { UserData } from '~/types/user';
import { signOutUser } from '~/app/api/auth_remote_data_service';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Profile() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isSignOut, setIsSignOut] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('userData');
        if (storedData) {
          setUserData(JSON.parse(storedData));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    loadUserData();
  }, []);
      
  if (!userData) {
    return (
      <View className="flex-1 items-center justify-center">
        <Skeleton className="w-48 h-48 mb-4" />
        <Skeleton className="w-64 h-6 mb-2" />
        <Skeleton className="w-32 h-6" />
      </View>
    );
  }

  const handleSignOut = async () => {
    try {
      setIsSignOut(true);
      await signOutUser();
      await AsyncStorage.removeItem('userData');
      router.push('/(auth)/signin');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsSignOut(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* <ScrollView className="flex-1"> */}
        <View className='flex-1 justify-center items-center gap-5 p-6 bg-secondary/30'>
          <Card className='w-full max-w-sm rounded-2xl mb-4'>
            <CardHeader className='items-center'>
              <CardTitle className='pb-2 text-center'>{userData.username}</CardTitle>
              <View className='flex-row'>
                <CardDescription className='text-base font-semibold'>{userData.email}</CardDescription>
                <Tooltip delayDuration={150}>
                  <TooltipTrigger className='px-2 pb-0.5 active:opacity-50'>
                    <Info size={14} strokeWidth={2.5} className='w-4 h-4 text-foreground/70' />
                  </TooltipTrigger>
                  <TooltipContent className='py-2 px-4 shadow'>
                    <Text className='native:text-lg'>{userData.role || 'Freelance'}</Text>
                  </TooltipContent>
                </Tooltip>
              </View>
            </CardHeader>
          </Card>

          <Button
            variant="destructive"
            onPress={handleSignOut}
            className="mx-auto" 
          >
            <Text className="text-white">Logout</Text>
          </Button>
        </View>
      {/* </ScrollView> */}
    </SafeAreaView>
  );
}