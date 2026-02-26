import { API_URL } from "../../config";

export interface PopulatedBrand {
  _id: string;
  name: string;
  country: string;
  logo?: string;
  mainContact?: { email: string; name?: string; surName?: string } | string;
}

export interface ApiOffer {
  _id: string;
  name: string;
  paidCooperation: boolean;
  categories: string[];
  activeFrom: string;
  activeTo: string;
  image: string;
  languages: string[];
  targets: string[];
  description: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  pinterest?: string;
  contact?: string;
  brand: PopulatedBrand | string;
  status: "active" | "concept";
  isArchived: boolean;
  createdAt?: string;
}

export interface OfferTableData {
  id: string;
  name: string;
  brandName: string;
  brandId: string;
  brandCountry: string;
  targets: string[];
  categories: string[];
  languages: string[];
  status: "active" | "concept" | "ended";
  activeFrom: string;
  activeTo: string;
  paidCooperation: boolean;
  image: string;
  description: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  pinterest?: string;
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return "--.--.----";
  return new Date(dateString).toLocaleDateString("sk-SK");
};

const getBrand = (offer: ApiOffer): PopulatedBrand | null =>
  offer.brand && typeof offer.brand === "object"
    ? (offer.brand as PopulatedBrand)
    : null;

const computeDisplayStatus = (
  offer: ApiOffer,
): "active" | "concept" | "ended" => {
  if (offer.status === "concept") return "concept";
  const now = new Date();
  const from = offer.activeFrom ? new Date(offer.activeFrom) : null;
  const to = offer.activeTo ? new Date(offer.activeTo) : null;
  if (from && to && now >= from && now <= to) return "active";
  return "ended";
};

const mapToTableData = (offer: ApiOffer): OfferTableData => {
  const brand = getBrand(offer);
  return {
    id: offer._id,
    name: offer.name,
    brandName: brand?.name ?? "-",
    brandId: brand?._id ?? (typeof offer.brand === "string" ? offer.brand : ""),
    brandCountry: brand?.country ?? "-",
    targets: offer.targets,
    categories: offer.categories,
    languages: offer.languages,
    status: computeDisplayStatus(offer),
    activeFrom: formatDate(offer.activeFrom),
    activeTo: formatDate(offer.activeTo),
    paidCooperation: offer.paidCooperation,
    image: offer.image,
    description: offer.description,
    website: offer.website,
    facebook: offer.facebook,
    instagram: offer.instagram,
    tiktok: offer.tiktok,
    pinterest: offer.pinterest,
  };
};

export const fetchOffersAdmin = async (
  archived = false,
): Promise<OfferTableData[]> => {
  try {
    const token = localStorage.getItem("access_token");
    const url = `${API_URL}/offers${archived ? "?archived=true" : ""}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Failed to fetch offers");
    const data: ApiOffer[] = await response.json();
    return data.map(mapToTableData);
  } catch (error) {
    console.error("Failed to fetch offers:", error);
    return [];
  }
};

export const fetchOfferById = async (id: string): Promise<ApiOffer | null> => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${API_URL}/offers/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Failed to fetch offer");
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch offer:", error);
    return null;
  }
};

export const createOffer = async (formData: FormData): Promise<ApiOffer> => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_URL}/offers`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw data;
  return data;
};

export const updateOffer = async (
  id: string,
  formData: FormData,
): Promise<ApiOffer> => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_URL}/offers/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw data;
  return data;
};

export const archiveOffer = async (id: string): Promise<boolean> => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${API_URL}/offers/${id}/archive`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.ok;
  } catch {
    return false;
  }
};

export const restoreOffer = async (id: string): Promise<boolean> => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${API_URL}/offers/${id}/restore`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.ok;
  } catch {
    return false;
  }
};

export const deleteOffer = async (id: string): Promise<boolean> => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${API_URL}/offers/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.ok;
  } catch {
    return false;
  }
};
