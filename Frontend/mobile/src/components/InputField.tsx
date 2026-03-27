import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface InputFieldProps extends TextInputProps {
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  password?: boolean;
}

export default function InputField({
  label,
  required,
  error,
  disabled,
  password,
  style,
  ...rest
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  if (password) {
    return (
      <View>
        {label ? (
          <Text style={styles.label}>
            {label} {required ? <Text style={styles.required}>*</Text> : null}
          </Text>
        ) : null}
        <View style={[styles.passwordContainer, error ? styles.inputError : null]}>
          <TextInput
            style={[styles.passwordInput, style]}
            secureTextEntry={!showPassword}
            placeholderTextColor="#999"
            {...rest}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={22}
              color="#666"
            />
          </TouchableOpacity>
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    );
  }

  return (
    <View>
      {label ? (
        <Text style={styles.label}>
          {label} {required ? <Text style={styles.required}>*</Text> : null}
        </Text>
      ) : null}
      <TextInput
        style={[
          styles.input,
          disabled ? styles.inputDisabled : null,
          error ? styles.inputError : null,
          style,
        ]}
        editable={!disabled}
        placeholderTextColor="#999"
        {...rest}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A2E",
    marginBottom: 6,
    marginTop: 16,
  },
  required: {
    color: "#EF4444",
  },
  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1A1A2E",
  },
  inputDisabled: {
    backgroundColor: "#F0F0F0",
    color: "#999",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1A1A2E",
  },
  eyeButton: {
    paddingHorizontal: 12,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
  },
});
