import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { Colors } from "../../constants/Colors";

const { height: screenHeight } = Dimensions.get('window');

const NutritionStatusHelpModal = ({ visible, onClose }) => {
  console.log('NutritionStatusHelpModal rendered with visible:', visible);
  
  const statusInfo = [
    {
      status: "Gizi Buruk",
      color: "#B91C1C",
      description: "Status gizi sangat kurang yang memerlukan perhatian medis segera. Biasanya terjadi pada BMI di bawah 17 atau sangat underweight.",
    },
    {
      status: "Gizi Kurang", 
      color: "#EA580C",
      description: "Status gizi kurang dimana berat badan anak berada di bawah normal untuk tinggi badannya. Perlu peningkatan asupan nutrisi.",
    },
    {
      status: "Gizi Baik",
      color: "#16A34A",
      description: "Status gizi normal dan sehat. Berat badan dan tinggi badan anak sesuai dengan standar pertumbuhan yang baik.",
    },
    {
      status: "Overweight",
      color: "#F59E0B",
      description: "Berat badan berlebih namun belum mencapai kategori obesitas. Perlu pengaturan pola makan dan aktivitas fisik.",
    },
    {
      status: "Obesitas",
      color: "#DC2626",
      description: "Kelebihan berat badan yang signifikan yang dapat berisiko pada kesehatan. Memerlukan intervensi diet dan gaya hidup.",
    },
  ];

  // Always render modal, let Modal component handle visibility

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
      presentationStyle="overFullScreen"
      hardwareAccelerated={true}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.overlayTouch} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Status Gizi Anak</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.subtitle}>
              Penjelasan kategori status gizi berdasarkan pengukuran berat dan tinggi badan:
            </Text>

            {statusInfo.map((item, index) => (
              <View key={index} style={styles.statusItem}>
                <View style={styles.statusHeader}>
                  <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
                  <Text style={[styles.statusName, { color: item.color }]}>
                    {item.status}
                  </Text>
                </View>
                <Text style={styles.statusDescription}>{item.description}</Text>
              </View>
            ))}

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                ⚠️ Status gizi ini berdasarkan perhitungan BMI sederhana. Untuk diagnosis yang akurat, konsultasikan dengan dokter atau ahli gizi.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
    zIndex: 9999999,
    elevation: 9999999,
  },
  overlayTouch: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: screenHeight * 0.85,
    minHeight: screenHeight * 0.6,
    width: '100%',
    elevation: 10000000,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    zIndex: 10000000,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.gray900,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray100,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 20,
    color: Colors.gray600,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.gray600,
    lineHeight: 22,
    marginBottom: 24,
    textAlign: "center",
  },
  statusItem: {
    marginBottom: 20,
    padding: 18,
    backgroundColor: Colors.gray25,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  colorIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 10,
  },
  statusName: {
    fontSize: 17,
    fontWeight: "600",
  },
  statusDescription: {
    fontSize: 15,
    color: Colors.gray700,
    lineHeight: 22,
  },
  footer: {
    marginTop: 20,
    padding: 18,
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  footerText: {
    fontSize: 14,
    color: "#92400E",
    lineHeight: 20,
    textAlign: "center",
  },
});

export default NutritionStatusHelpModal;