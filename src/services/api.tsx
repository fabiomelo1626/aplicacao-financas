import axios from 'axios';
import Cookies from 'js-cookie';
// src/services/cobrancaService.ts
import { EntradaRecebimento, CobrancaPixRequest, CobrancaPixResponse } from '@/src/types';


export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('token') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para redirecionar se o token expirar no backend (Erro 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token', { path: '/' });
      localStorage.removeItem('token');
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);