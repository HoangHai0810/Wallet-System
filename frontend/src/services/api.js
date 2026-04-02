import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm token vào header nếu có
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
};

export const walletService = {
  getWallet: () => api.get('/wallet/my'),
  transfer: (data, idempotencyKey) => 
    api.post('/wallet/transfer', data, {
      headers: { 'Idempotency-Key': idempotencyKey }
    }),
  getHistory: (params) => api.get('/wallet/history', { params }),
  getAiAnalysis: () => api.get('/api/ai/analyze'),
};

export default api;
