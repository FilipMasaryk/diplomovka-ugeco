import { API_URL } from "../../config";
import { apiFetch } from "../apiFetch";

type LoginPayload = { email: string; password: string; rememberMe?: boolean };

export async function login(payload: LoginPayload) {
  console.log(`${API_URL}/auth/login`);
  //const response = await fetch(`${API_URL}/auth/login`, {
  const response = await fetch(`/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
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

export async function resetPassword(
  token: string,
  password: string,
  passwordConfirm: string,
) {
  const response = await fetch(`${API_URL}/auth/reset-password/${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password, passwordConfirm }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to reset password");
  }

  return data;
}

export async function fetchMe() {
  const response = await apiFetch(`/users/me`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch user");
  }
  return data;
}

export async function uploadAvatar(file: File): Promise<{
  avatar: string;
  access_token: string;
}> {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await apiFetch(`/users/me/avatar`, {
    method: "PATCH",
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to upload avatar");
  }
  return data;
}

export async function deleteAvatar(): Promise<{
  avatar: string | null;
  access_token: string;
}> {
  const response = await apiFetch(`/users/me/avatar`, {
    method: "DELETE",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to delete avatar");
  }
  return data;
}

export async function updateProfile(data: {
  name?: string;
  surName?: string;
  password?: string;
  passwordConfirmation?: string;
  ico?: string;
  dic?: string;
}) {
  const response = await apiFetch(`/users/me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const firstMsg = Array.isArray(responseData.message)
      ? responseData.message[0]
      : responseData.message;
    const msg =
      typeof firstMsg === "string" && firstMsg.includes(":")
        ? firstMsg.split(":").slice(1).join(":").trim()
        : firstMsg;
    throw new Error(msg || "Failed to update profile");
  }

  return responseData;
}
