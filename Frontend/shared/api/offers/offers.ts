import { apiFetch } from "../apiFetch";

export interface PopulatedBrand {
  _id: string;
  name: string;
  country: string;
  logo?: string;
  mainContact?: { email: string; name?: string; surName?: string } | string;
  website?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  pinterest?: string;
  youtube?: string;
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

export interface CreatorOfferCard {
  id: string;
  name: string;
  image: string;
  paidCooperation: boolean;
  brandName: string;
  brandLogo?: string;
  categories: string[];
  languages: string[];
  targets: string[];
}

export const fetchOffersForCreator = async (filters: {
  category?: string;
  target?: string;
  paidCooperation?: string;
  language?: string;
}): Promise<CreatorOfferCard[]> => {
  try {
    const params = new URLSearchParams();
    if (filters.category) params.set("category", filters.category);
    if (filters.target) params.set("target", filters.target);
    if (filters.paidCooperation) params.set("paidCooperation", filters.paidCooperation);
    if (filters.language) params.set("language", filters.language);
    const qs = params.toString();
    const url = `/offers/filter${qs ? `?${qs}` : ""}`;
    const response = await apiFetch(url);
    if (!response.ok) throw new Error("Failed to fetch offers");
    const data: ApiOffer[] = await response.json();
    return data.map((offer) => {
      const brand = getBrand(offer);
      return {
        id: offer._id,
        name: offer.name,
        image: offer.image,
        paidCooperation: offer.paidCooperation,
        brandName: brand?.name ?? "-",
        brandLogo: brand?.logo,
        categories: offer.categories,
        languages: offer.languages,
        targets: offer.targets,
      };
    });
  } catch (error) {
    console.error("Failed to fetch creator offers:", error);
    return [];
  }
};

export const fetchLikedOfferIds = async (): Promise<string[]> => {
  try {
    const response = await apiFetch("/offers/liked");
    if (!response.ok) throw new Error("Failed to fetch liked offers");
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch liked offers:", error);
    return [];
  }
};

export const toggleOfferLike = async (
  offerId: string,
): Promise<{ liked: boolean } | null> => {
  try {
    const response = await apiFetch(`/offers/${offerId}/like`, {
      method: "POST",
    });
    if (!response.ok) throw new Error("Failed to toggle like");
    return await response.json();
  } catch (error) {
    console.error("Failed to toggle like:", error);
    return null;
  }
};

export const fetchOffersAdmin = async (
  archived = false,
): Promise<OfferTableData[]> => {
  try {
    const url = `/offers${archived ? "?archived=true" : ""}`;
    const response = await apiFetch(url);
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
    const response = await apiFetch(`/offers/${id}`);
    if (!response.ok) throw new Error("Failed to fetch offer");
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch offer:", error);
    return null;
  }
};

export const createOffer = async (formData: FormData): Promise<ApiOffer> => {
  const response = await apiFetch(`/offers`, {
    method: "POST",
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
  const response = await apiFetch(`/offers/${id}`, {
    method: "PATCH",
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw data;
  return data;
};

export const archiveOffer = async (id: string): Promise<boolean> => {
  try {
    const response = await apiFetch(`/offers/${id}/archive`, {
      method: "PATCH",
    });
    return response.ok;
  } catch {
    return false;
  }
};

export const restoreOffer = async (id: string): Promise<boolean> => {
  try {
    const response = await apiFetch(`/offers/${id}/restore`, {
      method: "PATCH",
    });
    return response.ok;
  } catch {
    return false;
  }
};

export const deleteOffer = async (id: string): Promise<boolean> => {
  try {
    const response = await apiFetch(`/offers/${id}`, {
      method: "DELETE",
    });
    return response.ok;
  } catch {
    return false;
  }
};
