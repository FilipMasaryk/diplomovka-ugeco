import { apiFetch } from "../apiFetch";

interface PopulatedPackage {
  _id: string;
  name: string;
  validityMonths: number;
}

interface PopulatedContact {
  _id: string;
  email: string;
  name?: string;
  surName?: string;
}

interface ApiBrand {
  _id: string;
  name: string;
  ico?: string;
  dic?: string;
  address: string;
  city: string;
  zip: string;
  country: string;
  categories: string[];
  package?: PopulatedPackage | string | null;
  mainContact?: PopulatedContact | string | null;
  purchasedAt?: string;
  offersCount: number;
  totalOffersMade?: number;
  offers?: string[];
  isArchived: boolean;
  logo?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  pinterest?: string;
  youtube?: string;
}

export interface BrandTableData {
  id: string;
  name: string;
  ico: string;
  address: string;
  city: string;
  zip: string;
  country: string;
  categories: string[];
  package: string;
  packageId: string;
  contact: string;
  contactId: string;
  purchased: string;
  expiration: string;
  activeOffers: number;
  totalOffers: number;
  totalOffersMade: number;
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return "--.--.----";
  const date = new Date(dateString);
  return date.toLocaleDateString("sk-SK");
};

const calculateExpiration = (purchasedAt?: string, months?: number): string => {
  if (!purchasedAt || !months) return "--.--.----";
  const date = new Date(purchasedAt);
  date.setMonth(date.getMonth() + months);
  return date.toLocaleDateString("sk-SK");
};

const mapBrandToTableData = (brand: ApiBrand): BrandTableData => {
  const pkg =
    brand.package && typeof brand.package === "object"
      ? (brand.package as PopulatedPackage)
      : null;

  const contactObj =
    brand.mainContact && typeof brand.mainContact === "object"
      ? (brand.mainContact as PopulatedContact)
      : null;

  return {
    id: brand._id,
    name: brand.name,
    ico: brand.ico || "-",
    address: brand.address,
    city: brand.city,
    zip: brand.zip,
    country: brand.country,
    categories: brand.categories,
    package: pkg?.name || "-",
    packageId:
      pkg?._id || (typeof brand.package === "string" ? brand.package : ""),
    contact: contactObj?.email || "-",
    contactId:
      contactObj?._id ||
      (typeof brand.mainContact === "string" ? brand.mainContact : ""),
    purchased: formatDate(brand.purchasedAt),
    expiration: calculateExpiration(brand.purchasedAt, pkg?.validityMonths),
    activeOffers: brand.offers?.length ?? 0,
    totalOffers: brand.offersCount ?? 0,
    totalOffersMade: brand.totalOffersMade ?? 0,
  };
};

export const fetchBrandsAdmin = async (): Promise<BrandTableData[]> => {
  try {
    const response = await apiFetch(`/brands`, {
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error("Failed to fetch brands");

    const data: ApiBrand[] = await response.json();
    return data.map(mapBrandToTableData);
  } catch (error) {
    console.error("Failed to fetch brands:", error);
    return [];
  }
};

export const fetchArchivedBrandsAdmin = async (): Promise<BrandTableData[]> => {
  try {
    const response = await apiFetch(`/brands/archived`, {
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error("Failed to fetch archived brands");

    const data: ApiBrand[] = await response.json();
    return data.map(mapBrandToTableData);
  } catch (error) {
    console.error("Failed to fetch archived brands:", error);
    return [];
  }
};

const cleanBrandPayload = (brandData: any, isUpdate = false): any => {
  const payload = { ...brandData };
  if (!payload.package) delete payload.package;
  if (!payload.ico) delete payload.ico;
  if (!payload.mainContact) {
    if (isUpdate) {
      payload.mainContact = null;
    } else {
      delete payload.mainContact;
    }
  }
  return payload;
};

export const createBrand = async (brandData: any): Promise<void> => {
  const response = await apiFetch(`/brands`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cleanBrandPayload(brandData)),
  });

  const data = await response.json();

  if (!response.ok) throw data;
};

export const updateBrand = async (
  brandId: string,
  brandData: any,
): Promise<void> => {
  const response = await apiFetch(`/brands/${brandId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cleanBrandPayload(brandData, true)),
  });

  const data = await response.json();

  if (!response.ok) throw data;
};

export const archiveBrand = async (id: string): Promise<boolean> => {
  try {
    const response = await apiFetch(`/brands/${id}/archive`, {
      method: "PATCH",
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to archive brand:", error);
    return false;
  }
};

export const restoreBrand = async (id: string): Promise<boolean> => {
  try {
    const response = await apiFetch(`/brands/${id}/restore`, {
      method: "PATCH",
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to restore brand:", error);
    return false;
  }
};

export interface ContactUser {
  _id: string;
  name: string;
  surName?: string;
  email: string;
  countries?: string[];
}

export const fetchContactsByCountry = async (
  country: string,
): Promise<ContactUser[]> => {
  try {
    const response = await apiFetch(`/users/contacts/${country}`);
    return response.ok ? await response.json() : [];
  } catch {
    return [];
  }
};

export const fetchUsersForContact = async (): Promise<ContactUser[]> => {
  try {
    const response = await apiFetch(`/users`);
    return response.ok ? await response.json() : [];
  } catch (error) {
    console.error("Failed to fetch users for contact:", error);
    return [];
  }
};

export interface BrandSelectOption {
  _id: string;
  name: string;
  country: string;
  mainContactDisplay?: string;
  logo?: string;
}

export const fetchBrandsForSelect = async (): Promise<BrandSelectOption[]> => {
  try {
    const response = await apiFetch(`/brands`);
    if (!response.ok) return [];
    const data: ApiBrand[] = await response.json();
    return data
      .filter((b) => !b.isArchived)
      .map((brand) => {
        const contact =
          brand.mainContact && typeof brand.mainContact === "object"
            ? (brand.mainContact as PopulatedContact)
            : null;
        const contactDisplay = contact
          ? `${contact.name ?? ""} ${contact.surName ?? ""}`.trim() +
            (contact.email ? ` (${contact.email})` : "")
          : undefined;
        return {
          _id: brand._id,
          name: brand.name,
          country: brand.country,
          mainContactDisplay: contactDisplay || undefined,
          logo: brand.logo || undefined,
        };
      });
  } catch {
    return [];
  }
};

export interface BrandPackage {
  _id: string;
  name: string;
  validityMonths: number;
  type: string;
}

export interface BrandStats {
  totalOffers: number;
  activeOffers: number;
}

export const fetchBrandStats = async (
  brandId: string,
): Promise<BrandStats> => {
  try {
    const response = await apiFetch(`/brands/${brandId}/stats`);
    if (!response.ok) return { totalOffers: 0, activeOffers: 0 };
    return response.json();
  } catch {
    return { totalOffers: 0, activeOffers: 0 };
  }
};

export interface BrandDetail {
  _id: string;
  name: string;
  ico: string;
  dic: string;
  address: string;
  city: string;
  zip: string;
  country: string;
  categories: string[];
  mainContact: string;
  mainContactDisplay: string;
  logo: string;
  website: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  pinterest: string;
  youtube: string;
}

export const fetchBrandDetail = async (
  brandId: string,
): Promise<BrandDetail | null> => {
  try {
    const response = await apiFetch(`/brands/${brandId}`);
    if (!response.ok) return null;
    const brand: ApiBrand = await response.json();
    const contact =
      brand.mainContact && typeof brand.mainContact === "object"
        ? (brand.mainContact as PopulatedContact)
        : null;
    return {
      _id: brand._id,
      name: brand.name,
      ico: brand.ico || "",
      dic: brand.dic || "",
      address: brand.address,
      city: brand.city,
      zip: brand.zip,
      country: brand.country,
      categories: brand.categories,
      mainContact: contact?._id || "",
      mainContactDisplay: contact
        ? `${contact.name ?? ""} ${contact.surName ?? ""}`.trim()
        : "",
      logo: brand.logo || "",
      website: brand.website || "",
      facebook: brand.facebook || "",
      instagram: brand.instagram || "",
      tiktok: brand.tiktok || "",
      pinterest: brand.pinterest || "",
      youtube: brand.youtube || "",
    };
  } catch {
    return null;
  }
};

export const updateBrandSettings = async (
  brandId: string,
  data: FormData,
): Promise<void> => {
  const response = await apiFetch(`/brands/settings/${brandId}`, {
    method: "PATCH",
    body: data,
  });
  const result = await response.json();
  if (!response.ok) throw result;
};

export const fetchBrandPackages = async (): Promise<BrandPackage[]> => {
  try {
    const response = await apiFetch(`/packages`);
    const all = response.ok ? await response.json() : [];
    return all.filter((p: BrandPackage) => p.type === "brand");
  } catch (error) {
    console.error("Failed to fetch brand packages:", error);
    return [];
  }
};
