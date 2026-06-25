import axios from "axios";

const api = axios.create({
  baseURL: "https://savezo.onrender.com/api",
});

export default api;