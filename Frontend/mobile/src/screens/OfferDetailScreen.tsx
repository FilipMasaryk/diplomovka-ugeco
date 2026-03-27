import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../api/config";
import { fetchOfferById, toggleOfferLike, OfferDetail } from "../api/offers";

const LANGUAGE_LABELS: Record<string, string> = {
  sk: "slovenský",
  en: "anglický",
  cz: "český",
  pl: "poľský",
  de: "nemecký",
  hu: "maďarský",
  it: "taliansky",
  es: "španielsky",
};

const TARGET_LABELS: Record<string, string> = {
  man: "muž",
  woman: "žena",
  child: "dieťa",
  family: "rodina",
  couple: "pár",
  friends: "kamaráti",
  animal: "zviera",
};

type Props = {
  route: any;
  navigation: any;
};

export default function OfferDetailScreen({ route, navigation }: Props) {
  const { offerId, isLiked: initialLiked } = route.params;
  const [offer, setOffer] = useState<OfferDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(initialLiked ?? false);

  useEffect(() => {
    fetchOfferById(offerId)
      .then(setOffer)
      .catch((e) => console.error("Failed to load offer:", e))
      .finally(() => setLoading(false));
  }, [offerId]);

  const handleLike = async () => {
    setIsLiked(!isLiked);
    try {
      await toggleOfferLike(offerId);
    } catch {
      setIsLiked(isLiked);
    }
  };

  const openLink = (url: string) => {
    const fullUrl = url.startsWith("http") ? url : `https://${url}`;
    Linking.openURL(fullUrl);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FE6E30" />
      </View>
    );
  }

  if (!offer) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Ponuka sa nenašla</Text>
      </View>
    );
  }

  const imageUri = offer.image ? `${API_URL}${offer.image}` : null;
  const languages = offer.languages
    .map((l) => LANGUAGE_LABELS[l] || l)
    .join(", ");
  const targets = offer.targets
    .map((t) => TARGET_LABELS[t] || t)
    .join(", ");

  const socialLinks = [
    { key: "website", icon: "globe-outline" as const, color: "#1A1A2E", url: offer.website },
    { key: "instagram", icon: "logo-instagram" as const, color: "#E4405F", url: offer.instagram },
    { key: "facebook", icon: "logo-facebook" as const, color: "#1877F2", url: offer.facebook },
    { key: "tiktok", icon: "logo-tiktok" as const, color: "#000000", url: offer.tiktok },
    { key: "pinterest", icon: "logo-pinterest" as const, color: "#E60023", url: offer.pinterest },
  ].filter((s) => s.url);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header image */}
        <View style={styles.imageContainer}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Ionicons name="image-outline" size={60} color="#ccc" />
            </View>
          )}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#1A1A2E" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={24}
              color={isLiked ? "#FF4D6A" : "#1A1A2E"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>{offer.name}</Text>

          {/* Brand name */}
          <View style={styles.brandRow}>
            <Text style={styles.brandName}>{offer.brand?.name}</Text>
          </View>

          {/* Info rows */}
          <View style={styles.infoSection}>
            {offer.contact && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Kontakt</Text>
                <Text style={styles.infoValue}>{offer.contact}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Typ spolupráce</Text>
              <Text style={styles.infoValue}>
                {offer.paidCooperation ? "platená" : "barter"}
              </Text>
            </View>
            {languages ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Jazyk</Text>
                <Text style={styles.infoValue}>{languages}</Text>
              </View>
            ) : null}
            {targets ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ponuka pre</Text>
                <Text style={styles.infoValue}>{targets}</Text>
              </View>
            ) : null}
          </View>

          {/* Description */}
          {offer.description ? (
            <Text style={styles.description}>{offer.description}</Text>
          ) : null}

          {/* Social links */}
          {socialLinks.length > 0 && (
            <View style={styles.socialRow}>
              {socialLinks.map((s) => (
                <TouchableOpacity
                  key={s.key}
                  style={styles.socialIcon}
                  onPress={() => openLink(s.url!)}
                >
                  <Ionicons name={s.icon} size={28} color={s.color} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 340,
    marginTop: 40,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  likeButton: {
    position: "absolute",
    top: 50,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A2E",
    marginBottom: 16,
  },
  brandRow: {
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#F8F8F8",
  },
  brandName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A2E",
  },
  infoSection: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1A1A2E",
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: "#444",
    marginBottom: 24,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  socialIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
});
