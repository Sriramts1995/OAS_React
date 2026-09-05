import axios from "axios";
import { COMMON_HEADERS } from "../common/constants";

const SERVICES_URL = "http://lp3-ap-52176291:8080/services";

export const getPendingListByEmpId = async (
  empnumber = "100203",
  rowSize = 10
) => {
  const token = localStorage.getItem("claims_token");

  const formData = new URLSearchParams();
  formData.append("empnumber", empnumber);
  formData.append("orderByCol", "updatedat");
  formData.append("sortByVal", "desc");
  formData.append("rowSize", rowSize.toString());

  return axios.post(
    `${SERVICES_URL}/requestlistservice/getPendingListByEmpId`,
    formData,
    {
      headers: {
        ...COMMON_HEADERS,
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Voltmx-Authorization": token,
      },
    }
  );
};

export const getInitiatedListByEmpId = async (
  empnumber = "100203",
  rowSize = 10
) => {
  const token = localStorage.getItem("claims_token");

  const formData = new URLSearchParams();
  formData.append("empnumber", empnumber);
  formData.append("orderByCol", "updatedat");
  formData.append("sortByVal", "desc");
  formData.append("rowSize", rowSize.toString());

  return axios.post(
    `${SERVICES_URL}/requestlistservice/getInitiatedListByEmpId`,
    formData,
    {
      headers: {
        ...COMMON_HEADERS,
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Voltmx-Authorization": token,
      },
    }
  );
};

export const getApprovedListByEmpId = async (
  empnumber = "100203",
  rowSize = 10
) => {
  const token = localStorage.getItem("claims_token");

  const formData = new URLSearchParams();
  formData.append("empnumber", empnumber);
  formData.append("orderByCol", "updatedat");
  formData.append("sortByVal", "desc");
  formData.append("rowSize", rowSize.toString());

  return axios.post(
    `${SERVICES_URL}/requestlistservice/getApprovedListByEmpId`,
    formData,
    {
      headers: {
        ...COMMON_HEADERS,
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Voltmx-Authorization": token,
      },
    }
  );
};

export const getRejectedListByEmpId = async (
  empnumber = "100203",
  rowSize = 10
) => {
  const token = localStorage.getItem("claims_token");

  const formData = new URLSearchParams();
  formData.append("empnumber", empnumber);
  formData.append("orderByCol", "updatedat");
  formData.append("sortByVal", "desc");
  formData.append("rowSize", rowSize.toString());

  return axios.post(
    `${SERVICES_URL}/requestlistservice/getRejectedListByEmpId`,
    formData,
    {
      headers: {
        ...COMMON_HEADERS,
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Voltmx-Authorization": token,
      },
    }
  );
};

// SUBMIT REQUEST (Volt MX Object Service)
export const submitrequest = async (payload) => {
  const token = localStorage.getItem("claims_token");

  return axios.post(
    `${SERVICES_URL}/data/v1/requestobject/objects/request`,
    payload,
    {
      headers: {
        ...COMMON_HEADERS,
        "Content-Type": "application/json",
        "X-Voltmx-Authorization": token,
      },
    }
  );
};

// SUBMIT / APPROVE REQUEST (Volt MX Object Service)
export const approveorrejectRequest = async (payload) => {
  const token = localStorage.getItem("claims_token");

  return axios.put(
    `${SERVICES_URL}/data/v1/requestobject/objects/request`,
    payload,
    {
      headers: {
        ...COMMON_HEADERS,
        "Content-Type": "application/json",
        "X-Voltmx-Authorization": token,
      },
    }
  );
};


// FETCH REQUEST DETAILS BY ID (Orchestration Service)
export const getrequestsdetailsById = async (requestId) => {
  const token = localStorage.getItem("claims_token");

  const formData = new URLSearchParams();
  formData.append("requestid", requestId);
  formData.append("axisref", "false");

  return axios.post(
    `${SERVICES_URL}/requestDetailsOrchService/nonfinancials`,
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