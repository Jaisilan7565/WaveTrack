import { getAuthHeaders } from "../utils/authHeaders";
import { BASE_URL } from "../utils/url";
import axios from "axios";

export const createTicketAPI = async (ticketData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/tickets`,
      ticketData,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error creating ticket:", error);
    throw error;
  }
};

export const getTicketsAPI = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/tickets`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Error fetching tickets:", error);
    throw error;
  }
};
