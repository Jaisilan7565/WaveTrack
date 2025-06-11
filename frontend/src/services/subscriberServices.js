import { getAuthHeaders } from "../utils/authHeaders";
import { BASE_URL } from "../utils/url";
import axios from "axios";

export const createSubscriberAPI = async (subscriberData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/subscribers`,
      subscriberData,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error creating Subscriber:", error);
    throw error;
  }
};
