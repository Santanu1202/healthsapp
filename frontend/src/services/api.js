
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api/";

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Separate refresh request tracker
let refreshPromise = null;

// ========================================
// REQUEST INTERCEPTOR
// ========================================

api.interceptors.request.use(
    (config) => {
        const url = config.url?.replace(/^\/+/, "");

        config.headers = config.headers || {};

        // Public endpoints
        const publicEndpoints = [
            "doctors/",
            "doctors/login/",
            "accounts/login/",
            "accounts/admin-login/",
        ];

        if (publicEndpoints.includes(url)) {
            config.__authRole = "public";
            delete config.headers.Authorization;
        }

        // Admin authentication
        else if (url === "doctors/register/" ||  url === "admin-dashboard-stats/") {
            config.__authRole = "admin";

            const adminToken = localStorage.getItem(
                "adminAccessToken"
            );

            if (adminToken) {
                config.headers.Authorization = `Bearer ${adminToken}`;
            } else {
                delete config.headers.Authorization;
            }
        }

        // Doctor authentication
        else if (
            url.startsWith("doctors/") ||
            url.startsWith("doctor-dashboard/")
        ) {
            config.__authRole = "doctor";

            const doctorToken = localStorage.getItem(
                "doctorAccessToken"
            );

            if (doctorToken) {
                config.headers.Authorization = `Bearer ${doctorToken}`;
            } else {
                delete config.headers.Authorization;
            }
        }

        // Patient authentication
        else {
            config.__authRole = "patient";

            const patientToken = localStorage.getItem(
                "accessToken"
            );

            if (patientToken) {
                config.headers.Authorization = `Bearer ${patientToken}`;
            } else {
                delete config.headers.Authorization;
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);


// ========================================
// RESPONSE INTERCEPTOR
// AUTOMATIC PATIENT TOKEN REFRESH
// ========================================

api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        if (!originalRequest) {
            return Promise.reject(error);
        }

        const url = originalRequest.url?.replace(/^\/+/, "");

        // Refresh only expired Patient tokens.
        // Never refresh Admin or Doctor tokens here.
        if (
            error.response?.status === 401 &&
            originalRequest.__authRole === "patient" &&
            !originalRequest._retry &&
            url !== "token/refresh/" &&
            url !== "accounts/login/"
        ) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem(
                "refreshToken"
            );

            if (!refreshToken) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");

                return Promise.reject(error);
            }

            try {
                // Prevent multiple simultaneous refresh requests
                if (!refreshPromise) {
                    refreshPromise = axios.post(
                        `${API_BASE_URL}token/refresh/`,
                        {
                            refresh: refreshToken,
                        }
                    );
                }

                const response = await refreshPromise;

                const newAccessToken = response.data.access;

                localStorage.setItem(
                    "accessToken",
                    newAccessToken
                );

                originalRequest.headers =
                    originalRequest.headers || {};

                originalRequest.headers.Authorization =
                    `Bearer ${newAccessToken}`;

                return api(originalRequest);

            } catch (refreshError) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");

                return Promise.reject(refreshError);

            } finally {
                refreshPromise = null;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
