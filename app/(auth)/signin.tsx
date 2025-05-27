import { View, KeyboardAvoidingView, Platform, ScrollView, TextInput, Pressable, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image } from 'react-native';
import { Text } from '~/components/ui/text'; // Adjust the import based on your structure
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Eye, EyeOff } from 'lucide-react-native';
import { handleGoogleSignIn, loginUser } from '../api/auth_remote_data_service';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '~/components/ui/alert-dialog';


export default function SignIn() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State to control dialog visibility
  

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');

      // Use the loginUser function from auth_remote_data_source
      const { user } = await loginUser(email, password);
      const now = new Date();
      const expirationTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      await AsyncStorage.setItem('userData', JSON.stringify({
        id: user.id,
        email: user.email,
        password: password,
        username: user.username,
        role: user.role,
        namaAnak: user.namaAnak,
        birthdate: user.birthdate,
        gender: user.gender,
        rfid: user.rfid,
        loginTimestamp: now.toISOString(),
        expirationTime: expirationTime.toISOString(),

      }));

      // Navigate to home screen based on user role
      if (user.role === 'admin') {
        router.push('/(root)/(admin)/profile');
      } else {
        router.push('/(root)/(user)/profile');
      }
    } catch (error: any) {
      // Set the error message directly from the error thrown in loginUser
      setError(error.message); // Use the error message from the thrown error
      setIsDialogOpen(true); // Open the dialog on error
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignInWrapper = async () => {
    try {
      setGoogleLoading(true);
      await handleGoogleSignIn();
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 pt-4">
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        className="flex-1 p-5" // Tailwind CSS style
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
      >
      <View className="items-center mb-5">
         

            <Text className="text-2xl font-bold mb-4 text-center">
                Selamat Datang, Silakan Login Terlebih Dahulu
            </Text>
          <Image
            source={require('../../assets/images/Illustration.png')}
            style={{ width: 300, height: 300 }}
            resizeMode="contain"
          />
        </View>

          <Input
            label="Email"
            placeholder="Email@gmail.com"
            keyboardType="email-address"
            autoCapitalize="none"
            className="mb-4"
            value={email}
            onChangeText={setEmail}
            aria-labelledby='inputLabel'
          />
          <View className='relative'>
            <Input
              label="Password"
              placeholder="Password"
              secureTextEntry={!showPassword}
              className="mb-4"
              value={password}
              onChangeText={setPassword}
            />
            <Pressable 
                className="absolute right-4 top-1/2 -translate-y-1/2"
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <Eye size={20} color="#000000" />
                ) : (
                  <EyeOff size={20} color="#000000" />
                )}
              </Pressable>
          </View>

          <Button 
            variant="default" 
            onPress={handleLogin}
            className="mb-4"
            loading={loading}
            disabled={loading || !email || !password}
          >
            <Text>
              {loading ? '' : 'Sign In'}
            </Text>
          </Button>
{/* 
          <View className="flex-row items-center mb-4">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="mx-2">Or</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View> */}
            {/* <Button 
                variant="default"
                className="bg-white flex-row items-center justify-center rounded-full mb-4"
                style={{
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: 2,
                    },
                    shadowOpacity: 0.3,
                    shadowRadius: 3,
                    elevation: 3,
                    height: 48,
                }}
                onPress={handleGoogleSignInWrapper}
                loading={googleLoading}
            >
                {!googleLoading && (
                    <View className="flex-row items-center">
                        <View className="rounded-full overflow-hidden">
                            <Image 
                                source={require('../../assets/images/google.png')}
                                style={{ 
                                    width: 24, 
                                    height: 24,
                                    marginRight: 12,
                                }}
                                resizeMode="contain"
                            />
                        </View>
                        <Text className="text-black text-base font-medium">
                            Continue with Gmail
                        </Text>
                    </View>
                )}
                {googleLoading ? (
                    <ActivityIndicator color="black" size="small" />
                ) : null}
            </Button>


          <View className="flex-row items-center justify-center">
            <Text>Don't have an account? </Text>
            <Button 
              variant="link"
              onPress={() => router.replace('/signup')}
            >
              <Text className='text-blue-400'>Sign Up</Text>
            </Button>
          </View> */}

        {/* Alert Dialog for displaying errors */}
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Login Error</AlertDialogTitle>
              <AlertDialogDescription>
                {error}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                <Text>Cancel</Text>
              </AlertDialogCancel>
              <AlertDialogAction onPress={() => setIsDialogOpen(false)}>
                <Text>OK</Text>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
