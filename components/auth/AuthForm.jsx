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

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!validatePassword(formData.password)) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (isRegister && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Child name is required";
    }

    if (!formData.parentName.trim()) {
      newErrors.parentName = "Parent name is required";
    }

    if (!formData.birthdate) {
      newErrors.birthdate = "Birth date is required";
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setErrors({});
  };

  const handleSubmit = () => {
    if (isRegister && step === 1) {
      handleNext();
      return;
    }

    if (isRegister && step === 2) {
      if (!validateStep2()) return;
    } else if (!isForgotPassword) {
      if (!validateStep1()) return;
    }

    const data = { email: formData.email };

    if (!isForgotPassword) {
      data.password = formData.password;
    }

    if (isRegister) {
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
      return step === 1 ? "Create Account" : "Child Information";
    }
    switch (type) {
      case "forgot-password":
        return "Reset Password";
      default:
        return "Welcome Back";
    }
  };

  const getButtonText = () => {
    if (isRegister) {
      return step === 1 ? "Next" : "Create Account";
    }
    switch (type) {
      case "forgot-password":
        return "Send Reset Email";
      default:
        return "Sign In";
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
    return <LoadingSpinner text="Please wait..." />;
  }

  const { maxDate, minDate } = getDateLimits();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>{getTitle()}</Text>

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
                placeholder="Enter your email"
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
                    placeholder="Enter your password"
                    value={formData.password}
                    onChangeText={(value) => updateFormData("password", value)}
                    secureTextEntry
                    error={errors.password}
                  />

                  {isRegister && (
                    <Input
                      label="Confirm Password"
                      placeholder="Confirm your password"
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

          {isRegister && step === 2 && (
            <>
              <Input
                label="Child Name"
                placeholder="Enter child's name"
                value={formData.name}
                onChangeText={(value) => updateFormData("name", value)}
                autoCapitalize="words"
                error={errors.name}
              />

              <Input
                label="Parent Name"
                placeholder="Enter parent's name"
                value={formData.parentName}
                onChangeText={(value) => updateFormData("parentName", value)}
                autoCapitalize="words"
                error={errors.parentName}
              />

              <DatePicker
                label="Birth Date"
                placeholder="Select birth date"
                value={formData.birthdate}
                onChange={(value) => updateFormData("birthdate", value)}
                maximumDate={maxDate}
                minimumDate={minDate}
                error={errors.birthdate}
              />

              <View style={styles.genderContainer}>
                <Text style={styles.genderLabel}>Gender</Text>
                <View style={styles.genderButtons}>
                  <Button
                    title="Male"
                    onPress={() => updateFormData("gender", "male")}
                    variant={formData.gender === "male" ? "primary" : "outline"}
                    style={styles.genderButton}
                  />
                  <Button
                    title="Female"
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
          {isRegister && step === 2 && (
            <Button
              title="Back"
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
