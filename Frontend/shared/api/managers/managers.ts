import { apiFetch } from "../apiFetch";

interface ApiManager {
  _id: string;
  name: string;
  surName?: string;
  email: string;
  role: string;
  brands?: { _id: string; name: string }[];
}

export interface ManagerTableData {
  id: string;
  name: string;
  surName: string;
  email: string;
  brand: string;
}

export const fetchManagersByBrand = async (
  brandId: string,
): Promise<ManagerTableData[]> => {
  try {
    const response = await apiFetch(`/users/manager/brand/${brandId}`);
    if (!response.ok) return [];
    const data: ApiManager[] = await response.json();
    return data.map((u) => ({
      id: u._id,
      name: u.name,
      surName: u.surName || "",
      email: u.email,
      brand:
        u.brands && u.brands.length > 0
          ? u.brands.map((b) => b.name).join(", ")
          : "-",
    }));
  } catch {
    return [];
  }
};

export const createManager = async (
  brandId: string,
  data: { name: string; surName: string; email: string; password: string },
): Promise<void> => {
  const response = await apiFetch(`/users/manager/${brandId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) throw result;
};

export const updateManager = async (
  id: string,
  data: { name: string; surName: string },
): Promise<void> => {
  const response = await apiFetch(`/users/manager/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) throw result;
};

export const removeManagerAccess = async (
  userId: string,
  brandId: string,
): Promise<boolean> => {
  try {
    const response = await apiFetch(`/users/manager/${userId}/brands/${brandId}`, {
      method: "DELETE",
    });
    return response.ok;
  } catch {
    return false;
  }
};
