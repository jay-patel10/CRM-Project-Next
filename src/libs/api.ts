// utils/api.ts
import axios from 'axios'

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// ✅ Add token to every request
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  error => Promise.reject(error)
)

// ✅ Handle 401 errors and refresh token
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // If 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        console.log('🔄 Token expired, attempting refresh...')

        const refreshToken = localStorage.getItem('refreshToken')

        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        // Call refresh endpoint
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
          refreshToken
        })

        const { accessToken, refreshToken: newRefreshToken } = response.data

        // Save new tokens
        localStorage.setItem('accessToken', accessToken)

        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken)
        }

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`

        return apiClient(originalRequest)
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError)

        // Clear everything and redirect to login
        localStorage.clear()
        window.location.href = '/en/login'

        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
