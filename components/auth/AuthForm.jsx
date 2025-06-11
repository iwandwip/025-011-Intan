import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Input from "../ui/Input";
import DatePicker from "../ui/DatePicker";
import Button from "../ui/Button";
import LoadingSpinner from "../ui/LoadingSpinner";
import { Colors } from "../../constants/Colors";
import { validateEmail, validatePassword } from "../../utils/validation";

const AuthForm = ({ type = "login", onSubmit, loading = false }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    parentName: "",
    birthdate: "",
    gender: "",
  });
  const [errors, setErrors] = useState({});

  const isRegister = type === "register";
  const isForgotPassword = type === "forgot-password";
  const isAdminEmail = formData.email === "admin@gmail.com";

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!validateEmail(formData.email)) {
      newErrors.email = "Silakan masukkan alamat email yang valid";
    }

    if (!validatePassword(formData.password)) {
      newErrors.password = "Password harus minimal 6 karakter";
    }

    if (isRegister && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Password tidak cocok";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
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

  const handleNext = () => {
    if (validateStep1()) {
      if (isAdminEmail) {
        handleSubmit();
      } else {
        setStep(2);
      }
    }
  };

  const handleBack = () => {
    setStep(1);
    setErrors({});
  };

  const handleSubmit = () => {
    if (isRegister && step === 1 && !isAdminEmail) {
      handleNext();
      return;
    }

    if (isRegister && step === 2 && !isAdminEmail) {
      if (!validateStep2()) return;
    } else if (!isForgotPassword) {
      if (!validateStep1()) return;
    }

    const data = { email: formData.email };

    if (!isForgotPassword) {
      data.password = formData.password;
    }

    if (isRegister && !isAdminEmail) {
      data.profileData = {
        name: formData.name,
        parentName: formData.parentName,
        birthdate: formData.birthdate,
        gender: formData.gender,
      };
    }

    onSubmit(data);
  };

  const getTitle = () => {
    if (isRegister) {
      if (isAdminEmail && step === 1) {
        return "Buat Akun Admin";
      }
      return step === 1 ? "Buat Akun" : "Informasi Anak";
    }
    switch (type) {
      case "forgot-password":
        return "Reset Password";
      default:
        return "Selamat Datang Kembali";
    }
  };

  const getButtonText = () => {
    if (isRegister) {
      if (isAdminEmail && step === 1) {
        return "Buat Akun Admin";
      }
      return step === 1 ? "Selanjutnya" : "Buat Akun";
    }
    switch (type) {
      case "forgot-password":
        return "Kirim Email Reset";
      default:
        return "Masuk";
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

  if (loading) {
    return <LoadingSpinner text="Silakan tunggu..." />;
  }

  const { maxDate, minDate } = getDateLimits();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>{getTitle()}</Text>

        {isRegister && isAdminEmail && step === 1 && (
          <View style={styles.adminNotice}>
            <Text style={styles.adminNoticeText}>
              🔐 Akun admin akan dibuat dengan pengaturan default
            </Text>
          </View>
        )}

        <KeyboardAwareScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          enableAutomaticScroll={true}
          extraScrollHeight={20}
          bounces={false}
        >
          {(!isRegister || step === 1) && (
            <>
              <Input
                label="Email"
                placeholder="Masukkan email Anda"
                value={formData.email}
                onChangeText={(value) => updateFormData("email", value)}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
              />

              {!isForgotPassword && (
                <>
                  <Input
                    label="Password"
                    placeholder="Masukkan password Anda"
                    value={formData.password}
                    onChangeText={(value) => updateFormData("password", value)}
                    secureTextEntry
                    error={errors.password}
                  />

                  {isRegister && (
                    <Input
                      label="Konfirmasi Password"
                      placeholder="Konfirmasi password Anda"
                      value={formData.confirmPassword}
                      onChangeText={(value) =>
                        updateFormData("confirmPassword", value)
                      }
                      secureTextEntry
                      error={errors.confirmPassword}
                    />
                  )}
                </>
              )}
            </>
          )}

          {isRegister && step === 2 && !isAdminEmail && (
            <>
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
                    variant={
                      formData.gender === "female" ? "primary" : "outline"
                    }
                    style={styles.genderButton}
                  />
                </View>
                {errors.gender && (
                  <Text style={styles.errorText}>{errors.gender}</Text>
                )}
              </View>
            </>
          )}
        </KeyboardAwareScrollView>

        <View style={styles.buttonContainer}>
          {isRegister && step === 2 && !isAdminEmail && (
            <Button
              title="Kembali"
              onPress={handleBack}
              variant="outline"
              style={styles.backButton}
            />
          )}

          <Button
            title={getButtonText()}
            onPress={handleSubmit}
            style={styles.submitButton}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.gray900,
    textAlign: "center",
    marginBottom: 32,
  },
  adminNotice: {
    backgroundColor: Colors.primary + "20",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.primary + "40",
  },
  adminNoticeText: {
    fontSize: 14,
    color: Colors.primary,
    textAlign: "center",
    fontWeight: "500",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
  buttonContainer: {
    marginTop: 24,
    paddingTop: 16,
  },
  backButton: {
    marginBottom: 12,
  },
  submitButton: {
    marginBottom: 8,
  },
});

export default AuthForm;
