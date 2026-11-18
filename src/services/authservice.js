import axios from "axios";
import { COMMON_HEADERS, VOLTMX_CONFIG } from "../config/voltmxConfig";

const AUTH_URL = `${VOLTMX_CONFIG.BASE_URL.replace('/services', '')}/authService/100000002`;
const SERVICES_URL = VOLTMX_CONFIG.BASE_URL;

//export const login = async (email, password = "Hcl@1234") => {
export const login = async (email, password) => {
  const formData = new URLSearchParams();
  formData.append("userid", email);
  formData.append("password", password);
  formData.append("provider", "userrepositorylogin");
  formData.append("persistLoginResponse", "true");
  formData.append("continueOnRefreshError", "false");
  formData.append("include_profile", "false");
  formData.append("isSSOEnabled", "false");
  formData.append("isOfflineEnabled", "false");

  const response = await axios.post(
    `${AUTH_URL}/login?provider=userrepositorylogin`,
    formData,
    {
      headers: {
        ...COMMON_HEADERS,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  // Extract the dynamic JWT claims token
  const token = response.data?.claims_token?.value;

  if (token) {
    // Store in localStorage for subsequent API requests
    localStorage.setItem("claims_token", token);
  }

  return response.data;
};

// LOGOUT (Session Management Service)
// Mirrors Volt MX doLogout(): calls the "sessionmgmt / invalidate" Java integration
// service so Foundry invalidates the server-side session for the current claims token.
// The operation takes no input params and returns { sessionid }. The caller should
// clear local storage and navigate to login regardless of whether this call succeeds,
// which is exactly what the Volt MX app does in both its success and error callbacks.
export const logout = async () => {
  const token = localStorage.getItem("claims_token");

  // Nothing to invalidate on the server if no token was ever stored
  if (!token) return null;

  try {
    const response = await axios.post(
      `${SERVICES_URL}/sessionmgmt/invalidate`,
      new URLSearchParams(), // no input params
      {
        headers: {
          ...COMMON_HEADERS,
          "Content-Type": "application/x-www-form-urlencoded",
          "X-Voltmx-Authorization": token,
        },
      }
    );
    return response.data;
  } catch (error) {
    // Do not block the user from logging out if the server call fails
    console.error("Session invalidate failed (continuing with local logout):", error);
    return null;
  }
};
