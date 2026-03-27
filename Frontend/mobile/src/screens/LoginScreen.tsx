import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { login } from "../api/auth";
import InputField from "../components/InputField";
import Button from "../components/Button";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Zadaný e-mail alebo heslo nie je správne.");
      return;
    }

    setLoading(true);
    try {
      const data = await login({ email, password, rememberMe });
      const payload = JSON.parse(atob(data.access_token.split(".")[1]));
      if (payload.role === "brand_manager") {
        setError("Táto aplikácia nie je určená pre správcov značiek.");
        setLoading(false);
        return;
      }
      await AsyncStorage.setItem("access_token", data.access_token);
      navigation.replace("Home");
    } catch (err: any) {
      console.log("[AUTH] Login error:", err.message);
      if (
        err.message?.includes("Server nedostupný") ||
        err.message?.includes("Network")
      ) {
        setError("Server nedostupný. Skontrolujte pripojenie.");
      } else {
        setError("Zadaný e-mail alebo heslo nie je správne.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log("Forgot password");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>
            <Text style={styles.logoOrange}>U</Text>
            <Text style={styles.logoDark}>G</Text>
            <Text style={styles.logoOrange}>E</Text>
            <Text style={styles.logoOrange}>C</Text>
            <Text style={styles.logoDark}>O</Text>
          </Text>
          <Text style={styles.subtitle}>
            Tvoř obsah, který značkám opravdu funguje.
          </Text>
        </View>

        <View style={styles.formContainer}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <InputField
            label="E-mail"
            placeholder="Zadajte e-mail"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError("");
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={error ? " " : undefined}
            style={styles.loginInput}
          />

          <InputField
            label="Heslo"
            password
            placeholder="*****"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError("");
            }}
            autoCapitalize="none"
            error={error ? " " : undefined}
            style={styles.loginInput}
          />

          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View
                style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
              >
                {rememberMe && (
                  <Ionicons name="checkmark" size={14} color="#FFF" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Zapamätať si</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPassword}>Zapomenuté heslo</Text>
            </TouchableOpacity>
          </View>

          <Button
            title="Přihlásit se"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
            textStyle={{ fontSize: 17 }}
          />

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Registrovat </Text>
            <Text style={styles.registerText}>se můžete na </Text>
            <TouchableOpacity
              onPress={() => Linking.openURL("https://www.ugeco.cz")}
            >
              <Text style={styles.registerLink}>www.ugeco.cz</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  logo: {
    fontFamily: "Aclonica_400Regular",
    fontSize: 64,
    color: "#FFFFFF",
    lineHeight: 64,
    marginBottom: 16,
  },
  logoDark: {
    color: "#1A1A2E",
  },
  logoOrange: {
    color: "#FE6E30",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  loginInput: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 40,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: "#D0D0D0",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: "#FE6E30",
    borderColor: "#FE6E30",
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#666",
  },
  forgotPassword: {
    fontSize: 14,
    color: "#FE6E30",
    fontWeight: "500",
  },
  loginButton: {
    paddingVertical: 16,
    marginBottom: 30,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  registerText: {
    fontSize: 14,
    color: "#666",
  },
  registerLink: {
    fontSize: 14,
    color: "#1A1A2E",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
