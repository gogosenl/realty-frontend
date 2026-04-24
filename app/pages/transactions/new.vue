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
            <!-- İşlem Tipi -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >İşlem Tipi</label
              >
              <div class="flex gap-3">
                <button
                  type="button"
                  @click="form.transactionType = 'sale'"
                  :class="[
                    'flex-1 py-3 rounded-xl text-sm font-medium border-2 transition-all',
                    form.transactionType === 'sale'
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-green-300',
                  ]"
                >
                  🏠 Satış
                </button>
                <button
                  type="button"
                  @click="
                    form.transactionType = 'rent';
                    form.propertyType = '';
                  "
                  :class="[
                    'flex-1 py-3 rounded-xl text-sm font-medium border-2 transition-all',
                    form.transactionType === 'rent'
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-green-300',
                  ]"
                >
                  🔑 Kiralama
                </button>
              </div>
            </div>

            <!-- Mülk Tipi (sadece satışta) -->
            <!-- Mülk Tipi -->
            <div
              v-if="
                form.transactionType === 'sale' ||
                form.transactionType === 'rent'
              "
            >
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Mülk Tipi</label
              >
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="pt in propertyTypes"
                  :key="pt.value"
                  type="button"
                  @click="form.propertyType = pt.value"
                  :class="[
                    'py-2 px-3 rounded-xl text-sm font-medium border-2 transition-all',
                    form.propertyType === pt.value
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-green-300',
                  ]"
                >
                  {{ pt.label }}
                </button>
              </div>
            </div>

            <!-- İl -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >İl</label
              >
              <select
                v-model="form.city"
                class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                required
              >
                <option value="">Seçin...</option>
                <option v-for="city in cities" :key="city" :value="city">
                  {{ city }}
                </option>
              </select>
            </div>

            <!-- Mülk Adresi -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Mülk Adresi</label
              >
              <input
                v-model="form.propertyAddress"
                type="text"
                class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                placeholder="Atatürk Cad. No:5 Karaman"
                required
              />
            </div>

            <!-- Satış Fiyatı -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{
                  form.transactionType === "rent"
                    ? "Kira Bedeli (₺)"
                    : "Satış Fiyatı (₺)"
                }}
              </label>
              <input
                v-model.number="form.salePrice"
                type="number"
                class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                :placeholder="
                  form.transactionType === 'rent' ? '10000' : '2000000'
                "
                required
                @input="recalculateFee"
              />
            </div>

            <!-- Kiralama Komisyon -->
            <div v-if="form.transactionType === 'rent'">
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Kaç Kira Komisyon Alınacak?</label
              >
              <div class="flex gap-2">
                <button
                  v-for="n in [1, 2, 3]"
                  :key="n"
                  type="button"
                  @click="
                    rentMonths = n;
                    calculateRentCommission();
                  "
                  :class="[
                    'flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all',
                    rentMonths === n
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-green-300',
                  ]"
                >
                  {{ n }} Kira
                </button>
              </div>
              <div
                v-if="form.totalServiceFee"
                class="mt-2 p-3 bg-green-50 rounded-xl"
              >
                <p class="text-sm text-green-700">
                  Hesaplanan Komisyon:
                  <span class="font-semibold">{{
                    formatCurrency(form.totalServiceFee)
                  }}</span>
                </p>
                <p class="text-xs text-green-500 mt-1">
                  {{ formatCurrency(form.salePrice) }} × {{ rentMonths }} kira =
                  {{ formatCurrency(form.totalServiceFee) }}
                </p>
              </div>
            </div>

            <!-- Satış Komisyon -->
            <div v-if="form.transactionType === 'sale'">
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Komisyon Tipi</label
              >
              <div class="flex gap-3">
                <button
                  type="button"
                  @click="commissionType = 'tl'"
                  :class="[
                    'flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all',
                    commissionType === 'tl'
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-green-300',
                  ]"
                >
                  ₺ Tutar Olarak
                </button>
                <button
                  type="button"
                  @click="commissionType = 'percent'"
                  :class="[
                    'flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all',
                    commissionType === 'percent'
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-green-300',
                  ]"
                >
                  % Yüzde Olarak
                </button>
              </div>
              <div v-if="commissionType === 'tl'" class="mt-3">
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Toplam Komisyon (₺)</label
                >
                <input
                  v-model.number="form.totalServiceFee"
                  type="number"
                  class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  placeholder="60000"
                  required
                />
              </div>
              <div v-if="commissionType === 'percent'" class="mt-3">
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Komisyon Oranı (%)</label
                >
                <input
                  v-model.number="commissionPercent"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  placeholder="3"
                  @input="recalculateFee"
                />
                <div
                  v-if="form.salePrice && commissionPercent"
                  class="mt-2 p-3 bg-green-50 rounded-xl"
                >
                  <p class="text-sm text-green-700">
                    Hesaplanan Komisyon:
                    <span class="font-semibold">{{
                      formatCurrency(form.totalServiceFee)
                    }}</span>
                  </p>
                  <p class="text-xs text-green-500 mt-1">
                    {{ formatCurrency(form.salePrice) }} × %{{
                      commissionPercent
                    }}
                    = {{ formatCurrency(form.totalServiceFee) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Emlak Danışmanları -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Listeleyen Emlak Danışmanı</label
                >
                <select
                  v-model="form.listingAgent"
                  class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
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
                  class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
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

            <!-- Notlar -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Notlar</label
              >
              <textarea
                v-model="form.notes"
                rows="3"
                class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                placeholder="Opsiyonel notlar..."
              />
            </div>

            <div
              v-if="error"
              class="text-red-500 text-sm bg-red-50 p-3 rounded-xl"
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

onMounted(() => agentsStore.fetchAgents());

const commissionType = ref("tl");
const commissionPercent = ref(null);
const monthlyRent = ref(null);
const rentMonths = ref(1);

const form = reactive({
  propertyAddress: "",
  salePrice: null,
  totalServiceFee: null,
  listingAgent: "",
  sellingAgent: "",
  city: "",
  transactionType: "",
  propertyType: "",
  notes: "",
});

const propertyTypes = [
  { value: "house", label: "🏡 Ev" },
  { value: "apartment", label: "🏢 Daire" },
  { value: "land", label: "🌿 Arsa" },
  { value: "shop", label: "🏪 Dükkan" },
  { value: "office", label: "🏬 Ofis" },
  { value: "other", label: "📦 Diğer" },
];

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

const calculateRentCommission = () => {
  if (form.salePrice && rentMonths.value) {
    form.totalServiceFee = form.salePrice * rentMonths.value;
  }
};

const recalculateFee = () => {
  if (form.transactionType === "rent") {
    calculateRentCommission();
  } else if (
    commissionType.value === "percent" &&
    form.salePrice &&
    commissionPercent.value
  ) {
    form.totalServiceFee = Math.round(
      (form.salePrice * commissionPercent.value) / 100,
    );
  }
};

watch(
  () => form.transactionType,
  () => {
    form.totalServiceFee = null;
    monthlyRent.value = null;
    rentMonths.value = 1;
    commissionType.value = "tl";
    commissionPercent.value = null;
    form.salePrice = null;
  },
);

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
  const payload = { ...form };
  if (!payload.propertyType) delete payload.propertyType;
  if (!payload.notes) delete payload.notes;
  try {
    const txn = await transactionsStore.createTransaction(payload);
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
