<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow px-6 py-4 flex items-center gap-4">
      <NuxtLink to="/" class="text-gray-500 hover:text-gray-700">← Geri</NuxtLink>
      <h1 class="text-xl font-semibold text-gray-800">Kullanıcı Yönetimi</h1>
    </nav>

    <div class="max-w-4xl mx-auto px-6 py-8">
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
                {{ user.role === 'admin' ? 'Admin' : 'Ajan' }}
              </span>
              <select
                v-if="user._id !== currentUserId"
                :value="user.role"
                @change="handleRoleChange(user._id, $event.target.value)"
                class="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="admin">Admin</option>
                <option value="agent">Ajan</option>
              </select>
              <button
                v-if="user._id !== currentUserId"
                @click="handleDelete(user._id)"
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

const loading = ref(false)
const users = ref([])

const currentUserId = computed(() => authStore.user?.id)

const getHeaders = () => {
  const token = import.meta.client ? localStorage.getItem('token') : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

onMounted(async () => {
  loading.value = true
  try {
    users.value = await $fetch(`${config.public.apiBase}/auth/users`, {
      headers: getHeaders(),
    })
  } catch (e) {
    users.value = []
  } finally {
    loading.value = false
  }
})

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

const handleDelete = async (id) => {
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