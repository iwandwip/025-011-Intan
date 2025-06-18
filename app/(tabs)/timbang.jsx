import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import DataSelectionModal from "../../components/ui/DataSelectionModal";
import WeighingResultModal from "../../components/ui/WeighingResultModal";
import WeighingControlModal from "../../components/ui/WeighingControlModal";
import {
  subscribeToSystemStatus,
  startWeighingSession,
  endGlobalSession,
  initializeSystemStatus,
  startWeighingFlow,
  confirmWeight,
  confirmHeight,
  cancelWeighingFlow,
} from "../../services/globalSessionService";
import { addMeasurement } from "../../services/dataService";
import { updateUserProfile } from "../../services/userService";
import {
  GLOBAL_SESSION_TYPES,
  getSessionStatusMessage,
  isSessionAvailable,
  isMySession,
} from "../../utils/globalStates";
import { Colors } from "../../constants/Colors";

export default function TimbangScreen() {
  const { userProfile } = useAuth();
  const router = useRouter();

  const [systemStatus, setSystemStatus] = useState(null);
  const [selectionModalVisible, setSelectionModalVisible] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // App-controlled weighing states
  const [weighingControlVisible, setWeighingControlVisible] = useState(false);
  const [currentWeighingStep, setCurrentWeighingStep] = useState('idle');

  useEffect(() => {
    initializeSystemStatus();
  }, []);

  useEffect(() => {
    if (!userProfile?.id) return;

    const unsubscribe = subscribeToSystemStatus((doc) => {
      if (doc.exists()) {
        const data = doc.data();
        console.log('=== System status updated ===');
        console.log('🕐 Timestamp:', new Date().toLocaleTimeString());
        console.log('👤 Current user ID:', userProfile.id);
        console.log('📋 Session type:', data.sessionType);
        console.log('👤 Current user in session:', data.currentUserId);
        console.log('🎮 App controlled:', data.appControlled);
        console.log('📍 Current step:', data.currentStep);
        console.log('🔄 Is in use:', data.isInUse);
        console.log('⚖️ Weighing Status:', data.weighingStatus);
        console.log('🎯 Weighing Event:', data.weighingEvent);
        console.log('🔍 Raw data keys:', Object.keys(data).filter(key => key.includes('weigh')));
        console.log('🔍 All keys:', Object.keys(data));
        
        // Highlight step changes
        if (data.currentStep && data.currentStep !== 'idle') {
          console.log('🚨 NON-IDLE STEP DETECTED:', data.currentStep);
          
          if (data.currentStep === 'processing') {
            console.log('⏳⏳⏳ PROCESSING STEP DETECTED ⏳⏳⏳');
          }
          
          if (data.measurementComplete) {
            console.log('✅✅✅ MEASUREMENT COMPLETE DETECTED ✅✅✅');
          }
        }
        
        setSystemStatus(data);

        // Handle event-driven weighing
        if (
          data.sessionType === GLOBAL_SESSION_TYPES.WEIGHING &&
          data.currentUserId === userProfile.id
        ) {
          console.log('✅ Event-driven weighing session detected');
          console.log('  - Weighing status:', data.weighingStatus);
          console.log('  - Current step:', data.currentStep);
          
          if (data.weighingStatus) {
            console.log('🎯 Processing weighing status:', data.weighingStatus);
            handleEventDrivenWeighing(data);
          } else if (data.currentStep === 'weighing') {
            console.log('🎯 Fallback: currentStep is weighing, treating as weighing status');
            handleEventDrivenWeighing({...data, weighingStatus: 'weighing'});
          } else {
            console.log('⚠️ No weighing status found, but weighing session active');
            console.log('  - Available fields:', Object.keys(data));
            console.log('  - currentStep:', data.currentStep);
          }
        } else {
          console.log('❌ Event-driven weighing not active');
          console.log('  - Session type match:', data.sessionType === GLOBAL_SESSION_TYPES.WEIGHING);
          console.log('  - User ID match:', data.currentUserId === userProfile.id);
          console.log('  - Weighing status present:', !!data.weighingStatus);
          console.log('  - Weighing status value:', data.weighingStatus);
        }

        // Handle RFID verification failure
        if (
          data.sessionType === GLOBAL_SESSION_TYPES.WEIGHING &&
          data.currentUserId === userProfile.id &&
          data.rfidVerificationFailed
        ) {
          handleRFIDVerificationFailed();
        }

        // Handle measurement completion
        if (
          data.sessionType === GLOBAL_SESSION_TYPES.WEIGHING &&
          data.currentUserId === userProfile.id &&
          data.measurementComplete &&
          data.weight > 0 &&
          data.height > 0
        ) {
          console.log('✅ Measurement completed detected:', data);
          console.log('📊 Final data:', {
            weight: data.weight,
            height: data.height,
            imt: data.imt,
            nutritionStatus: data.nutritionStatus,
            eatingPattern: data.eatingPattern,
            childResponse: data.childResponse
          });
          handleWeighingCompleted(data);
        } else if (
          data.sessionType === GLOBAL_SESSION_TYPES.WEIGHING &&
          data.currentUserId === userProfile.id &&
          data.measurementComplete
        ) {
          console.log('⚠️ Measurement complete but missing weight/height:', {
            weight: data.weight,
            height: data.height,
            complete: data.measurementComplete
          });
        }
      }
    });

    return unsubscribe;
  }, [userProfile?.id]);

  const handleEventDrivenWeighing = (data) => {
    const { weighingStatus, currentStep } = data;
    
    console.log('🔄 handleEventDrivenWeighing - status:', weighingStatus, 'step:', currentStep);
    
    // Special handling: If currentStep is 'weighing' but weighingStatus is not set properly
    if (currentStep === 'weighing' && (!weighingStatus || weighingStatus === 'waiting_rfid')) {
      console.log('🔧 FALLBACK: currentStep is weighing, force trigger modal');
      setCurrentWeighingStep('weighing');
      setWeighingControlVisible(true);
      return;
    }
    
    // Special handling: If we're in a weighing session but no weighingStatus yet,
    // check if ESP32 might be trying to trigger weighing mode
    if (!weighingStatus && currentStep === 'waiting_rfid' && data.isInUse) {
      console.log('🔄 Checking if ESP32 set weighing status...');
      
      // Force a brief delay then check again - sometimes Firestore needs a moment
      setTimeout(() => {
        console.log('🔄 Checking for delayed weighing status...');
        // The onSnapshot will trigger again if data changed
      }, 2000);
      
      setWeighingControlVisible(false);
      return;
    }
    
    switch (weighingStatus) {
      case 'waiting_rfid':
        console.log('⏳ Waiting for RFID - hiding modal');
        setWeighingControlVisible(false);
        break;
        
      case 'rfid_verified':
      case 'weighing':
        console.log('⚖️ Weighing mode - showing weight modal');
        setCurrentWeighingStep('weighing');
        setWeighingControlVisible(true);
        break;
        
      case 'height':
        console.log('📏 Height mode - showing height modal');
        setCurrentWeighingStep('height');
        setWeighingControlVisible(true);
        break;
        
      case 'calculating':
        console.log('🧮 Calculating - showing processing modal');
        setCurrentWeighingStep('processing');
        setWeighingControlVisible(true);
        break;
        
      case 'measurement_complete':
      case 'complete':
        console.log('✅ Complete - will show results');
        setWeighingControlVisible(false);
        break;
        
      case 'rfid_failed':
        console.log('❌ RFID failed - hiding modal and showing alert');
        setWeighingControlVisible(false);
        handleRFIDVerificationFailed();
        break;
        
      default:
        console.log('💤 Default state - hiding modal, status:', weighingStatus);
        setWeighingControlVisible(false);
        break;
    }
  };

  const handleRFIDVerificationFailed = async () => {
    setWeighingControlVisible(false);
    setCurrentWeighingStep('idle');
    
    Alert.alert(
      "RFID Tidak Cocok",
      "Kartu RFID yang ditap tidak sesuai dengan akun Anda. Sesi akan direset.",
      [
        {
          text: "OK",
          onPress: async () => {
            await endGlobalSession();
          }
        }
      ]
    );
  };

  const handleWeighingCompleted = async (data) => {
    try {
      setLoading(true);

      const measurementData = {
        weight: data.weight,
        height: data.height,
        imt: data.imt || 0,
        nutritionStatus: data.nutritionStatus,
        eatingPattern: data.eatingPattern,
        childResponse: data.childResponse,
      };

      const addResult = await addMeasurement(userProfile.id, measurementData, userProfile);

      if (addResult.success) {
        await updateUserProfile(userProfile.id, {
          latestWeighing: {
            ...measurementData,
            ageYears: userProfile.ageYears,
            ageMonths: userProfile.ageMonths,
            gender: userProfile.gender,
            dateTime: new Date(),
          },
        });

        setResultData({
          ...measurementData,
          ageYears: userProfile.ageYears,
          ageMonths: userProfile.ageMonths,
          gender: userProfile.gender,
          dateTime: new Date(),
        });
        setResultModalVisible(true);
      }

      await endGlobalSession();
    } catch (error) {
      console.error("Error completing weighing:", error);
      Alert.alert("Kesalahan", "Gagal menyimpan data pengukuran");
    } finally {
      setLoading(false);
    }
  };

  const hasRFID = () => {
    return userProfile?.rfid && userProfile.rfid.trim() !== "";
  };

  const handleStartWeighing = () => {
    if (!hasRFID()) {
      Alert.alert(
        "RFID Belum Dipasang",
        "Anda harus memasang kartu RFID terlebih dahulu sebelum dapat melakukan penimbangan.",
        [
          { text: "Batal", style: "cancel" },
          {
            text: "Pasang RFID",
            onPress: () => router.push("/(tabs)/edit-profile"),
          },
        ]
      );
      return;
    }

    if (!isSessionAvailable(systemStatus)) {
      Alert.alert(
        "Alat Sedang Digunakan",
        getSessionStatusMessage(systemStatus)
      );
      return;
    }
    setSelectionModalVisible(true);
  };

  const handleWeighingProceed = async () => {
    try {
      setLoading(true);
      
      let result;
      switch (currentWeighingStep) {
        case 'weighing':
          console.log('Confirming weight measurement');
          result = await confirmWeight();
          break;
        case 'height':
          console.log('Confirming height measurement');
          result = await confirmHeight();
          break;
        default:
          return;
      }

      if (!result.success) {
        Alert.alert("Kesalahan", result.error);
      }
    } catch (error) {
      console.error('Error in handleWeighingProceed:', error);
      Alert.alert("Kesalahan", "Gagal melanjutkan pengukuran");
    } finally {
      setLoading(false);
    }
  };

  const handleWeighingCancel = async () => {
    try {
      setLoading(true);
      const result = await cancelWeighingFlow();
      
      if (result.success) {
        setWeighingControlVisible(false);
        setCurrentWeighingStep('idle');
        await endGlobalSession();
        
        Alert.alert(
          "Sesi Dibatalkan", 
          "Pengukuran telah dibatalkan dan sesi direset."
        );
      } else {
        Alert.alert("Kesalahan", result.error);
      }
    } catch (error) {
      Alert.alert("Kesalahan", "Gagal membatalkan pengukuran");
    } finally {
      setLoading(false);
    }
  };

  const handleDataSelection = async (selectionData) => {
    try {
      setLoading(true);
      const result = await startWeighingSession(
        userProfile.id,
        userProfile.name,
        userProfile.rfid,
        selectionData,
        userProfile
      );

      if (result.success) {
        setSelectionModalVisible(false);
        Alert.alert(
          "Siap untuk Timbang",
          "Silakan tap kartu RFID Anda pada perangkat untuk memulai pengukuran. ESP32 akan memverifikasi RFID Anda terlebih dahulu."
        );
        
        // Don't auto-start weighing - wait for RFID verification from ESP32
      } else {
        Alert.alert("Kesalahan", result.error);
      }
    } catch (error) {
      Alert.alert("Kesalahan", "Gagal memulai sesi penimbangan");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelWeighing = async () => {
    try {
      await endGlobalSession();
      Alert.alert("Dibatalkan", "Sesi penimbangan telah dibatalkan");
    } catch (error) {
      Alert.alert("Kesalahan", "Gagal membatalkan sesi penimbangan");
    }
  };

  const handleViewHistory = async () => {
    if (userProfile?.latestWeighing) {
      setResultData(userProfile.latestWeighing);
      setResultModalVisible(true);
    } else {
      Alert.alert("Tidak Ada Data", "Tidak ada riwayat penimbangan ditemukan");
    }
  };

  const getStatusColor = () => {
    if (!systemStatus?.isInUse) return Colors.gray600;

    if (systemStatus.timeout) return Colors.error;

    if (isMySession(systemStatus, userProfile?.id)) {
      if (systemStatus.measurementComplete) return Colors.success;
      return Colors.primary;
    }

    return Colors.warning;
  };

  const canStartSession = () => {
    return hasRFID() && isSessionAvailable(systemStatus) && !loading;
  };

  const isMyActiveSession = () => {
    return systemStatus?.isInUse && isMySession(systemStatus, userProfile?.id);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner text="Memuat..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.content}>
          <Text style={styles.title}>Timbang & Ukur</Text>
          <Text style={styles.subtitle}>Pengukuran Berat & Tinggi Badan</Text>

          {!hasRFID() && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningIcon}>⚠️</Text>
              <View style={styles.warningContent}>
                <Text style={styles.warningTitle}>RFID Belum Dipasang</Text>
                <Text style={styles.warningText}>
                  Anda harus memasang kartu RFID terlebih dahulu untuk dapat
                  melakukan penimbangan.
                </Text>
                <Button
                  title="Pasang RFID Sekarang"
                  onPress={() => router.push("/(tabs)/edit-profile")}
                  style={styles.warningButton}
                />
              </View>
            </View>
          )}

          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor() },
              ]}
            >
              <Text style={styles.statusText}>
                {getSessionStatusMessage(systemStatus)}
              </Text>
            </View>
          </View>

          <View style={styles.deviceInfo}>
            <Text style={styles.deviceTitle}>📏 Alat Pengukuran</Text>
            <Text style={styles.deviceDescription}>
              Pengukuran berat dan tinggi badan otomatis menggunakan sensor IoT
            </Text>

            <View style={styles.deviceSpecs}>
              <View style={styles.specItem}>
                <Text style={styles.specIcon}>⚖️</Text>
                <Text style={styles.specText}>Berat: Sensor Load Cell</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specIcon}>📐</Text>
                <Text style={styles.specText}>Tinggi: Sensor Ultrasonik</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specIcon}>📡</Text>
                <Text style={styles.specText}>RFID: Deteksi Otomatis</Text>
              </View>
            </View>

            {hasRFID() && (
              <View style={styles.rfidInfo}>
                <Text style={styles.rfidLabel}>Kartu RFID Terpasang:</Text>
                <Text style={styles.rfidValue}>{userProfile.rfid}</Text>
              </View>
            )}
          </View>

          {isMyActiveSession() && (
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionTitle}>Sesi Saat Ini</Text>
              <View style={styles.sessionDetails}>
                <Text style={styles.sessionItem}>
                  Pola Makan: {systemStatus.eatingPattern}
                </Text>
                <Text style={styles.sessionItem}>
                  Respon Anak: {systemStatus.childResponse}
                </Text>
                <Text style={styles.sessionItem}>
                  RFID: {systemStatus.userRfid}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.actionsContainer}>
            {canStartSession() ? (
              <>
                <Button
                  title="🎯 Ambil Data"
                  onPress={handleStartWeighing}
                  style={styles.primaryButton}
                />

                <Button
                  title="📊 Hasil Pengukuran Terakhir"
                  onPress={handleViewHistory}
                  variant="outline"
                  style={styles.secondaryButton}
                />
              </>
            ) : isMyActiveSession() ? (
              <Button
                title="❌ Batal Timbang"
                onPress={handleCancelWeighing}
                variant="outline"
                style={styles.cancelButton}
              />
            ) : (
              <View style={styles.waitingContainer}>
                <Text style={styles.waitingText}>
                  {!hasRFID()
                    ? "Pasang RFID terlebih dahulu untuk menggunakan fitur ini."
                    : "Alat sedang digunakan. Silakan tunggu sebentar."}
                </Text>
                <Button
                  title="📊 Hasil Pengukuran Terakhir"
                  onPress={handleViewHistory}
                  variant="outline"
                  style={styles.secondaryButton}
                />
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <DataSelectionModal
        visible={selectionModalVisible}
        onClose={() => setSelectionModalVisible(false)}
        onSubmit={handleDataSelection}
      />

      <WeighingResultModal
        visible={resultModalVisible}
        data={resultData}
        onClose={() => {
          setResultModalVisible(false);
          setResultData(null);
        }}
      />

      <WeighingControlModal
        visible={weighingControlVisible}
        currentStep={currentWeighingStep}
        realTimeWeight={systemStatus?.realTimeWeight || 0}
        realTimeHeight={systemStatus?.realTimeHeight || 0}
        userProfile={userProfile}
        onProceed={handleWeighingProceed}
        onCancel={handleWeighingCancel}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.gray900,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray600,
    textAlign: "center",
    marginBottom: 32,
  },
  warningContainer: {
    backgroundColor: Colors.warning + "20",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.warning,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  warningIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.warning,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: Colors.gray700,
    marginBottom: 12,
    lineHeight: 20,
  },
  warningButton: {
    marginTop: 8,
  },
  statusContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 200,
    alignItems: "center",
  },
  statusText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  deviceInfo: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: Colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  deviceTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.gray900,
    marginBottom: 8,
  },
  deviceDescription: {
    fontSize: 14,
    color: Colors.gray600,
    marginBottom: 16,
    lineHeight: 20,
  },
  deviceSpecs: {
    gap: 8,
    marginBottom: 16,
  },
  specItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  specIcon: {
    fontSize: 16,
    marginRight: 8,
    width: 24,
  },
  specText: {
    fontSize: 14,
    color: Colors.gray700,
  },
  rfidInfo: {
    backgroundColor: Colors.primary + "10",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary + "30",
  },
  rfidLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.primary,
    marginBottom: 4,
  },
  rfidValue: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
  },
  sessionInfo: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.white,
    marginBottom: 8,
  },
  sessionDetails: {
    gap: 4,
  },
  sessionItem: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
  },
  actionsContainer: {
    gap: 16,
  },
  primaryButton: {
    marginBottom: 8,
  },
  secondaryButton: {
    marginBottom: 8,
  },
  cancelButton: {
    borderColor: Colors.error,
  },
  waitingContainer: {
    gap: 16,
    alignItems: "center",
  },
  waitingText: {
    fontSize: 16,
    color: Colors.gray600,
    textAlign: "center",
    backgroundColor: Colors.gray50,
    padding: 16,
    borderRadius: 8,
  },
});
