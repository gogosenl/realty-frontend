<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow px-6 py-4 flex items-center gap-4">
      <NuxtLink to="/" class="text-gray-500 hover:text-gray-700">← Geri</NuxtLink>
      <h1 class="text-xl font-semibold text-gray-800">Yeni İşlem</h1>
    </nav>

    <div class="max-w-2xl mx-auto px-6 py-8">
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form @submit.prevent="handleSubmit">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Mülk Adresi</label>
              <input
                v-model="form.propertyAddress"
                type="text"
                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Atatürk Cad. No:5 Karaman"
                required
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Satış Fiyatı (₺)</label>
                <input
                  v-model.number="form.salePrice"
                  type="number"
                  class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="2000000"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Toplam Komisyon (₺)</label>
                <input
                  v-model.number="form.totalServiceFee"
                  type="number"
                  class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="60000"
                  required
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Listeleyen Ajan</label>
                <select
                  v-model="form.listingAgent"
                  class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seçin...</option>
                  <option v-for="agent in agentsStore.agents" :key="agent._id" :value="agent._id">
                    {{ agent.name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Satan Ajan</label>
                <select
                  v-model="form.sellingAgent"
                  class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seçin...</option>
                  <option v-for="agent in agentsStore.agents" :key="agent._id" :value="agent._id">
                    {{ agent.name }}
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Notlar</label>
              <textarea
                v-model="form.notes"
                rows="3"
                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Opsiyonel notlar..."
              />
            </div>

            <div v-if="error" class="text-red-500 text-sm">{{ error }}</div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {{ loading ? 'Kaydediliyor...' : 'İşlem Oluştur' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
const router = useRouter()
const agentsStore = useAgentsStore()
const transactionsStore = useTransactionsStore()

onMounted(() => agentsStore.fetchAgents())

const form = reactive({
  propertyAddress: '',
  salePrice: null,
  totalServiceFee: null,
  listingAgent: '',
  sellingAgent: '',
  notes: '',
})

const loading = ref(false)
const error = ref(null)

const handleSubmit = async () => {
  loading.value = true
  error.value = null
  try {
    const txn = await transactionsStore.createTransaction(form)
    router.push(`/transactions/${txn._id}`)
  } catch (e) {
    error.value = 'İşlem oluşturulamadı. Bilgileri kontrol edin.'
  } finally {
    loading.value = false
  }
}
</script>