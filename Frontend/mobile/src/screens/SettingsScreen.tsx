import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import UgecoHeader from "../components/UgecoHeader";
import InputField from "../components/InputField";
import Button from "../components/Button";
import Toast from "../components/Toast";
import { API_URL } from "../api/config";

type DecodedToken = {
  id: string;
  name: string;
  surName: string;
  email: string;
  role: string;
};

export default function SettingsScreen({ navigation }: any) {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [ico, setIco] = useState("");
  const [dic, setDic] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "error";
  }>({ visible: false, message: "", type: "success" });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) return;

      const decoded = jwtDecode<DecodedToken>(token);
      setName(decoded.name || "");
      setSurname(decoded.surName || "");
      setEmail(decoded.email || "");
      setRole(decoded.role || "");
      const res = await fetch(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setIco(data.ico || "");
        setDic(data.dic || "");
      }
    } catch (e) {
      console.error("Failed to load user data:", e);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Povinné pole";
    if (!surname.trim()) newErrors.surname = "Povinné pole";
    if (password && !passwordConfirmation) {
      newErrors.passwordConfirmation = "Potvrďte heslo";
    }
    if (passwordConfirmation && !password) {
      newErrors.password = "Zadajte nové heslo";
    }
    if (password && passwordConfirmation && password !== passwordConfirmation) {
      newErrors.passwordConfirmation = "Heslá sa nezhodujú";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      const token = await AsyncStorage.getItem("access_token");
      const body: any = { name, surname };

      if (role === "creator") {
        body.ico = ico;
        body.dic = dic;
      }
      if (password) {
        body.password = password;
        body.passwordConfirmation = passwordConfirmation;
      }

      const res = await fetch(`${API_URL}/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = Array.isArray(data.message)
          ? data.message[0]
          : data.message;
        setToast({
          visible: true,
          message: msg || "Niečo sa pokazilo",
          type: "error",
        });
        return;
      }

      if (data.access_token) {
        await AsyncStorage.setItem("access_token", data.access_token);
      }

      setPassword("");
      setPasswordConfirmation("");
      setToast({
        visible: true,
        message: "Zmeny boli uložené",
        type: "success",
      });
    } catch (e) {
      setToast({ visible: true, message: "Niečo sa pokazilo", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("access_token");
    navigation.getParent()?.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FE6E30" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <UgecoHeader />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.titleRow}>
          <Text style={styles.title}>Nastavenia</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutText}>Odhlásiť sa</Text>
          </TouchableOpacity>
        </View>

        <InputField
          label="Meno"
          required
          value={name}
          onChangeText={(t) => {
            setName(t);
            setErrors((e) => ({ ...e, name: "" }));
          }}
          placeholder="Meno"
          error={errors.name}
        />

        <InputField
          label="Priezvisko"
          required
          value={surname}
          onChangeText={(t) => {
            setSurname(t);
            setErrors((e) => ({ ...e, surname: "" }));
          }}
          placeholder="Priezvisko"
          error={errors.surname}
        />

        {role === "creator" && (
          <>
            <InputField
              label="IČO"
              value={ico}
              onChangeText={setIco}
              placeholder="IČO"
            />
            <InputField
              label="DIČ"
              value={dic}
              onChangeText={setDic}
              placeholder="DIČ"
            />
          </>
        )}

        <InputField
          label="E-mail"
          value={email}
          disabled
        />

        <Text style={styles.sectionTitle}>Nové heslo</Text>

        <InputField
          label="Nové heslo"
          required
          password
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            setErrors((e) => ({ ...e, password: "" }));
          }}
          placeholder="*****"
          error={errors.password}
        />

        <InputField
          label="Potvrdiť heslo"
          required
          password
          value={passwordConfirmation}
          onChangeText={(t) => {
            setPasswordConfirmation(t);
            setErrors((e) => ({ ...e, passwordConfirmation: "" }));
          }}
          placeholder="*****"
          error={errors.passwordConfirmation}
        />

        <Button
          title="Uložiť"
          onPress={handleSave}
          loading={saving}
          style={{ marginTop: 30, paddingVertical: 14 }}
        />
      </ScrollView>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1A1A2E",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FE6E30",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A2E",
    marginTop: 30,
    marginBottom: 4,
  },
});
