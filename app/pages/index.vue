<template>
  <div class="min-h-screen bg-gray-50">
<nav class="bg-white shadow px-6 py-4 flex items-center justify-between">
  <h1 class="text-xl font-semibold text-gray-800">Realty Manager</h1>
  <div class="flex items-center gap-3">
    <ClientOnly>
      <template v-if="authStore.user?.role === 'admin'">
        <NuxtLink to="/agents" class="text-sm text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100">
          Ajanlar
        </NuxtLink>
        <NuxtLink to="/reports" class="text-sm text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100">
          Finans Raporu
        </NuxtLink>
        <NuxtLink to="/users" class="text-sm text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100">
          Kullanıcı Yönetimi
        </NuxtLink>
      </template>
    </ClientOnly>
    <NuxtLink to="/transactions/new" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
      + Yeni İşlem
    </NuxtLink>
    <ClientOnly>
      <div class="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
        <span v-if="authStore.user" class="text-sm text-gray-600">{{ authStore.user.name }}</span>
        <span v-if="authStore.user" :class="authStore.user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'" class="text-xs px-2 py-1 rounded-full font-medium">
          {{ authStore.user.role === 'admin' ? 'Admin' : 'Ajan' }}
        </span>
        <button
          @click="handleLogout"
          class="text-sm text-red-500 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50"
        >
          Çıkış
        </button>
      </div>
    </ClientOnly>
  </div>
</nav>

    <div class="max-w-6xl mx-auto px-6 py-8">

<ClientOnly>
  <!-- Agent Özet Kartı -->
  <div v-if="authStore.user?.role === 'agent'" class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
    <h2 class="font-semibold text-gray-700 mb-4">Kazanç Özetim</h2>
    <div class="grid grid-cols-3 gap-4">
      <div>
        <p class="text-xs text-gray-400">Toplam İşlem</p>
        <p class="text-2xl font-bold text-gray-800 mt-1">{{ store.transactions.length }}</p>
      </div>
      <div>
        <p class="text-xs text-gray-400">Tamamlanan</p>
        <p class="text-2xl font-bold text-green-600 mt-1">{{ completedCount }}</p>
      </div>
      <div>
        <p class="text-xs text-gray-400">Toplam Kazanç</p>
        <p class="text-2xl font-bold text-blue-600 mt-1">{{ formatCurrency(totalEarnings) }}</p>
      </div>
    </div>
  </div>

  <!-- Admin Stage Kartları -->
  <div v-if="authStore.user?.role === 'admin'" class="grid grid-cols-4 gap-4 mb-8">
    <div v-for="stage in stages" :key="stage.key" class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <p class="text-sm text-gray-500">{{ stage.label }}</p>
      <p class="text-2xl font-bold text-gray-800 mt-1">{{ countByStage(stage.key) }}</p>
    </div>
  </div>
</ClientOnly>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="px-6 py-4 border-b border-gray-100">
          <h2 class="font-semibold text-gray-700">
            {{ authStore.user?.role === 'admin' ? 'Tüm İşlemler' : 'İşlemlerim' }}
          </h2>
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

const completedCount = computed(() =>
  store.transactions.filter((t) => t.stage === 'completed').length
)

const totalEarnings = computed(() => {
  return store.transactions
    .filter((t) => t.stage === 'completed' && t.commissionBreakdown)
    .reduce((sum, t) => {
      const userId = authStore.user?.id
      const listingId = t.listingAgent?._id
      const sellingId = t.sellingAgent?._id
      if (listingId === sellingId && listingId === userId) {
        return sum + t.commissionBreakdown.listingAgentAmount
      }
      let earning = 0
      if (listingId === userId) earning += t.commissionBreakdown.listingAgentAmount
      if (sellingId === userId) earning += t.commissionBreakdown.sellingAgentAmount
      return sum + earning
    }, 0)
})

const countByStage = (stage) => store.transactions.filter((t) => t.stage === stage).length

const formatCurrency = (val) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val ?? 0)

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