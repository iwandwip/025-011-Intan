import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from "react-native";
import Button from "./Button";
import { Colors } from "../../constants/Colors";

const WeighingControlModal = ({ 
  visible, 
  currentStep, 
  realTimeWeight, 
  realTimeHeight, 
  onProceed, 
  onCancel,
  userProfile 
}) => {
  const getModalContent = () => {
    switch (currentStep) {
      case 'weighing':
        return {
          title: "Konfirmasi Berat Badan",
          content: (
            <View style={styles.measurementContainer}>
              <Text style={styles.measurementLabel}>Berat Badan Saat Ini:</Text>
              <Text style={styles.measurementValue}>{realTimeWeight.toFixed(1)} kg</Text>
              <Text style={styles.instructionText}>
                Pastikan anak berdiri dengan tenang di atas timbangan.
                Ketika angka sudah stabil, tekan "Lanjut" untuk konfirmasi.
              </Text>
            </View>
          ),
          proceedText: "Lanjut ke Ukur Tinggi",
          showCancel: true
        };
      
      case 'height':
        return {
          title: "Konfirmasi Tinggi Badan",
          content: (
            <View style={styles.measurementContainer}>
              <Text style={styles.measurementLabel}>Tinggi Badan Saat Ini:</Text>
              <Text style={styles.measurementValue}>{realTimeHeight.toFixed(1)} cm</Text>
              <Text style={styles.instructionText}>
                Pastikan anak berdiri tegak di bawah sensor tinggi.
                Ketika angka sudah stabil, tekan "Lanjut" untuk konfirmasi.
              </Text>
            </View>
          ),
          proceedText: "Konfirmasi Tinggi",
          showCancel: true
        };
      
      case 'processing':
        return {
          title: "Memproses Data",
          content: (
            <View style={styles.measurementContainer}>
              <Text style={styles.processingIcon}>⏳</Text>
              <Text style={styles.processingText}>
                Menghitung IMT dan Status Gizi
              </Text>
              <Text style={styles.instructionText}>
                Mohon tunggu, sistem sedang memproses data pengukuran dan menentukan status gizi menggunakan algoritma K-NN...
              </Text>
            </View>
          ),
          proceedText: "",
          showCancel: true
        };
      
      default:
        return {
          title: "Pengukuran",
          content: <Text>Menunggu...</Text>,
          proceedText: "Lanjut",
          showCancel: false
        };
    }
  };

  const handleProceed = () => {
    const { proceedText } = getModalContent();
    
    Alert.alert(
      "Konfirmasi",
      `Apakah Anda yakin ingin ${proceedText.toLowerCase()}?`,
      [
        { text: "Batal", style: "cancel" },
        { text: "Ya", onPress: onProceed }
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert(
      "Batalkan Pengukuran",
      "Apakah Anda yakin ingin membatalkan pengukuran ini?",
      [
        { text: "Tidak", style: "cancel" },
        { text: "Ya, Batalkan", style: "destructive", onPress: onCancel }
      ]
    );
  };

  const { title, content, proceedText, showCancel } = getModalContent();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
          </View>

          <View style={styles.modalBody}>
            {content}
          </View>

          {(showCancel || proceedText) && (
            <View style={styles.modalFooter}>
              {showCancel && (
                <Button
                  title="Batalkan"
                  onPress={handleCancel}
                  variant="outline"
                  style={styles.modalButton}
                />
              )}
              {proceedText && (
                <Button
                  title={proceedText}
                  onPress={handleProceed}
                  style={styles.modalButton}
                />
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    width: "90%",
    maxWidth: 400,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.gray900,
    textAlign: "center",
  },
  modalBody: {
    padding: 24,
  },
  measurementContainer: {
    alignItems: "center",
  },
  measurementLabel: {
    fontSize: 16,
    color: Colors.gray600,
    marginBottom: 8,
  },
  measurementValue: {
    fontSize: 48,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 14,
    color: Colors.gray700,
    textAlign: "center",
    lineHeight: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
    width: "100%",
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.gray700,
  },
  summaryValue: {
    fontSize: 16,
    color: Colors.gray900,
    fontWeight: "600",
  },
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    marginBottom: 0,
  },
  processingIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  processingText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.primary,
    marginBottom: 16,
    textAlign: "center",
  },
});

export default WeighingControlModal;