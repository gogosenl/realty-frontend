<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow px-6 py-4 flex items-center gap-4">
      <NuxtLink to="/" class="text-gray-500 hover:text-gray-700">← Geri</NuxtLink>
      <h1 class="text-xl font-semibold text-gray-800">Kullanıcı Yönetimi</h1>
    </nav>

    <div class="max-w-4xl mx-auto px-6 py-8 space-y-6">

      <!-- Davet Formu -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 class="font-semibold text-gray-700 mb-4">Yeni Kullanıcı Davet Et</h2>
        <form @submit.prevent="handleInvite" class="flex gap-3">
          <input
            v-model="inviteEmail"
            type="text"
            class="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="kullanici@realty.com"
            required
          />
          <button
            type="submit"
            :disabled="inviteLoading"
            class="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {{ inviteLoading ? 'Gönderiliyor...' : 'Davet Et' }}
          </button>
        </form>
        <div v-if="successMsg" class="mt-3 text-green-600 text-sm bg-green-50 p-3 rounded-lg">{{ successMsg }}</div>
        <div v-if="errorMsg" class="mt-3 text-red-500 text-sm bg-red-50 p-3 rounded-lg">{{ errorMsg }}</div>
      </div>

      <!-- Davet Listesi -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="px-6 py-4 border-b border-gray-100">
          <h2 class="font-semibold text-gray-700">Davetler</h2>
        </div>
        <div v-if="invites.length === 0" class="p-8 text-center text-gray-400">Henüz davet yok</div>
        <div v-else>
          <div
            v-for="invite in invites"
            :key="invite._id"
            class="px-6 py-4 border-b border-gray-50 flex items-center justify-between"
          >
            <div>
              <p class="font-medium text-gray-800">{{ invite.email }}</p>
              <p class="text-xs text-gray-400 mt-1">{{ formatDate(invite.createdAt) }}</p>
            </div>
            <div class="flex items-center gap-3">
              <span
                :class="invite.used ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'"
                class="text-xs px-3 py-1 rounded-full font-medium"
              >
                {{ invite.used ? 'Kullanıldı' : 'Bekliyor' }}
              </span>
              <button
                v-if="!invite.used"
                @click="handleDeleteInvite(invite._id)"
                class="text-xs text-red-500 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Kullanıcı Listesi -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="px-6 py-4 border-b border-gray-100">
          <h2 class="font-semibold text-gray-700">Tüm Kullanıcılar</h2>
        </div>
        <div v-if="loading" class="p-8 text-center text-gray-400">Yükleniyor...</div>
        <div v-else-if="users.length === 0" class="p-8 text-center text-gray-400">Henüz kullanıcı yok</div>
        <div v-else>
          <div
            v-for="user in users"
            :key="user._id"
            class="px-6 py-4 border-b border-gray-50 flex items-center justify-between"
          >
            <div>
              <p class="font-medium text-gray-800">{{ user.name }}</p>
              <p class="text-sm text-gray-500 mt-1">{{ user.email }}</p>
              <p class="text-xs text-gray-400 mt-1">{{ formatDate(user.createdAt) }}</p>
            </div>
            <div class="flex items-center gap-3">
              <span
                :class="user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'"
                class="text-xs px-3 py-1 rounded-full font-medium"
              >
                {{ user.role === 'admin' ? 'Admin' : 'Emlak Danışmanı' }}
              </span>
              <select
                v-if="user._id !== currentUserId"
                :value="user.role"
                @change="handleRoleChange(user._id, $event.target.value)"
                class="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="admin">Admin</option>
                <option value="agent">Emlak Danışmanı</option>
              </select>
              <button
                v-if="user._id !== currentUserId"
                @click="handleDeleteUser(user._id)"
                class="text-sm text-red-500 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50"
              >
                Sil
              </button>
              <span v-else class="text-xs text-gray-400">Siz</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()
const authStore = useAuthStore()
const { success, error: toastError } = useToast()
const loading = ref(false)
const users = ref([])
const invites = ref([])
const inviteEmail = ref('')
const inviteLoading = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

const currentUserId = computed(() => authStore.user?.id)

const getHeaders = () => {
  const token = import.meta.client ? localStorage.getItem('token') : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

onMounted(async () => {
  loading.value = true
  try {
    const [usersData, invitesData] = await Promise.all([
      $fetch(`${config.public.apiBase}/auth/users`, { headers: getHeaders() }),
      $fetch(`${config.public.apiBase}/auth/invites`, { headers: getHeaders() }),
    ])
    users.value = usersData
    invites.value = invitesData
  } catch (e) {
    users.value = []
    invites.value = []
  } finally {
    loading.value = false
  }
})

const handleInvite = async () => {
  inviteLoading.value = true
  successMsg.value = ''
  errorMsg.value = ''
  try {
    const res = await $fetch(`${config.public.apiBase}/auth/invite`, {
      method: 'POST',
      body: { email: inviteEmail.value },
      headers: getHeaders(),
    })
    successMsg.value = res.message
    inviteEmail.value = ''
    invites.value = await $fetch(`${config.public.apiBase}/auth/invites`, { headers: getHeaders() })
  } catch (e) {
    errorMsg.value = e?.data?.message ?? 'Davet gönderilemedi'
  } finally {
    inviteLoading.value = false
  }
}

const handleDeleteInvite = async (id) => {
  try {
    await $fetch(`${config.public.apiBase}/auth/invites/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })
    invites.value = invites.value.filter((i) => i._id !== id)
  } catch (e) {
    alert('Silme başarısız')
  }
}

const handleRoleChange = async (id, role) => {
  try {
    await $fetch(`${config.public.apiBase}/auth/users/${id}/role`, {
      method: 'PATCH',
      body: { role },
      headers: getHeaders(),
    })
    const user = users.value.find((u) => u._id === id)
    if (user) user.role = role
  } catch (e) {
    alert('Rol güncellenemedi')
  }
}

const handleDeleteUser = async (id) => {
  if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) return
  try {
    await $fetch(`${config.public.apiBase}/auth/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })
    users.value = users.value.filter((u) => u._id !== id)
  } catch (e) {
    alert('Silme başarısız')
  }
}

const formatDate = (val) =>
  new Intl.DateTimeFormat('tr-TR').format(new Date(val))
</script>