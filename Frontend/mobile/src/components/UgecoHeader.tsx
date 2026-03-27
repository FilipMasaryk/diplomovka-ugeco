import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useFonts, Aclonica_400Regular } from "@expo-google-fonts/aclonica";

export default function UgecoHeader() {
  const [fontsLoaded] = useFonts({ Aclonica_400Regular });

  if (!fontsLoaded) return null;

  return (
    <View style={styles.header}>
      <Text style={[styles.letter, { color: "#FE6E30" }]}>U</Text>
      <Text style={[styles.letter, { color: "#333" }]}>G</Text>
      <Text style={[styles.letter, { color: "#FE6E30" }]}>E</Text>
      <Text style={[styles.letter, { color: "#FE6E30" }]}>C</Text>
      <Text style={[styles.letter, { color: "#333" }]}>O</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
  },
  letter: {
    fontFamily: "Aclonica_400Regular",
    fontSize: 24,
    lineHeight: 24,
  },
});
