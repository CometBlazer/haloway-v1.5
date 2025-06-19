// src/lib/stores/toast.ts
import { writable } from "svelte/store"

export interface ToastItem {
  id: string
  type: "success" | "error" | "info"
  message: string
  timeout?: NodeJS.Timeout
}

function createToastStore() {
  const { subscribe, update } = writable<ToastItem[]>([])

  return {
    subscribe,
    show: (
      message: string,
      type: "success" | "error" | "info" = "info",
      duration = 3000,
    ) => {
      const id = Math.random().toString(36).substr(2, 9)
      const toast: ToastItem = { id, type, message }

      update((toasts) => [...toasts, toast])

      if (duration > 0) {
        const timeout = setTimeout(() => {
          update((toasts) => toasts.filter((t) => t.id !== id))
        }, duration)
        toast.timeout = timeout
      }
    },
    remove: (id: string) => {
      update((toasts) => {
        const toast = toasts.find((t) => t.id === id)
        if (toast?.timeout) {
          clearTimeout(toast.timeout)
        }
        return toasts.filter((t) => t.id !== id)
      })
    },
    clear: () => {
      update((toasts) => {
        toasts.forEach((toast) => {
          if (toast.timeout) {
            clearTimeout(toast.timeout)
          }
        })
        return []
      })
    },
  }
}

export const toastStore = createToastStore()
