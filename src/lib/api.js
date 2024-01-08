import axios from "axios";
import { API_URL } from "./constants";

const apiInstance = axios.create({
  baseURL: API_URL,
});

export default apiInstance;
