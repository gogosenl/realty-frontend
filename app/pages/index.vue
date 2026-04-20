<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow px-6 py-4 flex items-center justify-between">
      <h1 class="text-xl font-semibold text-gray-800">Realty Manager</h1>
      <div class="flex items-center gap-3">
        <NuxtLink to="/agent" class="text-sm text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100">
          Ajanlar
        </NuxtLink>
        <NuxtLink to="/reports" class="text-sm text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100">
          Finans Raporu
        </NuxtLink>
        <NuxtLink to="/transactions/new" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          + Yeni İşlem
        </NuxtLink>
        <div class="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
          <span v-if="authStore.user" class="text-sm text-gray-600">{{ authStore.user.name }}</span>
          <button
            @click="handleLogout"
            class="text-sm text-red-500 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50"
          >
            Çıkış
          </button>
        </div>
      </div>
    </nav>

    <div class="max-w-6xl mx-auto px-6 py-8">
      <div class="grid grid-cols-4 gap-4 mb-8">
        <div v-for="stage in stages" :key="stage.key" class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p class="text-sm text-gray-500">{{ stage.label }}</p>
          <p class="text-2xl font-bold text-gray-800 mt-1">{{ countByStage(stage.key) }}</p>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="px-6 py-4 border-b border-gray-100">
          <h2 class="font-semibold text-gray-700">Tüm İşlemler</h2>
        </div>

        <div v-if="store.loading" class="p-8 text-center text-gray-400">Yükleniyor...</div>
        <div v-else-if="store.transactions.length === 0" class="p-8 text-center text-gray-400">Henüz işlem yok</div>

        <div v-else>
          <div
            v-for="txn in store.transactions"
            :key="txn._id"
            class="px-6 py-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
            @click="$router.push(`/transactions/${txn._id}`)"
          >
            <div>
              <p class="font-medium text-gray-800">{{ txn.propertyAddress }}</p>
              <p class="text-sm text-gray-500 mt-1">
                {{ txn.listingAgent?.name }} → {{ txn.sellingAgent?.name }}
              </p>
            </div>
            <div class="flex items-center gap-4">
              <p class="text-sm font-medium text-gray-700">{{ formatCurrency(txn.totalServiceFee) }}</p>
              <span :class="stageBadge(txn.stage)" class="text-xs px-3 py-1 rounded-full font-medium">
                {{ stageLabel(txn.stage) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })

const router = useRouter()
const store = useTransactionsStore()
const authStore = useAuthStore()

onMounted(() => {
  authStore.loadFromStorage()
  store.fetchTransactions()
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const stages = [
  { key: 'agreement', label: 'Anlaşma' },
  { key: 'earnest_money', label: 'Kapora' },
  { key: 'title_deed', label: 'Tapu' },
  { key: 'completed', label: 'Tamamlandı' },
]

const countByStage = (stage) => store.transactions.filter((t) => t.stage === stage).length

const formatCurrency = (val) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val)

const stageLabel = (stage) => ({
  agreement: 'Anlaşma',
  earnest_money: 'Kapora',
  title_deed: 'Tapu',
  completed: 'Tamamlandı',
})[stage] ?? stage

const stageBadge = (stage) => ({
  agreement: 'bg-yellow-100 text-yellow-700',
  earnest_money: 'bg-blue-100 text-blue-700',
  title_deed: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
})[stage] ?? 'bg-gray-100 text-gray-700'
</script>