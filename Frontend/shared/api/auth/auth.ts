import { type LoginPayload } from "../../../web/src/pages/Login/schemas/loginValidation";
import { API_URL } from "../../config";

export async function login(payload: LoginPayload) {
  const response = await fetch(`${API_URL}/auth/login`, {
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

export async function updateProfile(data: {
  name?: string;
  surName?: string;
  email?: string;
  emailConfirmation?: string;
  password?: string;
  passwordConfirmation?: string;
}) {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_URL}/users/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const msg = Array.isArray(responseData.message)
      ? responseData.message.join(", ")
      : responseData.message;
    throw new Error(msg || "Failed to update profile");
  }

  return responseData;
}

