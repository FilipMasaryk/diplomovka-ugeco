import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import UgecoHeader from "../components/UgecoHeader";
import { API_URL } from "../api/config";
import { fetchPublishedNews, markNewsSeen } from "../api/news";

type NewsItem = {
  _id: string;
  title: string;
  description: string;
  category: "fix" | "feature" | "bug";
  image?: string;
  publishedAt?: string;
  createdAt: string;
};

const categoryIcon = (category: string) => {
  switch (category) {
    case "fix":
      return { name: "checkmark-circle-outline" as const, color: "#00BFAE" };
    case "feature":
      return { name: "notifications-outline" as const, color: "#F59E0B" };
    case "bug":
      return { name: "alert-outline" as const, color: "#EF4444" };
    default:
      return { name: "information-circle-outline" as const, color: "#666" };
  }
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}.${d.getFullYear()}`;
}

export default function NewsScreen() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();

  const loadNews = useCallback(async () => {
    try {
      const data = await fetchPublishedNews();
      setNews(data);
      await markNewsSeen();
    } catch (e) {
      console.error("Failed to load news:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      loadNews();
    }
  }, [isFocused, loadNews]);

  const onRefresh = () => {
    setRefreshing(true);
    loadNews();
  };

  const renderItem = ({ item }: { item: NewsItem }) => {
    const icon = categoryIcon(item.category);
    const imageUri = item.image ? `${API_URL}${item.image}` : null;
    const date = item.publishedAt || item.createdAt;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Ionicons name={icon.name} size={24} color={icon.color} />
        </View>

        <Text style={styles.cardDescription}>{item.description}</Text>

        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.cardImage} />
        )}

        <Text style={styles.cardDate}>{formatDate(date)}</Text>
      </View>
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
      <Text style={styles.title}>Novinky</Text>

      <FlatList
        data={news}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Žiadne novinky</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingTop: 50,
    paddingHorizontal: 20,
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
    marginBottom: 16,
  },
  list: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A2E",
    flex: 1,
    marginRight: 12,
  },
  cardDescription: {
    fontSize: 14,
    color: "#555",
    lineHeight: 21,
    marginBottom: 12,
  },
  cardImage: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
    resizeMode: "cover",
  },
  cardDate: {
    fontSize: 13,
    color: "#999",
    textAlign: "right",
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    fontSize: 16,
    marginTop: 40,
  },
});
