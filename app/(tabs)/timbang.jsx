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
  startWeighingSession,
  resetWeighingSession,
  getLatestWeighing,
  subscribeToWeighingSession,
} from "../../services/weighingService";
import { WEIGHING_STATES } from "../../utils/weighingStates";
import { Colors } from "../../constants/Colors";

export default function TimbangScreen() {
  const { userProfile } = useAuth();

  const [weighingState, setWeighingState] = useState(WEIGHING_STATES.IDLE);
  const [selectionModalVisible, setSelectionModalVisible] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [latestData, setLatestData] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userProfile?.id) return;

    const unsubscribe = subscribeToWeighingSession(userProfile.id, (doc) => {
      if (doc.exists()) {
        const data = doc.data();

        if (data.weighingSession) {
          const session = data.weighingSession;
          setWeighingState(session.state || WEIGHING_STATES.IDLE);
          setCurrentSession(session);

          if (
            session.state === WEIGHING_STATES.COMPLETED &&
            session.resultData
          ) {
            setResultModalVisible(true);
            resetWeighingSession(userProfile.id);
          }
        }
      }
    });

    return unsubscribe;
  }, [userProfile?.id]);

  const handleStartWeighing = () => {
    setSelectionModalVisible(true);
  };

  const handleDataSelection = async (selectionData) => {
    try {
      setLoading(true);
      const result = await startWeighingSession(userProfile.id, selectionData);

      if (result.success) {
        setSelectionModalVisible(false);
        setWeighingState(WEIGHING_STATES.WAITING);
        Alert.alert(
          "Ready for Weighing",
          "Please tap your RFID card on the device to start measurement."
        );
      } else {
        Alert.alert("Error", result.error);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to start weighing session");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelWeighing = async () => {
    try {
      await resetWeighingSession(userProfile.id);
      setWeighingState(WEIGHING_STATES.IDLE);
      Alert.alert("Cancelled", "Weighing session has been cancelled");
    } catch (error) {
      Alert.alert("Error", "Failed to cancel weighing session");
    }
  };

  const handleViewHistory = async () => {
    try {
      setLoading(true);
      const result = await getLatestWeighing(userProfile.id);

      if (result.success && result.data) {
        setLatestData(result.data);
        setResultModalVisible(true);
      } else {
        Alert.alert("No Data", "No weighing history found");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const getStatusMessage = () => {
    switch (weighingState) {
      case WEIGHING_STATES.WAITING:
        return "Waiting for RFID card tap...";
      case WEIGHING_STATES.MEASURING:
        return "Measuring in progress...";
      case WEIGHING_STATES.COMPLETED:
        return "Measurement completed!";
      default:
        return "Ready to start weighing";
    }
  };

  const getStatusColor = () => {
    switch (weighingState) {
      case WEIGHING_STATES.WAITING:
        return Colors.warning;
      case WEIGHING_STATES.MEASURING:
        return Colors.primary;
      case WEIGHING_STATES.COMPLETED:
        return Colors.success;
      default:
        return Colors.gray600;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner text="Loading..." />
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
          <Text style={styles.subtitle}>Weight & Height Measurement</Text>

          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor() },
              ]}
            >
              <Text style={styles.statusText}>{getStatusMessage()}</Text>
            </View>
          </View>

          <View style={styles.deviceInfo}>
            <Text style={styles.deviceTitle}>📏 Measurement Device</Text>
            <Text style={styles.deviceDescription}>
              Automated weight and height measurement using IoT sensors
            </Text>

            <View style={styles.deviceSpecs}>
              <View style={styles.specItem}>
                <Text style={styles.specIcon}>⚖️</Text>
                <Text style={styles.specText}>Weight: Load Cell Sensor</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specIcon}>📐</Text>
                <Text style={styles.specText}>Height: Ultrasonic Sensor</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specIcon}>📡</Text>
                <Text style={styles.specText}>RFID: Automatic Detection</Text>
              </View>
            </View>
          </View>

          {currentSession && weighingState === WEIGHING_STATES.WAITING && (
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionTitle}>Current Session</Text>
              <View style={styles.sessionDetails}>
                <Text style={styles.sessionItem}>
                  Pola Makan: {currentSession.eatingPattern}
                </Text>
                <Text style={styles.sessionItem}>
                  Respon Anak: {currentSession.childResponse}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.actionsContainer}>
            {weighingState === WEIGHING_STATES.IDLE ? (
              <>
                <Button
                  title="🎯 Ambil Data"
                  onPress={handleStartWeighing}
                  style={styles.primaryButton}
                />

                <Button
                  title="📊 History"
                  onPress={handleViewHistory}
                  variant="outline"
                  style={styles.secondaryButton}
                />
              </>
            ) : (
              <Button
                title="❌ Cancel Weighing"
                onPress={handleCancelWeighing}
                variant="outline"
                style={styles.cancelButton}
              />
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
        data={latestData}
        onClose={() => {
          setResultModalVisible(false);
          setLatestData(null);
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
});
