import * as React from 'react';
import { View, TouchableOpacity, ScrollView, ActivityIndicator, Pressable } from "react-native";
import { Text } from "~/components/ui/text";
import { ChevronRight } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, X, Eye, EyeOff } from "lucide-react-native";
import {  useRouter, Stack } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signOutUser } from "../api/auth_remote_data_service";
import { useState, useRef, useEffect, useCallback } from "react";
import { TextInput } from "react-native";
import { auth, firestore } from "../firebaseConfig";
import { Button } from "~/components/ui/button";
import { Input } from '~/components/ui/input';

import { 
  updateProfile,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential 
} from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';

// You might want to move this to a separate file later
interface SettingItemProps {
  label: string;
  rightText?: string;
  onPress?: () => void;
  isLoading?: boolean;
}

const SettingItem = ({ label, rightText, 
  onPress,
   isLoading = false }: SettingItemProps) => (
  <TouchableOpacity 
    onPress={onPress}
    disabled={isLoading}
    className="flex-row items-center justify-between p-4 bg-white border-b border-gray-100 rounded-lg my-1 shadow-sm"
  >
    <Text className="text-base font-medium text-gray-800">{label}</Text>
    <View className="flex-row items-center">
      {isLoading ? (
        <ActivityIndicator size="small" color="#6366F1" />
      ) : (
        <>
          {rightText && <Text className="text-indigo-500 mr-2">{rightText}</Text>}
          <ChevronRight size={20} color="#6366F1" />
        </>
      )}
    </View>
  </TouchableOpacity>
);

export default function Setting() {

  const router = useRouter();
  const [isSignOut, setIsSignOut] = useState(false);
  const [userData, setUserData] = useState<any>(null);



  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('userData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setUserData(parsedData);
          // console.log('Loaded user data:', parsedData); // Log the loaded data

        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    loadUserData();
  }, []);

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
    <>
       <SafeAreaView className="flex-1 bg-gray-50">
          <View className="flex-1">
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200 bg-indigo-50">
              <TouchableOpacity onPress={() => router.back()}>
                <ChevronLeft size={24} color="#6366F1" />
              </TouchableOpacity>
              <Text className="text-xl font-bold text-indigo-700">Settings</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView className="flex-1 px-3">
              {/* Section headers with gradient background */}
              <View className="mt-6 mb-2 mx-1">
                <Text className="text-lg font-bold text-indigo-800 px-2 text-center">Account</Text>
                <View className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mt-1" />
              </View>
                  {/* Settings Group 1 */}
                  
                  <View className="mt-4 mx-4 space-y-1">
              <SettingItem 
                label="Username"
                rightText={userData?.displayName}
                // onPress={() => router.push('/root/edit_username')}
              />
              
              <SettingItem 
                label="Email"
                rightText={userData?.email}
                // onPress={() => router.push('/root/edit_email')}
              />
              
              <SettingItem 
                label="Password"
                rightText="**********"
                // onPress={() => router.push('/root/edit_password')}
              />
            </View>

            {/* Sign Out Button */}
            <View className="mt-4 mx-4 bg-white rounded-xl overflow-hidden">
              <SettingItem 
                label="Sign out" 
                onPress={handleSignOut}
                isLoading={isSignOut}
              />
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
     
    </>
  );
}
