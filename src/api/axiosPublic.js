// axiosPublic.js
import axios from "axios";

export const axiosPublic = axios.create({
 baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
});
