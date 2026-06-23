import axios from 'axios';

// Для продакшена - используем переменную окружения
const BASE_URL = "https://diploma-production-f729.up.railway.app/"

const ax = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Интерсептор для обработки ошибок
ax.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default ax;