import "../types/telegram.d"
import { mockInitData } from '../mock/initData';

export const getInitData = () => {  
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return `user=${encodeURIComponent(JSON.stringify(mockInitData))}&hash=MOCK_HASH`;
  }
  return window.Telegram?.WebApp?.initData || '';
};