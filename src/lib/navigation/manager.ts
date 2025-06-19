// 📁 src/lib/navigation/manager.ts
import { browser } from "$app/environment"

export interface NavigationCallbacks {
  onUnsavedChanges: () => boolean
  onBackup: () => void
  onSave: (fromKeyboard?: boolean) => Promise<void>
  onNetworkChange: (isOnline: boolean) => void
}

export class NavigationManager {
  private callbacks: NavigationCallbacks
  private intervals: NodeJS.Timeout[] = []

  constructor(callbacks: NavigationCallbacks) {
    this.callbacks = callbacks
  }

  handleKeydown = (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "s") {
      event.preventDefault()
      event.stopPropagation()
      this.callbacks.onSave(true)
    }
  }

  handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (this.callbacks.onUnsavedChanges()) {
      this.callbacks.onBackup()
      event.preventDefault()
      event.returnValue =
        "You have unsaved changes. Are you sure you want to leave?"
      return event.returnValue
    }
  }

  handleOnline = () => {
    this.callbacks.onNetworkChange(true)
  }

  handleOffline = () => {
    this.callbacks.onNetworkChange(false)
  }

  setupEventListeners() {
    if (!browser) return

    window.addEventListener("beforeunload", this.handleBeforeUnload)
    window.addEventListener("keydown", this.handleKeydown)
    window.addEventListener("online", this.handleOnline)
    window.addEventListener("offline", this.handleOffline)

    // Periodic connectivity check
    const connectivityInterval = setInterval(() => {
      this.callbacks.onNetworkChange(navigator.onLine)
    }, 5000)

    // Periodic backup
    const backupInterval = setInterval(() => {
      if (this.callbacks.onUnsavedChanges()) {
        this.callbacks.onBackup()
      }
    }, 30000)

    this.intervals = [connectivityInterval, backupInterval]

    return () => {
      this.cleanup()
    }
  }

  cleanup() {
    if (!browser) return

    window.removeEventListener("beforeunload", this.handleBeforeUnload)
    window.removeEventListener("keydown", this.handleKeydown)
    window.removeEventListener("online", this.handleOnline)
    window.removeEventListener("offline", this.handleOffline)

    this.intervals.forEach((interval) => clearInterval(interval))
    this.intervals = []
  }
}
