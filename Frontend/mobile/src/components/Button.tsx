import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";

type ButtonVariant = "primary" | "outline" | "dark" | "outlineGray";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const containerStyles = [
    styles.base,
    variant === "primary" && styles.primary,
    variant === "outline" && styles.outline,
    variant === "dark" && styles.dark,
    variant === "outlineGray" && styles.outlineGray,
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.textBase,
    variant === "primary" && styles.textPrimary,
    variant === "outline" && styles.textOutline,
    variant === "dark" && styles.textDark,
    variant === "outlineGray" && styles.textOutlineGray,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={containerStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" || variant === "outlineGray" ? "#FE6E30" : "#FFF"}
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: "#FE6E30",
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#FE6E30",
  },
  dark: {
    backgroundColor: "#1A1A2E",
  },
  outlineGray: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#71717A",
    borderRadius: 6,
  },
  disabled: {
    opacity: 0.7,
  },
  textBase: {
    fontSize: 16,
    fontWeight: "600",
  },
  textPrimary: {
    color: "#FFF",
  },
  textOutline: {
    color: "#FE6E30",
  },
  textDark: {
    color: "#FFF",
  },
  textOutlineGray: {
    color: "#71717A",
  },
});
