import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import DataSelectionModal from "../../components/ui/DataSelectionModal";
import WeighingResultModal from "../../components/ui/WeighingResultModal";
import {
  subscribeToSystemStatus,
  startWeighingSession,
  endGlobalSession,
  initializeSystemStatus,
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

  const [systemStatus, setSystemStatus] = useState(null);
  const [selectionModalVisible, setSelectionModalVisible] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initializeSystemStatus();
  }, []);

  useEffect(() => {
    if (!userProfile?.id) return;

    const unsubscribe = subscribeToSystemStatus((doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setSystemStatus(data);

        if (
          data.sessionType === GLOBAL_SESSION_TYPES.WEIGHING &&
          data.currentUserId === userProfile.id &&
          data.measurementComplete &&
          data.weight > 0 &&
          data.height > 0
        ) {
          handleWeighingCompleted(data);
        }
      }
    });

    return unsubscribe;
  }, [userProfile?.id]);

  const handleWeighingCompleted = async (data) => {
    try {
      setLoading(true);

      const measurementData = {
        weight: data.weight,
        height: data.height,
        nutritionStatus: data.nutritionStatus,
        eatingPattern: data.eatingPattern,
        childResponse: data.childResponse,
      };

      const addResult = await addMeasurement(userProfile.id, measurementData);

      if (addResult.success) {
        await updateUserProfile(userProfile.id, {
          latestWeighing: {
            ...measurementData,
            dateTime: new Date(),
          },
        });

        setResultData({
          ...measurementData,
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

  const handleStartWeighing = () => {
    if (!isSessionAvailable(systemStatus)) {
      Alert.alert(
        "Alat Sedang Digunakan",
        getSessionStatusMessage(systemStatus)
      );
      return;
    }
    setSelectionModalVisible(true);
  };

  const handleDataSelection = async (selectionData) => {
    try {
      setLoading(true);
      const result = await startWeighingSession(
        userProfile.id,
        userProfile.name,
        selectionData
      );

      if (result.success) {
        setSelectionModalVisible(false);
        Alert.alert(
          "Siap untuk Timbang",
          "Silakan tap kartu RFID Anda pada perangkat untuk memulai pengukuran."
        );
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
    return isSessionAvailable(systemStatus) && !loading;
  };

  const isMyActiveSession = () => {
    return systemStatus?.isInUse && isMySession(systemStatus, userProfile?.id);
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
      >
        <View style={styles.content}>
          <Text style={styles.title}>Timbang & Ukur</Text>
          <Text style={styles.subtitle}>Pengukuran Berat & Tinggi Badan</Text>

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
                  title="📊 Riwayat"
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
                  Alat sedang digunakan. Silakan tunggu sebentar.
                </Text>
                <Button
                  title="📊 Riwayat"
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
