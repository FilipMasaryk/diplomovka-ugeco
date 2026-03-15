import { apiFetch } from "../apiFetch";

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

export const fetchMyProfile = async (): Promise<UserProfile | null> => {
  try {
    const response = await apiFetch("/profiles/me");
    if (response.status === 404) return null;
    if (!response.ok) throw new Error("Failed to fetch profile");
    return await response.json();
  } catch {
    return null;
  }
};

export const createProfile = async (
  formData: FormData,
): Promise<UserProfile> => {
  const response = await apiFetch("/profiles", {
    method: "POST",
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw data;
  return data;
};

export const updateProfile = async (
  formData: FormData,
): Promise<UserProfile> => {
  const response = await apiFetch("/profiles", {
    method: "PATCH",
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw data;
  return data;
};
