// frontend/src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // URL do nosso backend FastAPI
});

// Interceptor automático: Adiciona o Token JWT em todas as requisições se ele existir
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@AuleviNexus:token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;