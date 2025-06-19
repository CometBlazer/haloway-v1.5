// 📁 src/lib/autosave/manager.ts
import { writable, type Writable } from "svelte/store"
import { browser } from "$app/environment"
import type { Editor } from "@tiptap/core"
import type { SaveConfig, SaveState } from "./types"
import { LocalBackupManager } from "./backup"
import { SaveQueue } from "./queue"
import { categorizeError } from "./utils"
import type { ToastOptions } from "./types"

export class AutoSaveManager {
  private editor: Editor | null = null
  private config: SaveConfig
  private backup: LocalBackupManager
  private queue: SaveQueue

  // State
  private state: Writable<SaveState>
  private savedContentJSON = ""
  private isContentInitialized = false
  private autoSaveEnabled = true

  // Timers
  private saveTimer: NodeJS.Timeout | null = null
  private retryTimeout: NodeJS.Timeout | null = null
  private pendingSaveContent: unknown = null

  // Callbacks
  private onSave: (
    content: string,
    lastKnownVersion: string,
  ) => Promise<Response>
  private onToast: (
    message: string,
    type: "success" | "error" | "info",
    options?: ToastOptions,
  ) => void
  private onConflict: (data?: unknown) => void
  private onAuthError: () => void

  constructor(
    config: Partial<SaveConfig> = {},
    callbacks: {
      onSave: (content: string, lastKnownVersion: string) => Promise<Response>
      onToast: (
        message: string,
        type: "success" | "error" | "info",
        options?: ToastOptions,
      ) => void
      onConflict: (data?: unknown) => void
      onAuthError: () => void
    },
  ) {
    this.config = {
      debounceMs: 2000,
      maxRetryAttempts: 3,
      retryDelays: [2000, 5000, 10000],
      timeoutMs: 30000,
      backupIntervalMs: 30000,
      ...config,
    }

    this.backup = new LocalBackupManager()
    this.queue = new SaveQueue()
    this.onSave = callbacks.onSave
    this.onToast = callbacks.onToast
    this.onConflict = callbacks.onConflict
    this.onAuthError = callbacks.onAuthError

    this.state = writable({
      status: "saved" as const,
      lastSavedTime: new Date(),
      hasUnsavedChanges: false,
      consecutiveFailures: 0,
      isOnline: browser ? navigator.onLine : true,
      isSaveInProgress: false,
    })
  }

  // Public methods
  initialize(
    editor: Editor,
    initialContent: unknown,
    documentId: string,
  ): void {
    this.editor = editor
    this.savedContentJSON = JSON.stringify(initialContent)
    this.isContentInitialized = true

    // Check for backup
    if (browser) {
      this.backup.checkForBackup(documentId).then((backup) => {
        if (backup) {
          this.onToast(
            "Found unsaved changes from previous session. Click to restore.",
            "info",
            {
              duration: 10000,
              action: {
                label: "Restore",
                handler: () => {
                  if (this.editor && backup.content) {
                    this.editor.commands.setContent(backup.content)
                    this.backup.clearBackup()
                    this.onToast("Previous session restored", "success")
                  }
                },
              },
            },
          )
        }
      })
    }
  }

  onContentChange(): void {
    if (!this.isContentInitialized) return

    this.updateState((state) => ({
      ...state,
      hasUnsavedChanges: this.checkUnsavedChanges(),
    }))

    this.debouncedAutoSave()

    // Occasional backup
    if (Math.random() < 0.1) {
      this.createBackup()
    }
  }

  async manualSave(fromKeyboard = false): Promise<void> {
    if (!this.editor) {
      this.onToast("Editor not ready", "error")
      return
    }

    const currentState = this.getCurrentState()
    if (!currentState.isOnline) {
      this.onToast("Cannot save while offline", "error")
      return
    }

    if (!this.checkUnsavedChanges()) {
      if (!fromKeyboard) {
        this.onToast("No changes to save", "info")
      }
      return
    }

    this.clearTimers()
    await this.saveToServer(false, 0)
  }

  setOnlineStatus(isOnline: boolean): void {
    this.updateState((state) => ({ ...state, isOnline }))

    if (isOnline && this.getCurrentState().hasUnsavedChanges) {
      this.onToast("Back online - resuming auto-save", "info")
      this.debouncedAutoSave()
    } else if (!isOnline) {
      this.updateState((state) => ({ ...state, status: "offline" }))
      this.onToast("Offline - changes will be saved when reconnected", "error")
    }
  }

  getState(): Writable<SaveState> {
    return this.state
  }

  createBackup(documentId?: string, versionId?: string, title?: string): void {
    if (!this.editor || !browser) return
    this.backup.backup(
      this.editor.getJSON(),
      documentId || "",
      versionId || "",
      title || "",
    )
  }

  cleanup(): void {
    this.clearTimers()
    this.queue.clear()
  }

  // Private methods
  private getCurrentState(): SaveState {
    let currentState: SaveState = {
      status: "saved",
      lastSavedTime: new Date(),
      hasUnsavedChanges: false,
      consecutiveFailures: 0,
      isOnline: true,
      isSaveInProgress: false,
    }
    this.state.subscribe((state) => (currentState = state))()
    return currentState
  }

  private updateState(updater: (state: SaveState) => SaveState): void {
    this.state.update(updater)
  }

  private checkUnsavedChanges(): boolean {
    if (!this.editor || !this.isContentInitialized) return false

    try {
      const currentJSON = JSON.stringify(this.editor.getJSON())
      const hasChanges =
        currentJSON !== this.savedContentJSON && currentJSON !== ""
      if (!hasChanges) return false

      const currentText = this.editor.getText().trim()
      const isEmpty = currentText === "" && this.savedContentJSON === ""
      return !isEmpty
    } catch (error) {
      console.error("Error checking changes:", error)
      return false
    }
  }

  private debouncedAutoSave(): void {
    if (!this.autoSaveEnabled || !this.isContentInitialized) return

    const hasChanges = this.checkUnsavedChanges()
    this.updateState((state) => ({ ...state, hasUnsavedChanges: hasChanges }))

    if (hasChanges) {
      this.updateState((state) => ({
        ...state,
        status: state.status === "saved" ? "unsaved" : state.status,
      }))

      this.clearTimers()

      const currentState = this.getCurrentState()
      if (!currentState.isOnline) {
        this.updateState((state) => ({ ...state, status: "offline" }))
        return
      }

      this.saveTimer = setTimeout(() => {
        this.saveToServer()
      }, this.config.debounceMs)
    } else {
      this.updateState((state) => ({
        ...state,
        status: state.status === "unsaved" ? "saved" : state.status,
        consecutiveFailures: 0,
      }))
    }
  }

  private async saveToServer(isRetry = false, retryAttempt = 0): Promise<void> {
    if (!this.editor || !this.isContentInitialized) {
      console.warn("Editor not ready for save")
      return
    }

    const currentState = this.getCurrentState()

    // Prevent concurrent saves
    if (currentState.isSaveInProgress && !isRetry) {
      this.pendingSaveContent = this.editor.getJSON()
      return
    }

    if (!this.checkUnsavedChanges()) {
      console.log("No changes detected, skipping save")
      this.updateState((state) => ({ ...state, status: "saved" }))
      return
    }

    if (!currentState.isOnline) {
      this.updateState((state) => ({ ...state, status: "offline" }))
      return
    }

    this.updateState((state) => ({
      ...state,
      isSaveInProgress: true,
      status: isRetry ? "retrying" : "saving",
    }))

    const jsonContent = this.editor.getJSON()

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeoutMs,
      )

      const response = await this.onSave(
        JSON.stringify(jsonContent),
        "current_version_timestamp",
      )

      clearTimeout(timeoutId)

      if (response.status === 409) {
        const conflictData = await response.json()
        this.onConflict(conflictData)
        return
      }

      if (response.ok) {
        this.savedContentJSON = JSON.stringify(jsonContent)
        this.updateState((state) => ({
          ...state,
          status: "saved",
          lastSavedTime: new Date(),
          consecutiveFailures: 0,
          hasUnsavedChanges: false,
          isSaveInProgress: false,
        }))

        this.clearTimers()
        this.backup.clearBackup()

        if (isRetry || retryAttempt > 0) {
          this.onToast("Content saved successfully", "success")
        }

        console.log("Content saved successfully")

        // Handle pending content
        this.handlePendingContent()
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error("Save failed:", error)
      this.handleSaveError(error, isRetry, retryAttempt)
    } finally {
      this.updateState((state) => ({ ...state, isSaveInProgress: false }))
    }
  }

  private handleSaveError(
    error: unknown,
    isRetry: boolean,
    retryAttempt: number,
  ): void {
    this.updateState((state) => ({
      ...state,
      consecutiveFailures: state.consecutiveFailures + 1,
    }))

    const errorType = categorizeError(error)
    const currentState = this.getCurrentState()

    switch (errorType) {
      case "network": {
        if (retryAttempt < 5) {
          this.scheduleRetry(retryAttempt)
        } else {
          this.updateState((state) => ({ ...state, status: "error" }))
        }
        break
      }
      case "auth":
        this.onToast("Authentication expired. Please log in again.", "error")
        this.onAuthError()
        break
      case "conflict":
        this.onConflict()
        break
      default: {
        const shouldRetry =
          retryAttempt < this.config.maxRetryAttempts &&
          currentState.consecutiveFailures <= this.config.maxRetryAttempts &&
          currentState.isOnline &&
          !(error instanceof Error && error.name === "AbortError")

        if (shouldRetry) {
          this.scheduleRetry(retryAttempt)
        } else {
          this.handleMaxRetriesReached(error)
        }
      }
    }
  }

  private scheduleRetry(retryAttempt: number): void {
    this.updateState((state) => ({ ...state, status: "retrying" }))
    const delay =
      this.config.retryDelays[retryAttempt] ||
      this.config.retryDelays[this.config.retryDelays.length - 1]

    this.retryTimeout = setTimeout(() => {
      console.log(
        `Retrying save (attempt ${retryAttempt + 1}/${this.config.maxRetryAttempts})`,
      )
      this.saveToServer(true, retryAttempt + 1)
    }, delay)

    if (retryAttempt === 0) {
      this.onToast("Save failed, retrying...", "error")
    }
  }

  private handleMaxRetriesReached(error: unknown): void {
    this.updateState((state) => ({ ...state, status: "error" }))
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred"
    this.onToast(`Failed to save: ${errorMessage}`, "error")

    const currentState = this.getCurrentState()
    if (currentState.consecutiveFailures >= this.config.maxRetryAttempts) {
      this.autoSaveEnabled = false
      this.onToast(
        "Auto-save disabled due to repeated failures. Use manual save.",
        "error",
      )

      setTimeout(() => {
        this.autoSaveEnabled = true
        this.updateState((state) => ({ ...state, consecutiveFailures: 0 }))
        this.onToast("Auto-save re-enabled", "info")
      }, 300000)
    }
  }

  private handlePendingContent(): void {
    if (this.pendingSaveContent && this.editor) {
      const currentContent = JSON.stringify(this.editor.getJSON())
      const pendingContent = JSON.stringify(this.pendingSaveContent)

      if (currentContent !== pendingContent) {
        this.pendingSaveContent = null
        setTimeout(() => this.saveToServer(), 1000)
      } else {
        this.pendingSaveContent = null
      }
    }
  }

  private clearTimers(): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer)
      this.saveTimer = null
    }
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout)
      this.retryTimeout = null
    }
  }
}
