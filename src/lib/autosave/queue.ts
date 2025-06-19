// 📁 src/lib/autosave/queue.ts
export class SaveQueue {
  private queue: Array<() => Promise<void>> = []
  private isProcessing = false

  add(saveOperation: () => Promise<void>): void {
    this.queue.push(saveOperation)
    this.process()
  }

  private async process(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return

    this.isProcessing = true

    while (this.queue.length > 0) {
      const saveOp = this.queue.shift()
      if (saveOp) {
        try {
          await saveOp()
        } catch (error) {
          console.error("Queued save failed:", error)
        }
      }
    }

    this.isProcessing = false
  }

  clear(): void {
    this.queue = []
  }
}
