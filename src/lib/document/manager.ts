// 📁 src/lib/document/manager.ts
import type { DocumentCallbacks } from "./types"
import type { Status } from "$lib/components/StatusDropdown.svelte"

export class DocumentManager {
  private callbacks: DocumentCallbacks

  constructor(callbacks: DocumentCallbacks) {
    this.callbacks = callbacks
  }

  async updateTitle(newTitle: string, currentTitle: string): Promise<string> {
    if (newTitle === currentTitle) return currentTitle

    try {
      const formData = new FormData()
      formData.append("title", newTitle)
      const response = await fetch("?/updateDocument", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        this.callbacks.onSuccess("Title updated successfully")
        return newTitle
      } else {
        throw new Error("Failed to update title")
      }
    } catch (error) {
      console.error("Failed to update title:", error)
      this.callbacks.onError("Failed to update title")
      return currentTitle // Revert on error
    }
  }

  async updatePrompt(
    newPrompt: string,
    currentPrompt: string,
  ): Promise<string> {
    if (newPrompt === currentPrompt) return currentPrompt

    try {
      const formData = new FormData()
      formData.append("prompt", newPrompt)
      const response = await fetch("?/updateDocument", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        this.callbacks.onSuccess("Prompt updated successfully")
        return newPrompt
      } else {
        throw new Error("Failed to update prompt")
      }
    } catch (error) {
      console.error("Failed to update prompt:", error)
      this.callbacks.onError("Failed to update prompt")
      return currentPrompt
    }
  }

  async updateWordCountLimit(
    newLimit: number,
    currentLimit: number,
  ): Promise<number> {
    if (newLimit === currentLimit) return currentLimit

    try {
      const formData = new FormData()
      formData.append("wordCountLimit", newLimit.toString())
      const response = await fetch("?/updateDocument", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        this.callbacks.onSuccess("Word count limit updated successfully")
        return newLimit
      } else {
        throw new Error("Failed to update word count limit")
      }
    } catch (error) {
      console.error("Failed to update word count limit:", error)
      this.callbacks.onError("Failed to update word count limit")
      return currentLimit
    }
  }

  async updateStatus(newStatus: Status): Promise<void> {
    try {
      const formData = new FormData()
      formData.append("status", newStatus)
      const response = await fetch("?/updateDocument", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        this.callbacks.onSuccess("Status updated successfully")
      } else {
        throw new Error("Failed to update status")
      }
    } catch (error) {
      console.error("Failed to update status:", error)
      this.callbacks.onError("Failed to update status")
    }
  }

  async updateDueDate(newDate: Date | null): Promise<void> {
    try {
      const formData = new FormData()
      formData.append("dueDate", newDate ? newDate.toISOString() : "")
      const response = await fetch("?/updateDocument", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        this.callbacks.onSuccess("Deadline updated successfully")
      } else {
        throw new Error("Failed to update deadline")
      }
    } catch (error) {
      console.error("Failed to update deadline:", error)
      this.callbacks.onError("Failed to update deadline")
    }
  }
}
