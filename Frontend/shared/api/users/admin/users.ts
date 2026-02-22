import { API_URL } from "../../../config";

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
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${API_URL}/packages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.ok ? await response.json() : [];
  } catch (error) {
    console.error("Failed to fetch packages:", error);
    return [];
  }
};

// 2. Získanie značiek (podľa role prihláseného uźívateľa na BE)
export const fetchBrands = async (): Promise<Brand[]> => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${API_URL}/brands`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.ok ? await response.json() : [];
  } catch (error) {
    console.error("Failed to fetch brands:", error);
    return [];
  }
};

// 3. Vytvorenie používateľa
export const createUser = async (userData: any): Promise<void> => {
  const token = localStorage.getItem("access_token");

  const payload = {
    ...userData,
    purchasedAt:
      userData.role === "creator" ? new Date().toISOString() : undefined,
  };

  const response = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    // vyhodíme celý backend response
    throw data;
  }
};

// 4. Update používateľa
export const updateUser = async (
  userId: string,
  userData: any,
): Promise<void> => {
  const token = localStorage.getItem("access_token");

  const payload = {
    ...userData,
    // ak je creator, môžeš tu upraviť purchasedAt, alebo necháme backend riešiť
  };

  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    // vyhodíme backend error
    throw data;
  }
};

export const fetchUsers = async (
  country?: string,
  role?: string,
  isArchived: boolean = false,
): Promise<UserTableData[]> => {
  try {
    const token = localStorage.getItem("access_token");

    const baseEndpoint = isArchived ? "archived" : "";
    const url = new URL(`${API_URL}/users/${baseEndpoint}`);

    if (country) url.searchParams.append("country", country);
    if (role) url.searchParams.append("role", role);
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
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
      };
    });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
};

export const archiveUser = async (id: string): Promise<boolean> => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to archive user:", error);
    return false;
  }
};

export const restoreUser = async (id: string): Promise<boolean> => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${API_URL}/users/restore/${id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to restore user:", error);
    return false;
  }
};
