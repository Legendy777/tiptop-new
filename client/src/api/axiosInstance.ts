import axios from 'axios';
import { getInitData } from '../utils/telegram';

const origin = typeof window !== 'undefined' ? window.location.origin : '';
const apiBase = import.meta.env.VITE_API_URL || origin || '';

const axiosInstance = axios.create({
    baseURL: apiBase ? `${apiBase}/api` : '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use((config) => {
    config.headers['X-Telegram-InitData'] = getInitData();
    return config;
});

export default axiosInstance;
