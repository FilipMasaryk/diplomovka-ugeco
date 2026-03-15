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
