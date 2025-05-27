import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { ScrollText, Weight, User } from 'lucide-react-native';


export default function UserLayout() {
  return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
          <Tabs
            screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: 'white',
            borderTopWidth: 1,
            borderTopColor: '#f1f1f1',
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          },
          tabBarActiveTintColor: '#000', // blue-500
          tabBarInactiveTintColor: '#9ca3af', // gray-400
        }}
      >
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          }}
        />
      <Tabs.Screen
            name="list-data"
            options={{
              title: 'List Data',
              tabBarIcon: ({ color, size }) => <ScrollText size={size} color={color} />,
            }}
          />
      <Tabs.Screen
            name="timbang"
            options={{
              title: 'Timbang',
              tabBarIcon: ({ color, size }) => <Weight size={size} color={color} />,
            }}
          />
      </Tabs>
    </View>
  );
}
