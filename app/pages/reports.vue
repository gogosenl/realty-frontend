<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow px-6 py-4 flex items-center gap-4">
      <NuxtLink to="/" class="text-gray-500 hover:text-gray-700">← Geri</NuxtLink>
      <h1 class="text-xl font-semibold text-gray-800">Finans Raporu</h1>
    </nav>

    <div class="max-w-4xl mx-auto px-6 py-8 space-y-6">

      <!-- Özet Kartlar -->
      <div v-if="summary" class="grid grid-cols-2 gap-4">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p class="text-sm text-gray-500">Tamamlanan İşlem</p>
          <p class="text-3xl font-bold text-gray-800 mt-1">{{ summary.completedCount }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p class="text-sm text-gray-500">Toplam Komisyon Geliri</p>
          <p class="text-3xl font-bold text-gray-800 mt-1">{{ formatCurrency(summary.totalRevenue) }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p class="text-sm text-gray-500">Acente Geliri (%50)</p>
          <p class="text-3xl font-bold text-blue-600 mt-1">{{ formatCurrency(summary.agencyRevenue) }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p class="text-sm text-gray-500">Toplam Emlak Danışman Ödemesi (%50)</p>
          <p class="text-3xl font-bold text-green-600 mt-1">{{ formatCurrency(summary.agentRevenue) }}</p>
        </div>
      </div>

      <div v-if="loading" class="p-8 text-center text-gray-400">Yükleniyor...</div>

      <!-- Emlak Danışmanı Bazlı Kazanç -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="px-6 py-4 border-b border-gray-100">
          <h2 class="font-semibold text-gray-700">Emlak Danışmanı Bazlı Kazanç</h2>
        </div>

        <div v-if="earnings.length === 0" class="p-8 text-center text-gray-400">
          Henüz tamamlanmış işlem yok
        </div>

        <div v-else>
          <div
            v-for="item in earnings"
            :key="item.agent._id"
            class="px-6 py-4 border-b border-gray-50 flex items-center justify-between"
          >
            <div>
              <p class="font-medium text-gray-800">{{ item.agent.name }}</p>
              <p class="text-sm text-gray-500">{{ item.agent.email }}</p>
            </div>
            <div class="text-right">
              <p class="font-semibold text-green-600">{{ formatCurrency(item.total) }}</p>
              <p class="text-xs text-gray-400 mt-1">
                Toplam gelirin %{{ summaryPercent(item.total) }}'i
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tamamlanan İşlemler -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="px-6 py-4 border-b border-gray-100">
          <h2 class="font-semibold text-gray-700">Tamamlanan İşlemler</h2>
        </div>

        <div v-if="completedTransactions.length === 0" class="p-8 text-center text-gray-400">
          Henüz tamamlanmış işlem yok
        </div>

        <div v-else>
          <div
            v-for="txn in completedTransactions"
            :key="txn._id"
            class="px-6 py-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
            @click="$router.push(`/transactions/${txn._id}`)"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-800">{{ txn.propertyAddress }}</p>
                <p class="text-sm text-gray-500 mt-1">
                  {{ txn.listingAgent?.name }} → {{ txn.sellingAgent?.name }}
                </p>
              </div>
              <div class="text-right">
                <p class="font-semibold text-gray-800">{{ formatCurrency(txn.commissionBreakdown?.totalServiceFee) }}</p>
                <p class="text-xs text-gray-400 mt-1">{{ formatDate(txn.updatedAt) }}</p>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-gray-50">
              <div>
                <p class="text-xs text-gray-400">Acente</p>
                <p class="text-sm font-medium text-blue-600">{{ formatCurrency(txn.commissionBreakdown?.agencyAmount) }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400">{{ txn.listingAgent?.name }}</p>
                <p class="text-sm font-medium text-green-600">{{ formatCurrency(txn.commissionBreakdown?.listingAgentAmount) }}</p>
              </div>
              <div v-if="txn.commissionBreakdown?.sellingAgentAmount > 0">
                <p class="text-xs text-gray-400">{{ txn.sellingAgent?.name }}</p>
                <p class="text-sm font-medium text-green-600">{{ formatCurrency(txn.commissionBreakdown?.sellingAgentAmount) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()
const transactionsStore = useTransactionsStore()

const loading = ref(false)
const summary = ref(null)
const earnings = ref([])

const getHeaders = () => {
  const token = import.meta.client ? localStorage.getItem('token') : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

onMounted(async () => {
  loading.value = true
  try {
    await transactionsStore.fetchTransactions()
    summary.value = await $fetch(`${config.public.apiBase}/transactions/summary/financial`, {
      headers: getHeaders(),
    })
    earnings.value = await $fetch(`${config.public.apiBase}/transactions/summary/agent-earnings`, {
      headers: getHeaders(),
    })
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

const completedTransactions = computed(() =>
  transactionsStore.transactions.filter((t) => t.stage === 'completed')
)

const summaryPercent = (total) => {
  if (!summary.value?.totalRevenue) return 0
  return ((total / summary.value.totalRevenue) * 100).toFixed(1)
}

const formatCurrency = (val) =>
  val ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val) : '₺0'

const formatDate = (val) =>
  new Intl.DateTimeFormat('tr-TR').format(new Date(val))
</script>