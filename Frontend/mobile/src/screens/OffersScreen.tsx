import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import UgecoHeader from "../components/UgecoHeader";
import { useIsFocused } from "@react-navigation/native";
import { API_URL } from "../api/config";
import {
  fetchOffersForCreator,
  fetchLikedOfferIds,
  toggleOfferLike,
  CreatorOfferCard,
} from "../api/offers";

const CATEGORIES: { value: string; label: string }[] = [
  { value: "apps_and_technology", label: "Aplikácie a technológie" },
  { value: "auto_moto", label: "Auto-moto" },
  { value: "travelling", label: "Cestovanie" },
  { value: "home_and_garden", label: "Dom a záhrada" },
  { value: "electronics", label: "Elektronika" },
  { value: "games", label: "Hry" },
  { value: "music_and_dance", label: "Hudba a tanec" },
  { value: "food_and_drinks", label: "Jedlo a nápoje" },
  { value: "books", label: "Knihy" },
  { value: "cosmetics", label: "Kozmetika" },
  { value: "fashion", label: "Móda" },
  { value: "family_and_kids", label: "Rodina a deti" },
  { value: "services", label: "Služby" },
  { value: "sport", label: "Šport" },
  { value: "experiences", label: "Zážitky" },
  { value: "health", label: "Zdravie" },
  { value: "animals", label: "Zvieratá" },
  { value: "lifestyle", label: "Životný štýl" },
];

export default function OffersScreen({ navigation }: any) {
  const [offers, setOffers] = useState<CreatorOfferCard[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined,
  );
  const [activeCategory, setActiveCategory] = useState<string | undefined>(
    undefined,
  );

  const loadData = useCallback(async () => {
    try {
      const [offersData, likedData] = await Promise.all([
        fetchOffersForCreator(
          activeCategory ? { category: activeCategory } : undefined,
        ),
        fetchLikedOfferIds(),
      ]);
      setOffers(offersData);
      setLikedIds(new Set(likedData));
    } catch (e) {
      console.error("Failed to load offers:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeCategory]);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused, loadData]);

  const handleLike = async (offerId: string) => {
    const newLiked = new Set(likedIds);
    if (newLiked.has(offerId)) {
      newLiked.delete(offerId);
    } else {
      newLiked.add(offerId);
    }
    setLikedIds(newLiked);
    try {
      await toggleOfferLike(offerId);
    } catch {
      setLikedIds(likedIds);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const applyFilter = () => {
    setActiveCategory(selectedCategory);
    setFilterVisible(false);
  };

  const clearFilter = () => {
    setSelectedCategory(undefined);
    setActiveCategory(undefined);
    setFilterVisible(false);
  };

  const filteredOffers = offers.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase()),
  );

  const renderOffer = ({ item }: { item: CreatorOfferCard }) => {
    const isLiked = likedIds.has(item._id);
    const imageUri = item.image ? `${API_URL}${item.image}` : null;
    const brandLogoUri = item.brand?.logo
      ? `${API_URL}${item.brand.logo}`
      : null;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() =>
          navigation.getParent()?.navigate("OfferDetail", {
            offerId: item._id,
            isLiked,
          })
        }
      >
        <View style={styles.cardImageWrapper}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.cardImage} />
          ) : (
            <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
              <Ionicons name="image-outline" size={40} color="#ccc" />
            </View>
          )}
        </View>
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle} numberOfLines={3}>
              {item.name}
            </Text>
            <TouchableOpacity
              onPress={() => handleLike(item._id)}
              style={styles.heartButton}
            >
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={24}
                color={isLiked ? "#FF4D6A" : "#999"}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.cardFooter}>
            {!item.paidCooperation && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Barter</Text>
              </View>
            )}
            {item.paidCooperation && <View />}
            {brandLogoUri ? (
              <Image source={{ uri: brandLogoUri }} style={styles.brandLogo} />
            ) : (
              <View style={styles.brandLogoPlaceholder}>
                <Ionicons name="business-outline" size={16} color="#999" />
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
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

      <Text style={styles.title}>Ponuky</Text>

      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Vyhľadať"
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => {
            setSelectedCategory(activeCategory);
            setFilterVisible(true);
          }}
        >
          <Text style={styles.filterText}>Filtrovať</Text>
          <Ionicons name="options-outline" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredOffers}
        keyExtractor={(item) => item._id}
        renderItem={renderOffer}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FE6E30"]}
          />
        }
        ListEmptyComponent={<Text style={styles.emptyText}>Žiadne ponuky</Text>}
      />

      <Modal
        visible={filterVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFilterVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Kategórie</Text>
            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.value;
                return (
                  <TouchableOpacity
                    key={cat.value}
                    style={styles.checkboxRow}
                    onPress={() =>
                      setSelectedCategory(isSelected ? undefined : cat.value)
                    }
                  >
                    <View
                      style={[
                        styles.checkbox,
                        isSelected && styles.checkboxChecked,
                      ]}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={16} color="#FFF" />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>{cat.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearFilter}
              >
                <Text style={styles.clearButtonText}>Zrušiť</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={applyFilter}
              >
                <Text style={styles.applyButtonText}>Filtrovať</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1A1A2E",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 16,
  },
  searchRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 16,
    alignItems: "center",
    gap: 10,
  },
  searchContainer: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  searchInput: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: "#333",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FE6E30",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  filterText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 14,
    flexDirection: "row",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  cardImageWrapper: {
    width: 140,
    height: 140,
    padding: 8,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  cardImagePlaceholder: {
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A2E",
    flex: 1,
    marginTop: 20,
    marginRight: 8,
  },
  heartButton: {
    padding: 2,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#FE6E30",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFF",
  },
  brandLogo: {
    width: 28,
    height: 28,
    borderRadius: 4,
    resizeMode: "contain" as const,
  },
  brandLogoPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    fontSize: 16,
    marginTop: 40,
  },
  // Filter modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A2E",
    marginBottom: 16,
  },
  modalScroll: {
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#D0D0D0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: "#1A1A2E",
    borderColor: "#1A1A2E",
  },
  checkboxLabel: {
    fontSize: 15,
    color: "#1A1A2E",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  clearButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#FE6E30",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  clearButtonText: {
    color: "#FE6E30",
    fontSize: 16,
    fontWeight: "600",
  },
  applyButton: {
    flex: 1,
    backgroundColor: "#FE6E30",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
