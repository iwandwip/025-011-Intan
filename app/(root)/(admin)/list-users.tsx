import * as React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { firestore } from '~/app/firebaseConfig';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import { Skeleton } from '~/components/ui/skeleton';
import { Mail, User } from 'lucide-react-native';
import { getAllUsers } from '~/app/api/user';
import { SafeAreaView } from 'react-native-safe-area-context';

interface UserData {
  id: string;
  username: string;
  namaAnak: string;
  email: string;
}

export default function ListUsers() {
  const router = useRouter();
  const [users, setUsers] = React.useState<UserData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getAllUsers(); // Call the getAllUsers function
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleUserPress = (userId: string) => {
    router.push({
      pathname: '/(root)/list-data',
      params: { userId }
    });
  };

  if (isLoading) {
    return (
      <View className="flex-1 p-4">
        <Stack.Screen options={{ title: 'Users List', headerShadowVisible: false }} />
        <View className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="w-full">
              <CardHeader>
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
          ))}
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Stack.Screen options={{ 
        title: 'Users List', 
        headerShadowVisible: false,
        headerShown: false 
      }} />
      
      <View className="p-4 border-b border-gray-200">
        <Text className="text-xl font-bold text-center">Daftar Pengguna</Text>
      </View>

      <ScrollView className="flex-1 px-4">
        <View className="space-y-4 py-4">
          {users.map((user) => (
            <TouchableOpacity 
              key={user.id} 
              onPress={() => handleUserPress(user.id)}
              activeOpacity={0.7}
            >
              <Card className="w-full border-l-4 border-l-primary">
                <CardHeader>
                  <CardTitle className="text-lg">{user.username}</CardTitle>
                  <CardDescription className="text-base">
                    {user.namaAnak}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <View className="flex-row items-center">
                    <Mail size={16} className="text-muted-foreground mr-2" />
                    <Text className="text-muted-foreground">{user.email}</Text>
                  </View>
                </CardContent>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
