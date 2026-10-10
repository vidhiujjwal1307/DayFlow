import axios from 'axios';

// Production frontend and API are deployed separately on Vercel and Render.
// Local development uses Vite's /api proxy to the FastAPI server.
const API_BASE_URL = import.meta.env.VITE_API_URL
  || (import.meta.env.PROD ? 'https://dayflow-2ntc.onrender.com' : '');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dayflow_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const AuthAPI = {
  login: (data) => api.post('/api/auth/login', data).then((res) => res.data),
  register: (data) => api.post('/api/auth/register', data).then((res) => res.data),
};

export const TaskAPI = {
  getAll: (params) => api.get('/api/tasks', { params }).then((res) => res.data),
  getDaySummary: (date) => api.get(`/api/tasks/day/${date}`).then((res) => res.data),
  getUpcoming: (params) => api.get('/api/tasks/upcoming', { params }).then((res) => res.data),
  create: (data) => api.post('/api/tasks', data).then((res) => res.data),
  getById: (id) => api.get(`/api/tasks/${id}`).then((res) => res.data),
  update: (id, data) => api.put(`/api/tasks/${id}`, data).then((res) => res.data),
  toggle: (id) => api.patch(`/api/tasks/${id}/toggle`).then((res) => res.data),
  delete: (id) => api.delete(`/api/tasks/${id}`).then((res) => res.data),
  reschedule: (id, newDate) => api.post(`/api/tasks/${id}/reschedule`, null, { params: { new_date: newDate } }).then((res) => res.data),
};

export const ReflectionAPI = {
  getAll: () => api.get('/api/reflections').then((res) => res.data),
  getByDate: (date) => api.get(`/api/reflections/day/${date}`).then((res) => res.data),
  save: (data) => api.post('/api/reflections', data).then((res) => res.data),
  delete: (date) => api.delete(`/api/reflections/day/${date}`).then((res) => res.data),
};

export const AnalyticsAPI = {
  getWeekly: (date) => api.get('/api/analytics/weekly', { params: { date } }).then((res) => res.data),
};

export const SettingsAPI = {
  get: () => api.get('/api/settings').then((res) => res.data),
  update: (data) => api.put('/api/settings', data).then((res) => res.data),
};

export const NoteAPI = {
  getAll: (params) => api.get('/api/notes', { params }).then((res) => res.data),
  getById: (id) => api.get(`/api/notes/${id}`).then((res) => res.data),
  create: (data) => api.post('/api/notes', data).then((res) => res.data),
  update: (id, data) => api.put(`/api/notes/${id}`, data).then((res) => res.data),
  togglePin: (id) => api.patch(`/api/notes/${id}/pin`).then((res) => res.data),
  delete: (id) => api.delete(`/api/notes/${id}`).then((res) => res.data),
};

export const AIAPI = {
  planDay: (data) => api.post('/api/ai/plan', data).then((res) => res.data),
};

export default api;
