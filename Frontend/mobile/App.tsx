import React from "react";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View, Text, TextInput } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import WelcomeScreen from "./src/screens/WelcomeScreen";
import LoginScreen from "./src/screens/LoginScreen";
import MainTabs from "./src/navigation/MainTabs";
import OfferDetailScreen from "./src/screens/OfferDetailScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Set Inter as default font for all Text and TextInput components
  if (fontsLoaded) {
    const defaultTextStyle = { fontFamily: "Inter_400Regular" };
    const origTextRender = (Text as any).render;
    if (origTextRender && !(Text as any).__interPatched) {
      (Text as any).render = function (props: any, ref: any) {
        const style = [defaultTextStyle, props.style];
        return origTextRender.call(this, { ...props, style }, ref);
      };
      (Text as any).__interPatched = true;
    }
    const origInputRender = (TextInput as any).render;
    if (origInputRender && !(TextInput as any).__interPatched) {
      (TextInput as any).render = function (props: any, ref: any) {
        const style = [defaultTextStyle, props.style];
        return origInputRender.call(this, { ...props, style }, ref);
      };
      (TextInput as any).__interPatched = true;
    }
  }

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#F26A3E" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={MainTabs} />
        <Stack.Screen name="OfferDetail" component={OfferDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
