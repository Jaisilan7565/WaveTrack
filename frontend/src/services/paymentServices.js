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
