import { View, KeyboardAvoidingView, Platform, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image } from 'react-native';
import { Text } from '~/components/ui/text';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { handleGoogleSignIn, registerUser } from '../api/auth_remote_data_service';
import { Eye, EyeOff } from 'lucide-react-native';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '~/components/ui/alert-dialog';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignUp() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [citizenName, setCitizenName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [rfid, setRfid] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State to control dialog visibility
  
  const handleGoogleSignInWrapper = async () => {
    try {
      setGoogleLoading(true);
      await handleGoogleSignIn();
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSignUp = async () => {
    try {
      setLoading(true);
      setError('');

      if (!name || !email || !password) {
        setError('Please fill in all fields');
        setIsDialogOpen(true); // Open the dialog on error
        return;
      }

      const response = await registerUser(email, password, name);
      if (response.user) {
        router.push('/(auth)/signin');
      }
      
    } catch (error: unknown) {
      if (error instanceof Error) {
        // Set the error message directly from the error thrown in registerUser
        setError(error.message); // Use the error message from the thrown error
      } else {
        setError('An unexpected error occurred.');
      }
      setIsDialogOpen(true); // Open the dialog on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className='flex-1 pt-4'>
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        className="flex-1 p-5 pt-20 pb-5" // Tailwind CSS style
        contentContainerStyle={{ 
          flexGrow: 1, 
          justifyContent: 'center', 
        }}
      >
        <View className="items-center mb-5">
          <Text style={{
                fontSize: 28,
                fontWeight: 'bold',
                textAlign: 'center',
                color: 'black',
                textShadowColor: 'black',
                textShadowOffset: { width: 1.5, height: 1.5 },
                textShadowRadius: 1,
                marginBottom: 16,
                letterSpacing: 1,
                textTransform: 'uppercase'
              }}>
                SMART BISYAROH
          </Text>
          <Text className="text-2xl font-bold mb-4 text-center">
              Create an Account to Get Started!
          </Text>
          <Image
            source={require('../../assets/images/Illustration.png')}
            style={{ width: 300, height: 300 }}
            resizeMode="contain"
          />
        </View>

        <Input
          label="Username"
          placeholder="Enter your username"
          autoCapitalize="words"
          className="mb-4"
          value={name}
          onChangeText={setName}
        />

        <Input
          label="Email"
          placeholder="Email@gmail.com"
          keyboardType="email-address"
          autoCapitalize="none"
          className="mb-4"
          value={email}
          onChangeText={setEmail}
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
          onPress={handleSignUp}
          className="mb-4"
          loading={loading}
          disabled={loading || !email || !password || !name}
        >
            <Text>
              {loading ? 'Signing up...' : 'Sign Up'}
            </Text>
        </Button>

        {/* Alert Dialog for displaying errors */}
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Error!</AlertDialogTitle>
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

        <View className="flex-row items-center mb-4">
          <View className="flex-1 h-px bg-gray-300" />
          <Text className="mx-2">Or</Text>
          <View className="flex-1 h-px bg-gray-300" />
        </View>

        <Button 
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
                elevation: 3, // for Android
                height: 48, // specific height for the button
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
          <Text>Already have an account? </Text>
          <Button 
            variant="link"
            onPress={() => router.replace('/signin')}
          >
            <Text className='text-blue-400'>Sign In</Text>
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
