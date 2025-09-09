import axios from "axios";

// const instance = axios.create({
//   baseURL: process.env.REACT_APP_SERVER_BASE_URL || "http://localhost:3000",
//   withCredentials: true,
// });
const instance = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
});
export default instance;
