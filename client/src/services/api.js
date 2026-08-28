import axios from 'axios';

const API = axios.create({
  baseURL: '/api'
});

// Attach Token Interceptor
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('edusphere_user') || 'null');
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;
