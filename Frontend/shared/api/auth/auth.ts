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
