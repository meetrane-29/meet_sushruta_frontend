import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null,
    refreshToken: null,
    role: null,
    userId: null,
    userName: null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.accessToken,
  },

  actions: {
    async login(email, password) {
      try {
        const response = await axios.post('http://localhost:8080/api/v1/auth/login', {
          email,
          password,
        })

        const { access_token, refresh_token, role, user_id, first_name, last_name } = response.data.data

        console.log('[authStore] login success — role:', role, '| user_id:', user_id)

        this.accessToken = access_token
        this.refreshToken = refresh_token
        this.role = role
        this.userId = user_id
        this.userName = `${first_name} ${last_name}`

        sessionStorage.setItem('accessToken', access_token)
        sessionStorage.setItem('refreshToken', refresh_token)
        sessionStorage.setItem('role', role)
        sessionStorage.setItem('userId', user_id)
        sessionStorage.setItem('userName', `${first_name} ${last_name}`)

        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`

        // Redirect is handled by Login.vue using useRouter()
        // Store only manages state — no router dependency needed
        return response.data
      } catch (error) {
        console.error('[authStore] login failed:', error)
        throw error
      }
    },

    async register(formData) {
      try {
        const response = await axios.post('http://localhost:8080/api/v1/auth/register', formData)
        return response.data
      } catch (error) {
        console.error('Registration failed:', error)
        // Throw the error with message from API response if available
        const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.'
        const err = new Error(errorMessage)
        err.status = error.response?.status
        throw err
      }
    },

    logout() {
      this.accessToken = null
      this.refreshToken = null
      this.role = null
      this.userId = null
      this.userName = null

      sessionStorage.removeItem('accessToken')
      sessionStorage.removeItem('refreshToken')
      sessionStorage.removeItem('role')
      sessionStorage.removeItem('userId')
      sessionStorage.removeItem('userName')

      delete axios.defaults.headers.common['Authorization']
    },

    initializeFromStorage() {
      const accessToken = sessionStorage.getItem('accessToken')
      const refreshToken = sessionStorage.getItem('refreshToken')
      const role = sessionStorage.getItem('role')
      const userId = sessionStorage.getItem('userId')
      const userName = sessionStorage.getItem('userName')

      console.log('[authStore] initializeFromStorage:', { hasToken: !!accessToken, role, userId })

      if (accessToken) {
        this.accessToken = accessToken
        this.refreshToken = refreshToken
        this.role = role
        this.userId = userId
        this.userName = userName

        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
      }
    },
  },
})
