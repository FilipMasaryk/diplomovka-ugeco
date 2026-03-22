import { apiFetch } from "../apiFetch";

export interface OffersStats {
  totalOffers: number;
  activeOffers: number;
  creatorsCount: number;
  countriesCount: number;
}

export const getOffersStats = async (_token?: string): Promise<OffersStats> => {
  const response = await apiFetch(`/offers/stats`, {
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch stats");
  }

  return response.json();
};

export interface MonthlyDataPoint {
  month: string;
  count: number;
}

export interface MonthlyStats {
  creatorsMonthly: MonthlyDataPoint[];
  offersMonthly: MonthlyDataPoint[];
}

export const getMonthlyStats = async (
  _token?: string,
): Promise<MonthlyStats> => {
  const response = await apiFetch(`/offers/stats/monthly`, {
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch monthly stats");
  }

  return response.json();
};

export interface OverviewStats {
  totalUsers: number;
  creatorsCount: number;
  brandsCount: number;
  totalOffers: number;
  activeOffers: number;
  countriesCount: number;
  archivedUsers: number;
  assignedPackages: number;
}

export interface MonthlyOverview {
  usersMonthly: MonthlyDataPoint[];
  creatorsMonthly: MonthlyDataPoint[];
  offersMonthly: MonthlyDataPoint[];
}

export interface RoleDistribution {
  role: string;
  count: number;
}

export interface CategoryDistribution {
  category: string;
  count: number;
}

export interface CountryDistribution {
  country: string;
  count: number;
}

export const getStatsOverview = async (): Promise<OverviewStats> => {
  const response = await apiFetch(`/stats/overview`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Failed to fetch stats overview");
  return response.json();
};

export const getStatsMonthly = async (): Promise<MonthlyOverview> => {
  const response = await apiFetch(`/stats/monthly`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Failed to fetch monthly stats");
  return response.json();
};

export const getStatsRoles = async (): Promise<RoleDistribution[]> => {
  const response = await apiFetch(`/stats/roles`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Failed to fetch role distribution");
  return response.json();
};

export const getStatsCategories = async (): Promise<CategoryDistribution[]> => {
  const response = await apiFetch(`/stats/categories`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Failed to fetch category distribution");
  return response.json();
};

export const getStatsCountries = async (): Promise<CountryDistribution[]> => {
  const response = await apiFetch(`/stats/countries`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Failed to fetch country distribution");
  return response.json();
};
