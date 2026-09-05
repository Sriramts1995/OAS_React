import axios from "axios";
import { COMMON_HEADERS, VOLTMX_CONFIG } from "../config/voltmxConfig";

const SERVICES_URL = VOLTMX_CONFIG.BASE_URL;

export const getDetailsByEmpNumber = async () => {
  // Grab the dynamic token saved during login
  const token = localStorage.getItem("claims_token");

  const formData = new URLSearchParams();
  formData.append("testparams", "sfdf@gmail.com"); // Dummy email (Preprocessor overwrites this)

  return axios.post(
    `${SERVICES_URL}/usersearchseravice/getDetailsByEmpNumber`,
    formData,
    {
      headers: {
        ...COMMON_HEADERS,
        "Content-Type": "application/x-www-form-urlencoded",
        
        // Pass the dynamic token so UserDetailsPreprocessor can identify the user
        "X-Voltmx-Authorization": token, 
      },
    }
  );
};

// FETCH APPROVER DETAILS BY EMP ID
export const getApprovarDetailsById = async (empNumber) => {
  const token = localStorage.getItem("claims_token");

  const formData = new URLSearchParams();
  formData.append("empNumber", empNumber);

  return axios.post(
    `${SERVICES_URL}/usersearchseravice/getApprovarDetailsByEmpId`,
    formData,
    {
      headers: {
        ...COMMON_HEADERS,
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Voltmx-Authorization": token,
      },
    }
  );
}