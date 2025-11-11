import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/', // URL base do seu backend
});

// Interceptor: Adiciona o token de autenticação a cada requisição
api.interceptors.request.use(
  (config) => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const token = user?.token;
      if (token) {
        config.headers['Authorization'] = 'Bearer ' + token;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;