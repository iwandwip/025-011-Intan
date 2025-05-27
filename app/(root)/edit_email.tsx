import { View, Text, TextInput, ActivityIndicator } from "react-native";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, firestore } from "../firebaseConfig";
import { updateEmail, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function EditEmail() {
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSave = async () => {
        if (!newEmail.trim() || !currentPassword.trim()) {
            setError('All fields are required');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const user = auth.currentUser;
            
            if (!user || !user.email) {
                throw new Error('No authenticated user found');
            }

            // Re-authenticate user before email change
            const credential = EmailAuthProvider.credential(
                user.email,
                currentPassword
            );
            await reauthenticateWithCredential(user, credential);

            // Update email in Firebase Auth
            await updateEmail(user, newEmail);

            // Update Firestore user document
            const userRef = doc(firestore, 'users', user.uid);
            await updateDoc(userRef, {
                email: newEmail
            });

            // Update local storage
            const storedData = await AsyncStorage.getItem('userData');
            if (storedData) {
                const userData = JSON.parse(storedData);
                const updatedUserData = { ...userData, email: newEmail };
                await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
            }

            router.push("/(root)/edit-profile");
        } catch (err: any) {
            console.error('Error updating email:', err);
            let errorMessage = 'Failed to update email';
            
            if (err.code === 'auth/wrong-password') {
                errorMessage = 'Current password is incorrect';
            } else if (err.code === 'auth/email-already-in-use') {
                errorMessage = 'Email is already in use';
            }
            
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="flex-row items-center p-4 border-b border-gray-200 bg-white">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="p-2"
                >
                    <ChevronLeft size={24} color="#000" />
                </TouchableOpacity>
                <Text className="flex-1 text-center text-lg font-bold mr-10">
                    Edit Email
                </Text>
            </View>

            <View className="flex-1 p-4">
                <Card className="p-4">
                    <Text className="text-sm text-gray-500 mb-2">Current Password</Text>
                    <TextInput
                        className="border border-gray-200 rounded-lg p-2 mb-4"
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        placeholder="Enter current password"
                        secureTextEntry
                    />

                    <Text className="text-sm text-gray-500 mb-2">New Email</Text>
                    <TextInput
                        className="border border-gray-200 rounded-lg p-2 mb-4"
                        value={newEmail}
                        onChangeText={setNewEmail}
                        placeholder="Enter new email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </Card>
            </View>

            {error && (
                <Text className="text-red-500 text-center p-2">{error}</Text>
            )}

            <View className="p-4 bg-white border-t border-gray-200">
                <Button 
                    className="w-full"
                    onPress={handleSave}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text className="text-white font-semibold">
                            Save Changes
                        </Text>
                    )}
                </Button>
            </View>
        </SafeAreaView>
    );
} 