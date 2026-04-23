<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-green-700 px-6 py-4 flex items-center gap-4 shadow-lg">
      <NuxtLink to="/" class="text-green-200 hover:text-white transition-colors"
        >← Geri</NuxtLink
      >
      <h1 class="text-xl font-semibold text-white">Yeni İşlem</h1>
    </nav>

    <div class="max-w-2xl mx-auto px-6 py-8">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <form @submit.prevent="handleSubmit">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >İl</label
              >
              <select
                v-model="form.city"
                class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                required
              >
                <option value="">Seçin...</option>
                <option v-for="city in cities" :key="city" :value="city">
                  {{ city }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Mülk Adresi</label
              >
              <input
                v-model="form.propertyAddress"
                type="text"
                class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Atatürk Cad. No:5 Karaman"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Satış Fiyatı (₺)</label
              >
              <input
                v-model.number="form.salePrice"
                type="number"
                class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="2000000"
                required
                @input="recalculateFee"
              />
            </div>

            <!-- Komisyon Tipi Seçimi -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Komisyon Tipi</label
              >
              <div class="flex gap-3">
                <button
                  type="button"
                  @click="commissionType = 'tl'"
                  :class="[
                    'flex-1 py-2 rounded-lg text-sm font-medium border transition-all',
                    commissionType === 'tl'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300',
                  ]"
                >
                  ₺ Tutar Olarak
                </button>
                <button
                  type="button"
                  @click="commissionType = 'percent'"
                  :class="[
                    'flex-1 py-2 rounded-lg text-sm font-medium border transition-all',
                    commissionType === 'percent'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300',
                  ]"
                >
                  % Yüzde Olarak
                </button>
              </div>
            </div>

            <!-- TL Komisyon -->
            <div v-if="commissionType === 'tl'">
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Toplam Komisyon (₺)</label
              >
              <input
                v-model.number="form.totalServiceFee"
                type="number"
                class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="60000"
                required
              />
            </div>

            <!-- Yüzde Komisyon -->
            <div v-if="commissionType === 'percent'">
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Komisyon Oranı (%)</label
              >
              <input
                v-model.number="commissionPercent"
                type="number"
                step="0.1"
                min="0"
                max="100"
                class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="3"
                @input="recalculateFee"
              />
              <div
                v-if="form.salePrice && commissionPercent"
                class="mt-2 p-3 bg-blue-50 rounded-lg"
              >
                <p class="text-sm text-blue-700">
                  Hesaplanan Komisyon:
                  <span class="font-semibold">{{
                    formatCurrency(form.totalServiceFee)
                  }}</span>
                </p>
                <p class="text-xs text-blue-500 mt-1">
                  {{ formatCurrency(form.salePrice) }} × %{{
                    commissionPercent
                  }}
                  = {{ formatCurrency(form.totalServiceFee) }}
                </p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Listeleyen Emlak Danışmanı</label
                >
                <select
                  v-model="form.listingAgent"
                  class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Seçin...</option>
                  <option
                    v-for="agent in agentsStore.agents"
                    :key="agent._id"
                    :value="agent._id"
                  >
                    {{ agent.name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Satan Emlak Danışmanı</label
                >
                <select
                  v-model="form.sellingAgent"
                  class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Seçin...</option>
                  <option
                    v-for="agent in agentsStore.agents"
                    :key="agent._id"
                    :value="agent._id"
                  >
                    {{ agent.name }}
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Notlar</label
              >
              <textarea
                v-model="form.notes"
                rows="3"
                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Opsiyonel notlar..."
              />
            </div>

            <div
              v-if="error"
              class="text-red-500 text-sm bg-red-50 p-3 rounded-lg"
            >
              {{ error }}
            </div>

            <button
              type="submit"
              :disabled="loading || !form.totalServiceFee"
              class="w-full bg-green-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {{ loading ? "Kaydediliyor..." : "İşlem Oluştur" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
const router = useRouter();
const agentsStore = useAgentsStore();
const transactionsStore = useTransactionsStore();
const { success, error: toastError } = useToast();
const cities = [
  "Adana",
  "Adıyaman",
  "Afyonkarahisar",
  "Ağrı",
  "Amasya",
  "Ankara",
  "Antalya",
  "Artvin",
  "Aydın",
  "Balıkesir",
  "Bilecik",
  "Bingöl",
  "Bitlis",
  "Bolu",
  "Burdur",
  "Bursa",
  "Çanakkale",
  "Çankırı",
  "Çorum",
  "Denizli",
  "Diyarbakır",
  "Edirne",
  "Elazığ",
  "Erzincan",
  "Erzurum",
  "Eskişehir",
  "Gaziantep",
  "Giresun",
  "Gümüşhane",
  "Hakkari",
  "Hatay",
  "Isparta",
  "Mersin",
  "İstanbul",
  "İzmir",
  "Kars",
  "Kastamonu",
  "Kayseri",
  "Kırklareli",
  "Kırşehir",
  "Kocaeli",
  "Konya",
  "Kütahya",
  "Malatya",
  "Manisa",
  "Kahramanmaraş",
  "Mardin",
  "Muğla",
  "Muş",
  "Nevşehir",
  "Niğde",
  "Ordu",
  "Rize",
  "Sakarya",
  "Samsun",
  "Siirt",
  "Sinop",
  "Sivas",
  "Tekirdağ",
  "Tokat",
  "Trabzon",
  "Tunceli",
  "Şanlıurfa",
  "Uşak",
  "Van",
  "Yozgat",
  "Zonguldak",
  "Aksaray",
  "Bayburt",
  "Karaman",
  "Kırıkkale",
  "Batman",
  "Şırnak",
  "Bartın",
  "Ardahan",
  "Iğdır",
  "Yalova",
  "Karabük",
  "Kilis",
  "Osmaniye",
  "Düzce",
];

onMounted(() => agentsStore.fetchAgents());

const commissionType = ref("tl");
const commissionPercent = ref(null);

const form = reactive({
  propertyAddress: "",
  salePrice: null,
  totalServiceFee: null,
  listingAgent: "",
  sellingAgent: "",
  city: "",
  notes: "",
});

const recalculateFee = () => {
  if (
    commissionType.value === "percent" &&
    form.salePrice &&
    commissionPercent.value
  ) {
    form.totalServiceFee = Math.round(
      (form.salePrice * commissionPercent.value) / 100,
    );
  }
};

watch(commissionType, () => {
  form.totalServiceFee = null;
  commissionPercent.value = null;
});

const formatCurrency = (val) =>
  val
    ? new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
      }).format(val)
    : "₺0";

const loading = ref(false);
const error = ref(null);

const handleSubmit = async () => {
  loading.value = true;
  error.value = null;
  try {
    const txn = await transactionsStore.createTransaction(form);
    success("İşlem başarıyla oluşturuldu");
    router.push(`/transactions/${txn._id}`);
  } catch (e) {
    toastError("İşlem oluşturulamadı. Bilgileri kontrol edin.");
    error.value = "İşlem oluşturulamadı. Bilgileri kontrol edin.";
  } finally {
    loading.value = false;
  }
};
</script>
