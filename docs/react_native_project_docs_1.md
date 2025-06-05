# 📱 React Native Project - Panduan Lengkap dari Nol
## Dokumentasi untuk Pemula Total

---

## 📋 **DAFTAR ISI**

1. [Prerequisites & Setup](#-prerequisites--setup)
2. [React Fundamentals](#-react-fundamentals-wajib-paham)
3. [JavaScript ES6 Essentials](#-javascript-es6-essentials)
4. [React Native Specifics](#-react-native-specifics)
5. [Project Structure](#-project-structure-overview)
6. [CLI Commands](#-cli-commands--development)
7. [Membuat Components](#-cara-membuat-komponen-baru)
8. [Membuat Screens](#-cara-membuat-screen-baru)
9. [Common Patterns](#-common-patterns--best-practices)
10. [Debugging](#-debugging--troubleshooting)
11. [Learning Path](#-learning-path-untuk-pemula)

---

## 💻 **PREREQUISITES & SETUP**

### **Install Prerequisites:**
```bash
# 1. Install Node.js (versi 18+)
# Download dari: https://nodejs.org

# 2. Verify installation
node --version
npm --version

# 3. Install Expo CLI global
npm install -g @expo/cli

# 4. Install EAS CLI (untuk build production)
npm install -g eas-cli

# 5. Verify Expo installation
expo --version
```

### **Setup Project:**
```bash
# 1. Clone atau download project
git clone <repo-url>
cd belajarapp

# 2. Install dependencies
npm install

# 3. Start development server
npm start

# 4. Install "Expo Go" app di HP Android/iOS
# 5. Scan QR code yang muncul di terminal
```

---

## 🎓 **REACT FUNDAMENTALS (WAJIB PAHAM!)**

### **1. Apa itu React?**
React = Library untuk membangun User Interface dengan **components** (komponen yang bisa dipakai ulang)

**Analogi Engineering:** Seperti IC/module di embedded systems - sekali buat, bisa pakai berkali-kali

### **2. JSX - JavaScript + HTML**
JSX = cara menulis HTML di dalam JavaScript:

```jsx
// ❌ HTML biasa (tidak bisa di React)
<div class="container">
  <p>Hello World</p>
</div>

// ✅ JSX (React way)
<View style={styles.container}>
  <Text>Hello World</Text>
</View>
```

**Aturan JSX:**
- Pakai `{}` untuk JavaScript di dalam JSX
- Semua tag harus ditutup: `<input />` bukan `<input>`
- `class` → `className` (web) atau `style` (React Native)

```jsx
const name = "John";
const age = 25;

return (
  <View>
    <Text>Hello {name}!</Text>
    <Text>You are {age} years old</Text>
    <Text>Next year: {age + 1}</Text>
    <Text>{age >= 18 ? "Adult" : "Child"}</Text>
  </View>
);
```

### **3. Components - Building Blocks**
Component = Function yang return JSX:

```jsx
// Function Component (recommended)
function Welcome(props) {
  return <Text>Hello {props.name}!</Text>;
}

// Arrow Function Component (modern way)
const Welcome = (props) => {
  return <Text>Hello {props.name}!</Text>;
};

// Dengan destructuring (preferred)
const Welcome = ({ name, age }) => {
  return (
    <View>
      <Text>Hello {name}!</Text>
      <Text>Age: {age}</Text>
    </View>
  );
};
```

### **4. Props - Data dari Parent ke Child**
Props = parameter yang dikirim ke component:

```jsx
// Parent Component
const App = () => {
  return (
    <View>
      <Welcome name="Alice" age={25} />
      <Welcome name="Bob" age={30} />
    </View>
  );
};

// Child Component  
const Welcome = ({ name, age }) => {
  return (
    <View>
      <Text>Hello {name}!</Text>
      <Text>Age: {age}</Text>
    </View>
  );
};
```

### **5. State - Data yang Berubah**
State = variabel yang bisa berubah dan otomatis update UI:

```jsx
import { useState } from 'react';

const Counter = () => {
  // [variabel, fungsi untuk ubah] = useState(nilai awal)
  const [count, setCount] = useState(0);
  const [name, setName] = useState("John");

  const increment = () => {
    setCount(count + 1); // UI otomatis update!
  };

  return (
    <View>
      <Text>Count: {count}</Text>
      <Text>Name: {name}</Text>
      <TouchableOpacity onPress={increment}>
        <Text>Increment</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### **6. useEffect - Side Effects**
useEffect = untuk operasi "sampingan" seperti API calls:

```jsx
import { useState, useEffect } from 'react';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Run once when component mounts
  useEffect(() => {
    console.log('Component mounted');
    loadUserData();
  }, []); // Empty array = run once

  // Run when user changes
  useEffect(() => {
    console.log('User changed:', user);
  }, [user]); // Run when 'user' state changes

  const loadUserData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setUser({ name: 'John', email: 'john@email.com' });
        setLoading(false);
      }, 2000);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  if (loading) return <Text>Loading...</Text>;

  return (
    <View>
      <Text>Name: {user?.name}</Text>
      <Text>Email: {user?.email}</Text>
    </View>
  );
};
```

---

## 📝 **JAVASCRIPT ES6 ESSENTIALS**

### **1. Arrow Functions:**
```jsx
// Old way
function sayHello(name) {
  return "Hello " + name;
}

// New way (Arrow Function)
const sayHello = (name) => {
  return "Hello " + name;
};

// Shorter version (one-liner)
const sayHello = (name) => "Hello " + name;

// For event handlers
<TouchableOpacity onPress={() => console.log('Pressed')} />
<TouchableOpacity onPress={() => setCount(count + 1)} />
```

### **2. Destructuring:**
```jsx
// Object destructuring
const user = { name: 'John', age: 25, email: 'john@email.com' };

// Old way
const name = user.name;
const age = user.age;

// New way
const { name, age, email } = user;

// In function parameters
const UserCard = ({ name, age, email }) => {
  return <Text>{name} - {age} - {email}</Text>;
};

// Array destructuring
const [count, setCount] = useState(0); // count = value, setCount = setter
```

### **3. Template Literals:**
```jsx
// Old way
const message = "Hello " + name + "! You are " + age + " years old.";

// New way (Template Literals)
const message = `Hello ${name}! You are ${age} years old.`;

// In JSX
<Text>{`Welcome ${user.name}!`}</Text>
<Text>{`Total: ${price * quantity}`}</Text>
```

### **4. Spread Operator (...):**
```jsx
// Arrays
const numbers = [1, 2, 3];
const moreNumbers = [...numbers, 4, 5]; // [1, 2, 3, 4, 5]

// Objects
const user = { name: 'John', age: 25 };
const updatedUser = { ...user, age: 26 }; // { name: 'John', age: 26 }

// In State updates
setItems([...items, newItem]); // Add item to array
setUser({ ...user, age: 26 }); // Update object property
```

### **5. Async/Await:**
```jsx
// For API calls
const loadData = async () => {
  try {
    setLoading(true);
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();
    setData(data);
  } catch (error) {
    console.error('Error:', error);
    Alert.alert('Error', 'Failed to load data');
  } finally {
    setLoading(false);
  }
};

// Call in useEffect
useEffect(() => {
  loadData();
}, []);
```

---

## 📱 **REACT NATIVE SPECIFICS**

### **1. Core Components:**
React Native tidak pakai HTML tags, tapi components khusus:

| Web HTML | React Native | Fungsi |
|----------|--------------|--------|
| `<div>` | `<View>` | Container |
| `<p>`, `<span>`, `<h1>` | `<Text>` | Text display |
| `<input>` | `<TextInput>` | Input field |
| `<button>` | `<TouchableOpacity>` + `<Text>` | Button |
| `<img>` | `<Image>` | Gambar |
| `<ul>`, `<ol>` | `<FlatList>`, `<ScrollView>` | Lists |

### **2. Basic Components Example:**
```jsx
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  StyleSheet
} from 'react-native';

const BasicExample = () => {
  const [text, setText] = useState('');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My App</Text>
      </View>
      
      <TextInput
        style={styles.input}
        placeholder="Type here..."
        value={text}
        onChangeText={setText}
      />
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => Alert.alert('Pressed!', `You typed: ${text}`)}
      >
        <Text style={styles.buttonText}>Press Me</Text>
      </TouchableOpacity>
      
      <Image 
        source={{uri: 'https://picsum.photos/200/200'}}
        style={styles.image}
      />
    </ScrollView>
  );
};
```

### **3. Styling dengan StyleSheet:**
```jsx
// ❌ CSS (tidak bisa di React Native)
.container {
  background-color: blue;
  padding: 20px;
  margin-top: 10px;
}

// ✅ React Native StyleSheet
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'blue',  // camelCase!
    padding: 20,              // number, bukan string
    marginTop: 10,           // camelCase!
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  }
});

// Usage
<View style={styles.container}>
  <Text style={styles.title}>Hello</Text>
</View>

// Combine styles
<Text style={[styles.title, {color: 'red'}]}>Red Title</Text>
```

### **4. Flexbox Layout (Super Penting!):**
React Native menggunakan Flexbox untuk layout:

```jsx
const FlexExample = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text>Header</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.sidebar}>
          <Text>Sidebar</Text>
        </View>
        <View style={styles.main}>
          <Text>Main Content</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,              // Take all available space
    flexDirection: 'column', // vertical (default)
  },
  header: {
    height: 60,
    backgroundColor: 'lightblue',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    flexDirection: 'row',   // horizontal
  },
  sidebar: {
    width: 100,
    backgroundColor: 'lightgray',
  },
  main: {
    flex: 1,              // Take remaining space
    backgroundColor: 'white',
    justifyContent: 'center', // vertical center
    alignItems: 'center',     // horizontal center
  }
});
```

**Flexbox Properties:**
- `flex: 1` = Ambil semua space tersedia
- `flexDirection: 'row'` = Horizontal, `'column'` = Vertical (default)
- `justifyContent` = Main axis alignment (`'center'`, `'flex-start'`, `'flex-end'`, `'space-between'`)
- `alignItems` = Cross axis alignment (`'center'`, `'flex-start'`, `'flex-end'`, `'stretch'`)

### **5. Event Handling:**
```jsx
const EventExample = () => {
  const [text, setText] = useState('');
  const [count, setCount] = useState(0);

  return (
    <View>
      {/* Text Input Events */}
      <TextInput
        value={text}
        onChangeText={setText}           // Every character change
        onFocus={() => console.log('Input focused')}
        onBlur={() => console.log('Input unfocused')}
        placeholder="Type something..."
      />

      {/* Touch Events */}
      <TouchableOpacity
        onPress={() => setCount(count + 1)}        // Normal tap
        onLongPress={() => Alert.alert('Long pressed!')} // Long press
        onPressIn={() => console.log('Touch start')}
        onPressOut={() => console.log('Touch end')}
        style={styles.button}
      >
        <Text>Pressed {count} times</Text>
      </TouchableOpacity>

      {/* Conditional Rendering */}
      {count > 5 && <Text>Wow, you pressed many times!</Text>}
    </View>
  );
};
```

---

## 📁 **PROJECT STRUCTURE OVERVIEW**

```
belajarapp/
├── app/                     # 🏠 Semua halaman/screens
│   ├── (auth)/             # 📝 Auth pages (login, register)
│   │   ├── _layout.jsx     # Layout untuk auth screens
│   │   ├── login.jsx       # Login screen
│   │   ├── register.jsx    # Register screen
│   │   └── forgot-password.jsx
│   ├── (tabs)/             # 📊 Main app dengan tabs
│   │   ├── _layout.jsx     # Tab navigation layout
│   │   └── index.jsx       # Home tab
│   ├── _layout.jsx         # 🎨 Root layout
│   └── index.jsx           # 🚀 Entry point
├── components/             # 🧱 Reusable components
│   ├── auth/              # 🔐 Auth-specific components
│   ├── ui/                # 🎨 General UI components
│   └── illustrations/     # 🎭 SVG illustrations
├── constants/             # 📋 Constants (Colors, sizes)
├── contexts/              # 🔄 Global state management
├── services/              # 🌐 API/Firebase connections
├── utils/                 # 🛠️ Helper functions
└── assets/                # 🖼️ Images, icons, fonts
```

### **Expo Router - File-based Routing:**
- Setiap file `.jsx` di `app/` = 1 halaman
- Nama file = URL path
- Folder `()` = route groups (tidak muncul di URL)

**Contoh routing:**
```
app/index.jsx           → URL: "/"
app/profile.jsx         → URL: "/profile"  
app/(auth)/login.jsx    → URL: "/login"
app/(tabs)/index.jsx    → URL: "/tabs" 
```

### **File `_layout.jsx`:**
Mengatur struktur navigasi untuk folder/grup tertentu:

```jsx
// app/_layout.jsx - Root layout
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
```

---

## 🚀 **CLI COMMANDS & DEVELOPMENT**

### **Development Commands:**
```bash
# Start development server
npm start
# atau
expo start

# Start dengan clear cache (jika error)
npm run clear

# Start untuk platform tertentu
npm run android    # Android emulator
npm run ios        # iOS simulator (macOS only)
npm run web        # Web browser
```

### **Testing di Device:**

**Option 1: Expo Go App (Recommended)**
```bash
# 1. Install "Expo Go" app di HP Android/iOS
# 2. Jalankan: npm start
# 3. Scan QR code dengan Expo Go app
```

**Option 2: Emulator**
```bash
# Android (perlu Android Studio)
npm run android

# iOS (perlu Xcode, macOS only)
npm run ios
```

### **Keyboard Shortcuts (development server):**
```
a - Open Android
i - Open iOS  
w - Open web
r - Reload app
d - Open developer menu
c - Clear cache
```

### **Package Management:**
```bash
# Install package
npm install package-name
expo install package-name  # Expo-compatible version

# Remove package
npm uninstall package-name

# Update all packages
npm update
```

---

## 🧱 **CARA MEMBUAT KOMPONEN BARU**

### **Step 1: Buat File Component**

```jsx
// components/ui/UserCard.jsx
import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "../../constants/Colors";

const UserCard = ({ 
  name, 
  email, 
  avatar, 
  onPress,
  isOnline = false 
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: avatar }} style={styles.avatar} />
      
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>
      
      <View style={[
        styles.status, 
        { backgroundColor: isOnline ? Colors.success : Colors.gray400 }
      ]} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: Colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray900,
  },
  email: {
    fontSize: 14,
    color: Colors.gray600,
    marginTop: 2,
  },
  status: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default UserCard;
```

### **Step 2: Export dari Index (Optional tapi Good Practice)**

```jsx
// components/ui/index.js
export { default as Button } from './Button';
export { default as Input } from './Input';
export { default as LoadingSpinner } from './LoadingSpinner';
export { default as UserCard } from './UserCard';
```

### **Step 3: Gunakan Component**

```jsx
// Di screen manapun
import UserCard from '../components/ui/UserCard';
// atau dengan named export:
// import { UserCard } from '../components/ui';

const UserListScreen = () => {
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', avatar: 'https://picsum.photos/100/100?random=1', isOnline: true },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', avatar: 'https://picsum.photos/100/100?random=2', isOnline: false },
  ];

  const handleUserPress = (user) => {
    Alert.alert('User Pressed', `You tapped on ${user.name}`);
  };

  return (
    <ScrollView style={styles.container}>
      {users.map(user => (
        <UserCard
          key={user.id}
          name={user.name}
          email={user.email}
          avatar={user.avatar}
          isOnline={user.isOnline}
          onPress={() => handleUserPress(user)}
        />
      ))}
    </ScrollView>
  );
};
```

---

## 📱 **CARA MEMBUAT SCREEN BARU**

### **Step 1: Buat File Screen**

Contoh membuat screen monitoring system:

```jsx
// app/monitoring.jsx
import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  RefreshControl,
  Alert 
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import Button from "../components/ui/Button";
import { Colors } from "../constants/Colors";

export default function MonitoringScreen() {
  const { currentUser } = useAuth();
  const [data, setData] = useState({
    cpu: 0,
    memory: 0,
    uptime: 0,
    status: 'unknown'
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMonitoringData();
    
    // Auto refresh every 30 seconds
    const interval = setInterval(loadMonitoringData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadMonitoringData = async () => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      setData({
        cpu: Math.floor(Math.random() * 100),
        memory: Math.floor(Math.random() * 100),
        uptime: 99.9,
        status: 'healthy'
      });
    } catch (error) {
      console.error('Failed to load monitoring data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMonitoringData();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return Colors.success;
      case 'warning': return Colors.warning;
      case 'error': return Colors.error;
      default: return Colors.gray500;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading monitoring data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>System Monitoring</Text>
          <Text style={styles.subtitle}>
            User: {currentUser?.email}
          </Text>
        </View>

        {/* Status Overview */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(data.status) }]}>
            <Text style={styles.statusText}>
              {data.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Metrics */}
        <View style={styles.metricsContainer}>
          <MetricCard 
            title="CPU Usage" 
            value={`${data.cpu}%`}
            icon="💻"
            status={data.cpu > 80 ? 'error' : data.cpu > 60 ? 'warning' : 'good'}
          />
          
          <MetricCard 
            title="Memory Usage" 
            value={`${data.memory}%`}
            icon="💾"
            status={data.memory > 80 ? 'error' : data.memory > 60 ? 'warning' : 'good'}
          />
          
          <MetricCard 
            title="Uptime" 
            value={`${data.uptime}%`}
            icon="⏱️"
            status="good"
          />
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <Button 
            title="Refresh Data" 
            onPress={loadMonitoringData}
            style={styles.refreshButton}
          />
          
          <Button 
            title="View Logs" 
            onPress={() => Alert.alert('Logs', 'Logs feature coming soon!')}
            variant="outline"
            style={styles.logsButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper Component
const MetricCard = ({ title, value, icon, status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'good': return Colors.success;
      case 'warning': return Colors.warning;
      case 'error': return Colors.error;
      default: return Colors.primary;
    }
  };

  return (
    <View style={[styles.metricCard, { borderLeftColor: getStatusColor() }]}>
      <View style={styles.metricHeader}>
        <Text style={styles.metricIcon}>{icon}</Text>
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <Text style={[styles.metricValue, { color: getStatusColor() }]}>
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.gray600,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 60, // Account for status bar
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.gray900,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray600,
    marginTop: 4,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  metricsContainer: {
    paddingHorizontal: 24,
  },
  metricCard: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    marginBottom: 12,
    shadowColor: Colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  metricTitle: {
    fontSize: 14,
    color: Colors.gray600,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  actionsContainer: {
    padding: 24,
  },
  refreshButton: {
    marginBottom: 12,
  },
  logsButton: {
    marginBottom: 12,
  },
});
```

### **Step 2: Tambahkan ke Navigation (Optional)**

Jika ingin masuk ke tab navigation:

```jsx
// app/(tabs)/_layout.jsx
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: "Home",
          tabBarIcon: () => <Text>🏠</Text>
        }} 
      />
      <Tabs.Screen 
        name="monitoring" 
        options={{ 
          title: "Monitor",
          tabBarIcon: () => <Text>📊</Text>
        }} 
      />
    </Tabs>
  );
}
```

**Dan buat file:** `app/(tabs)/monitoring.jsx` (copy code di atas)

### **Step 3: Navigation antar Screen**

```jsx
// Navigasi programmatic
import { useRouter } from 'expo-router';

const SomeComponent = () => {
  const router = useRouter();

  const goToMonitoring = () => {
    router.push('/monitoring');
  };

  const goBack = () => {
    router.back();
  };

  return (
    <View>
      <Button title="Go to Monitoring" onPress={goToMonitoring} />
      <Button title="Go Back" onPress={goBack} />
    </View>
  );
};
```

---

## 🔧 **COMMON PATTERNS & BEST PRACTICES**

### **1. Conditional Rendering:**
```jsx
const MyComponent = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // Pattern 1: && operator (simple conditions)
  return (
    <View>
      {loading && <Text>Loading...</Text>}
      {error && <Text style={{color: 'red'}}>Error: {error}</Text>}
      {user && <Text>Welcome {user.name}!</Text>}
    </View>
  );

  // Pattern 2: Ternary operator (if-else)
  return (
    <View>
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage error={error} />
      ) : user ? (
        <UserProfile user={user} />
      ) : (
        <LoginPrompt />
      )}
    </View>
  );

  // Pattern 3: Function (complex logic)
  const renderContent = () => {
    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage error={error} />;
    if (user) return <UserProfile user={user} />;
    return <LoginPrompt />;
  };

  return <View>{renderContent()}</View>;
};
```

### **2. Lists dengan FlatList:**
```jsx
const TodoList = () => {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn React Native', completed: false },
    { id: 2, text: 'Build awesome app', completed: false },
    { id: 3, text: 'Deploy to app store', completed: false },
  ]);

  const toggleTodo = (id) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const renderTodoItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.todoItem}
      onPress={() => toggleTodo(item.id)}
    >
      <Text style={[
        styles.todoText, 
        item.completed && styles.completedText
      ]}>
        {item.text}
      </Text>
      <Text style={styles.checkbox}>
        {item.completed ? '✅' : '⬜'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={todos}
      renderItem={renderTodoItem}
      keyExtractor={(item) => item.id.toString()}
      style={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
    padding: 16,
  },
  todoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 8,
    borderRadius: 8,
  },
  todoText: {
    flex: 1,
    fontSize: 16,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#gray',
  },
  checkbox: {
    fontSize: 20,
  },
});
```

### **3. Forms & Input Handling:**
```jsx
const ContactForm = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!form.email.includes('@')) {
      newErrors.email = 'Invalid email address';
    }
    
    if (!form.message.trim()) {
      newErrors.message = 'Message is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert('Success', 'Message sent successfully!');
      
      // Reset form
      setForm({ name: '', email: '', message: '' });
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Contact Us</Text>
      
      <Input
        label="Name"
        placeholder="Your name"
        value={form.name}
        onChangeText={(value) => handleInputChange('name', value)}
        error={errors.name}
      />
      
      <Input
        label="Email"
        placeholder="your@email.com"
        value={form.email}
        onChangeText={(value) => handleInputChange('email', value)}
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
      />
      
      <Input
        label="Message"
        placeholder="Your message..."
        value={form.message}
        onChangeText={(value) => handleInputChange('message', value)}
        multiline
        numberOfLines={4}
        error={errors.message}
      />
      
      <Button 
        title={submitting ? "Sending..." : "Send Message"}
        onPress={handleSubmit}
        disabled={submitting}
        style={styles.submitButton}
      />
    </ScrollView>
  );
};
```

### **4. Context Usage Pattern:**
```jsx
// contexts/AppContext.jsx
import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    setNotifications(prev => [...prev, {
      id: Date.now(),
      ...notification
    }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const value = {
    theme,
    notifications,
    addNotification,
    removeNotification,
    toggleTheme,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Usage in any component
const SomeComponent = () => {
  const { theme, addNotification, toggleTheme } = useApp();

  const handleSuccess = () => {
    addNotification({
      type: 'success',
      message: 'Operation completed successfully!'
    });
  };

  return (
    <View style={theme === 'dark' ? styles.darkContainer : styles.lightContainer}>
      <Button title="Toggle Theme" onPress={toggleTheme} />
      <Button title="Show Success" onPress={handleSuccess} />
    </View>
  );
};
```

---

## 🐛 **DEBUGGING & TROUBLESHOOTING**

### **1. Console.log - Your Best Friend:**
```jsx
const DebuggingExample = () => {
  const [count, setCount] = useState(0);
  const [user, setUser] = useState(null);

  // Debug component lifecycle
  console.log('Component rendered, count:', count);

  // Debug state changes
  useEffect(() => {
    console.log('Count changed to:', count);
  }, [count]);

  // Debug user object
  useEffect(() => {
    console.log('User state:', user);
    if (user) {
      console.log('User name:', user.name);
      console.log('User email:', user.email);
    }
  }, [user]);

  const handlePress = () => {
    console.log('Button pressed! Current count:', count);
    console.log('About to increment...');
    
    setCount(prev => {
      console.log('Previous count:', prev);
      console.log('New count will be:', prev + 1);
      return prev + 1;
    });
    
    console.log('setCount called (but state not updated yet)');
  };

  const loadUser = async () => {
    console.log('Loading user...');
    try {
      const userData = await fetchUser(); // Simulate API
      console.log('User data received:', userData);
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
  };

  return (
    <View>
      <Text>Count: {count}</Text>
      <Button title="Increment" onPress={handlePress} />
      <Button title="Load User" onPress={loadUser} />
    </View>
  );
};
```

### **2. React DevTools:**
```bash
# Development setup for debugging:
# 1. Start expo: npm start
# 2. Press 'd' untuk development menu
# 3. Enable "Debug with Chrome"
# 4. Install React DevTools browser extension
# 5. Open Chrome DevTools → React tab
```

### **3. Common Mistakes & Solutions:**

**❌ State tidak update langsung:**
```jsx
// WRONG expectation
const handlePress = () => {
  setCount(count + 1);
  console.log(count); // Still old value!
  Alert.alert('Count', count.toString()); // Still old value!
};

// ✅ CORRECT understanding
const handlePress = () => {
  setCount(prev => prev + 1);
  // State akan update pada render berikutnya
};

// Jika perlu lihat new value:
useEffect(() => {
  console.log('New count:', count);
  if (count > 0) {
    Alert.alert('Count updated', count.toString());
  }
}, [count]);
```

**❌ Mutating state directly:**
```jsx
// WRONG - Modifying state directly
const [items, setItems] = useState([1, 2, 3]);
const [user, setUser] = useState({name: 'John', age: 25});

// Don't do this:
items.push(4); // State won't update!
user.age = 26; // State won't update!

// ✅ CORRECT - Create new objects/arrays
setItems([...items, 4]); // Spread operator
setItems(items.concat(4)); // Concat method
setUser({...user, age: 26}); // Spread operator
setUser(prev => ({...prev, age: 26})); // Function form
```

**❌ Missing dependencies in useEffect:**
```jsx
// WRONG - Missing dependencies
const [userId, setUserId] = useState(1);
const [userData, setUserData] = useState(null);

useEffect(() => {
  fetchUserData(userId); // Uses userId but not in deps
}, []); // Empty deps = only run once

// ✅ CORRECT - Include all dependencies
useEffect(() => {
  fetchUserData(userId);
}, [userId]); // Run when userId changes
```

**❌ Infinite re-renders:**
```jsx
// WRONG - Object/array in useEffect deps
const [user, setUser] = useState({name: 'John'});

useEffect(() => {
  console.log('User changed');
}, [user]); // Object reference changes every render!

// ✅ CORRECT - Watch specific properties
useEffect(() => {
  console.log('User name changed');
}, [user.name]); // Only when name changes

// Or use JSON.stringify for deep comparison (not recommended for large objects)
useEffect(() => {
  console.log('User object changed');
}, [JSON.stringify(user)]);
```

### **4. Error Boundaries:**
```jsx
// ErrorBoundary.jsx
import React from 'react';
import { View, Text, Button } from 'react-native';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error);
    console.error('Error info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>Something went wrong!</Text>
          <Text style={{ textAlign: 'center', marginBottom: 20 }}>
            {this.state.error?.message}
          </Text>
          <Button 
            title="Try Again"
            onPress={() => this.setState({ hasError: false, error: null })}
          />
        </View>
      );
    }

    return this.props.children;
  }
}

// Usage in App
const App = () => {
  return (
    <ErrorBoundary>
      <MyApp />
    </ErrorBoundary>
  );
};
```

### **5. Common CLI Troubleshooting:**
```bash
# Clear cache dan restart
expo start --clear

# Reset metro bundler
npx react-native start --reset-cache

# Delete node_modules dan reinstall
rm -rf node_modules
npm install

# Check for issues
expo doctor

# Clear iOS build (macOS only)
cd ios && rm -rf build && cd ..

# Clear Android build
cd android && ./gradlew clean && cd ..

# Reset git if needed
git clean -fdx
git reset --hard HEAD
```

---

## 🛣️ **LEARNING PATH UNTUK PEMULA**

### **Phase 1: Foundation (Week 1-2)**
**Goal:** Understand basic React concepts

✅ **Learn:**
- JSX syntax dan rules
- Function components
- Props passing
- useState hook
- Basic event handling
- Conditional rendering

📝 **Practice Projects:**
- Simple counter app
- Hello world dengan props
- Toggle visibility component

```jsx
// Week 1 Challenge: Build this simple counter
const Counter = () => {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  return (
    <View style={{ padding: 20 }}>
      <TextInput 
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
      />
      
      {name && <Text>Hello {name}!</Text>}
      
      <Text style={{ fontSize: 24, textAlign: 'center' }}>
        Count: {count}
      </Text>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }}>
        <Button title="-" onPress={() => setCount(count - 1)} />
        <Button title="Reset" onPress={() => setCount(0)} />
        <Button title="+" onPress={() => setCount(count + 1)} />
      </View>
      
      {count > 10 && <Text style={{ color: 'red', textAlign: 'center' }}>High count!</Text>}
    </View>
  );
};
```

### **Phase 2: React Native Specifics (Week 3-4)**
**Goal:** Master React Native components and styling

✅ **Learn:**
- Core components (View, Text, TextInput, TouchableOpacity, Image)
- StyleSheet dan Flexbox layout
- FlatList untuk lists
- useEffect hook
- Navigation basics

📝 **Practice Projects:**
- Todo list app
- Contact list dengan search
- Simple calculator

```jsx
// Week 3 Challenge: Build this todo app
const TodoApp = () => {
  const [todos, setTodos] = useState([]);
  const [inputText, setInputText] = useState('');

  const addTodo = () => {
    if (inputText.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: inputText,
        completed: false
      }]);
      setInputText('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? {...todo, completed: !todo.completed} : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <View style={{ flexDirection: 'row', marginBottom: 20 }}>
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Add a todo..."
          style={{ flex: 1, borderWidth: 1, padding: 10 }}
        />
        <Button title="Add" onPress={addTodo} />
      </View>

      <FlatList
        data={todos}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            padding: 10,
            backgroundColor: item.completed ? '#f0f0f0' : 'white'
          }}>
            <TouchableOpacity onPress={() => toggleTodo(item.id)}>
              <Text style={{ fontSize: 20 }}>
                {item.completed ? '✅' : '⬜'}
              </Text>
            </TouchableOpacity>
            
            <Text style={{ 
              flex: 1, 
              marginLeft: 10,
              textDecorationLine: item.completed ? 'line-through' : 'none'
            }}>
              {item.text}
            </Text>
            
            <TouchableOpacity onPress={() => deleteTodo(item.id)}>
              <Text style={{ color: 'red', fontSize: 18 }}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};
```

### **Phase 3: Intermediate Concepts (Week 5-6)**
**Goal:** Handle forms, API calls, and global state

✅ **Learn:**
- Form handling & validation
- API calls dengan fetch/axios
- Context API untuk global state
- AsyncStorage untuk local data
- Error handling

📝 **Practice Projects:**
- Weather app dengan API
- Notes app dengan local storage
- User profile dengan forms

### **Phase 4: Advanced Features (Week 7-8)**
**Goal:** Firebase integration dan real-world features

✅ **Learn:**
- Firebase Authentication
- Firestore database
- File/image handling
- Push notifications
- Navigation dengan Expo Router

📝 **Practice Projects:**
- Chat app dengan Firebase
- Photo sharing app
- E-commerce app mockup

### **Phase 5: Polish & Deploy (Week 9+)**
**Goal:** Build production-ready apps

✅ **Learn:**
- Performance optimization
- Testing dengan Jest
- Build & deployment dengan EAS
- App store submission
- Analytics & monitoring

📝 **Practice Projects:**
- Full social media app
- Business/productivity app
- Portfolio app

---

## 🎯 **ANALOGI UNTUK ENGINEER**

Sebagai engineer embedded/firmware, concepts React Native mirip dengan:

| Embedded/Firmware | React Native | Penjelasan |
|-------------------|--------------|------------|
| `main()` function | `App` component | Entry point aplikasi |
| Hardware modules (UART, SPI, I2C) | Components | Building blocks yang reusable |
| Global variables | Context/State | Data yang shared across system |
| Function parameters | Props | Data yang dipassing antar modules |
| Hardware interrupts | Events (onPress, onChangeText) | Response terhadap user input |
| Memory management | State management | Handle perubahan data |
| HAL (Hardware Abstraction) | Native modules | Platform-specific features |
| RTOS tasks | useEffect | Background operations |
| printf/UART debug | console.log | Output untuk debugging |
| Firmware OTA updates | Expo OTA | Deploy code updates |
| Watchdog timer | Error boundaries | Handle system crashes |
| Peripheral drivers | Services (API calls) | External communication |
| Configuration files | Constants, Config | System settings |
| Modular code structure | Component hierarchy | Organized, maintainable code |

### **Development Workflow Comparison:**

| Embedded | React Native |
|----------|--------------|
| 1. Write C/C++ code | 1. Write JSX/JavaScript |
| 2. Compile firmware | 2. Metro bundler compiles |
| 3. Flash to device | 3. Push to Expo Go app |
| 4. Serial monitor debug | 4. Chrome DevTools debug |
| 5. Hardware debugging (JTAG) | 5. React DevTools |
| 6. Production firmware build | 6. EAS build for stores |

---

## 🎊 **SELAMAT!**

Sekarang kamu punya roadmap lengkap untuk belajar React Native dari nol! 🚀

**🔑 Key Takeaways:**
- **React** = Library untuk UI dengan components
- **JSX** = HTML-like syntax di JavaScript  
- **State** = Data yang berubah dan update UI otomatis
- **Props** = Data dari parent ke child component
- **useEffect** = Side effects (API calls, timers, etc)
- **Flexbox** = Layout system untuk React Native

**🛣️ Recommended Starting Steps:**
1. **Setup project:** `npm install` → `npm start` → scan QR code
2. **Week 1:** Build simple counter dengan useState
3. **Week 2:** Add TextInput dan conditional rendering  
4. **Week 3:** Build todo list dengan FlatList
5. **Week 4:** Add useEffect dan mock API calls
6. **Keep building projects!** 💪

**📚 Next Learning Resources:**
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [React Hooks Guide](https://reactjs.org/docs/hooks-intro.html)

**Remember:** Programming is like embedded systems - start simple, test frequently, debug systematically, and build incrementally! 

Good luck dengan React Native journey kamu! 🎉