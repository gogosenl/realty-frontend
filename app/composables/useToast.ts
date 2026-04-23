const toasts = useState<Array<{ id: number; message: string; type: string }>>('toasts', () => [])
let counter = 0

export const useToast = () => {
  const add = (message: string, type = 'success', duration = 3000) => {
    if (!import.meta.client) return
    const id = ++counter
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id)
    }, duration)
  }

  const success = (message: string) => add(message, 'success')
  const error = (message: string) => add(message, 'error')
  const info = (message: string) => add(message, 'info')
  const warning = (message: string) => add(message, 'warning')

  return { toasts, success, error, info, warning }
}