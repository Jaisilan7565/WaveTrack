import { getAuthHeaders } from "../utils/authHeaders";
import { BASE_URL } from "../utils/url";
import axios from "axios";

export const createPaymentAPI = async (paymentData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/payments`,
      paymentData,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
};

export const getPaymentsAPI = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/payments`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Error fetching payments:", error);
    throw error;
  }
};

export const getPaymentsBySubscriberIdAPI = async (subId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/payments/${subId}`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching payments:", error);
    throw error;
  }
};

export const approvePaymentAPI = async (id, status, payment) => {
  try {
    let payload;

    if (status === "Paid") {
      payload = {
        request_status: "approved",
      };
    } else if (status === "Modified") {
      // payload = {
      //   name: payment?.modifiedData?.current?.name,
      //   email: payment?.modifiedData?.current?.email,
      //   contact: payment?.modifiedData?.current?.contact,
      //   roles: payment?.modifiedData?.current?.roles,
      //   request_status: "approved",
      //   status: "Active",
      // };
    } else if (status === "Received") {
      payload = {
        request_status: "approved",
      };
    } else if (status === "Active") {
      payload = {
        request_status: "approved",
        status: "Active",
      };
    }

    const response = await axios.patch(
      `${BASE_URL}/payments/${id}/approve`,
      payload,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error approving payment:", error);
    throw error;
  }
};

export const rejectPaymentAPI = async (id, status, payment) => {
  try {
    let payload;

    if (status === "Paid" || status === "Received") {
      payload = {
        request_status: "rejected",
        status: "Rejected",
      };
    } else if (status === "Modified") {
      payload = {
        request_status: "rejected",
        status: "Rejected",
      };
    }

    const response = await axios.patch(
      `${BASE_URL}/payments/${id}/reject`,
      payload,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error rejecting payment:", error);
    throw error;
  }
};
