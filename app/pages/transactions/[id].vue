<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <NuxtLink to="/" class="text-gray-500 hover:text-gray-700"
          >← Geri</NuxtLink
        >
        <h1 class="text-xl font-semibold text-gray-800">İşlem Detayı</h1>
      </div>
      <div
        v-if="txn && txn.stage !== 'completed'"
        class="flex items-center gap-2"
      >
        <button
          @click="showEditModal = true"
          class="text-sm text-blue-600 hover:text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50 border border-blue-200"
        >
          Düzenle
        </button>
        <button
          @click="showDeleteModal = true"
          class="text-sm text-red-500 hover:text-red-700 px-4 py-2 rounded-lg hover:bg-red-50 border border-red-200"
        >
          Sil
        </button>
      </div>

    </nav>

    <div v-if="store.loading" class="p-8 text-center text-gray-400">
      Yükleniyor...
    </div>

    <div v-else-if="txn" class="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <!-- Genel Bilgiler -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-lg font-semibold text-gray-800">
              {{ txn.propertyAddress }}
            </h2>
            <p class="text-sm text-gray-500 mt-1">
              Oluşturulma: {{ formatDate(txn.createdAt) }}
            </p>
          </div>
          <span
            :class="stageBadge(txn.stage)"
            class="text-sm px-4 py-1 rounded-full font-medium"
          >
            {{ stageLabel(txn.stage) }}
          </span>
        </div>
        <div class="grid grid-cols-2 gap-4 mt-4">
          <div>
            <p class="text-xs text-gray-400">Satış Fiyatı</p>
            <p class="font-semibold text-gray-800">
              {{ formatCurrency(txn.salePrice) }}
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-400">Toplam Komisyon</p>
            <p class="font-semibold text-gray-800">
              {{ formatCurrency(txn.totalServiceFee) }}
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-400">Listeleyen Emlak Danışmanı</p>
            <p class="font-semibold text-gray-800">
              {{ txn.listingAgent?.name }}
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-400">Satan Emlak Danışmanı</p>
            <p class="font-semibold text-gray-800">
              {{ txn.sellingAgent?.name }}
            </p>
          </div>
          <div v-if="txn.notes" class="col-span-2">
            <p class="text-xs text-gray-400">Notlar</p>
            <p class="font-semibold text-gray-800">{{ txn.notes }}</p>
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
            {{
              stageLoading ? "İşleniyor..." : `${nextStageLabel} Aşamasına Geç`
            }}
          </button>
        </div>
        <div v-else class="mt-4 text-green-600 font-medium text-sm">
          ✓ İşlem tamamlandı
        </div>
      </div>

      <!-- Komisyon Dağılımı -->
      <div
        v-if="txn.commissionBreakdown"
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <h3 class="font-semibold text-gray-700 mb-4">Komisyon Dağılımı</h3>
        <div class="space-y-3">
          <div
            class="flex justify-between items-center py-2 border-b border-gray-50"
          >
            <span class="text-sm text-gray-600">Toplam Komisyon</span>
            <span class="font-semibold text-gray-800">{{
              formatCurrency(txn.commissionBreakdown.totalServiceFee)
            }}</span>
          </div>
          <div
            class="flex justify-between items-center py-2 border-b border-gray-50"
          >
            <span class="text-sm text-gray-600">Acente (%50)</span>
            <span class="font-semibold text-blue-600">{{
              formatCurrency(txn.commissionBreakdown.agencyAmount)
            }}</span>
          </div>
          <div
            class="flex justify-between items-center py-2 border-b border-gray-50"
          >
            <span class="text-sm text-gray-600"
              >{{ txn.listingAgent?.name }} (Listeleyen)</span
            >
            <span class="font-semibold text-green-600">{{
              formatCurrency(txn.commissionBreakdown.listingAgentAmount)
            }}</span>
          </div>
          <div
            v-if="txn.commissionBreakdown.sellingAgentAmount > 0"
            class="flex justify-between items-center py-2"
          >
            <span class="text-sm text-gray-600"
              >{{ txn.sellingAgent?.name }} (Satan)</span
            >
            <span class="font-semibold text-green-600">{{
              formatCurrency(txn.commissionBreakdown.sellingAgentAmount)
            }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Düzenleme Modalı -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4">
        <h2 class="font-semibold text-gray-800 mb-4">İşlemi Düzenle</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Mülk Adresi</label
            >
            <input
              v-model="editForm.propertyAddress"
              type="text"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Satış Fiyatı (₺)</label
              >
              <input
                v-model.number="editForm.salePrice"
                type="number"
                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Komisyon (₺)</label
              >
              <input
                v-model.number="editForm.totalServiceFee"
                type="number"
                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Notlar</label
            >
            <textarea
              v-model="editForm.notes"
              rows="3"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button
            @click="handleEdit"
            :disabled="editLoading"
            class="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {{ editLoading ? "Kaydediliyor..." : "Kaydet" }}
          </button>
          <button
            @click="showEditModal = false"
            class="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
          >
            İptal
          </button>
        </div>
      </div>
    </div>

    <!-- Silme Onay Modalı -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        <h2 class="font-semibold text-gray-800 mb-2">İşlemi Sil</h2>
        <p class="text-sm text-gray-500 mb-6">
          Bu işlemi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
        </p>
        <div class="flex gap-3">
          <button
            @click="handleDelete"
            :disabled="deleteLoading"
            class="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50"
          >
            {{ deleteLoading ? "Siliniyor..." : "Evet, Sil" }}
          </button>
          <button
            @click="showDeleteModal = false"
            class="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
          >
            İptal
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const router = useRouter();
const store = useTransactionsStore();
const agentsStore = useAgentsStore();

onMounted(() => {
  store.fetchTransaction(route.params.id);
  agentsStore.fetchAgents();
});

const txn = computed(() => store.currentTransaction);

const showEditModal = ref(false);
const showDeleteModal = ref(false);
const editLoading = ref(false);
const deleteLoading = ref(false);

const editForm = reactive({
  propertyAddress: "",
  salePrice: null,
  totalServiceFee: null,
  notes: "",
});

watch(txn, (val) => {
  if (val) {
    editForm.propertyAddress = val.propertyAddress;
    editForm.salePrice = val.salePrice;
    editForm.totalServiceFee = val.totalServiceFee;
    editForm.notes = val.notes ?? "";
  }
});

const getHeaders = () => {
  const token = import.meta.client ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const config = useRuntimeConfig();

const handleEdit = async () => {
  editLoading.value = true;
  try {
    const data = await $fetch(
      `${config.public.apiBase}/transactions/${route.params.id}`,
      {
        method: "PATCH",
        body: editForm,
        headers: getHeaders(),
      },
    );
    store.currentTransaction = data;
    showEditModal.value = false;
  } catch (e) {
    alert("Düzenleme başarısız.");
  } finally {
    editLoading.value = false;
  }
};

const handleDelete = async () => {
  deleteLoading.value = true;
  try {
    await $fetch(`${config.public.apiBase}/transactions/${route.params.id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    router.push("/");
  } catch (e) {
    alert("Silme başarısız.");
  } finally {
    deleteLoading.value = false;
  }
};

const stages = [
  { key: "agreement", label: "Anlaşma" },
  { key: "earnest_money", label: "Kapora" },
  { key: "title_deed", label: "Tapu" },
  { key: "completed", label: "Tamamlandı" },
];

const stageIndex = (stage) => stages.findIndex((s) => s.key === stage);

const nextStageLabel = computed(() => {
  const idx = stageIndex(txn.value?.stage);
  return stages[idx + 1]?.label ?? "";
});

const stageLoading = ref(false);

const handleNextStage = async () => {
  const idx = stageIndex(txn.value.stage);
  const nextStage = stages[idx + 1]?.key;
  if (!nextStage) return;
  stageLoading.value = true;
  try {
    await store.updateStage(route.params.id, nextStage);
  } finally {
    stageLoading.value = false;
  }
};

const formatCurrency = (val) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(
    val,
  );

const formatDate = (val) =>
  new Intl.DateTimeFormat("tr-TR").format(new Date(val));

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
