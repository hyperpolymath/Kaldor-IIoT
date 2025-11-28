import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
})

// Add auth token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  register: (username: string, email: string, password: string) =>
    api.post('/auth/register', { username, email, password }),
}

export const loomsAPI = {
  getAll: () => api.get('/looms'),
  getById: (id: string) => api.get(`/looms/${id}`),
  updateConfig: (id: string, config: any) => api.post(`/looms/${id}/config`, config),
}

export const measurementsAPI = {
  get: (loomId: string, params?: any) => api.get('/measurements', { params: { loom_id: loomId, ...params } }),
}

export const alertsAPI = {
  getAll: (params?: any) => api.get('/alerts', { params }),
  acknowledge: (id: number) => api.post(`/alerts/${id}/acknowledge`),
}

export const analyticsAPI = {
  getSummary: (loomId: string) => api.get('/analytics/summary', { params: { loom_id: loomId } }),
}

export default api
