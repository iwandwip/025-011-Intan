import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  StatusBar,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useAuth } from "../../contexts/AuthContext";
import Input from "../../components/ui/Input";
import DatePicker from "../../components/ui/DatePicker";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { updateUserProfile } from "../../services/userService";
import { Colors } from "../../constants/Colors";

export default function EditProfile() {
  const { userProfile, refreshProfile } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: userProfile?.name || "",
    parentName: userProfile?.parentName || "",
    birthdate: userProfile?.birthdate || "",
    gender: userProfile?.gender || "",
  });
  const [errors, setErrors] = useState({});

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

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

    setLoading(true);

    try {
      const result = await updateUserProfile(userProfile.id, formData);

      if (result.success) {
        await refreshProfile();
        Alert.alert("Profil Diperbarui", "Profil Anda berhasil diperbarui!", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert("Gagal Memperbarui", result.error);
      }
    } catch (error) {
      Alert.alert("Gagal Memperbarui", "Terjadi kesalahan. Silakan coba lagi.");
    }

    setLoading(false);
  };


  const getDateLimits = () => {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setFullYear(today.getFullYear() - 3);

    const minDate = new Date();
    minDate.setFullYear(today.getFullYear() - 18);

    return { maxDate, minDate };
  };

  const hasRfid = () => {
    return userProfile?.rfid && userProfile.rfid.trim() !== "";
  };

  const { maxDate, minDate } = getDateLimits();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.header}>
        <Text style={styles.title}>Ubah Profil</Text>
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAwareScrollView
          style={styles.scrollContainer}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          enableAutomaticScroll={true}
          extraScrollHeight={20}
          bounces={false}
        >
          <View style={styles.formContainer}>
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

            <View style={styles.rfidContainer}>
              <Text style={styles.rfidLabel}>Kartu RFID</Text>
              <View style={styles.rfidInfo}>
                <Text style={styles.rfidValue}>
                  {hasRfid() ? userProfile.rfid : "Belum dipasang"}
                </Text>
                {hasRfid() && (
                  <Text style={styles.rfidConnected}>✓ Terhubung</Text>
                )}
              </View>

              <View style={styles.rfidStatus}>
                <Text style={styles.rfidStatusText}>
                  {hasRfid() 
                    ? "Kartu RFID sudah terpasang" 
                    : "Hubungi admin untuk memasang kartu RFID Anda"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Batal"
              onPress={() => router.back()}
              variant="outline"
              style={styles.cancelButton}
              disabled={loading}
            />

            <Button
              title={loading ? "Menyimpan..." : "Simpan Perubahan"}
              onPress={handleSave}
              style={styles.saveButton}
              disabled={loading}
            />
          </View>
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.gray900,
    textAlign: "center",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  formContainer: {
    flex: 1,
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
  rfidContainer: {
    marginBottom: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  rfidLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.gray900,
    marginBottom: 8,
  },
  rfidInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  rfidValue: {
    fontSize: 14,
    color: Colors.gray600,
    flex: 1,
  },
  rfidConnected: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: "500",
  },
  rfidStatus: {
    backgroundColor: Colors.gray50,
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  rfidStatusText: {
    fontSize: 12,
    color: Colors.gray600,
    textAlign: "center",
  },
  rfidPairingContainer: {
    alignItems: "center",
    paddingVertical: 8,
  },
  rfidActions: {
    gap: 8,
  },
  rfidButton: {
    marginTop: 8,
  },
  removeRfidButton: {
    borderColor: Colors.error,
  },
  cancelRfidButton: {
    marginTop: 12,
    minWidth: 100,
  },
  buttonContainer: {
    marginTop: 32,
    gap: 12,
  },
  cancelButton: {
    marginBottom: 8,
  },
  saveButton: {
    marginBottom: 8,
  },
});
