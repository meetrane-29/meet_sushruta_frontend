import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'
import router from '@/router'

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1/'
})

// Track if a token refresh is already in progress to prevent duplicate calls
let isRefreshing = false
let failedRequestQueue = []

const processQueue = (error, token = null) => {
  failedRequestQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })
  failedRequestQueue = []
}

// Request interceptor - attach Bearer token
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.accessToken) {
      config.headers.Authorization = `Bearer ${authStore.accessToken}`
    }

    // Log POST requests with data
    if (config.method === 'post' || config.method === 'patch') {
      console.log('[API Request]', config.method.toUpperCase(), config.url, 'Data:', config.data)
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Only handle 401 errors, and don't retry refresh calls themselves
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        // Queue this request until the refresh completes
        return new Promise((resolve, reject) => {
          failedRequestQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const authStore = useAuthStore()
      const refreshToken = authStore.refreshToken || sessionStorage.getItem('refreshToken')

      if (!refreshToken) {
        // No refresh token — log out
        isRefreshing = false
        authStore.logout()
        router.push('/login')
        return Promise.reject(error)
      }

      try {
        const response = await axios.post('http://localhost:8080/api/v1/auth/refresh', {
          refresh_token: refreshToken
        })

        const { access_token, refresh_token } = response.data.data

        // Update tokens in store and sessionStorage
        authStore.accessToken = access_token
        authStore.refreshToken = refresh_token
        sessionStorage.setItem('accessToken', access_token)
        sessionStorage.setItem('refreshToken', refresh_token)

        // Update default axios header
        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`

        processQueue(null, access_token)

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        authStore.logout()
        router.push('/login')
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// Helper for making requests with error handling
const makeRequest = async (requestFn) => {
  try {
    return await requestFn()
  } catch (error) {
    console.error('API Request failed:', error)
    throw error
  }
}

export function useApi() {
  return {
    api,
    get: (url, config) => api.get(url, config),
    post: (url, data, config) => api.post(url, data, config),
    patch: (url, data, config) => api.patch(url, data, config),
    del: (url, config) => api.delete(url, config),
    makeRequest
  }
}

export default api
