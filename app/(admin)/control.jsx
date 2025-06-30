import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { Colors } from "../../constants/Colors";

export default function ControlScreen() {
  const insets = useSafeAreaInsets();
  const [calibrating, setCalibrating] = useState(false);
  const [taring, setTaring] = useState(false);
  const [calibrationWeight, setCalibrationWeight] = useState("");

  const handleCalibration = async () => {
    if (!calibrationWeight || parseFloat(calibrationWeight) <= 0) {
      Alert.alert("Error", "Silakan masukkan berat kalibrasi yang valid (lebih dari 0 kg)");
      return;
    }

    setCalibrating(true);
    try {
      // TODO: Implement loadcell calibration with weight
      const weight = parseFloat(calibrationWeight);
      Alert.alert(
        "Kalibrasi Load Cell",
        `Fitur kalibrasi load cell akan segera tersedia.\n\nInstruksi:\n1. Letakkan beban ${weight} kg pada load cell\n2. Pastikan beban terdistribusi merata\n3. Proses kalibrasi akan dimulai`,
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert("Error", "Gagal melakukan kalibrasi load cell");
    } finally {
      setCalibrating(false);
    }
  };

  const handleTare = async () => {
    setTaring(true);
    try {
      // TODO: Implement loadcell tare
      Alert.alert(
        "Tare Load Cell",
        "Fitur tare load cell akan segera tersedia. Load cell akan di-reset ke nol.",
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert("Error", "Gagal melakukan tare load cell");
    } finally {
      setTaring(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>⚙️ Control Panel</Text>
          <Text style={styles.subtitle}>
            Kontrol perangkat keras dan kalibrasi sensor
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Load Cell Control</Text>
          <Text style={styles.sectionDescription}>
            Kontrol dan kalibrasi sensor berat (load cell)
          </Text>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>⚖️</Text>
              <Text style={styles.cardTitle}>Kalibrasi Load Cell</Text>
            </View>
            <Text style={styles.cardDescription}>
              Kalibrasi sensor berat dengan menggunakan beban standar yang diketahui
            </Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Berat Kalibrasi (kg)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Contoh: 5.0"
                value={calibrationWeight}
                onChangeText={setCalibrationWeight}
                keyboardType="decimal-pad"
                editable={!calibrating && !taring}
              />
              <Text style={styles.inputHelper}>
                Masukkan berat beban standar yang akan digunakan untuk kalibrasi
              </Text>
            </View>
            
            <Button
              title={calibrating ? "Mengkalibrasi..." : "Mulai Kalibrasi"}
              onPress={handleCalibration}
              disabled={calibrating || taring || !calibrationWeight}
              style={styles.actionButton}
            />
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>🔄</Text>
              <Text style={styles.cardTitle}>Tare Load Cell</Text>
            </View>
            <Text style={styles.cardDescription}>
              Reset sensor berat ke nilai nol (tanpa beban)
            </Text>
            <Button
              title={taring ? "Melakukan Tare..." : "Tare Sekarang"}
              onPress={handleTare}
              disabled={calibrating || taring}
              variant="outline"
              style={styles.actionButton}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status Perangkat</Text>
          <Text style={styles.sectionDescription}>
            Informasi status perangkat keras
          </Text>

          <View style={styles.statusCard}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>ESP32 Status:</Text>
              <Text style={[styles.statusValue, styles.statusOnline]}>
                Online
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Load Cell:</Text>
              <Text style={[styles.statusValue, styles.statusOnline]}>
                Ready
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Ultrasonic:</Text>
              <Text style={[styles.statusValue, styles.statusOnline]}>
                Ready
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>RFID Reader:</Text>
              <Text style={[styles.statusValue, styles.statusOnline]}>
                Ready
              </Text>
            </View>
          </View>
        </View>

        {(calibrating || taring) && (
          <View style={styles.loadingContainer}>
            <LoadingSpinner 
              size="small" 
              text={calibrating ? "Kalibrasi dalam proses..." : "Tare dalam proses..."} 
            />
          </View>
        )}
      </ScrollView>
    </View>
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
  header: {
    padding: 24,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.gray900,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray600,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.gray900,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.gray600,
    marginBottom: 16,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.gray900,
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.gray600,
    marginBottom: 16,
    lineHeight: 20,
  },
  actionButton: {
    marginBottom: 0,
  },
  statusCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: Colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  statusLabel: {
    fontSize: 14,
    color: Colors.gray700,
    fontWeight: "500",
  },
  statusValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  statusOnline: {
    color: Colors.success,
  },
  statusOffline: {
    color: Colors.error,
  },
  loadingContainer: {
    padding: 24,
    alignItems: "center",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.gray700,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: Colors.gray900,
    backgroundColor: Colors.white,
    marginBottom: 4,
  },
  inputHelper: {
    fontSize: 12,
    color: Colors.gray500,
    lineHeight: 16,
  },
});