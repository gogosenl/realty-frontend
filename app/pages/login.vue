<template>
  <div class="min-h-screen bg-gradient-to-br from-green-800 to-green-600 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span class="text-green-700 font-bold text-2xl">RM</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-800">Realty Manager</h1>
        <p class="text-sm text-gray-500 mt-1">Hesabınıza giriş yapın</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
          <input
            v-model="form.email"
            type="email"
            class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            placeholder="admin@realty.com"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
          <input
            v-model="form.password"
            type="password"
            class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            placeholder="••••••"
            required
          />
        </div>

        <div v-if="error" class="text-red-500 text-sm bg-red-50 p-3 rounded-xl">{{ error }}</div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-green-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors mt-2"
        >
          {{ loading ? 'Giriş yapılıyor...' : 'Giriş Yap' }}
        </button>

        <p class="text-center text-sm text-gray-500 mt-4">
          Hesabınız yok mu?
          <NuxtLink to="/register" class="text-green-600 hover:underline font-medium">Kayıt olun</NuxtLink>
        </p>
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