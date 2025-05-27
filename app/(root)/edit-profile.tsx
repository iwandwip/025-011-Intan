import * as React from 'react';
import { View, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check, User, Mail, Key, CreditCard, UserCircle, Baby, Calendar, Users, ChevronLeft, ChevronRight } from "lucide-react-native";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { Input } from '~/components/ui/input';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from '~/components/ui/select';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Skeleton } from '~/components/ui/skeleton';
import { UserData } from '~/types/user';
import { DateType } from 'react-native-ui-datepicker';
import SingleDatePicker from '~/components/SingleDatePicker';
import dayjs from 'dayjs';
import Modal from "react-native-modal";
import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';
import { SafeAreaView } from "react-native-safe-area-context";


interface SettingItemProps {
    label: string;
    rightText?: string;
    onPress?: () => void;
    isLoading?: boolean;
  }
const SettingItem = ({ label, rightText, onPress, isLoading = false }: SettingItemProps) => (
    <TouchableOpacity 
      onPress={onPress}
      disabled={isLoading}
      className="flex-row items-center justify-between p-4 bg-gray-100 border-b border-gray-100 rounded-lg"
    >
      <Text className="text-base font-medium text-gray-800">{label}</Text>
      <View className="flex-row items-center">
        {isLoading ? (
          <ActivityIndicator size="small" color="#6366F1" />
        ) : (
          <>
            {rightText && <Text className="text-black-500 mr-2">{rightText}</Text>}
            <ChevronRight size={20} color="#6366F1" />
          </>
        )}
      </View>
    </TouchableOpacity>
  );

export default function EditProfile() {
  const router = useRouter();
  const [originalData, setOriginalData] = useState<UserData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState<DateType>(dayjs());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('userData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setOriginalData(parsedData);
          setUserData(parsedData);
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

  const handleChange = (field, value) => {
    if (field === 'birthdate') {
        // Format the date to ISO 8601
        value = dayjs(value).toISOString();
    }
    setUserData(prev => ({
        ...prev,
        [field]: value
    }));
  };


  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (!userData || !userData.id) {
        throw new Error("User data or user ID is missing");
      }
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      
      // Save to Firestore
      const userRef = doc(firestore, "users", userData.id);
      await updateDoc(userRef, {
        username: userData.displayName,
        rfid: userData.rfid,
        namaAnak: userData.namaAnak || null,
        birthdate: userData.birthdate || null,
        gender: userData.gender || null,
      });
      
      // Show success message
      Alert.alert(
        "Success",
        "Profile updated successfully in both local storage and cloud",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error saving user data:', error);
      Alert.alert("Error", "Failed to save profile data. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = () => {
    return JSON.stringify(userData) !== JSON.stringify(originalData);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
                 <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              <TouchableOpacity onPress={() => router.back()}>
                <ArrowLeft size={24} color="#000000" />
              </TouchableOpacity>
              <Text className="text-xl font-bold text-black-700">Edit Profile</Text>
              <View style={{ width: 24 }} />
            </View>

      <ScrollView className="flex-1 p-4">
        <Card className="mb-4">
         <CardHeader>
            <CardTitle>Credential information</CardTitle>
          </CardHeader>
            <CardContent className='gap-4'>
            <SettingItem 
                label="Email"
                rightText={userData?.email}
                onPress={() => router.push('/(root)/edit_email')}
              />
              
              <SettingItem 
                label="Password"
                rightText="**********"
                onPress={() => router.push('/(root)/edit_password')}
              />
            </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
          <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <View>
              <Text className="text-sm text-gray-500 mb-1">Username</Text>
              <Input
                value={userData.displayName}
                onChangeText={(text) => handleChange('displayName', text)}
                placeholder="Enter your name"
              />
            </View>
            
           

            <View>
              <Text className="text-sm text-gray-500 mb-1">RFID</Text>
              <Input
                value={userData.rfid}
                onChangeText={(text) => handleChange('rfid', text)}
                placeholder="Enter RFID"
              />
            </View>

            <View>
              <Text className="text-sm text-gray-500 mb-1">Nama Anak</Text>
              <Input
                value={userData.namaAnak || ''}
                onChangeText={(text) => handleChange('namaAnak', text)}
                placeholder="Enter nama anak "
              />
            </View>
            <View>
              <Text className="text-sm text-gray-500 mb-1">Tanggal Lahir</Text>
              <TouchableOpacity 
                onPress={() => setIsDatePickerOpen(true)}
                className="border border-gray-300 rounded-md p-2"
              >
                <Text>{selectedDate ? dayjs(selectedDate).format('DD/MM/YYYY') : 'Select date'}</Text>
              </TouchableOpacity>
            </View>


            <View>
              <Text className="text-sm text-gray-500 mb-1">Jenis Kelamin</Text>
              <Select
                defaultValue={{ value: userData.gender || "laki-laki", label: 'laki-laki' }}
                // value={userData.gender || 'Laki-Laki'}
                onValueChange={(value) => handleChange('gender', value?.label)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem label='Laki-Laki' value='laki-laki'>
                    Laki-Laki
                </SelectItem>
                <SelectItem label='Perempuan' value='perempuan'>
                    Perempuan
                </SelectItem>
             
                </SelectContent>
              </Select>
            </View>
          </CardContent>
        </Card>



        <View className="flex-row justify-center mt-4 mb-8">
          <Button 
            disabled={!hasChanges() || isSaving}
            onPress={handleSave}
            className="px-8"
          >
            {isSaving ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="#ffffff" />
                <Text className="text-white ml-2">Saving...</Text>
              </View>
            ) : (
                <Text className="text-white">Save Changes</Text>
      
            )}
          </Button>
        </View>
      </ScrollView>

      <Modal
        isVisible={isDatePickerOpen}
        onBackdropPress={() => setIsDatePickerOpen(false)}
        backdropOpacity={0.5}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        style={{ margin: 0, justifyContent: 'flex-end' }}
      >
        <View className="bg-white items-center rounded-t-lg p-4">
          <View className="items-center mb-4">
            <Text className="text-lg font-medium">Select date</Text>
          </View>
          
          <SingleDatePicker
            date={selectedDate}
            onChange={(date) => {
              setSelectedDate(date);
              handleChange('birthdate', date);
            }}
            format="DD/MM/YYYY"
            placeholder="Select date"
          />
          
          <View className="flex-row justify-end mt-4 space-x-2">
            <Button 
              onPress={() => setIsDatePickerOpen(false)}
              variant="ghost"
            >
              <Text className="text-gray-500">CANCEL</Text>
            </Button>
            <Button 
              onPress={() => {
                // Handle confirmation
                setIsDatePickerOpen(false);
              }}
              variant="ghost"
            >
              <Text className="text-blue-500 font-medium">CONFIRM</Text>
            </Button>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

