import axios from "axios";
import { COMMON_HEADERS, VOLTMX_CONFIG } from "../config/voltmxConfig";

const AUTH_URL = `${VOLTMX_CONFIG.BASE_URL.replace('/services', '')}/authService/100000002`;

export const login = async (email, password = "Hcl@1234") => {
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