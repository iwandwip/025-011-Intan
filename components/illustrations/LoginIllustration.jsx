import React from "react";
import { View, StyleSheet } from "react-native";
import LoginSvg from "../../assets/images/login-illustration.svg";

const LoginIllustration = ({ width = 280, height = 200, style }) => {
  return (
    <View style={[styles.container, style]}>
      <LoginSvg width={width} height={height} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default LoginIllustration;
