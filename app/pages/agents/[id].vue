<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-green-700 px-6 py-4 flex items-center gap-4 shadow-lg">
      <NuxtLink
        to="/agents"
        class="text-green-200 hover:text-white transition-colors"
        >← Geri</NuxtLink
      >
      <h1 class="text-xl font-semibold text-white">Emlak Danışmanı Detayı</h1>
    </nav>

    <div v-if="loading" class="p-8 text-center text-gray-400">
      Yükleniyor...
    </div>

    <div v-else-if="agent" class="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <!-- Ajan Bilgileri -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-lg font-semibold text-gray-800">
              {{ agent.name }}
            </h2>
            <p class="text-sm text-gray-500 mt-1">{{ agent.email }}</p>
            <p class="text-sm text-gray-500">{{ agent.phone }}</p>
          </div>
          <span
            class="bg-blue-100 text-blue-700 text-sm px-4 py-1 rounded-full font-medium"
            >Ajan</span
          >
        </div>

        <div class="grid grid-cols-3 gap-4 mt-6">
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-xs text-gray-400">Toplam İşlem</p>
            <p class="text-2xl font-bold text-gray-800 mt-1">
              {{ agentTransactions.length }}
            </p>
          </div>
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-xs text-gray-400">Tamamlanan</p>
            <p class="text-2xl font-bold text-green-600 mt-1">
              {{ completedCount }}
            </p>
          </div>
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-xs text-gray-400">Toplam Kazanç</p>
            <p class="text-2xl font-bold text-blue-600 mt-1">
              {{ formatCurrency(totalEarnings) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Ajan İşlemleri -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="px-6 py-4 border-b border-gray-100">
          <h3 class="font-semibold text-gray-700">İşlemler</h3>
        </div>

        <div
          v-if="agentTransactions.length === 0"
          class="p-8 text-center text-gray-400"
        >
          Henüz işlem yok
        </div>

        <div v-else>
          <div
            v-for="txn in agentTransactions"
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
              <div
                v-if="txn.stage === 'completed' && txn.commissionBreakdown"
                class="text-right"
              >
                <p class="text-xs text-gray-400">Kazanç</p>
                <p class="text-sm font-semibold text-green-600">
                  {{ formatCurrency(getAgentEarning(txn)) }}
                </p>
              </div>
              <span
                :class="stageBadge(txn.stage)"
                class="text-xs px-3 py-1 rounded-full font-medium"
              >
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
const route = useRoute();
const config = useRuntimeConfig();

const loading = ref(false);
const agent = ref(null);
const allTransactions = ref([]);

const getHeaders = () => {
  const token = import.meta.client ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

onMounted(async () => {
  loading.value = true;
  try {
    const [agentData, txnData] = await Promise.all([
      $fetch(`${config.public.apiBase}/agents/${route.params.id}`, {
        headers: getHeaders(),
      }),
      $fetch(`${config.public.apiBase}/transactions`, {
        headers: getHeaders(),
      }),
    ]);
    agent.value = agentData;
    allTransactions.value = txnData;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
});

const agentTransactions = computed(() => {
  if (!agent.value) return [];
  return allTransactions.value.filter(
    (txn) =>
      txn.listingAgent?._id === route.params.id ||
      txn.sellingAgent?._id === route.params.id,
  );
});

const completedCount = computed(
  () => agentTransactions.value.filter((t) => t.stage === "completed").length,
);

const totalEarnings = computed(() => {
  return agentTransactions.value
    .filter((t) => t.stage === "completed" && t.commissionBreakdown)
    .reduce((sum, t) => sum + getAgentEarning(t), 0);
});

const getAgentEarning = (txn) => {
  if (!txn.commissionBreakdown) return 0;
  const id = route.params.id;
  const listingId = txn.listingAgent?._id;
  const sellingId = txn.sellingAgent?._id;

  if (listingId === sellingId && listingId === id) {
    return txn.commissionBreakdown.listingAgentAmount;
  }

  let earning = 0;
  if (listingId === id) earning += txn.commissionBreakdown.listingAgentAmount;
  if (sellingId === id) earning += txn.commissionBreakdown.sellingAgentAmount;
  return earning;
};

const formatCurrency = (val) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(
    val ?? 0,
  );

const stageLabel = (stage) =>
  ({
    agreement: "Anlaşma",
    earnest_money: "Kapora",
    title_deed: "Tapu",
    completed: "Tamamlandı",
  })[stage] ?? stage;

const stageBadge = (stage) =>
  ({
    agreement: "bg-yellow-100 text-yellow-700",
    earnest_money: "bg-blue-100 text-blue-700",
    title_deed: "bg-purple-100 text-purple-700",
    completed: "bg-green-100 text-green-700",
  })[stage] ?? "bg-gray-100 text-gray-700";
</script>
