import axios from "axios";
import { API_CONFIG } from "../config/api";

const API_BASE_URL = API_CONFIG.baseURL;

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    withCredentials: true,
});

let sessionExpiredHandler = null;

export const setSessionExpiredHandler = (handler) => {
    sessionExpiredHandler = handler;
};

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            const url = error.config?.url || "";
            const publicEndpoints = [
                "/admin/login",
                "/employee/auth",
                "/admin/me",
                "/employee/me",
            ];

            const isPublicEndpoint = publicEndpoints.some((endpoint) =>
                url.includes(endpoint)
            );

            if (!isPublicEndpoint) {
                if (sessionExpiredHandler) {
                    sessionExpiredHandler();
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
