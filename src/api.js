import axios from "axios";

const API_BASE_URL = "https://two400030518-tourist-project-f.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
export { API_BASE_URL };
