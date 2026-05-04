import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  me: () => API.get('/auth/me'),
}

export const resumeAPI = {
  upload: (formData) =>
    API.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAnalysis: (id) => API.get(`/resume/${id}/analysis`),
  matchJob: (id, jd) => API.post(`/resume/${id}/match`, { job_description: jd }),
  getHistory: () => API.get('/resume/history'),
}

export default API