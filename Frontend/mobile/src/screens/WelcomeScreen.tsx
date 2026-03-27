import React, { useEffect } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFonts, Aclonica_400Regular } from "@expo-google-fonts/aclonica";

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function WelcomeScreen({ navigation }: Props) {
  const [fontsLoaded] = useFonts({ Aclonica_400Regular });

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 800);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require("../../assets/welcome-photo.png")}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      <View style={styles.bottomContainer}>
        <Text style={styles.logo}>UGECO</Text>
        <Text style={styles.subtitle}>
          Naskoč na nejnovější trend tvorby{"\n"}obsahu.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FE6E30",
  },
  imageContainer: {
    flex: 0,
    height: "45%",
    overflow: "hidden",
  },
  image: {
    width: "130%",
    height: "130%",
    marginTop: -50,
    marginLeft: -30,
  },
  bottomContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 160,
  },
  logo: {
    fontFamily: "Aclonica_400Regular",
    fontSize: 64,
    color: "#FFFFFF",
    lineHeight: 64,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 26,
  },
});
