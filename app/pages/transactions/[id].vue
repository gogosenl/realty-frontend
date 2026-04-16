<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow px-6 py-4 flex items-center gap-4">
      <NuxtLink to="/" class="text-gray-500 hover:text-gray-700">← Geri</NuxtLink>
      <h1 class="text-xl font-semibold text-gray-800">İşlem Detayı</h1>
    </nav>

    <div v-if="store.loading" class="p-8 text-center text-gray-400">Yükleniyor...</div>

    <div v-else-if="txn" class="max-w-4xl mx-auto px-6 py-8 space-y-6">

      <!-- Genel Bilgiler -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-lg font-semibold text-gray-800">{{ txn.propertyAddress }}</h2>
            <p class="text-sm text-gray-500 mt-1">Oluşturulma: {{ formatDate(txn.createdAt) }}</p>
          </div>
          <span :class="stageBadge(txn.stage)" class="text-sm px-4 py-1 rounded-full font-medium">
            {{ stageLabel(txn.stage) }}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-4 mt-4">
          <div>
            <p class="text-xs text-gray-400">Satış Fiyatı</p>
            <p class="font-semibold text-gray-800">{{ formatCurrency(txn.salePrice) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400">Toplam Komisyon</p>
            <p class="font-semibold text-gray-800">{{ formatCurrency(txn.totalServiceFee) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400">Listeleyen Ajan</p>
            <p class="font-semibold text-gray-800">{{ txn.listingAgent?.name }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400">Satan Ajan</p>
            <p class="font-semibold text-gray-800">{{ txn.sellingAgent?.name }}</p>
          </div>
        </div>
      </div>

      <!-- Stage Geçişi -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 class="font-semibold text-gray-700 mb-4">Aşama Takibi</h3>
        <div class="flex items-center gap-2">
          <div
            v-for="(stage, index) in stages"
            :key="stage.key"
            class="flex items-center gap-2"
          >
            <div
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium',
                txn.stage === stage.key
                  ? 'bg-blue-600 text-white'
                  : stageIndex(txn.stage) > index
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-400',
              ]"
            >
              {{ stage.label }}
            </div>
            <div v-if="index < stages.length - 1" class="text-gray-300">→</div>
          </div>
        </div>

        <div v-if="txn.stage !== 'completed'" class="mt-4">
          <button
            @click="handleNextStage"
            :disabled="stageLoading"
            class="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {{ stageLoading ? 'İşleniyor...' : `${nextStageLabel} Aşamasına Geç` }}
          </button>
        </div>
        <div v-else class="mt-4 text-green-600 font-medium text-sm">✓ İşlem tamamlandı</div>
      </div>

      <!-- Komisyon Dağılımı -->
      <div v-if="txn.commissionBreakdown" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 class="font-semibold text-gray-700 mb-4">Komisyon Dağılımı</h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center py-2 border-b border-gray-50">
            <span class="text-sm text-gray-600">Toplam Komisyon</span>
            <span class="font-semibold text-gray-800">{{ formatCurrency(txn.commissionBreakdown.totalServiceFee) }}</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-gray-50">
            <span class="text-sm text-gray-600">Acente (%50)</span>
            <span class="font-semibold text-blue-600">{{ formatCurrency(txn.commissionBreakdown.agencyAmount) }}</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-gray-50">
            <span class="text-sm text-gray-600">{{ txn.listingAgent?.name }} (Listeleyen)</span>
            <span class="font-semibold text-green-600">{{ formatCurrency(txn.commissionBreakdown.listingAgentAmount) }}</span>
          </div>
          <div v-if="txn.commissionBreakdown.sellingAgentAmount > 0" class="flex justify-between items-center py-2">
            <span class="text-sm text-gray-600">{{ txn.sellingAgent?.name }} (Satan)</span>
            <span class="font-semibold text-green-600">{{ formatCurrency(txn.commissionBreakdown.sellingAgentAmount) }}</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const store = useTransactionsStore()

onMounted(() => store.fetchTransaction(route.params.id))

const txn = computed(() => store.currentTransaction)

const stages = [
  { key: 'agreement', label: 'Anlaşma' },
  { key: 'earnest_money', label: 'Kapora' },
  { key: 'title_deed', label: 'Tapu' },
  { key: 'completed', label: 'Tamamlandı' },
]

const stageIndex = (stage) => stages.findIndex((s) => s.key === stage)

const nextStageLabel = computed(() => {
  const idx = stageIndex(txn.value?.stage)
  return stages[idx + 1]?.label ?? ''
})

const stageLoading = ref(false)

const handleNextStage = async () => {
  const idx = stageIndex(txn.value.stage)
  const nextStage = stages[idx + 1]?.key
  if (!nextStage) return
  stageLoading.value = true
  try {
    await store.updateStage(route.params.id, nextStage)
  } finally {
    stageLoading.value = false
  }
}

const formatCurrency = (val) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val)

const formatDate = (val) =>
  new Intl.DateTimeFormat('tr-TR').format(new Date(val))

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