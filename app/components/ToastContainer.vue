<template>
  <div class="fixed top-4 right-4 z-50 space-y-2">
    <transition-group name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium min-w-72 max-w-sm',
          toast.type === 'success' ? 'bg-green-500 text-white' : '',
          toast.type === 'error' ? 'bg-red-500 text-white' : '',
          toast.type === 'info' ? 'bg-blue-500 text-white' : '',
          toast.type === 'warning' ? 'bg-yellow-500 text-white' : '',
        ]"
      >
        <span v-if="toast.type === 'success'">✓</span>
        <span v-if="toast.type === 'error'">✕</span>
        <span v-if="toast.type === 'info'">ℹ</span>
        <span v-if="toast.type === 'warning'">⚠</span>
        {{ toast.message }}
      </div>
    </transition-group>
  </div>
</template>

<script setup>
const { toasts } = useToast()
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>