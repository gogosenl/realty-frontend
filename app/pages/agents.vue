<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <NuxtLink to="/" class="text-gray-500 hover:text-gray-700">← Geri</NuxtLink>
        <h1 class="text-xl font-semibold text-gray-800">Ajanlar</h1>
      </div>
      <button
        @click="showForm = !showForm"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
      >
        + Yeni Ajan
      </button>
    </nav>

    <div class="max-w-4xl mx-auto px-6 py-8 space-y-6">

      <!-- Yeni Ajan Formu -->
      <div v-if="showForm" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 class="font-semibold text-gray-700 mb-4">Yeni Ajan Ekle</h2>
        <form @submit.prevent="handleCreateAgent">
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
              <input
                v-model="newAgent.name"
                type="text"
                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ahmet Yılmaz"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
              <input
                v-model="newAgent.email"
                type="email"
                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ahmet@realty.com"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
              <input
                v-model="newAgent.phone"
                type="text"
                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="05551234567"
                required
              />
            </div>
          </div>
          <div class="flex gap-3 mt-4">
            <button
              type="submit"
              :disabled="formLoading"
              class="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {{ formLoading ? 'Kaydediliyor...' : 'Kaydet' }}
            </button>
            <button
              type="button"
              @click="showForm = false"
              class="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              İptal
            </button>
          </div>
        </form>
      </div>

      <!-- Ajan Listesi -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="px-6 py-4 border-b border-gray-100">
          <h2 class="font-semibold text-gray-700">Tüm Ajanlar</h2>
        </div>

        <div v-if="loading" class="p-8 text-center text-gray-400">Yükleniyor...</div>
        <div v-else-if="agentsWithEarnings.length === 0" class="p-8 text-center text-gray-400">Henüz ajan yok</div>

        <div v-else>
          <div
            v-for="item in agentsWithEarnings"
            :key="item.agent._id"
            class="px-6 py-4 border-b border-gray-50 flex items-center justify-between"
          >
            <div>
              <p class="font-medium text-gray-800">{{ item.agent.name }}</p>
              <p class="text-sm text-gray-500 mt-1">{{ item.agent.email }} · {{ item.agent.phone }}</p>
            </div>
            <div class="text-right">
              <p class="text-xs text-gray-400">Toplam Kazanç</p>
              <p class="font-semibold text-green-600">{{ formatCurrency(item.total) }}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()
const agentsStore = useAgentsStore()

const loading = ref(false)
const showForm = ref(false)
const formLoading = ref(false)
const earnings = ref([])

const newAgent = reactive({ name: '', email: '', phone: '' })

const getHeaders = () => {
  const token = import.meta.client ? localStorage.getItem('token') : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

onMounted(async () => {
  loading.value = true
  await agentsStore.fetchAgents()
  try {
    earnings.value = await $fetch(`${config.public.apiBase}/transactions/summary/agent-earnings`, {
      headers: getHeaders(),
    })
  } catch (e) {
    earnings.value = []
  }
  loading.value = false
})

const agentsWithEarnings = computed(() => {
  return agentsStore.agents.map((agent) => {
    const found = earnings.value.find((e) => e.agent._id === agent._id)
    return { agent, total: found?.total ?? 0 }
  })
})

const handleCreateAgent = async () => {
  formLoading.value = true
  try {
    await agentsStore.createAgent({ ...newAgent })
    newAgent.name = ''
    newAgent.email = ''
    newAgent.phone = ''
    showForm.value = false
    earnings.value = await $fetch(`${config.public.apiBase}/transactions/summary/agent-earnings`, {
      headers: getHeaders(),
    })
  } catch (e) {
    alert('Ajan oluşturulamadı.')
  } finally {
    formLoading.value = false
  }
}

const formatCurrency = (val) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val)
</script>