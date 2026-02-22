import { API_URL } from "../../config";

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
  address: string;
  city: string;
  zip: string;
  country: string;
  categories: string[];
  package?: PopulatedPackage | string | null;
  mainContact?: PopulatedContact | string | null;
  purchasedAt?: string;
  offersCount: number;
  offers?: string[];
  isArchived: boolean;
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

export const fetchBrandsAdmin = async (): Promise<BrandTableData[]> => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${API_URL}/brands`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch brands");

    const data: ApiBrand[] = await response.json();

    return data.map((brand) => {
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
      };
    });
  } catch (error) {
    console.error("Failed to fetch brands:", error);
    return [];
  }
};

const cleanBrandPayload = (brandData: any): any => {
  const payload = { ...brandData };
  if (!payload.package) delete payload.package;
  if (!payload.ico) delete payload.ico;
  if (!payload.mainContact) delete payload.mainContact;
  return payload;
};

export const createBrand = async (brandData: any): Promise<void> => {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/brands`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(cleanBrandPayload(brandData)),
  });

  const data = await response.json();

  if (!response.ok) throw data;
};

export const updateBrand = async (
  brandId: string,
  brandData: any,
): Promise<void> => {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/brands/${brandId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(cleanBrandPayload(brandData)),
  });

  const data = await response.json();

  if (!response.ok) throw data;
};

export const archiveBrand = async (id: string): Promise<boolean> => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${API_URL}/brands/${id}/archive`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to archive brand:", error);
    return false;
  }
};

export const restoreBrand = async (id: string): Promise<boolean> => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${API_URL}/brands/${id}/restore`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
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

export const fetchUsersForContact = async (): Promise<ContactUser[]> => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.ok ? await response.json() : [];
  } catch (error) {
    console.error("Failed to fetch users for contact:", error);
    return [];
  }
};

export interface BrandPackage {
  _id: string;
  name: string;
  validityMonths: number;
  type: string;
}

export const fetchBrandPackages = async (): Promise<BrandPackage[]> => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${API_URL}/packages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const all = response.ok ? await response.json() : [];
    return all.filter((p: BrandPackage) => p.type === "brand");
  } catch (error) {
    console.error("Failed to fetch brand packages:", error);
    return [];
  }
};
