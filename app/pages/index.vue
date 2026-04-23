<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navbar -->
    <nav
      class="bg-green-700 px-6 py-4 flex items-center justify-between shadow-lg"
    >
      <div class="flex items-center gap-2">
        <div
          class="w-8 h-8 bg-white rounded-lg flex items-center justify-center"
        >
          <span class="text-green-700 font-bold text-sm">RM</span>
        </div>
        <h1 class="text-xl font-semibold text-white">Realty Manager</h1>
      </div>
      <div class="flex items-center gap-2">
        <ClientOnly>
          <template v-if="authStore.user?.role === 'admin'">
            <NuxtLink
              to="/agents"
              class="text-sm text-green-100 hover:text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Emlak Danışmanları
            </NuxtLink>
            <NuxtLink
              to="/reports"
              class="text-sm text-green-100 hover:text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Finans Raporu
            </NuxtLink>
            <NuxtLink
              to="/users"
              class="text-sm text-green-100 hover:text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Kullanıcı Yönetimi
            </NuxtLink>
          </template>
        </ClientOnly>
        <NuxtLink
          to="/transactions/new"
          class="bg-white text-green-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-50 transition-colors"
        >
          + Yeni İşlem
        </NuxtLink>
        <ClientOnly>
          <div
            class="flex items-center gap-2 ml-2 pl-2 border-l border-green-600"
          >
            <div class="text-right">
              <p v-if="authStore.user" class="text-sm text-white font-medium">
                {{ authStore.user.name }}
              </p>
              <p v-if="authStore.user" class="text-xs text-green-200">
                {{
                  authStore.user.role === "admin" ? "Admin" : "Emlak Danışmanı"
                }}
              </p>
            </div>
            <button
              @click="handleLogout"
              class="text-sm text-green-200 hover:text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors"
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
        <div
          v-if="authStore.user?.role === 'agent'"
          class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6"
        >
          <h2 class="font-semibold text-gray-700 mb-4">Kazanç Özetim</h2>
          <div class="grid grid-cols-3 gap-4">
            <div class="bg-gray-50 rounded-xl p-4">
              <p class="text-xs text-gray-400">Toplam İşlem</p>
              <p class="text-2xl font-bold text-gray-800 mt-1">
                {{ store.transactions.length }}
              </p>
            </div>
            <div class="bg-green-50 rounded-xl p-4">
              <p class="text-xs text-green-600">Tamamlanan</p>
              <p class="text-2xl font-bold text-green-600 mt-1">
                {{ completedCount }}
              </p>
            </div>
            <div class="bg-blue-50 rounded-xl p-4">
              <p class="text-xs text-blue-600">Toplam Kazanç</p>
              <p class="text-2xl font-bold text-blue-600 mt-1">
                {{ formatCurrency(totalEarnings) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Admin Stage Kartları -->
        <div
          v-if="authStore.user?.role === 'admin'"
          class="grid grid-cols-4 gap-4 mb-8"
        >
          <div
            class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div class="flex items-center justify-between mb-3">
              <p class="text-sm text-gray-500">Anlaşma</p>
              <div
                class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center"
              >
                <span class="text-yellow-600 text-xs font-bold">A</span>
              </div>
            </div>
            <p class="text-3xl font-bold text-gray-800">
              {{ countByStage("agreement") }}
            </p>
          </div>
          <div
            class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div class="flex items-center justify-between mb-3">
              <p class="text-sm text-gray-500">Kapora</p>
              <div
                class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"
              >
                <span class="text-blue-600 text-xs font-bold">K</span>
              </div>
            </div>
            <p class="text-3xl font-bold text-gray-800">
              {{ countByStage("earnest_money") }}
            </p>
          </div>
          <div
            class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div class="flex items-center justify-between mb-3">
              <p class="text-sm text-gray-500">Tapu</p>
              <div
                class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center"
              >
                <span class="text-purple-600 text-xs font-bold">T</span>
              </div>
            </div>
            <p class="text-3xl font-bold text-gray-800">
              {{ countByStage("title_deed") }}
            </p>
          </div>
          <div
            class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div class="flex items-center justify-between mb-3">
              <p class="text-sm text-gray-500">Tamamlandı</p>
              <div
                class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center"
              >
                <span class="text-green-600 text-xs font-bold">✓</span>
              </div>
            </div>
            <p class="text-3xl font-bold text-green-600">
              {{ countByStage("completed") }}
            </p>
          </div>
        </div>
      </ClientOnly>

      <!-- İşlem Listesi -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div
          class="px-6 py-4 border-b border-gray-100 flex items-center justify-between"
        >
          <ClientOnly>
            <h2 class="font-semibold text-gray-700">
              {{
                authStore.user?.role === "admin" ? "Tüm İşlemler" : "İşlemlerim"
              }}
            </h2>
          </ClientOnly>
          <select
            v-model="selectedCity"
            class="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Tüm İller</option>
            <option v-for="city in cities" :key="city" :value="city">
              {{ city }}
            </option>
          </select>
        </div>

        <div v-if="store.loading" class="p-12 text-center">
          <div
            class="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"
          ></div>
          <p class="text-gray-400 mt-3 text-sm">Yükleniyor...</p>
        </div>

        <div
          v-else-if="filteredTransactions.length === 0"
          class="p-12 text-center"
        >
          <div
            class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <span class="text-2xl">📋</span>
          </div>
          <p class="text-gray-400">
            {{
              selectedCity
                ? `${selectedCity} ilinde işlem yok`
                : "Henüz işlem yok"
            }}
          </p>
        </div>

        <div v-else>
          <div
            v-for="txn in filteredTransactions"
            :key="txn._id"
            class="px-6 py-4 border-b border-gray-50 hover:bg-green-50 cursor-pointer flex items-center justify-between transition-colors group"
            @click="$router.push(`/transactions/${txn._id}`)"
          >
            <div>
              <p
                class="font-medium text-gray-800 group-hover:text-green-700 transition-colors"
              >
                {{ txn.propertyAddress }}
              </p>
              <p class="text-sm text-gray-500 mt-1">
                {{ txn.listingAgent?.name }} → {{ txn.sellingAgent?.name }}
              </p>
              <p class="text-xs text-gray-400 mt-1">
                Oluşturan: {{ txn.createdBy?.name ?? "Bilinmiyor" }}
              </p>
              <p v-if="txn.city" class="text-xs text-gray-400 mt-1">
                📍 {{ txn.city }}
              </p>
            </div>
            <div class="flex items-center gap-4">
              <p class="text-sm font-semibold text-gray-700">
                {{ formatCurrency(txn.totalServiceFee) }}
              </p>
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
definePageMeta({ middleware: "auth" });

const router = useRouter();
const store = useTransactionsStore();
const authStore = useAuthStore();

onMounted(() => {
  authStore.loadFromStorage();
  store.fetchTransactions();
});

const handleLogout = () => {
  authStore.logout();
  router.push("/login");
};

const selectedCity = ref("");

const filteredTransactions = computed(() => {
  if (!selectedCity.value) return store.transactions;
  return store.transactions.filter((t) => t.city === selectedCity.value);
});

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

const completedCount = computed(
  () => store.transactions.filter((t) => t.stage === "completed").length,
);

const totalEarnings = computed(() => {
  return store.transactions
    .filter((t) => t.stage === "completed" && t.commissionBreakdown)
    .reduce((sum, t) => {
      const userEmail = authStore.user?.email;
      const listingEmail = t.listingAgent?.email;
      const sellingEmail = t.sellingAgent?.email;

      if (listingEmail === sellingEmail && listingEmail === userEmail) {
        return sum + t.commissionBreakdown.listingAgentAmount;
      }

      let earning = 0;
      if (listingEmail === userEmail)
        earning += t.commissionBreakdown.listingAgentAmount;
      if (sellingEmail === userEmail)
        earning += t.commissionBreakdown.sellingAgentAmount;
      return sum + earning;
    }, 0);
});

const countByStage = (stage) =>
  store.transactions.filter((t) => t.stage === stage).length;

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
