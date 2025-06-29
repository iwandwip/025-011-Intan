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
import {
  startWeighingSession,
  subscribeToWeighingResults,
  completeWeighingSession,
  isSystemIdle,
  subscribeToSystemState,
  handleSystemError
} from "../../services/rtdbModeService";
import { addMeasurement } from "../../services/dataService";
import { saveMeasurementFromRTDB } from "../../services/dataService";
import { updateUserProfile } from "../../services/userService";
// Pure mode-based system - no legacy imports needed
import { Colors } from "../../constants/Colors";

export default function TimbangScreen() {
  const { userProfile } = useAuth();
  const router = useRouter();

  const [modeSystemState, setModeSystemState] = useState({ mode: 'idle' });
  const [selectionModalVisible, setSelectionModalVisible] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // No legacy system initialization needed

  useEffect(() => {
    if (!userProfile?.id) return;

    // Mode-based system: Subscribe to weighing results
    const unsubscribeResults = subscribeToWeighingResults((results) => {
      console.log('🔍 MODE-BASED WEIGHING RESULTS:', results);
      handleModeBasedWeighingCompleted(results);
    });

    // Subscribe to system state for monitoring
    const unsubscribeState = subscribeToSystemState((state) => {
      setModeSystemState(state);
      console.log('🎯 MODE-BASED SYSTEM STATE:', state);
    });

    return () => {
      unsubscribeResults();
      unsubscribeState();
    };
  }, [userProfile?.id]);

  const handleModeBasedWeighingCompleted = async (results) => {
    try {
      setLoading(true);

      // Convert RTDB results to Firestore format
      const measurementData = {
        weight: parseFloat(results.berat),
        height: parseFloat(results.tinggi),
        imt: parseFloat(results.imt),
        nutritionStatus: results.status_gizi,
        eatingPattern: results.pola_makan,
        childResponse: results.respon_anak,
        ageYears: parseInt(results.usia_th),
        ageMonths: parseInt(results.usia_bl),
        gender: results.gender === 'L' ? 'male' : 'female',
        dateTime: new Date()
      };

      // Save to Firestore
      const addResult = await addMeasurement(userProfile.id, measurementData, userProfile);

      if (addResult.success) {
        // Update user profile cache
        await updateUserProfile(userProfile.id, {
          latestWeighing: {
            weight: measurementData.weight,
            height: measurementData.height,
            imt: measurementData.imt,
            nutritionStatus: measurementData.nutritionStatus,
            eatingPattern: measurementData.eatingPattern,
            childResponse: measurementData.childResponse,
            ageYears: measurementData.ageYears,
            ageMonths: measurementData.ageMonths,
            gender: measurementData.gender,
            dateTime: measurementData.dateTime
          }
        });

        // Show results modal
        setResultData(measurementData);
        setResultModalVisible(true);

        // Complete session and cleanup
        await completeWeighingSession();
      }
    } catch (error) {
      console.error("Error completing mode-based weighing:", error);
      Alert.alert("Kesalahan", "Gagal menyimpan data pengukuran");
      await handleSystemError(error);
    } finally {
      setLoading(false);
    }
  };

  // Legacy function removed - using mode-based system only

  const hasRFID = () => {
    return userProfile?.rfid && userProfile.rfid.trim() !== "";
  };

  const handleStartWeighing = async () => {
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

    // Mode-based system: Check if system is idle
    try {
      const systemIdle = await isSystemIdle();
      if (!systemIdle) {
        Alert.alert(
          "Alat Sedang Digunakan",
          "Hardware sedang digunakan oleh pengguna lain. Silakan coba lagi nanti."
        );
        return;
      }
    } catch (error) {
      Alert.alert("Kesalahan", "Gagal memeriksa status sistem");
      return;
    }
    
    setSelectionModalVisible(true);
  };

  const handleDataSelection = async (selectionData) => {
    try {
      setLoading(true);
      
      // Mode-based system: Start weighing session
      const sessionData = {
        eatingPattern: selectionData.eatingPattern,
        childResponse: selectionData.childResponse,
        ageYears: userProfile.ageYears,
        ageMonths: userProfile.ageMonths,
        gender: userProfile.gender === 'male' ? 'L' : 'P'
      };

      const result = await startWeighingSession(sessionData);

      if (result.success) {
        setSelectionModalVisible(false);
        Alert.alert(
          "Sesi Dimulai",
          "Silakan tap kartu RFID Anda pada perangkat untuk memulai pengukuran."
        );
      } else {
        Alert.alert("Kesalahan", result.error);
      }
    } catch (error) {
      console.error("Error starting weighing session:", error);
      Alert.alert("Kesalahan", "Gagal memulai sesi penimbangan");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelWeighing = async () => {
    try {
      await completeWeighingSession();
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
    // Mode-based system status
    if (modeSystemState.mode === 'idle') return Colors.gray600;
    if (modeSystemState.mode === 'weighing') return Colors.primary;
    if (modeSystemState.mode === 'pairing') return Colors.warning;
    return Colors.gray600;
  };

  const canStartSession = () => {
    return hasRFID() && modeSystemState.mode === 'idle' && !loading;
  };

  const isMyActiveSession = () => {
    return modeSystemState.mode === 'weighing';
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
                {`Mode: ${modeSystemState.mode === 'idle' ? 'Siap Digunakan' : 
                    modeSystemState.mode === 'weighing' ? 'Sedang Menimbang' : 
                    modeSystemState.mode === 'pairing' ? 'Sedang Pairing RFID' : 'Tidak Diketahui'}`}
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
                  Status: Sedang Menimbang
                </Text>
                <Text style={styles.sessionItem}>
                  Tap kartu RFID untuk memulai
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
