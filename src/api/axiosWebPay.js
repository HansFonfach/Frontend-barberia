// webpayAxios.js
import axios from "axios";

export const axiosWebPay = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  // SIN withCredentials
  // SIN headers de Authorization
  headers: {
    "Content-Type": "application/json",
  },
});