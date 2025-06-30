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
import {
  startLoadCellTare,
  startLoadCellCalibration,
  startUltrasonicCalibration,
  subscribeToTareStatus,
  subscribeToCalibrationStatus,
  subscribeToUltrasonicCalibrationStatus,
  completeTareSession,
  completeCalibrationSession,
  completeUltrasonicCalibrationSession,
  isSystemIdle
} from "../../services/rtdbModeService";

export default function ControlScreen() {
  const insets = useSafeAreaInsets();
  const [calibrating, setCalibrating] = useState(false);
  const [taring, setTaring] = useState(false);
  const [ultrasonicCalibrating, setUltrasonicCalibrating] = useState(false);
  const [calibrationWeight, setCalibrationWeight] = useState("");
  const [poleHeight, setPoleHeight] = useState("");

  const handleCalibration = async () => {
    if (!calibrationWeight || parseFloat(calibrationWeight) <= 0) {
      Alert.alert("Error", "Silakan masukkan berat kalibrasi yang valid (lebih dari 0 kg)");
      return;
    }

    // Check if system is idle
    try {
      const systemIdle = await isSystemIdle();
      if (!systemIdle) {
        Alert.alert("System Busy", "Hardware sedang digunakan. Silakan coba lagi nanti.");
        return;
      }
    } catch (error) {
      Alert.alert("Error", "Gagal memeriksa status sistem");
      return;
    }

    setCalibrating(true);
    
    try {
      const weight = parseFloat(calibrationWeight);
      
      // Start calibration session
      const result = await startLoadCellCalibration(weight);
      if (!result.success) {
        Alert.alert("Error", result.error || "Gagal memulai kalibrasi");
        setCalibrating(false);
        return;
      }
      
      // Subscribe to calibration status updates
      const unsubscribe = subscribeToCalibrationStatus((status) => {
        console.log('Calibration status:', status);
        
        switch (status) {
          case 'waiting_weight':
            Alert.alert('Place Weight', `Silakan letakkan beban ${weight} kg pada load cell`);
            break;
          case 'processing':
            Alert.alert('Processing', 'Sedang mengkalibrasi load cell, harap tunggu...');
            break;
          case 'completed':
            Alert.alert('Calibration Complete', 'Kalibrasi load cell berhasil!');
            completeCalibrationSession();
            setCalibrating(false);
            unsubscribe();
            break;
          case 'failed':
            Alert.alert('Calibration Failed', 'Proses kalibrasi gagal. Silakan coba lagi.');
            completeCalibrationSession();
            setCalibrating(false);
            unsubscribe();
            break;
        }
      });
      
    } catch (error) {
      Alert.alert("Error", "Gagal melakukan kalibrasi load cell");
      setCalibrating(false);
    }
  };

  const handleTare = async () => {
    // Check if system is idle
    try {
      const systemIdle = await isSystemIdle();
      if (!systemIdle) {
        Alert.alert("System Busy", "Hardware sedang digunakan. Silakan coba lagi nanti.");
        return;
      }
    } catch (error) {
      Alert.alert("Error", "Gagal memeriksa status sistem");
      return;
    }

    setTaring(true);
    
    try {
      // Start tare session
      const result = await startLoadCellTare();
      if (!result.success) {
        Alert.alert("Error", result.error || "Gagal memulai tare");
        setTaring(false);
        return;
      }
      
      // Subscribe to tare status updates
      const unsubscribe = subscribeToTareStatus((status) => {
        console.log('Tare status:', status);
        
        switch (status) {
          case 'processing':
            Alert.alert('Tare in Progress', 'Sedang mereset load cell ke nol...');
            break;
          case 'completed':
            Alert.alert('Tare Complete', 'Load cell berhasil di-reset ke nol!');
            completeTareSession();
            setTaring(false);
            unsubscribe();
            break;
          case 'failed':
            Alert.alert('Tare Failed', 'Operasi tare gagal. Silakan coba lagi.');
            completeTareSession();
            setTaring(false);
            unsubscribe();
            break;
        }
      });
      
    } catch (error) {
      Alert.alert("Error", "Gagal melakukan tare load cell");
      setTaring(false);
    }
  };

  const handleUltrasonicCalibration = async () => {
    if (!poleHeight || parseFloat(poleHeight) <= 0) {
      Alert.alert("Error", "Silakan masukkan tinggi tiang yang valid (lebih dari 0 cm)");
      return;
    }

    // Check if system is idle
    try {
      const systemIdle = await isSystemIdle();
      if (!systemIdle) {
        Alert.alert("System Busy", "Hardware sedang digunakan. Silakan coba lagi nanti.");
        return;
      }
    } catch (error) {
      Alert.alert("Error", "Gagal memeriksa status sistem");
      return;
    }

    setUltrasonicCalibrating(true);
    
    try {
      const height = parseFloat(poleHeight);
      
      // Start ultrasonic calibration session
      const result = await startUltrasonicCalibration(height);
      if (!result.success) {
        Alert.alert("Error", result.error || "Gagal memulai kalibrasi ultrasonic");
        setUltrasonicCalibrating(false);
        return;
      }
      
      // Subscribe to ultrasonic calibration status updates
      const unsubscribe = subscribeToUltrasonicCalibrationStatus((status) => {
        console.log('Ultrasonic calibration status:', status);
        
        switch (status) {
          case 'measuring':
            Alert.alert('Pengukuran', 'Sedang mengukur jarak ke lantai untuk kalibrasi...');
            break;
          case 'processing':
            Alert.alert('Processing', `Sedang mengatur tinggi tiang ke ${height} cm, harap tunggu...`);
            break;
          case 'completed':
            Alert.alert('Calibration Complete', `Tinggi tiang berhasil diatur ke ${height} cm!`);
            completeUltrasonicCalibrationSession();
            setUltrasonicCalibrating(false);
            unsubscribe();
            break;
          case 'failed':
            Alert.alert('Calibration Failed', 'Proses kalibrasi ultrasonic gagal. Silakan coba lagi.');
            completeUltrasonicCalibrationSession();
            setUltrasonicCalibrating(false);
            unsubscribe();
            break;
        }
      });
      
    } catch (error) {
      Alert.alert("Error", "Gagal melakukan kalibrasi ultrasonic");
      setUltrasonicCalibrating(false);
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
                editable={!calibrating && !taring && !ultrasonicCalibrating}
              />
              <Text style={styles.inputHelper}>
                Masukkan berat beban standar yang akan digunakan untuk kalibrasi
              </Text>
            </View>
            
            <Button
              title={calibrating ? "Mengkalibrasi..." : "Mulai Kalibrasi"}
              onPress={handleCalibration}
              disabled={calibrating || taring || ultrasonicCalibrating || !calibrationWeight}
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
              disabled={calibrating || taring || ultrasonicCalibrating}
              variant="outline"
              style={styles.actionButton}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ultrasonic Control</Text>
          <Text style={styles.sectionDescription}>
            Kontrol dan kalibrasi sensor tinggi (ultrasonic)
          </Text>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>📏</Text>
              <Text style={styles.cardTitle}>Atur Tinggi Tiang</Text>
            </View>
            <Text style={styles.cardDescription}>
              Kalibrasi sensor ultrasonic dengan mengatur tinggi tiang pengukuran
            </Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Tinggi Tiang (cm)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Contoh: 200"
                value={poleHeight}
                onChangeText={setPoleHeight}
                keyboardType="decimal-pad"
                editable={!calibrating && !taring && !ultrasonicCalibrating}
              />
              <Text style={styles.inputHelper}>
                Masukkan tinggi tiang dari lantai ke sensor dalam centimeter
              </Text>
            </View>
            
            <Button
              title={ultrasonicCalibrating ? "Mengkalibrasi..." : "Atur Tinggi Tiang"}
              onPress={handleUltrasonicCalibration}
              disabled={calibrating || taring || ultrasonicCalibrating || !poleHeight}
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

        {(calibrating || taring || ultrasonicCalibrating) && (
          <View style={styles.loadingContainer}>
            <LoadingSpinner 
              size="small" 
              text={
                calibrating ? "Kalibrasi dalam proses..." : 
                taring ? "Tare dalam proses..." : 
                "Kalibrasi ultrasonic dalam proses..."
              } 
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