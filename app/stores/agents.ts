import { defineStore } from 'pinia'

export const useAgentsStore = defineStore('agents', {
  state: () => ({
    agents: [] as any[],
    loading: false,
    error: null as string | null,
  }),
  actions: {
    getHeaders() {
      const token = import.meta.client ? localStorage.getItem('token') : null
      return token ? { Authorization: `Bearer ${token}` } : {}
    },
    async fetchAgents() {
      const config = useRuntimeConfig()
      this.loading = true
      this.error = null
      try {
        const data = await $fetch(`${config.public.apiBase}/agents`, {
          headers: this.getHeaders(),
        })
        this.agents = data as any[]
      } catch (e) {
        this.error = 'Ajanlar yüklenemedi'
      } finally {
        this.loading = false
      }
    },
    async createAgent(payload: { name: string; email: string; phone: string }) {
      const config = useRuntimeConfig()
      const data = await $fetch(`${config.public.apiBase}/agents`, {
        method: 'POST',
        body: payload,
        headers: this.getHeaders(),
      })
      this.agents.push(data)
      return data
    },
  },
})