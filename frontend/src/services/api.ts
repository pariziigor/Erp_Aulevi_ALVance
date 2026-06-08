// frontend/src/services/api.ts
import axios, { AxiosError } from 'axios';

export const AUTH_UNAUTHORIZED_EVENT = 'alvance:auth-unauthorized';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
});

// Interceptor automático: Adiciona o Token JWT em todas as requisições se ele existir
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@AuleviNexus:token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    let message = 'Falha na comunicacao com a API.';

    const data = error.response?.data;
    if (data instanceof Blob) {
      try {
        const text = await data.text();
        const parsed = JSON.parse(text);
        message = parsed.detail || message;
      } catch {
        message = error.message || message;
      }
    } else if (data && typeof data === 'object' && 'detail' in data) {
      const detail = (data as { detail?: unknown }).detail;
      message = typeof detail === 'string' ? detail : JSON.stringify(detail);
    } else if (error.message) {
      message = error.message;
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('@AuleviNexus:token');
      localStorage.removeItem('@AuleviNexus:user');
      window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
    }

    return Promise.reject(new Error(message));
  },
);

export default api;
