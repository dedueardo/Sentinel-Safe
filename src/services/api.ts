import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

export const setupInterceptors = (navigate: any) => {
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        navigate('/login');
      }
      return Promise.reject(error);
    }
  );
};

export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
};

export const camerasApi = {
  list: () => api.get('/cameras'),
  add: (camera: { name: string; streamUrl: string }) =>
    api.post('/cameras', camera),
  update: (id: string, camera: { name: string; streamUrl: string }) =>
    api.put(`/cameras/${id}`, camera),
  delete: (id: string) => api.delete(`/cameras/${id}`),
  getStream: (id: string) => api.get(`/cameras/${id}/stream`),
};

export default api;