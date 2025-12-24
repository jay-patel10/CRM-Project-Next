// utils/api.ts
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// ==================================================
// REQUEST INTERCEPTOR
// ==================================================
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken')

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }

    return config
  },
  error => Promise.reject(error)
)

// ==================================================
// RESPONSE INTERCEPTOR WITH PROPER QUEUE HANDLING
// ==================================================
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: any) => void
  reject: (reason?: any) => void
}> = []

const processQueue = (error: any = null, token: string | null = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error)
    } else {
      promise.resolve(token)
    }
  })

  failedQueue = []
}

apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError<any>) => {
    const originalRequest: any = error.config

    // ✅ Check for TOKEN_EXPIRED specifically
    const isTokenExpired =
      error.response?.status === 401 &&
      (error.response?.data?.code === 'TOKEN_EXPIRED' || error.response?.data?.message === 'Token expired')

    if (isTokenExpired && !originalRequest._retry) {
      console.log('🚨 Token expired detected - starting refresh flow')

      // If already refreshing, queue this request
      if (isRefreshing) {
        console.log('⏳ Already refreshing, queuing request...')

        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }

            return apiClient(originalRequest)
          })
          .catch(err => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null

      if (!refreshToken) {
        console.error('❌ No refresh token found')
        processQueue(new Error('No refresh token'), null)
        localStorage.clear()

        if (typeof window !== 'undefined') {
          window.location.href = '/en/login'
        }

        return Promise.reject(error)
      }

      try {
        console.log('🔄 Calling refresh endpoint...')

        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken
        })

        if (!data.accessToken) {
          throw new Error('No access token in refresh response')
        }

        console.log('✅ Token refresh successful!')

        // Update localStorage
        localStorage.setItem('accessToken', data.accessToken)

        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken)
        }

        if (data.user) {
          localStorage.setItem('userData', JSON.stringify(data.user))
        }

        // Update the failed request's header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        }

        // Process queued requests
        processQueue(null, data.accessToken)

        console.log('🔁 Retrying original request')

        // Retry the original request
        return apiClient(originalRequest)
      } catch (err: any) {
        console.error('❌ Token refresh failed:', err.message)
        processQueue(err, null)
        localStorage.clear()

        if (typeof window !== 'undefined') {
          window.location.href = '/en/login'
        }

        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    // For all other errors, reject normally
    return Promise.reject(error)
  }
)

export default apiClient
