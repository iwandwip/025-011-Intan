# Authentication & Persistence Troubleshooting Guide

Dokumentasi lengkap untuk mengatasi masalah authentication dan data persistence di React Native + Firebase.

## 🚨 Masalah Umum Authentication

### 1. **Auth Initialization Timeout**
```
WARN  Auth initialization timeout, proceeding anyway
```

**Penyebab:**
- Firebase Auth membutuhkan waktu lebih lama untuk inisialisasi
- Network latency atau connection issues
- Timeout terlalu pendek (default 5 detik)

**Solusi:**
```javascript
// contexts/AuthContext.jsx
const timeoutId = setTimeout(() => {
  if (mounted && loading && !authInitialized) {
    console.warn("Auth initialization timeout, proceeding anyway");
    // ❌ JANGAN: setCurrentUser(null);
    // ✅ LAKUKAN: Preserve user state
    setLoading(false);
    setAuthInitialized(true);
  }
}, 10000); // Increase to 10 seconds
```

### 2. **Data Hilang Setelah App Restart**
**Penyebab:**
- Tidak check existing authenticated user
- onAuthStateChanged listener timeout
- User di-reset saat error

**Solusi:**
```javascript
const initializeAuth = async () => {
  if (!auth) return;

  try {
    // ✅ Check existing user DULU sebelum wait listener
    const currentUser = auth.currentUser;
    if (currentUser && mounted) {
      console.log("Found existing authenticated user:", currentUser.email);
      setCurrentUser(currentUser);
      await loadUserProfile(currentUser);
      setLoading(false);
      setAuthInitialized(true);
    }

    // Baru setup listener untuk future changes
    unsubscribe = onAuthStateChanged(auth, callback);
  } catch (error) {
    // ❌ JANGAN: Clear user on error
    // ✅ LAKUKAN: Just mark as initialized
    setLoading(false);
    setAuthInitialized(true);
  }
};
```

### 3. **Profile Loading Gagal**
**Penyebab:**
- Network issues saat load profile
- Firestore connection timeout
- Single attempt tanpa retry

**Solusi:**
```javascript
const loadUserProfile = async (user, retryCount = 0) => {
  if (!user) {
    setUserProfile(null);
    return;
  }

  try {
    const result = await getUserProfile(user.uid);
    if (result.success) {
      setUserProfile(result.profile);
    } else {
      // ✅ Retry mechanism
      if (retryCount === 0) {
        console.log("Retrying profile load in 2 seconds...");
        setTimeout(() => loadUserProfile(user, 1), 2000);
      } else {
        setUserProfile(null);
      }
    }
  } catch (error) {
    // ✅ Retry on network error
    if (retryCount === 0) {
      setTimeout(() => loadUserProfile(user, 1), 2000);
    } else {
      setUserProfile(null);
    }
  }
};
```

## 🔧 Best Practices

### 1. **Robust Authentication Context**
```javascript
// contexts/AuthContext.jsx
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    let unsubscribe = null;
    let mounted = true;

    const initializeAuth = async () => {
      // Check existing user first
      const currentUser = auth.currentUser;
      if (currentUser && mounted) {
        setCurrentUser(currentUser);
        await loadUserProfile(currentUser);
        setLoading(false);
        setAuthInitialized(true);
      }

      // Setup listener
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (mounted) {
          setCurrentUser(user);
          await loadUserProfile(user);
          setLoading(false);
          setAuthInitialized(true);
        }
      });
    };

    // Extended timeout with user preservation
    const timeoutId = setTimeout(() => {
      if (mounted && loading && !authInitialized) {
        setLoading(false);
        setAuthInitialized(true);
      }
    }, 10000);

    initializeAuth();

    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);
};
```

### 2. **Firebase Config Optimization**
```javascript
// services/firebase.js
let app;
let auth;
let db;

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  // ✅ Proper auth initialization with persistence
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
  } catch (error) {
    if (error.code === 'auth/already-initialized') {
      auth = getAuth(app);
    } else {
      console.warn('Auth initialization error:', error);
      auth = getAuth(app);
    }
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}
```

### 3. **Loading State Management**
```javascript
// app/index.jsx
export default function Index() {
  const { currentUser, loading, authInitialized, userProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // ✅ Wait for both auth AND profile
    if (authInitialized && !loading) {
      if (currentUser && userProfile) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(auth)/login");
      }
    }
  }, [currentUser, loading, authInitialized, userProfile]);

  // ✅ Show loading while initializing
  if (!authInitialized || loading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner text="Memuat..." />
      </View>
    );
  }
};
```

## 🐛 Debugging Checklist

### Saat User Logout Otomatis:
1. ✅ Check timeout duration (minimum 10 detik)
2. ✅ Pastikan tidak ada `setCurrentUser(null)` di error handler
3. ✅ Verify Firebase persistence config
4. ✅ Check network connectivity
5. ✅ Look for Firebase quota limits

### Saat Data Hilang:
1. ✅ Check `auth.currentUser` immediately on app start
2. ✅ Verify profile loading retry mechanism
3. ✅ Check AsyncStorage persistence
4. ✅ Verify Firebase rules allow read access
5. ✅ Check console for profile loading errors

### Saat Loading Terlalu Lama:
1. ✅ Reduce timeout untuk faster fallback
2. ✅ Implement skeleton screens
3. ✅ Check Firebase performance
4. ✅ Optimize profile loading query
5. ✅ Add offline detection

## 🔍 Debugging Tools

### Console Logs untuk Tracking:
```javascript
// Tambahkan logs ini untuk debugging
console.log("Auth state changed:", user ? `User: ${user.email}` : "Logged out");
console.log("Found existing authenticated user:", currentUser.email);
console.log("User profile loaded successfully");
console.log("Retrying profile load in 2 seconds...");
```

### Network Debugging:
```javascript
// Check Firebase connection
import { connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';

// Only in development
if (__DEV__) {
  // connectAuthEmulator(auth, 'http://localhost:9099');
  // connectFirestoreEmulator(db, 'localhost', 8080);
}
```

## 📱 Platform-Specific Issues

### Android:
- Check network security config
- Verify app permissions
- Check ProGuard rules untuk Firebase

### iOS:
- Verify Firebase iOS config
- Check Info.plist permissions
- Verify URL schemes

### Expo:
- Check app.json config
- Verify Firebase web config
- Check Metro bundler cache

## 🚀 Performance Optimization

### 1. **Lazy Loading**
```javascript
// Delay non-critical data loading
useEffect(() => {
  if (currentUser && userProfile) {
    // Load additional data after auth is stable
    setTimeout(() => {
      loadAdditionalUserData();
    }, 1000);
  }
}, [currentUser, userProfile]);
```

### 2. **Caching Strategy**
```javascript
// Cache user profile in AsyncStorage
const cacheUserProfile = async (profile) => {
  try {
    await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
  } catch (error) {
    console.error('Error caching profile:', error);
  }
};

const getCachedProfile = async () => {
  try {
    const cached = await AsyncStorage.getItem('userProfile');
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    return null;
  }
};
```

### 3. **Network Optimization**
```javascript
// Batch Firebase reads
const loadUserData = async (userId) => {
  const [profileResult, settingsResult] = await Promise.all([
    getUserProfile(userId),
    getUserSettings(userId)
  ]);
  
  return { profileResult, settingsResult };
};
```

## 📋 Quick Fix Checklist

Ketika menghadapi masalah authentication:

- [ ] Increase timeout ke 10+ detik
- [ ] Remove `setCurrentUser(null)` dari error handlers
- [ ] Add `auth.currentUser` check di initialization
- [ ] Implement retry mechanism untuk profile loading
- [ ] Verify Firebase persistence config
- [ ] Check network connectivity
- [ ] Clear Metro cache: `npx expo start -c`
- [ ] Restart aplikasi sepenuhnya
- [ ] Check Firebase console untuk errors
- [ ] Verify Firebase rules

## 📞 Emergency Recovery

Jika semua gagal:
1. Clear AsyncStorage: `AsyncStorage.clear()`
2. Clear Metro cache: `npx expo start -c`
3. Restart development server
4. Check Firebase project status
5. Verify internet connection
6. Re-login user manually

---

**💡 Tip:** Selalu test authentication flow dengan:
- App restart (close completely + reopen)
- Network interruption (airplane mode on/off)
- Background/foreground cycling
- Different devices dan network conditions