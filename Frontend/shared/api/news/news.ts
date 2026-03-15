import { apiFetch } from "../apiFetch";

export interface NewsItem {
  _id: string;
  title: string;
  description: string;
  category: "fix" | "feature" | "bug";
  target: "all" | "brand_manager" | "creator";
  image: string;
  status: "draft" | "published";
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const fetchNews = async (target?: string): Promise<NewsItem[]> => {
  const url = target ? `/news?target=${target}` : `/news`;
  const response = await apiFetch(url);
  if (!response.ok) throw await response.json();
  return response.json();
};

export const fetchPublishedNews = async (): Promise<NewsItem[]> => {
  const response = await apiFetch(`/news/published`);
  if (!response.ok) throw await response.json();
  return response.json();
};

export const fetchUnreadNewsCount = async (): Promise<number> => {
  const response = await apiFetch(`/news/unread-count`);
  if (!response.ok) return 0;
  const data = await response.json();
  return data.count;
};

export const fetchRecentNews = async (): Promise<NewsItem[]> => {
  const response = await apiFetch(`/news/recent`);
  if (!response.ok) return [];
  return response.json();
};

export const markNewsSeen = async (): Promise<void> => {
  await apiFetch(`/news/mark-seen`, { method: "POST" });
};

export const createNews = async (formData: FormData): Promise<NewsItem> => {
  const response = await apiFetch(`/news`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw await response.json();
  return response.json();
};

export const updateNews = async (
  id: string,
  formData: FormData,
): Promise<NewsItem> => {
  const response = await apiFetch(`/news/${id}`, {
    method: "PATCH",
    body: formData,
  });
  if (!response.ok) throw await response.json();
  return response.json();
};

export const deleteNews = async (id: string): Promise<boolean> => {
  const response = await apiFetch(`/news/${id}`, { method: "DELETE" });
  return response.ok;
};
