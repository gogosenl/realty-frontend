<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
      <h1 class="text-2xl font-semibold text-gray-800 mb-2">Realty Manager</h1>
      <p class="text-sm text-gray-500 mb-6">Hesabınıza giriş yapın</p>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
          <input
            v-model="form.email"
            type="email"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="admin@realty.com"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
          <input
            v-model="form.password"
            type="password"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••"
            required
          />
        </div>

        <div v-if="error" class="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{{ error }}</div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {{ loading ? 'Giriş yapılıyor...' : 'Giriş Yap' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: false })

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({ email: '', password: '' })
const loading = ref(false)
const error = ref(null)

onMounted(() => {
  if (authStore.isLoggedIn) router.push('/')
})

const handleLogin = async () => {
  loading.value = true
  error.value = null
  try {
    await authStore.login(form)
    router.push('/')
  } catch (e) {
    error.value = 'E-posta veya şifre hatalı'
  } finally {
    loading.value = false
  }
}
</script>