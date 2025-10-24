import axios from 'axios';
import { getInitData } from '../utils/telegram';

const axiosInstance = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use((config) => {
    config.headers['X-Telegram-InitData'] = getInitData();
    return config;
});

export default axiosInstance;
