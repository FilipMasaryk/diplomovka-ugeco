import {
  loginSchema,
  type LoginPayload,
} from "../../web/src/pages/Login/schemas/loginValidation";
const BASE_URL = "http://localhost:3000";

export async function login(payload: LoginPayload) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
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
