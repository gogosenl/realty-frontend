<template>
  <div class="min-h-screen bg-gradient-to-br from-green-800 to-green-600 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span class="text-green-700 font-bold text-2xl">RM</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-800">Realty Manager</h1>
        <p class="text-sm text-gray-500 mt-1">Hesap oluşturun</p>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
          <input
            v-model="form.name"
            type="text"
            class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            placeholder="Ahmet Yılmaz"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
          <input
            v-model="form.email"
            type="text"
            class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            placeholder="ajan@realty.com"
            required
          />
          <p class="text-xs text-gray-400 mt-1">Sadece admin tarafından davet edilen e-postalar kayıt olabilir</p>
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

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
          <input
            v-model="form.phone"
            type="text"
            class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            placeholder="05551234567"
            required
          />
        </div>

        <div v-if="errorMsg" class="text-red-500 text-sm bg-red-50 p-3 rounded-xl">{{ errorMsg }}</div>
        <div v-if="successMsg" class="text-green-600 text-sm bg-green-50 p-3 rounded-xl">{{ successMsg }}</div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-green-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors mt-2"
        >
          {{ loading ? 'Kaydediliyor...' : 'Kayıt Ol' }}
        </button>

        <p class="text-center text-sm text-gray-500 mt-4">
          Zaten hesabınız var mı?
          <NuxtLink to="/login" class="text-green-600 hover:underline font-medium">Giriş yapın</NuxtLink>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: false })

const router = useRouter()
const config = useRuntimeConfig()

const form = reactive({
  name: '',
  email: '',
  password: '',
  phone: '',
  role: 'agent',
})

const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const handleRegister = async () => {
  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''
  try {
    await $fetch(`${config.public.apiBase}/auth/register`, {
      method: 'POST',
      body: form,
    })
    successMsg.value = 'Kayıt başarılı! Giriş yapabilirsiniz.'
    setTimeout(() => router.push('/login'), 2000)
  } catch (e) {
    const msg = e?.data?.message ?? 'Kayıt başarısız'
    errorMsg.value = Array.isArray(msg) ? msg[0] : msg
  } finally {
    loading.value = false
  }
}
</script>