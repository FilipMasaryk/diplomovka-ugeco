import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import {
  fetchMyProfile,
  createProfile,
  updateProfile,
  UserProfile,
} from "../api/profiles";
import { API_URL } from "../api/config";
import UgecoHeader from "../components/UgecoHeader";
import Toast from "../components/Toast";
import InputField from "../components/InputField";
import Button from "../components/Button";

const CATEGORIES = [
  "apps_and_technology",
  "auto_moto",
  "travelling",
  "home_and_garden",
  "electronics",
  "games",
  "music_and_dance",
  "food_and_drinks",
  "books",
  "cosmetics",
  "fashion",
  "family_and_kids",
  "services",
  "sport",
  "experiences",
  "health",
  "animals",
  "lifestyle",
];

const CATEGORY_LABELS: Record<string, string> = {
  apps_and_technology: "Aplikácie a technológie",
  auto_moto: "Auto a Moto",
  travelling: "Cestovanie",
  home_and_garden: "Dom a záhrada",
  electronics: "Elektronika",
  games: "Hry",
  music_and_dance: "Hudba a tanec",
  food_and_drinks: "Jedlo a nápoje",
  books: "Knihy",
  cosmetics: "Kozmetika",
  fashion: "Móda",
  family_and_kids: "Rodina a deti",
  services: "Služby",
  sport: "Šport",
  experiences: "Zážitky",
  health: "Zdravie",
  animals: "Zvieratá",
  lifestyle: "Životný štýl",
};

const CATEGORY_COLORS: Record<string, string> = {
  apps_and_technology: "#EF4444",
  auto_moto: "#6B7280",
  travelling: "#F59E0B",
  home_and_garden: "#22C55E",
  electronics: "#3B82F6",
  games: "#A855F7",
  music_and_dance: "#EC4899",
  food_and_drinks: "#FE6E30",
  books: "#78716C",
  cosmetics: "#E879A2",
  fashion: "#8B5CF6",
  family_and_kids: "#FACC15",
  services: "#0EA5E9",
  sport: "#10B981",
  experiences: "#D946EF",
  health: "#14B8A6",
  animals: "#A3784D",
  lifestyle: "#E11D48",
};

const LANGUAGES = ["SK", "CZ", "PL", "DE", "HU", "AT"];
const LANGUAGE_LABELS: Record<string, string> = {
  SK: "Slovensko",
  CZ: "Česko",
  PL: "Poľsko",
  DE: "Nemecko",
  HU: "Maďarsko",
  AT: "Rakúsko",
};

const TARGETS = [
  "man",
  "woman",
  "child",
  "family",
  "couple",
  "friends",
  "animal",
];
const TARGET_LABELS: Record<string, string> = {
  man: "Muž",
  woman: "Žena",
  child: "Dieťa",
  family: "Rodina",
  couple: "Pár",
  friends: "Kamaráti",
  animal: "Zviera",
};

const ABOUT_MAX_LENGTH = 350;

interface FormState {
  name: string;
  languages: string[];
  categories: string[];
  creatingAs: string[];
  about: string;
  portfolio: string;
  instagram: string;
  pinterest: string;
  facebook: string;
  tiktok: string;
  youtube: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  languages: [],
  categories: [],
  creatingAs: [],
  about: "",
  portfolio: "",
  instagram: "",
  pinterest: "",
  facebook: "",
  tiktok: "",
  youtube: "",
};

const ensureUrl = (val: string) =>
  val.match(/^https?:\/\//) ? val : `https://${val}`;

const isValidUrl = (value: string): boolean => {
  try {
    const urlToCheck = value.match(/^https?:\/\//) ? value : `https://${value}`;
    const url = new URL(urlToCheck);
    return url.hostname.includes(".");
  } catch {
    return false;
  }
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "error";
  }>({ visible: false, message: "", type: "success" });

  const isNew = !profile;

  const loadProfile = useCallback(async () => {
    setLoading(true);
    const data = await fetchMyProfile();
    setProfile(data);
    if (data) {
      setForm({
        name: data.name || "",
        languages: data.languages || [],
        categories: data.categories || [],
        creatingAs: data.creatingAs || [],
        about: data.about || "",
        portfolio: data.portfolio || "",
        instagram: data.instagram || "",
        pinterest: data.pinterest || "",
        facebook: data.facebook || "",
        tiktok: data.tiktok || "",
        youtube: data.youtube || "",
      });
      if (data.image) setImagePreview(`${API_URL}${data.image}`);
      if (!data.published) setEditing(true);
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
    setIsDirty(true);
    if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
  };

  const toggleCheckbox = (
    key: "languages" | "categories" | "creatingAs",
    val: string,
  ) => {
    setForm((p) => {
      const arr = p[key] as string[];
      return {
        ...p,
        [key]: arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val],
      };
    });
    setIsDirty(true);
    if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];

      if (asset.fileSize && asset.fileSize > 100 * 1024) {
        setErrors((p) => ({ ...p, image: "Maximálna veľkosť je 100KB" }));
        return;
      }
      if (asset.width && asset.height && (asset.width > 200 || asset.height > 100)) {
        setErrors((p) => ({ ...p, image: "Maximálny rozmer je 200×100px" }));
        return;
      }

      setImage(asset);
      setImagePreview(asset.uri);
      setIsDirty(true);
      if (errors.image) setErrors((p) => ({ ...p, image: "" }));
    }
  };

  const validate = (published: boolean): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (published) {
      if (!form.name.trim()) errs.name = "Povinné pole";
      if (form.languages.length === 0) errs.languages = "Povinné pole";
      if (form.categories.length === 0) errs.categories = "Povinné pole";
      if (form.creatingAs.length === 0) errs.creatingAs = "Povinné pole";
      if (!form.about.trim()) errs.about = "Povinné pole";
      if (!form.portfolio.trim()) errs.portfolio = "Povinné pole";
      if (!image && !profile?.image) errs.image = "Povinné pole";
    }
    const urlFields: (keyof FormState)[] = [
      "portfolio",
      "instagram",
      "pinterest",
      "facebook",
      "tiktok",
      "youtube",
    ];
    urlFields.forEach((field) => {
      const val = form[field] as string;
      if (val.trim() && !isValidUrl(val)) errs[field] = "Neplatná URL adresa";
    });
    return errs;
  };

  const handleSubmit = async (published: boolean) => {
    const errs = validate(published);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("published", String(published));
      form.languages.forEach((l) => fd.append("languages", l));
      form.categories.forEach((c) => fd.append("categories", c));
      form.creatingAs.forEach((t) => fd.append("creatingAs", t));
      fd.append("about", form.about);
      fd.append(
        "portfolio",
        form.portfolio.trim() ? ensureUrl(form.portfolio) : "",
      );
      fd.append(
        "instagram",
        form.instagram.trim() ? ensureUrl(form.instagram) : "",
      );
      fd.append(
        "pinterest",
        form.pinterest.trim() ? ensureUrl(form.pinterest) : "",
      );
      fd.append(
        "facebook",
        form.facebook.trim() ? ensureUrl(form.facebook) : "",
      );
      fd.append("tiktok", form.tiktok.trim() ? ensureUrl(form.tiktok) : "");
      fd.append("youtube", form.youtube.trim() ? ensureUrl(form.youtube) : "");

      if (image) {
        const uri = image.uri;
        const filename = uri.split("/").pop() || "photo.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";
        fd.append("image", { uri, name: filename, type } as any);
      }

      const result = isNew ? await createProfile(fd) : await updateProfile(fd);
      setProfile(result);
      setEditing(false);
      setIsDirty(false);
      setImage(null);
      if (result.image) setImagePreview(`${API_URL}${result.image}`);
      setToast({
        visible: true,
        message: "Zmeny boli uložené",
        type: "success",
      });
    } catch (err: any) {
      console.log("[PROFILE] Submit error:", err);
      setToast({ visible: true, message: "Niečo sa pokazilo", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (isDirty) {
      setShowLeaveModal(true);
    } else {
      setEditing(false);
      if (profile?.image) setImagePreview(`${API_URL}${profile.image}`);
    }
  };

  const confirmLeave = () => {
    setShowLeaveModal(false);
    setEditing(false);
    setIsDirty(false);
    setImage(null);
    if (profile) {
      setForm({
        name: profile.name || "",
        languages: profile.languages || [],
        categories: profile.categories || [],
        creatingAs: profile.creatingAs || [],
        about: profile.about || "",
        portfolio: profile.portfolio || "",
        instagram: profile.instagram || "",
        pinterest: profile.pinterest || "",
        facebook: profile.facebook || "",
        tiktok: profile.tiktok || "",
        youtube: profile.youtube || "",
      });
      if (profile.image) setImagePreview(`${API_URL}${profile.image}`);
    } else {
      setForm(EMPTY_FORM);
      setImagePreview(null);
    }
    setErrors({});
  };

  // Loading
  if (loading) {
    return (
      <View style={styles.container}>
        <UgecoHeader />
        <ActivityIndicator
          size="large"
          color="#FE6E30"
          style={{ marginTop: 40 }}
        />
      </View>
    );
  }

  // Empty state - no profile
  if (!profile && !editing) {
    return (
      <View style={styles.container}>
        <UgecoHeader />
        <Text style={styles.pageTitle}>Profil</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setEditing(true)}
        >
          <Text style={styles.actionButtonText}>Vytvoriť profil</Text>
        </TouchableOpacity>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Zatiaľ nemáte vyplnený profil</Text>
          <Text style={styles.emptyDescription}>
            Po vyplnení profilu sa vám tu zobrazí náhľad
          </Text>
        </View>
      </View>
    );
  }

  // View mode - published profile
  if (profile && profile.published && !editing) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <UgecoHeader />
        <Text style={styles.pageTitle}>Profil</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setEditing(true)}
        >
          <Text style={styles.actionButtonText}>Upraviť profil</Text>
        </TouchableOpacity>

        <View style={styles.profileCard}>
          <View style={styles.cardHeader}>
            {profile.image ? (
              <Image
                source={{ uri: `${API_URL}${profile.image}` }}
                style={styles.cardImage}
              />
            ) : (
              <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
                <Ionicons name="person" size={30} color="#999" />
              </View>
            )}
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardName}>{profile.name}</Text>
            </View>
          </View>

          <View style={styles.badgesContainer}>
            {profile.categories.map((cat) => (
              <View
                key={cat}
                style={[
                  styles.badge,
                  {
                    borderColor: CATEGORY_COLORS[cat] || "#ccc",
                    backgroundColor: `${CATEGORY_COLORS[cat] || "#ccc"}15`,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: CATEGORY_COLORS[cat] || "#333" },
                  ]}
                >
                  {CATEGORY_LABELS[cat] || cat}
                </Text>
              </View>
            ))}
          </View>

          <Text style={styles.cardLanguages}>
            Jazyk:{" "}
            {profile.languages
              .map((l) => LANGUAGE_LABELS[l] || l)
              .join(", ")
              .toLowerCase()}
          </Text>

          {profile.about ? (
            <Text style={styles.cardAbout}>{profile.about}</Text>
          ) : null}

          <View style={styles.cardFooter}>
            {profile.portfolio ? (
              <TouchableOpacity
                style={styles.portfolioButton}
                onPress={() => Linking.openURL(ensureUrl(profile.portfolio!))}
              >
                <Text style={styles.portfolioButtonText}>
                  Zobraziť portfólio
                </Text>
              </TouchableOpacity>
            ) : null}
            <View style={styles.socialIcons}>
              {profile.instagram ? (
                <TouchableOpacity
                  onPress={() => Linking.openURL(ensureUrl(profile.instagram!))}
                >
                  <Ionicons name="logo-instagram" size={28} color="#E4405F" />
                </TouchableOpacity>
              ) : null}
              {profile.tiktok ? (
                <TouchableOpacity
                  onPress={() => Linking.openURL(ensureUrl(profile.tiktok!))}
                >
                  <Ionicons name="logo-tiktok" size={28} color="#000" />
                </TouchableOpacity>
              ) : null}
              {profile.youtube ? (
                <TouchableOpacity
                  onPress={() => Linking.openURL(ensureUrl(profile.youtube!))}
                >
                  <Ionicons name="logo-youtube" size={28} color="#FF0000" />
                </TouchableOpacity>
              ) : null}
              {profile.facebook ? (
                <TouchableOpacity
                  onPress={() => Linking.openURL(ensureUrl(profile.facebook!))}
                >
                  <Ionicons name="logo-facebook" size={28} color="#1877F2" />
                </TouchableOpacity>
              ) : null}
              {profile.pinterest ? (
                <TouchableOpacity
                  onPress={() => Linking.openURL(ensureUrl(profile.pinterest!))}
                >
                  <Ionicons name="logo-pinterest" size={28} color="#BD081C" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={() => setToast((t) => ({ ...t, visible: false }))}
        />
      </ScrollView>
    );
  }

  // Edit / Create mode
  return (
    <View style={styles.container}>
      <UgecoHeader />
      <View style={styles.editHeader}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={28} color="#1A1A2E" />
        </TouchableOpacity>
        <Text style={styles.pageTitleInline}>Profil</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Name */}
        <InputField
          label="Meno"
          required
          value={form.name}
          onChangeText={(t) => setField("name", t)}
          placeholder="Meno"
          error={errors.name}
        />

        {/* Languages + Tvorím ako/s  & Categories  */}
        <View style={styles.twoColumns}>
          <View style={styles.column}>
            <Text style={styles.label}>
              Jazyk <Text style={styles.required}>*</Text>
            </Text>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang}
                style={styles.checkboxItem}
                onPress={() => toggleCheckbox("languages", lang)}
              >
                <View
                  style={[
                    styles.checkbox,
                    form.languages.includes(lang) && styles.checkboxChecked,
                  ]}
                >
                  {form.languages.includes(lang) && (
                    <Ionicons name="checkmark" size={14} color="#FFF" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>
                  {LANGUAGE_LABELS[lang]}
                </Text>
              </TouchableOpacity>
            ))}
            {errors.languages ? (
              <Text style={styles.errorText}>{errors.languages}</Text>
            ) : null}

            <Text style={[styles.label, { marginTop: 120 }]}>
              Tvorím ako/s <Text style={styles.required}>*</Text>
            </Text>
            {TARGETS.map((target) => (
              <TouchableOpacity
                key={target}
                style={styles.checkboxItem}
                onPress={() => toggleCheckbox("creatingAs", target)}
              >
                <View
                  style={[
                    styles.checkbox,
                    form.creatingAs.includes(target) && styles.checkboxChecked,
                  ]}
                >
                  {form.creatingAs.includes(target) && (
                    <Ionicons name="checkmark" size={14} color="#FFF" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>
                  {TARGET_LABELS[target]}
                </Text>
              </TouchableOpacity>
            ))}
            {errors.creatingAs ? (
              <Text style={styles.errorText}>{errors.creatingAs}</Text>
            ) : null}
          </View>

          <View style={styles.column}>
            <Text style={styles.label}>
              Kategórie <Text style={styles.required}>*</Text>
            </Text>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={styles.checkboxItem}
                onPress={() => toggleCheckbox("categories", cat)}
              >
                <View
                  style={[
                    styles.checkbox,
                    form.categories.includes(cat) && styles.checkboxChecked,
                  ]}
                >
                  {form.categories.includes(cat) && (
                    <Ionicons name="checkmark" size={14} color="#FFF" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>{CATEGORY_LABELS[cat]}</Text>
              </TouchableOpacity>
            ))}
            {errors.categories ? (
              <Text style={styles.errorText}>{errors.categories}</Text>
            ) : null}
          </View>
        </View>

        {/* Image */}
        <View style={styles.imageRow}>
          <Text style={styles.label}>
            Fotka <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.imageHint}>Formát: 200×100px, do 100Kb</Text>
        </View>
        <TouchableOpacity style={styles.fileButton} onPress={pickImage}>
          <Text style={styles.fileButtonText}>Vybrať súbor</Text>
          <Text style={styles.fileName} numberOfLines={1}>
            {image
              ? image.uri.split("/").pop()
              : profile?.image
                ? profile.image.split("/").pop()
                : "Nie je vybratý žiadny súbor"}
          </Text>
        </TouchableOpacity>
        {imagePreview ? (
          <Image source={{ uri: imagePreview }} style={styles.previewImage} />
        ) : null}
        {errors.image ? (
          <Text style={styles.errorText}>{errors.image}</Text>
        ) : null}

        {/* About */}
        <InputField
          label="Niečo o mne"
          required
          value={form.about}
          onChangeText={(t) => {
            if (t.length <= ABOUT_MAX_LENGTH) setField("about", t);
          }}
          placeholder="Napíš niečo o sebe"
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          error={errors.about}
          style={styles.textArea}
        />
        <Text style={styles.charCount}>
          Počet znakov {form.about.length}/{ABOUT_MAX_LENGTH}
        </Text>

        {/* URL Fields */}
        {[
          {
            key: "portfolio",
            label: "Portfolio",
            req: true,
            placeholder: "https://portfolio.sk",
          },
          {
            key: "instagram",
            label: "Instagram",
            req: false,
            placeholder: "URL",
          },
          {
            key: "pinterest",
            label: "Pinterest",
            req: false,
            placeholder: "URL",
          },
          {
            key: "facebook",
            label: "Facebook",
            req: false,
            placeholder: "URL",
          },
          { key: "tiktok", label: "TikTok", req: false, placeholder: "URL" },
          { key: "youtube", label: "Youtube", req: false, placeholder: "URL" },
        ].map(({ key, label, req, placeholder }) => (
          <InputField
            key={key}
            label={label}
            required={req}
            value={form[key as keyof FormState] as string}
            onChangeText={(t) => setField(key as keyof FormState, t)}
            placeholder={placeholder}
            autoCapitalize="none"
            error={errors[key]}
          />
        ))}

        {/* Buttons */}
        <View style={styles.buttonsRow}>
          <Button
            title="Uložiť koncept"
            variant="outlineGray"
            onPress={() => handleSubmit(false)}
            disabled={submitting}
            style={{ paddingHorizontal: 20, paddingVertical: 10 }}
          />
          <Button
            title="Publikovať"
            onPress={() => handleSubmit(true)}
            loading={submitting}
            style={{ paddingHorizontal: 28, paddingVertical: 10 }}
          />
        </View>
      </ScrollView>

      {/* Leave confirmation modal */}
      <Modal visible={showLeaveModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Ste si istí, že chcete odísť bez uloženia?
            </Text>
            <View style={styles.modalButtons}>
              <Button
                title="Áno, odísť"
                variant="outline"
                onPress={confirmLeave}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderColor: "#D1D5DB",
                }}
                textStyle={{ color: "#333", fontSize: 14 }}
              />
              <Button
                title="Nie, pokračovať v úprave"
                onPress={() => setShowLeaveModal(false)}
                style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 16 }}
                textStyle={{ fontSize: 14 }}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  pageTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1A1A2E",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  pageTitleInline: { fontSize: 26, fontWeight: "700", color: "#1A1A2E" },
  editHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
    gap: 12,
  },
  actionButton: {
    backgroundColor: "#FE6E30",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: "flex-end",
    marginRight: 20,
    marginBottom: 16,
  },
  actionButtonText: { color: "#FFF", fontSize: 14, fontWeight: "600" },

  // Empty state
  emptyCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A2E",
    marginBottom: 8,
  },
  emptyDescription: { fontSize: 14, color: "#666" },

  // Profile card — matches web .profile-view-card
  profileCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingTop: 32,
    paddingBottom: 32,
    paddingRight: 32,
    paddingLeft: 20,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E5EAF0",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 20,
  },
  cardImage: { width: 80, height: 80, borderRadius: 10 },
  cardImagePlaceholder: {
    backgroundColor: "#F4F4F5",
    borderWidth: 1,
    borderColor: "#D4D4D8",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  cardHeaderText: { flex: 1, gap: 14 },
  cardName: {
    fontSize: 24,
    fontWeight: "600",
    color: "#181818",
    lineHeight: 32,
  },
  badgesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 0,
  },
  badge: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 12, fontWeight: "600" },
  cardLanguages: {
    fontSize: 13,
    color: "#71717A",
    marginTop: 10,
    marginBottom: 16,
  },
  cardAbout: {
    fontSize: 14,
    color: "#181818",
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 24,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  portfolioButton: {
    backgroundColor: "#FE6E30",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  portfolioButtonText: { color: "#FFF", fontSize: 14, fontWeight: "600" },
  socialIcons: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap",
  },

  // Form
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A2E",
    marginBottom: 6,
    marginTop: 16,
  },
  required: { color: "#EF4444" },
  textArea: { minHeight: 120 },
  errorText: { color: "#EF4444", fontSize: 12, marginTop: 4 },
  charCount: { fontSize: 12, color: "#999", textAlign: "right", marginTop: 4 },

  // Checkboxes
  twoColumns: { flexDirection: "row", marginTop: 8, gap: 20 },
  column: { flex: 1 },
  checkboxItem: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  checkboxChecked: { backgroundColor: "#1A1A2E", borderColor: "#1A1A2E" },
  checkboxLabel: { fontSize: 14, color: "#333" },

  // Image
  imageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  imageHint: { fontSize: 12, color: "#999" },
  fileButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 6,
  },
  fileButtonText: {
    backgroundColor: "#F0F0F0",
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 13,
    color: "#333",
    borderRightWidth: 1,
    borderRightColor: "#D1D5DB",
  },
  fileName: { flex: 1, paddingHorizontal: 12, fontSize: 13, color: "#666" },
  previewImage: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    marginTop: 10,
    resizeMode: "cover" as any,
  },

  // Buttons
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 30,
    paddingBottom: 20,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 30,
    width: "85%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A2E",
    marginBottom: 20,
  },
  modalButtons: { flexDirection: "row", gap: 12 },
});
