import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import Button from "./Button";
import LoadingSpinner from "./LoadingSpinner";
import { Colors } from "../../constants/Colors";

export default function RFIDPairingMethodModal({
  visible,
  userName,
  onClose,
  onDevicePairing,
  onManualPairing,
  loading = false,
}) {
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualRfidCode, setManualRfidCode] = useState("");
  const [manualRfidNumber, setManualRfidNumber] = useState("");
  const [manualLoading, setManualLoading] = useState(false);

  const handleDeviceMethod = () => {
    onDevicePairing();
  };

  const handleManualMethod = () => {
    setShowManualInput(true);
  };

  const handleManualSubmit = async () => {
    if (!manualRfidCode.trim()) {
      Alert.alert("Error", "Kode RFID tidak boleh kosong");
      return;
    }

    if (!manualRfidNumber.trim()) {
      Alert.alert("Error", "Nomor RFID tidak boleh kosong");
      return;
    }

    setManualLoading(true);
    try {
      await onManualPairing(manualRfidCode.trim(), manualRfidNumber.trim());
      setManualRfidCode("");
      setManualRfidNumber("");
      setShowManualInput(false);
    } catch (error) {
      console.error("Manual RFID error:", error);
    } finally {
      setManualLoading(false);
    }
  };

  const handleClose = () => {
    setShowManualInput(false);
    setManualRfidCode("");
    setManualRfidNumber("");
    onClose();
  };

  const handleBackToMethods = () => {
    setShowManualInput(false);
    setManualRfidCode("");
    setManualRfidNumber("");
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {!showManualInput ? (
            <>
              <Text style={styles.title}>Pilih Metode Pairing RFID</Text>
              <Text style={styles.subtitle}>untuk {userName}</Text>

              <View style={styles.methodsContainer}>
                <TouchableOpacity
                  style={styles.methodButton}
                  onPress={handleDeviceMethod}
                  disabled={loading}
                >
                  <Text style={styles.methodIcon}>📱</Text>
                  <Text style={styles.methodTitle}>Dari Alat</Text>
                  <Text style={styles.methodDescription}>
                    Tap kartu RFID pada perangkat untuk pairing otomatis
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.methodButton}
                  onPress={handleManualMethod}
                  disabled={loading}
                >
                  <Text style={styles.methodIcon}>✏️</Text>
                  <Text style={styles.methodTitle}>Input Manual</Text>
                  <Text style={styles.methodDescription}>
                    Masukkan kode RFID secara manual
                  </Text>
                </TouchableOpacity>
              </View>

              <Button
                title="Batal"
                onPress={handleClose}
                variant="outline"
                style={styles.cancelButton}
                disabled={loading}
              />
            </>
          ) : (
            <>
              <Text style={styles.title}>Input Manual RFID</Text>
              <Text style={styles.subtitle}>untuk {userName}</Text>

              {manualLoading && (
                <LoadingSpinner 
                  size="small" 
                  text="Menyimpan data RFID..." 
                  style={styles.loadingSpinner}
                />
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Kode RFID</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Masukkan kode RFID (contoh: A1B2C3D4)"
                  value={manualRfidCode}
                  onChangeText={setManualRfidCode}
                  autoCapitalize="characters"
                  editable={!manualLoading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Nomor RFID</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Masukkan nomor RFID (contoh: 001)"
                  value={manualRfidNumber}
                  onChangeText={setManualRfidNumber}
                  keyboardType="numeric"
                  editable={!manualLoading}
                />
              </View>

              <View style={styles.manualButtonsContainer}>
                <Button
                  title="Kembali"
                  onPress={handleBackToMethods}
                  variant="outline"
                  style={styles.backButton}
                  disabled={manualLoading}
                />
                <Button
                  title={manualLoading ? "Menyimpan..." : "Simpan"}
                  onPress={handleManualSubmit}
                  style={styles.saveButton}
                  disabled={manualLoading || !manualRfidCode.trim() || !manualRfidNumber.trim()}
                />
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 400,
    shadowColor: Colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.gray900,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray600,
    textAlign: "center",
    marginBottom: 24,
  },
  methodsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  methodButton: {
    backgroundColor: Colors.gray50,
    borderWidth: 2,
    borderColor: Colors.gray200,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    minHeight: 120,
  },
  methodIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.gray900,
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 12,
    color: Colors.gray600,
    textAlign: "center",
    lineHeight: 16,
  },
  cancelButton: {
    width: "100%",
  },
  loadingSpinner: {
    marginBottom: 16,
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
    fontSize: 14,
    color: Colors.gray900,
    backgroundColor: Colors.white,
  },
  manualButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  backButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});