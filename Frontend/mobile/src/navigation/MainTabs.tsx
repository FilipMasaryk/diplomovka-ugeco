import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import ProfileScreen from "../screens/ProfileScreen";
import FavoritesScreen from "../screens/FavoritesScreen";
import OffersScreen from "../screens/OffersScreen";
import NewsScreen from "../screens/NewsScreen";
import SettingsScreen from "../screens/SettingsScreen";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Ponuky"
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: "#FE6E30",
        tabBarInactiveTintColor: "#1A1A2E",
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Obľúbené"
        component={FavoritesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Ponuky"
        component={OffersScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.centerTabOuter}>
              <View style={[styles.centerTab, focused && styles.centerTabActive]}>
                <Ionicons name="document-text" size={25} color={focused ? "#FFF" : "#1A1A2E"} />
                <Text style={[styles.centerTabText, { color: focused ? "#FFF" : "#1A1A2E" }]}>Ponuky</Text>
              </View>
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tab.Screen
        name="Novinky"
        component={NewsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Nastavenia"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 70,
    paddingBottom: 8,
    paddingTop: 8,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  centerTabOuter: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
  },
  centerTab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  centerTabText: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
  centerTabActive: {
    backgroundColor: "#FE6E30",
    borderColor: "#FE6E30",
  },
});
