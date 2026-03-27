import { API_URL } from "./config";

export async function login(payload: {
  email: string;
  password: string;
  rememberMe: boolean;
}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    console.log("[AUTH] Logging in to:", `${API_URL}/auth/login`);
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    return data;
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new Error("Server nedostupný. Skontrolujte pripojenie.");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export async function forgotPassword(email: string) {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to send reset email");
  }

  return data;
}
