import axios from "axios";

// Fungsi untuk membuat delay/jeda
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Ambil base URL dari .env, fallback ke localhost
const BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:1434";

const api = axios.create({
    baseURL: `${BASE_URL}/api`, // pastikan /api diappend
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach JWT & Tambahkan DELAY
api.interceptors.request.use(
    async (config) => {
        // --- TAMBAH DELAY DI SINI (2.5 SAAT) ---
        // Delay ini akan berlaku untuk setiap permintaan API.
        if (config.url === '/auth/login') {
            await sleep(2500);
        }
        // ----------------------------------------

        const token = localStorage.getItem("token");
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// Global response interceptor (opsional)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error:", error);
        return Promise.reject(error);
    }
);

export default api;
