import { useRuntimeConfig } from 'nuxt/app'
import { defineStore } from 'pinia'

export const useTransactionsStore = defineStore('transactions', {
  state: () => ({
    transactions: [] as any[],
    currentTransaction: null as any,
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchTransactions() {
      const config = useRuntimeConfig()
      this.loading = true
      this.error = null
      try {
        const data = await $fetch(`${config.public.apiBase}/transactions`)
        this.transactions = data as any[]
      } catch (e) {
        this.error = 'İşlemler yüklenemedi'
      } finally {
        this.loading = false
      }
    },
    async fetchTransaction(id: string) {
      const config = useRuntimeConfig()
      this.loading = true
      try {
        const data = await $fetch(`${config.public.apiBase}/transactions/${id}`)
        this.currentTransaction = data
      } catch (e) {
        this.error = 'İşlem bulunamadı'
      } finally {
        this.loading = false
      }
    },
    async createTransaction(payload: any) {
      const config = useRuntimeConfig()
      const data = await $fetch(`${config.public.apiBase}/transactions`, {
        method: 'POST',
        body: payload,
      })
      this.transactions.push(data)
      return data
    },
    async updateStage(id: string, stage: string) {
      const config = useRuntimeConfig()
      const data = await $fetch(`${config.public.apiBase}/transactions/${id}/stage`, {
        method: 'PATCH',
        body: { stage },
      })
      const index = this.transactions.findIndex((t) => t._id === id)
      if (index !== -1) this.transactions[index] = data
      this.currentTransaction = data
      return data
    },
  },
})