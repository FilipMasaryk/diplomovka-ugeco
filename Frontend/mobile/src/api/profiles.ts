import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "./config";

export interface UserProfile {
  _id: string;
  name: string;
  user: string;
  languages: string[];
  categories: string[];
  creatingAs: string[];
  image?: string;
  about?: string;
  portfolio?: string;
  instagram?: string;
  pinterest?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const getHeaders = async () => {
  const token = await AsyncStorage.getItem("access_token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const fetchMyProfile = async (): Promise<UserProfile | null> => {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/profiles/me`, { headers });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error("Failed to fetch profile");
    return await response.json();
  } catch {
    return null;
  }
};

export const createProfile = async (
  formData: FormData
): Promise<UserProfile> => {
  const headers = await getHeaders();
  const response = await fetch(`${API_URL}/profiles`, {
    method: "POST",
    headers,
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw data;
  return data;
};

export const updateProfile = async (
  formData: FormData
): Promise<UserProfile> => {
  const headers = await getHeaders();
  const response = await fetch(`${API_URL}/profiles`, {
    method: "PATCH",
    headers,
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw data;
  return data;
};
