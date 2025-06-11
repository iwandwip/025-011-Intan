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
  ScrollView,
} from "react-native";
import Input from "./Input";
import DatePicker from "./DatePicker";
import Button from "./Button";
import { Colors } from "../../constants/Colors";

const EditUserModal = ({ visible, user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    parentName: "",
    birthdate: "",
    gender: "",
    rfid: "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        parentName: user.parentName || "",
        birthdate: user.birthdate || "",
        gender: user.gender || "",
        rfid: user.rfid || "",
      });
      setErrors({});
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nama anak wajib diisi";
    }

    if (!formData.parentName.trim()) {
      newErrors.parentName = "Nama orang tua wajib diisi";
    }

    if (!formData.birthdate) {
      newErrors.birthdate = "Tanggal lahir wajib diisi";
    }

    if (!formData.gender) {
      newErrors.gender = "Jenis kelamin wajib dipilih";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      Alert.alert("Kesalahan", "Gagal memperbarui profil pengguna");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      parentName: "",
      birthdate: "",
      gender: "",
      rfid: "",
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

  const getDateLimits = () => {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setFullYear(today.getFullYear() - 3);

    const minDate = new Date();
    minDate.setFullYear(today.getFullYear() - 18);

    return { maxDate, minDate };
  };

  const { maxDate, minDate } = getDateLimits();

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
          <Text style={styles.title}>Edit Profil Siswa</Text>
          <View style={styles.spacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Input
            label="Nama Anak"
            placeholder="Masukkan nama anak"
            value={formData.name}
            onChangeText={(value) => updateFormData("name", value)}
            autoCapitalize="words"
            error={errors.name}
          />

          <Input
            label="Nama Orang Tua"
            placeholder="Masukkan nama orang tua"
            value={formData.parentName}
            onChangeText={(value) => updateFormData("parentName", value)}
            autoCapitalize="words"
            error={errors.parentName}
          />

          <DatePicker
            label="Tanggal Lahir"
            placeholder="Pilih tanggal lahir"
            value={formData.birthdate}
            onChange={(value) => updateFormData("birthdate", value)}
            maximumDate={maxDate}
            minimumDate={minDate}
            error={errors.birthdate}
          />

          <View style={styles.genderContainer}>
            <Text style={styles.genderLabel}>Jenis Kelamin</Text>
            <View style={styles.genderButtons}>
              <Button
                title="Laki-laki"
                onPress={() => updateFormData("gender", "male")}
                variant={formData.gender === "male" ? "primary" : "outline"}
                style={styles.genderButton}
              />
              <Button
                title="Perempuan"
                onPress={() => updateFormData("gender", "female")}
                variant={formData.gender === "female" ? "primary" : "outline"}
                style={styles.genderButton}
              />
            </View>
            {errors.gender && (
              <Text style={styles.errorText}>{errors.gender}</Text>
            )}
          </View>

          <Input
            label="RFID (Opsional)"
            placeholder="Masukkan ID kartu RFID"
            value={formData.rfid}
            onChangeText={(value) => updateFormData("rfid", value)}
            autoCapitalize="characters"
          />
        </ScrollView>

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
  genderContainer: {
    marginBottom: 16,
  },
  genderLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.gray700,
    marginBottom: 8,
  },
  genderButtons: {
    flexDirection: "row",
    gap: 12,
  },
  genderButton: {
    flex: 1,
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

export default EditUserModal;
