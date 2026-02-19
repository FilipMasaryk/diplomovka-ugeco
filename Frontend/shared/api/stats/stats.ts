import { API_URL } from "../../config";

export interface OffersStats {
  totalOffers: number;
  activeOffers: number;
  creatorsCount: number;
}

export const getOffersStats = async (token: string): Promise<OffersStats> => {
  const response = await fetch(`${API_URL}/offers/stats`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch stats");
  }

  return response.json();
};
