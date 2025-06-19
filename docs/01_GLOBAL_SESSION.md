# Global Session Management with ESP32
## Shared Hardware Resource Concept for Multi-User Applications

---

## 🎯 **Core Concept**

**Global Session Management** is a pattern for managing IoT hardware that is shared by multiple users in real-time applications. This concept is perfect for:

- **Shared IoT devices** (scales, printers, scanners, etc.)
- **Multi-user applications** with single hardware
- **Real-time coordination** between users
- **ESP32-based systems** that are easy to implement

---

## 🏗️ **Architecture Overview**

```
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│   User A    │    │                 │    │             │
│   App       │◄──►│  Global Session │◄──►│    ESP32    │
└─────────────┘    │   (Firestore)   │    │  Hardware   │
                   │                 │    │             │
┌─────────────┐    │                 │    └─────────────┘
│   User B    │    │                 │
│   App       │◄──►│                 │
└─────────────┘    └─────────────────┘
```

### **Key Components:**
1. **Global Session State** - Firestore collection for coordination
2. **Client Apps** - Listen to real-time state, handle business logic  
3. **ESP32 Hardware** - Physical device controller and data provider

---

## 📊 **Global Session State Structure**

### **Core State Document:**
```javascript
// Collection: globalSessions
// Document: hardwareDevice

{
  // Session Control
  isInUse: false,
  timeout: false,
  sessionType: "",           // "typeA", "typeB", etc
  currentUserId: "",
  currentUserName: "",
  startTime: null,
  lastActivity: null,
  
  // Session Data (varies by use case)
  inputParameters: {},       // User input from app
  outputData: {},           // Results from ESP32
  processingComplete: false,
  
  // Custom fields based on your needs
  customField1: "",
  customField2: 0,
}
```

---

## 🔄 **Flow Pattern**

### **1. Session Initiation (App Side)**
```javascript
// Check availability
const systemStatus = await getGlobalSession();
if (systemStatus.isInUse && !systemStatus.timeout) {
  showMessage("Hardware is being used by " + systemStatus.currentUserName);
  return;
}

// Start session
await startGlobalSession({
  sessionType: "processing",
  currentUserId: userId,
  currentUserName: userName,
  inputParameters: userInput,
  // Reset output fields
  outputData: {},
  processingComplete: false
});
```

### **2. Hardware Processing (ESP32 Side)**
```cpp
// Monitor session state
void checkGlobalSession() {
  if (sessionChanged && currentSession.isInUse) {
    
    // Start hardware operation based on sessionType
    switch(currentSession.sessionType) {
      case "processing":
        startProcessing(currentSession.inputParameters);
        break;
      // Add more types as needed
    }
  }
}

// Send results back
void sendResults() {
  // Update global state with results
  updateGlobalSession({
    "outputData": resultData,
    "processingComplete": true,
    "lastActivity": getCurrentTimestamp()
  });
}

// Auto cleanup on timeout
void handleTimeout() {
  if (isSessionExpired()) {
    resetGlobalSession();
  }
}
```

### **3. Result Processing (App Side)**
```javascript
// Listen for completion
useEffect(() => {
  const unsubscribe = subscribeToGlobalSession((doc) => {
    const data = doc.data();
    
    // Check if my session is complete
    if (data.currentUserId === myUserId && 
        data.processingComplete && 
        data.outputData) {
      
      // Process results
      handleResults(data.outputData);
      
      // Save to user profile/database
      saveUserData(data.outputData);
      
      // Clean up
      endGlobalSession();
    }
  });
  
  return unsubscribe;
}, []);
```

---

## 🛠️ **Implementation Steps**

### **Step 1: Setup Global Session Service**
```javascript
// services/globalSessionService.js

export const startGlobalSession = async (sessionData) => {
  const systemRef = doc(db, 'globalSessions/hardwareDevice');
  await updateDoc(systemRef, {
    isInUse: true,
    timeout: false,
    startTime: new Date(),
    lastActivity: new Date(),
    ...sessionData
  });
};

export const endGlobalSession = async () => {
  const systemRef = doc(db, 'globalSessions/hardwareDevice');
  await updateDoc(systemRef, {
    isInUse: false,
    timeout: false,
    sessionType: '',
    currentUserId: '',
    currentUserName: '',
    // Reset all custom fields
    outputData: {},
    processingComplete: false,
  });
};

export const subscribeToGlobalSession = (callback) => {
  const systemRef = doc(db, 'globalSessions/hardwareDevice');
  return onSnapshot(systemRef, callback);
};
```

### **Step 2: ESP32 Firebase Integration**
```cpp
#include <WiFi.h>
#include <FirebaseESP32.h>

// Firebase setup
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

void setupFirebase() {
  config.database_url = "your-project.firebaseio.com";
  config.api_key = "your-api-key";
  
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void listenToGlobalSession() {
  if (Firebase.RTDB.getJSON(&fbdo, "/globalSessions/hardwareDevice")) {
    // Parse JSON and handle session
    FirebaseJson json = fbdo.jsonObject();
    
    bool isInUse;
    json.get("isInUse", isInUse);
    
    if (isInUse) {
      String sessionType;
      json.get("sessionType", sessionType);
      
      // Handle different session types
      handleSessionType(sessionType);
    }
  }
}

void updateSessionData(String field, String value) {
  String path = "/globalSessions/hardwareDevice/" + field;
  Firebase.RTDB.setString(&fbdo, path.c_str(), value);
}
```

### **Step 3: Client App Integration**
```javascript
// Custom hook for global session
export const useGlobalSession = (userId) => {
  const [sessionStatus, setSessionStatus] = useState(null);
  
  useEffect(() => {
    const unsubscribe = subscribeToGlobalSession((doc) => {
      setSessionStatus(doc.data());
    });
    return unsubscribe;
  }, []);
  
  const canStartSession = () => {
    return !sessionStatus?.isInUse || sessionStatus?.timeout;
  };
  
  const isMySession = () => {
    return sessionStatus?.currentUserId === userId;
  };
  
  return {
    sessionStatus,
    canStartSession,
    isMySession,
    startSession: startGlobalSession,
    endSession: endGlobalSession
  };
};
```

---

## 💡 **Use Cases & Examples**

### **1. Smart Weighing Scale**
```javascript
// Session data
{
  sessionType: "weighing",
  inputParameters: {
    userAge: 25,
    userGender: "male"
  },
  outputData: {
    weight: 70.5,
    bmi: 22.1,
    healthStatus: "normal"
  }
}
```

### **2. 3D Printer Management**
```javascript
// Session data  
{
  sessionType: "printing",
  inputParameters: {
    fileName: "model.stl",
    material: "PLA",
    quality: "high"
  },
  outputData: {
    printTime: 7200,
    filamentUsed: 150,
    status: "completed"
  }
}
```

### **3. Lab Equipment**
```javascript
// Session data
{
  sessionType: "analysis",
  inputParameters: {
    sampleType: "water",
    testType: "pH"
  },
  outputData: {
    phLevel: 7.2,
    temperature: 25.5,
    quality: "good"
  }
}
```

---

## ✅ **Benefits**

### **For Hardware (ESP32):**
- ✅ **Simple implementation** - Just read/write Firebase
- ✅ **Autonomous operation** - Handle timeouts independently
- ✅ **No complex networking** - Firebase handles everything
- ✅ **Self-healing** - Auto cleanup on timeout

### **For Mobile Apps:**
- ✅ **Real-time coordination** - Know when hardware is available
- ✅ **No conflicts** - Built-in locking mechanism
- ✅ **Clean separation** - Hardware logic vs business logic
- ✅ **Scalable** - Easy to add more hardware units

### **For System:**
- ✅ **Cost effective** - Share expensive hardware
- ✅ **User friendly** - Clear status messages
- ✅ **Maintainable** - Clear architecture
- ✅ **Extensible** - Easy to add new session types

---

## ⚠️ **Important Considerations**

### **Security:**
- Use Firebase Security Rules to protect global session
- Validate session ownership before operations
- Implement rate limiting to prevent abuse

### **Error Handling:**
- Handle network disconnections gracefully
- Implement retry mechanisms
- Provide clear error messages to users

### **Performance:**
- Use Firebase onSnapshot for real-time updates
- Implement proper cleanup to prevent memory leaks
- Consider offline scenarios

---

## 🚀 **Getting Started**

1. **Setup Firebase project** with Realtime Database
2. **Create globalSessions collection** with initial document
3. **Implement ESP32 Firebase connection** and session monitoring
4. **Build client app** with real-time session management
5. **Test coordination** with multiple users
6. **Deploy** and monitor system

---

## 📝 **Sample Firebase Security Rules**
```javascript
{
  "rules": {
    "globalSessions": {
      ".read": "auth != null",
      "hardwareDevice": {
        ".write": "auth != null && (
          !data.exists() || 
          data.child('currentUserId').val() == auth.uid ||
          newData.child('currentUserId').val() == auth.uid
        )"
      }
    }
  }
}
```

---

**This pattern has been proven robust and easy to implement for various types of IoT applications!** 🎯