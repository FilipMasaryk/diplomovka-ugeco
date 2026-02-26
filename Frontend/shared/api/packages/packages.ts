import { API_URL } from "../../config";

export interface ApiPackage {
  _id: string;
  name: string;
  validityMonths: number;
  offersCount: number;
  type: "creator" | "brand";
  createdAt: string;
}

export interface PackageTableData {
  id: string;
  name: string;
  validityMonths: number;
  offersCount: number;
  type: "creator" | "brand";
}

export const fetchPackages = async (): Promise<PackageTableData[]> => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${API_URL}/packages`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch packages");

    const data: ApiPackage[] = await response.json();

    return data.map((pkg) => ({
      id: pkg._id,
      name: pkg.name,
      validityMonths: pkg.validityMonths,
      offersCount: pkg.offersCount,
      type: pkg.type,
    }));
  } catch (error) {
    console.error("Failed to fetch packages:", error);
    return [];
  }
};

export const createPackage = async (packageData: {
  name: string;
  validityMonths: number;
  offersCount?: number;
  type: "creator" | "brand";
}): Promise<void> => {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/packages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(packageData),
  });

  const data = await response.json();
  if (!response.ok) throw data;
};

export const updatePackage = async (
  id: string,
  packageData: {
    name?: string;
    validityMonths?: number;
    offersCount?: number;
  },
): Promise<void> => {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/packages/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(packageData),
  });

  const data = await response.json();
  if (!response.ok) throw data;
};

export const deletePackage = async (id: string): Promise<boolean> => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${API_URL}/packages/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to delete package:", error);
    return false;
  }
};
