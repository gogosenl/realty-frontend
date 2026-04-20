import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    user: null as any,
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
  },
  actions: {
    async login(payload: { email: string; password: string }) {
      const config = useRuntimeConfig()
      const data: any = await $fetch(`${config.public.apiBase}/auth/login`, {
        method: 'POST',
        body: payload,
      })
      this.token = data.access_token
      this.user = data.user
      if (import.meta.client) {
        localStorage.setItem('token', data.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))
      }
    },
    logout() {
      this.token = null
      this.user = null
      if (import.meta.client) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    },
    loadFromStorage() {
      if (import.meta.client) {
        const token = localStorage.getItem('token')
        const user = localStorage.getItem('user')
        if (token) this.token = token
        if (user) this.user = JSON.parse(user)
      }
    },
  },
})