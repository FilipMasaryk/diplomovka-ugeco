import { API_URL } from "./config";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function fetchPublishedNews() {
  const token = await AsyncStorage.getItem("access_token");
  const res = await fetch(`${API_URL}/news/published`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch news");
  return res.json();
}

export async function markNewsSeen() {
  const token = await AsyncStorage.getItem("access_token");
  await fetch(`${API_URL}/news/mark-seen`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function fetchUnreadCount(): Promise<number> {
  const token = await AsyncStorage.getItem("access_token");
  const res = await fetch(`${API_URL}/news/unread-count`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return 0;
  const data = await res.json();
  return data.count;
}
