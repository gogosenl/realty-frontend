<template>
  <div class="min-h-screen bg-gray-50">
    <nav
      class="bg-green-700 px-6 py-4 flex items-center justify-between shadow-lg"
    >
      <div class="flex items-center gap-4">
        <NuxtLink
          to="/"
          class="text-green-200 hover:text-white transition-colors"
          >← Geri</NuxtLink
        >
        <h1 class="text-xl font-semibold text-white">Emlak Danışmanları</h1>
      </div>
    </nav>

    <div class="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="px-6 py-4 border-b border-gray-100">
          <h2 class="font-semibold text-gray-700">Tüm Emlak Danışmanları</h2>
        </div>

        <div v-if="loading" class="p-8 text-center text-gray-400">
          Yükleniyor...
        </div>
        <div
          v-else-if="agentsWithEarnings.length === 0"
          class="p-8 text-center text-gray-400"
        >
          Henüz ajan yok
        </div>

        <div v-else>
          <div
            v-for="item in agentsWithEarnings"
            :key="item.agent._id"
            class="px-6 py-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
            @click="$router.push(`/agents/${item.agent._id}`)"
          >
            <div>
              <p class="font-medium text-gray-800">{{ item.agent.name }}</p>
              <p class="text-sm text-gray-500 mt-1">
                {{ item.agent.email }} · {{ item.agent.phone }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-xs text-gray-400">Toplam Kazanç</p>
              <p class="font-semibold text-green-600">
                {{ formatCurrency(item.total) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig();
const agentsStore = useAgentsStore();

const loading = ref(false);
const earnings = ref([]);

const getHeaders = () => {
  const token = import.meta.client ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

onMounted(async () => {
  loading.value = true;
  await agentsStore.fetchAgents();
  try {
    earnings.value = await $fetch(
      `${config.public.apiBase}/transactions/summary/agent-earnings`,
      {
        headers: getHeaders(),
      },
    );
  } catch (e) {
    earnings.value = [];
  }
  loading.value = false;
});

const agentsWithEarnings = computed(() => {
  return agentsStore.agents.map((agent) => {
    const found = earnings.value.find((e) => e.agent._id === agent._id);
    return { agent, total: found?.total ?? 0 };
  });
});

const formatCurrency = (val) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(
    val,
  );
</script>
