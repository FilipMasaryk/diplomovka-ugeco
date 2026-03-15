import { apiFetch } from "../../apiFetch";

interface ApiUser {
  _id: string;
  name: string;
  surName?: string;
  email: string;
  role: string;
  countries?: string[];
  brands?: { _id: string; name: string }[];
  package?: { _id: string; name: string; validityMonths: number } | null;
  purchasedAt?: string;
  profile?: any;
  ico?: string;
}

export interface UserTableData {
  id: string;
  name: string;
  email: string;
  role: string;

  brand: string;
  brandIds: string[];

  country: string;
  countryCodes: string[];

  profile: string;

  package: string;
  packageId: string;

  purchased: string;
  expiration: string;
  ico: string;
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

export interface Package {
  _id: string;
  name: string;
  validityMonths: number;
  type: string;
}

export interface Brand {
  _id: string;
  name: string;
  country?: string;
}

// 1. Získanie všetkých balíčkov
export const fetchPackages = async (): Promise<Package[]> => {
  try {
    const response = await apiFetch(`/packages`);
    return response.ok ? await response.json() : [];
  } catch (error) {
    console.error("Failed to fetch packages:", error);
    return [];
  }
};

// 2. Získanie značiek (podľa role prihláseného uźívateľa na BE)
export const fetchBrands = async (): Promise<Brand[]> => {
  try {
    const response = await apiFetch(`/brands`);
    return response.ok ? await response.json() : [];
  } catch (error) {
    console.error("Failed to fetch brands:", error);
    return [];
  }
};

// 3. Vytvorenie používateľa
export const createUser = async (userData: any): Promise<void> => {
  const payload = {
    ...userData,
    purchasedAt:
      userData.role === "creator" ? new Date().toISOString() : undefined,
  };

  const response = await apiFetch(`/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw data;
  }
};

// 4. Update používateľa
export const updateUser = async (
  userId: string,
  userData: any,
): Promise<void> => {
  const payload = {
    ...userData,
  };

  const response = await apiFetch(`/users/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw data;
  }
};

export const fetchUsers = async (
  country?: string,
  role?: string,
  isArchived: boolean = false,
): Promise<UserTableData[]> => {
  try {
    const baseEndpoint = isArchived ? "archived" : "";
    const params = new URLSearchParams();
    if (country) params.append("country", country);
    if (role) params.append("role", role);
    const query = params.toString();
    const url = `/users/${baseEndpoint}${query ? `?${query}` : ""}`;

    const response = await apiFetch(url, {
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(
        `Error fetching users: ${response.status} ${response.statusText}`,
      );
    }

    const data: ApiUser[] = await response.json();

    return data.map((user) => {
      const isCreator = user.role === "creator";

      return {
        id: user._id,
        name: `${user.name} ${user.surName || ""}`.trim(),
        email: user.email,
        role:
          user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase(),

        brand:
          user.brands && user.brands.length > 0 ? user.brands[0].name : "-",

        brandIds: user.brands?.map((b) => b._id) || [],

        country:
          user.countries && user.countries.length > 0
            ? user.countries.join(", ")
            : "-",

        countryCodes: user.countries || [],

        profile: isCreator ? (user.profile ? "Yes" : "No") : "-",

        package: user.package?.name || "-",

        packageId: user.package?._id || "",

        purchased: formatDate(user.purchasedAt),

        expiration: calculateExpiration(
          user.purchasedAt,
          user.package?.validityMonths,
        ),

        ico: user.ico || "",
      };
    });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
};

export const archiveUser = async (id: string): Promise<boolean> => {
  try {
    const response = await apiFetch(`/users/${id}`, {
      method: "DELETE",
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to archive user:", error);
    return false;
  }
};

export const restoreUser = async (id: string): Promise<boolean> => {
  try {
    const response = await apiFetch(`/users/restore/${id}`, {
      method: "POST",
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to restore user:", error);
    return false;
  }
};
