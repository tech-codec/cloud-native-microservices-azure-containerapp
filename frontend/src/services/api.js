// ...existing code...
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL; // Ensure you have this variable in your .env file

// default axios instance (so `import api from "../services/api"` works)
const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});

// keep the helper as a named export if you prefer that pattern
export const fetchUsersWithOrders = async () => {
  try {
    const response = await api.get("/users-with-orders");
    return response.data;
  } catch (error) {
    console.error("Error fetching users with orders:", error);
    throw error;
  }
};

export default api;
// ...existing code...
