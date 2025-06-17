import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import Button from "./Button";
import { Colors } from "../../constants/Colors";
import { checkRfidNumberExists } from "../../services/userService";

export default function RFIDNumberModal({
  visible,
  rfidCode,
  userName,
  userId,
  onConfirm,
  onCancel,
}) {
  const [rfidNumber, setRfidNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!rfidNumber.trim()) {
      Alert.alert("Perhatian", "Nomor urut RFID tidak boleh kosong");
      return;
    }

    if (!/^\d+$/.test(rfidNumber.trim())) {
      Alert.alert("Perhatian", "Nomor urut RFID harus berupa angka");
      return;
    }

    setLoading(true);
    try {
      const duplicateCheck = await checkRfidNumberExists(rfidNumber.trim(), userId);
      
      if (!duplicateCheck.success) {
        Alert.alert("Error", "Gagal memeriksa duplikasi nomor urut RFID");
        return;
      }

      if (duplicateCheck.exists) {
        const existingUser = duplicateCheck.users[0];
        Alert.alert(
          "Nomor Urut Sudah Digunakan",
          `Nomor urut ${rfidNumber.trim()} sudah digunakan oleh ${existingUser.name}. Silakan pilih nomor urut yang berbeda.`
        );
        return;
      }

      await onConfirm(rfidCode, rfidNumber.trim());
      setRfidNumber("");
    } catch (error) {
      console.error("Error confirming RFID:", error);
      Alert.alert("Error", "Terjadi kesalahan saat menyimpan RFID");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setRfidNumber("");
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Pairing RFID Berhasil</Text>
          
          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>Nama Siswa:</Text>
            <Text style={styles.infoValue}>{userName}</Text>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>Kode RFID:</Text>
            <Text style={styles.rfidCode}>{rfidCode}</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nomor Urut RFID:</Text>
            <TextInput
              style={styles.input}
              value={rfidNumber}
              onChangeText={setRfidNumber}
              placeholder="Masukkan nomor urut (contoh: 001)"
              placeholderTextColor={Colors.gray400}
              keyboardType="numeric"
              maxLength={10}
              autoFocus={true}
            />
            <Text style={styles.inputHelp}>
              Masukkan nomor urut untuk memudahkan identifikasi kartu RFID
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Batal"
              onPress={handleCancel}
              variant="outline"
              style={styles.cancelButton}
              disabled={loading}
            />
            <Button
              title={loading ? "Menyimpan..." : "Simpan"}
              onPress={handleConfirm}
              style={styles.confirmButton}
              disabled={loading}
            />
          </View>
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
    padding: 20,
  },
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: Colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.gray900,
    textAlign: "center",
    marginBottom: 20,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.gray600,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.gray900,
    flex: 2,
    textAlign: "right",
  },
  rfidCode: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
    flex: 2,
    textAlign: "right",
    fontFamily: "monospace",
  },
  inputContainer: {
    marginTop: 16,
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.gray900,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.gray900,
    backgroundColor: Colors.white,
  },
  inputHelp: {
    fontSize: 12,
    color: Colors.gray500,
    marginTop: 4,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
});