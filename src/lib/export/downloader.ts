// 📁 src/lib/export/downloader.ts
import type { ExportFormat } from "./types"

export class FileDownloader {
  static download(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  static sanitizeFilename(filename: string): string {
    return filename.replace(/[<>:"/\\|?*]/g, "_")
  }

  static getMimeType(format: ExportFormat): string {
    const mimeTypes = {
      txt: "text/plain; charset=utf-8",
      doc: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      html: "text/html; charset=utf-8",
      pdf: "application/pdf",
    }
    return mimeTypes[format] || mimeTypes.txt
  }

  static getFileExtension(format: ExportFormat): string {
    const extensions = {
      txt: "txt",
      doc: "doc",
      html: "html",
      pdf: "pdf",
    }
    return extensions[format] || extensions.txt
  }
}
