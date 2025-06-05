import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Input from "./Input";
import Button from "./Button";
import { Colors } from "../../constants/Colors";

const EditMeasurementModal = ({ visible, measurement, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    weight: "",
    height: "",
    nutritionStatus: "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const nutritionOptions = ["sehat", "tidak sehat", "obesitas"];

  useEffect(() => {
    if (measurement) {
      setFormData({
        weight: measurement.weight
          ? measurement.weight.toString().replace(" kg", "")
          : "",
        height: measurement.height
          ? measurement.height.toString().replace(" cm", "")
          : "",
        nutritionStatus: measurement.nutritionStatus || "",
      });
      setErrors({});
    }
  }, [measurement]);

  const validateForm = () => {
    const newErrors = {};

    if (
      !formData.weight ||
      isNaN(formData.weight) ||
      parseFloat(formData.weight) <= 0
    ) {
      newErrors.weight = "Please enter a valid weight";
    }

    if (
      !formData.height ||
      isNaN(formData.height) ||
      parseFloat(formData.height) <= 0
    ) {
      newErrors.height = "Please enter a valid height";
    }

    if (!formData.nutritionStatus) {
      newErrors.nutritionStatus = "Please select nutrition status";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const updateData = {
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        nutritionStatus: formData.nutritionStatus,
      };

      await onSave(updateData);
    } catch (error) {
      Alert.alert("Error", "Failed to update measurement");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setFormData({ weight: "", height: "", nutritionStatus: "" });
    setErrors({});
    onClose();
  };

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

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
          <Text style={styles.title}>Edit Measurement</Text>
          <View style={styles.spacer} />
        </View>

        <View style={styles.content}>
          <Input
            label="Weight (kg)"
            placeholder="Enter weight"
            value={formData.weight}
            onChangeText={(value) => updateFormData("weight", value)}
            keyboardType="numeric"
            error={errors.weight}
          />

          <Input
            label="Height (cm)"
            placeholder="Enter height"
            value={formData.height}
            onChangeText={(value) => updateFormData("height", value)}
            keyboardType="numeric"
            error={errors.height}
          />

          <View style={styles.nutritionContainer}>
            <Text style={styles.nutritionLabel}>Nutrition Status</Text>
            <View style={styles.nutritionOptions}>
              {nutritionOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.nutritionOption,
                    formData.nutritionStatus === option &&
                      styles.nutritionOptionSelected,
                  ]}
                  onPress={() => updateFormData("nutritionStatus", option)}
                >
                  <Text
                    style={[
                      styles.nutritionOptionText,
                      formData.nutritionStatus === option &&
                        styles.nutritionOptionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.nutritionStatus && (
              <Text style={styles.errorText}>{errors.nutritionStatus}</Text>
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            title="Cancel"
            onPress={handleClose}
            variant="outline"
            style={styles.cancelButton}
          />
          <Button
            title={saving ? "Saving..." : "Save Changes"}
            onPress={handleSave}
            disabled={saving}
            style={styles.saveButton}
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
    paddingTop: 24,
  },
  nutritionContainer: {
    marginBottom: 16,
  },
  nutritionLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.gray700,
    marginBottom: 8,
  },
  nutritionOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  nutritionOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.gray300,
    backgroundColor: Colors.white,
  },
  nutritionOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  nutritionOptionText: {
    fontSize: 14,
    color: Colors.gray700,
    fontWeight: "500",
  },
  nutritionOptionTextSelected: {
    color: Colors.white,
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
  saveButton: {
    flex: 1,
  },
});

export default EditMeasurementModal;
