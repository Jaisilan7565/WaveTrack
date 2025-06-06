import { BASE_URL } from "../utils/url";
import axios from "axios";
import store from "../redux/store/store";
import { login, logout } from "../redux/store/authSlice";

export const loginAPI = async (credentials) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, credentials);
    const { token, user } = response.data;

    localStorage.setItem("jwt", token);
    store.dispatch(login({ token, user }));
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

export const logoutAPI = () => {
  localStorage.removeItem("jwt");
  store.dispatch(logout());
  window.location.href = "/login";
};
