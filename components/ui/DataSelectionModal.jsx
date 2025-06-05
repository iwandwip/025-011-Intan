import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Button from "./Button";
import { Colors } from "../../constants/Colors";

const DataSelectionModal = ({ visible, onClose, onSubmit }) => {
  const [selectedEating, setSelectedEating] = useState("");
  const [selectedResponse, setSelectedResponse] = useState("");
  const [errors, setErrors] = useState({});

  const eatingPatterns = [
    {
      value: "kurang",
      label: "Kurang",
      description: "Sehari Makan Dibawah Kategori Cukup",
    },
    {
      value: "cukup",
      label: "Cukup",
      description: "Sehari Makan 3x + Snack 2x",
    },
    {
      value: "berlebih",
      label: "Berlebih",
      description: "Sehari Makan Lebih dari Kategori Cukup",
    },
  ];

  const childResponses = [
    {
      value: "pasif",
      label: "Pasif",
      description: "Anak Tidak Aktif Bergerak Cenderung Cuek dengan Sekitar",
    },
    {
      value: "sedang",
      label: "Sedang",
      description: "Anak Biasa Saja Tidak Terlalu Aktif",
    },
    {
      value: "aktif",
      label: "Aktif",
      description: "Anak Aktif Secara Fisik dan Cepat Tanggap",
    },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!selectedEating) {
      newErrors.eating = "Please select eating pattern";
    }

    if (!selectedResponse) {
      newErrors.response = "Please select child response";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    onSubmit({
      eatingPattern: selectedEating,
      childResponse: selectedResponse,
    });

    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setSelectedEating("");
    setSelectedResponse("");
    setErrors({});
  };

  const renderOptionCard = (option, selectedValue, onSelect, error) => (
    <TouchableOpacity
      key={option.value}
      style={[
        styles.optionCard,
        selectedValue === option.value && styles.optionCardSelected,
        error && styles.optionCardError,
      ]}
      onPress={() => onSelect(option.value)}
    >
      <View style={styles.optionHeader}>
        <Text
          style={[
            styles.optionLabel,
            selectedValue === option.value && styles.optionLabelSelected,
          ]}
        >
          {option.label}
        </Text>
        <View
          style={[
            styles.radioButton,
            selectedValue === option.value && styles.radioButtonSelected,
          ]}
        >
          {selectedValue === option.value && (
            <View style={styles.radioButtonInner} />
          )}
        </View>
      </View>
      <Text
        style={[
          styles.optionDescription,
          selectedValue === option.value && styles.optionDescriptionSelected,
        ]}
      >
        {option.description}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Data Selection</Text>
          <View style={styles.spacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.subtitle}>
            Select eating pattern and child response for accurate analysis
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🍽️ Pola Makan</Text>
            <Text style={styles.sectionDescription}>
              Choose the eating pattern that best describes the child's daily
              consumption
            </Text>

            {eatingPatterns.map((option) =>
              renderOptionCard(
                option,
                selectedEating,
                setSelectedEating,
                errors.eating
              )
            )}

            {errors.eating && (
              <Text style={styles.errorText}>{errors.eating}</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏃‍♂️ Respon Anak</Text>
            <Text style={styles.sectionDescription}>
              Choose the response level that best describes the child's activity
            </Text>

            {childResponses.map((option) =>
              renderOptionCard(
                option,
                selectedResponse,
                setSelectedResponse,
                errors.response
              )
            )}

            {errors.response && (
              <Text style={styles.errorText}>{errors.response}</Text>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Cancel"
            onPress={handleClose}
            variant="outline"
            style={styles.cancelButton}
          />
          <Button
            title="Start Weighing"
            onPress={handleSubmit}
            style={styles.submitButton}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
    backgroundColor: Colors.white,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gray100,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 16,
    color: Colors.gray600,
    fontWeight: "600",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.gray900,
  },
  spacer: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray600,
    textAlign: "center",
    marginVertical: 16,
    lineHeight: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.gray900,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.gray600,
    marginBottom: 16,
    lineHeight: 20,
  },
  optionCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.gray200,
    shadowColor: Colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "10",
  },
  optionCardError: {
    borderColor: Colors.error,
  },
  optionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.gray900,
  },
  optionLabelSelected: {
    color: Colors.primary,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.gray600,
    lineHeight: 20,
  },
  optionDescriptionSelected: {
    color: Colors.gray700,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.gray300,
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonSelected: {
    borderColor: Colors.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 4,
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
    backgroundColor: Colors.white,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});

export default DataSelectionModal;
