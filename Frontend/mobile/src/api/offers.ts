import { API_URL } from "./config";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface CreatorOfferCard {
  _id: string;
  name: string;
  image?: string;
  paidCooperation: boolean;
  brand: {
    _id: string;
    name: string;
    logo?: string;
  };
  categories: string[];
  languages: string[];
  targets: string[];
}

export async function fetchOffersForCreator(filters?: {
  category?: string;
  target?: string;
  paidCooperation?: string;
  language?: string;
}): Promise<CreatorOfferCard[]> {
  const token = await AsyncStorage.getItem("access_token");
  const params = new URLSearchParams();
  if (filters?.category) params.append("category", filters.category);
  if (filters?.target) params.append("target", filters.target);
  if (filters?.paidCooperation) params.append("paidCooperation", filters.paidCooperation);
  if (filters?.language) params.append("language", filters.language);

  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${API_URL}/offers/filter${query}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch offers");
  return res.json();
}

export async function fetchLikedOfferIds(): Promise<string[]> {
  const token = await AsyncStorage.getItem("access_token");
  const res = await fetch(`${API_URL}/offers/liked`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch liked offers");
  return res.json();
}

export interface OfferDetail {
  _id: string;
  name: string;
  image?: string;
  paidCooperation: boolean;
  brand: {
    _id: string;
    name: string;
    logo?: string;
  };
  categories: string[];
  languages: string[];
  targets: string[];
  description: string;
  contact?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  pinterest?: string;
  activeFrom?: string;
  activeTo?: string;
}

export async function fetchOfferById(id: string): Promise<OfferDetail> {
  const token = await AsyncStorage.getItem("access_token");
  const res = await fetch(`${API_URL}/offers/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch offer");
  return res.json();
}

export async function toggleOfferLike(offerId: string): Promise<void> {
  const token = await AsyncStorage.getItem("access_token");
  await fetch(`${API_URL}/offers/${offerId}/like`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
