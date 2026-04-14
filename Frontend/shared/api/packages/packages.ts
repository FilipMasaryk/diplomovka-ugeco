import { apiFetch } from "../apiFetch";

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
    const response = await apiFetch(`/packages`, {
      headers: { "Content-Type": "application/json" },
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
  const response = await apiFetch(`/packages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
  const response = await apiFetch(`/packages/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(packageData),
  });

  const data = await response.json();
  if (!response.ok) throw data;
};

export const fetchArchivedPackages = async (): Promise<PackageTableData[]> => {
  try {
    const response = await apiFetch(`/packages/archived`, {
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error("Failed to fetch archived packages");

    const data: ApiPackage[] = await response.json();

    return data.map((pkg) => ({
      id: pkg._id,
      name: pkg.name,
      validityMonths: pkg.validityMonths,
      offersCount: pkg.offersCount,
      type: pkg.type,
    }));
  } catch (error) {
    console.error("Failed to fetch archived packages:", error);
    return [];
  }
};

export const archivePackage = async (id: string): Promise<boolean> => {
  try {
    const response = await apiFetch(`/packages/${id}/archive`, {
      method: "PATCH",
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to archive package");
    }
    return true;
  } catch (error) {
    throw error;
  }
};

export const restorePackage = async (id: string): Promise<boolean> => {
  try {
    const response = await apiFetch(`/packages/${id}/restore`, {
      method: "PATCH",
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to restore package:", error);
    return false;
  }
};

export const deletePackage = async (id: string): Promise<boolean> => {
  try {
    const response = await apiFetch(`/packages/${id}`, {
      method: "DELETE",
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to delete package:", error);
    return false;
  }
};
