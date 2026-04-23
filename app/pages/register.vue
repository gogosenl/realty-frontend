<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
      <h1 class="text-2xl font-semibold text-gray-800 mb-2">Realty Manager</h1>
      <p class="text-sm text-gray-500 mb-6">Hesap oluşturun</p>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
          <input
            v-model="form.name"
            type="text"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ahmet Yılmaz"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
          <input
            v-model="form.email"
            type="text"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
          <input
            v-model="form.phone"
            type="text"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="05551234567"
            required
          />
        </div>

        <div v-if="errorMsg" class="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{{ errorMsg }}</div>
        <div v-if="successMsg" class="text-green-600 text-sm bg-green-50 p-3 rounded-lg">{{ successMsg }}</div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {{ loading ? 'Kaydediliyor...' : 'Kayıt Ol' }}
        </button>

        <p class="text-center text-sm text-gray-500">
          Zaten hesabınız var mı?
          <NuxtLink to="/login" class="text-blue-600 hover:underline">Giriş yapın</NuxtLink>
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
    const msgStr = Array.isArray(msg) ? msg[0] : msg
    errorMsg.value = msgStr
  } finally {
    loading.value = false
  }
}
</script>