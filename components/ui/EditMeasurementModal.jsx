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
    ageYears: "",
    ageMonths: "",
    gender: "",
    weight: "",
    height: "",
    eatingPattern: "",
    childResponse: "",
    nutritionStatus: "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const nutritionOptions = ["gizi buruk", "gizi kurang", "gizi baik", "overweight", "obesitas"];
  const genderOptions = ["male", "female"];
  const eatingPatternOptions = ["Kurang", "Cukup", "Berlebih"];
  const childResponseOptions = ["Pasif", "Sedang", "Aktif"];

  useEffect(() => {
    if (measurement) {
      setFormData({
        ageYears: measurement.ageYears ? measurement.ageYears.toString() : "",
        ageMonths: measurement.ageMonths ? measurement.ageMonths.toString() : "",
        gender: measurement.gender || "",
        weight: measurement.weight
          ? measurement.weight.toString().replace(" kg", "")
          : "",
        height: measurement.height
          ? measurement.height.toString().replace(" cm", "")
          : "",
        eatingPattern: measurement.eatingPattern || "",
        childResponse: measurement.childResponse || "",
        nutritionStatus: measurement.nutritionStatus || "",
      });
      setErrors({});
    }
  }, [measurement]);

  const validateForm = () => {
    const newErrors = {};

    if (
      !formData.ageYears ||
      isNaN(formData.ageYears) ||
      parseInt(formData.ageYears) <= 0 ||
      parseInt(formData.ageYears) > 15
    ) {
      newErrors.ageYears = "Usia tahun harus antara 1-15 tahun";
    }

    if (
      !formData.ageMonths ||
      isNaN(formData.ageMonths) ||
      parseInt(formData.ageMonths) < 0 ||
      parseInt(formData.ageMonths) > 11
    ) {
      newErrors.ageMonths = "Usia bulan harus antara 0-11 bulan";
    }

    if (!formData.gender) {
      newErrors.gender = "Silakan pilih jenis kelamin";
    }

    if (
      !formData.weight ||
      isNaN(formData.weight) ||
      parseFloat(formData.weight) <= 0
    ) {
      newErrors.weight = "Silakan masukkan berat badan yang valid";
    }

    if (
      !formData.height ||
      isNaN(formData.height) ||
      parseFloat(formData.height) <= 0
    ) {
      newErrors.height = "Silakan masukkan tinggi badan yang valid";
    }

    if (!formData.eatingPattern) {
      newErrors.eatingPattern = "Silakan pilih pola makan";
    }

    if (!formData.childResponse) {
      newErrors.childResponse = "Silakan pilih respon anak";
    }

    if (!formData.nutritionStatus) {
      newErrors.nutritionStatus = "Silakan pilih status gizi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateIMT = (weight, height) => {
    if (height <= 0 || weight <= 0) return 0;
    const heightInMeters = height / 100;
    const imt = weight / (heightInMeters * heightInMeters);
    return Math.round(imt * 100) / 100;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const weight = parseFloat(formData.weight);
      const height = parseFloat(formData.height);
      const imt = calculateIMT(weight, height);
      
      const updateData = {
        ageYears: parseInt(formData.ageYears),
        ageMonths: parseInt(formData.ageMonths),
        gender: formData.gender,
        weight: weight,
        height: height,
        imt: imt,
        eatingPattern: formData.eatingPattern,
        childResponse: formData.childResponse,
        nutritionStatus: formData.nutritionStatus,
      };

      await onSave(updateData);
    } catch (error) {
      Alert.alert("Kesalahan", "Gagal memperbarui pengukuran");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setFormData({
      ageYears: "",
      ageMonths: "",
      gender: "",
      weight: "",
      height: "",
      eatingPattern: "",
      childResponse: "",
      nutritionStatus: "",
    });
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
          <Text style={styles.title}>Ubah Pengukuran</Text>
          <View style={styles.spacer} />
        </View>

        <View style={styles.content}>
          <View style={styles.ageContainer}>
            <View style={styles.ageRow}>
              <View style={styles.ageInput}>
                <Input
                  label="Usia (Tahun)"
                  placeholder="0-15"
                  value={formData.ageYears}
                  onChangeText={(value) => updateFormData("ageYears", value)}
                  keyboardType="numeric"
                  error={errors.ageYears}
                />
              </View>
              <View style={styles.ageInput}>
                <Input
                  label="Usia (Bulan)"
                  placeholder="0-11"
                  value={formData.ageMonths}
                  onChangeText={(value) => updateFormData("ageMonths", value)}
                  keyboardType="numeric"
                  error={errors.ageMonths}
                />
              </View>
            </View>
          </View>

          <View style={styles.optionContainer}>
            <Text style={styles.optionLabel}>Jenis Kelamin</Text>
            <View style={styles.optionButtons}>
              {genderOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    formData.gender === option && styles.optionButtonSelected,
                  ]}
                  onPress={() => updateFormData("gender", option)}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      formData.gender === option && styles.optionButtonTextSelected,
                    ]}
                  >
                    {option === 'male' ? 'Laki-laki' : 'Perempuan'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.gender && (
              <Text style={styles.errorText}>{errors.gender}</Text>
            )}
          </View>

          <View style={styles.measurementRow}>
            <View style={styles.measurementInput}>
              <Input
                label="Berat (kg)"
                placeholder="Berat badan"
                value={formData.weight}
                onChangeText={(value) => updateFormData("weight", value)}
                keyboardType="numeric"
                error={errors.weight}
              />
            </View>
            <View style={styles.measurementInput}>
              <Input
                label="Tinggi (cm)"
                placeholder="Tinggi badan"
                value={formData.height}
                onChangeText={(value) => updateFormData("height", value)}
                keyboardType="numeric"
                error={errors.height}
              />
            </View>
          </View>

          <View style={styles.optionContainer}>
            <Text style={styles.optionLabel}>Pola Makan</Text>
            <View style={styles.optionButtons}>
              {eatingPatternOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    formData.eatingPattern === option && styles.optionButtonSelected,
                  ]}
                  onPress={() => updateFormData("eatingPattern", option)}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      formData.eatingPattern === option && styles.optionButtonTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.eatingPattern && (
              <Text style={styles.errorText}>{errors.eatingPattern}</Text>
            )}
          </View>

          <View style={styles.optionContainer}>
            <Text style={styles.optionLabel}>Respon Anak</Text>
            <View style={styles.optionButtons}>
              {childResponseOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    formData.childResponse === option && styles.optionButtonSelected,
                  ]}
                  onPress={() => updateFormData("childResponse", option)}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      formData.childResponse === option && styles.optionButtonTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.childResponse && (
              <Text style={styles.errorText}>{errors.childResponse}</Text>
            )}
          </View>

          <View style={styles.optionContainer}>
            <Text style={styles.optionLabel}>Status Gizi</Text>
            <View style={styles.optionButtons}>
              {nutritionOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    formData.nutritionStatus === option && styles.optionButtonSelected,
                  ]}
                  onPress={() => updateFormData("nutritionStatus", option)}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      formData.nutritionStatus === option && styles.optionButtonTextSelected,
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
            title="Batal"
            onPress={handleClose}
            variant="outline"
            style={styles.cancelButton}
          />
          <Button
            title={saving ? "Menyimpan..." : "Simpan Perubahan"}
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
  contextInfo: {
    backgroundColor: Colors.gray50,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  contextTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.gray900,
    marginBottom: 12,
  },
  contextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  contextItem: {
    flex: 1,
    minWidth: "45%",
    marginBottom: 8,
  },
  contextLabel: {
    fontSize: 13,
    color: Colors.gray600,
    marginBottom: 2,
  },
  contextValue: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.gray900,
  },
  ageContainer: {
    marginBottom: 20,
  },
  ageRow: {
    flexDirection: "row",
    gap: 12,
  },
  ageInput: {
    flex: 1,
  },
  measurementRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  measurementInput: {
    flex: 1,
  },
  optionContainer: {
    marginBottom: 20,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.gray700,
    marginBottom: 8,
  },
  optionButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.gray300,
    backgroundColor: Colors.white,
  },
  optionButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionButtonText: {
    fontSize: 14,
    color: Colors.gray700,
    fontWeight: "500",
  },
  optionButtonTextSelected: {
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
