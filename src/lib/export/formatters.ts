// 📁 src/lib/export/formatters.ts
import type { DocumentMetadata, ExportOptions } from "./types"

export class TextFormatter {
  static format(
    content: string,
    metadata: DocumentMetadata,
    options: ExportOptions = {},
  ): string {
    if (!options.includeHeader) return content

    const header = this.createTextHeader(metadata)
    return `${header}\n\n${content}`
  }

  private static createTextHeader(metadata: DocumentMetadata): string {
    const {
      title,
      prompt,
      wordCount,
      wordCountLimit,
      versionName,
      lastSaved,
      downloadDate,
      appName,
    } = metadata
    const now = downloadDate || new Date()

    let header = title || "Untitled Document"

    if (prompt) {
      header += `\n\n${prompt}`
    }

    header += `\n\n${wordCountLimit} word limit • ${wordCount} words • ${versionName}`
    header += `\nLast saved ${this.formatTime(lastSaved)} • Downloaded ${now.toLocaleDateString()} • ${appName}`
    header += `\n\n${"─".repeat(50)}`

    return header
  }

  private static formatTime(time: Date | string): string {
    const date = typeof time === "string" ? new Date(time) : time
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 60) return "just now"
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
    if (diff < 2419200) return `${Math.floor(diff / 604800)}w ago`
    return date.toLocaleDateString()
  }
}

export class HtmlFormatter {
  static format(
    htmlContent: string,
    metadata: DocumentMetadata,
    options: ExportOptions = {},
  ): string {
    const header = options.includeHeader ? this.createHtmlHeader(metadata) : ""
    const styles = this.getStyles(options.customStyles)

    return `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:w="urn:schemas-microsoft-com:office:word"
            xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8">
          <meta name="ProgId" content="Word.Document">
          <meta name="Generator" content="${metadata.appName}">
          <title>${metadata.title || "Document"}</title>
          ${styles}
        </head>
        <body>
          ${header}
          <div class="content">
            ${htmlContent}
          </div>
        </body>
      </html>
    `
  }

  private static createHtmlHeader(metadata: DocumentMetadata): string {
    const {
      title,
      prompt,
      wordCount,
      wordCountLimit,
      versionName,
      lastSaved,
      downloadDate,
      appName,
    } = metadata
    const now = downloadDate || new Date()
    const savedTimeFormatted = TextFormatter["formatTime"](lastSaved)

    return `
      <div style="margin-bottom: 40px; padding-bottom: 20px; border-bottom: 1px solid #ccc;">
        <h1 style="margin: 0 0 20px 0; font-size: 18pt; font-weight: bold; color: #000;">
          ${title || "Untitled Document"}
        </h1>
        
        ${
          prompt
            ? `
          <p style="margin: 0 0 20px 0; font-size: 12pt; line-height: 1.5; color: #000; font-style: italic;">
            ${prompt.replace(/\r\n/g, "<br>").replace(/\n/g, "<br>")}
          </p>
        `
            : ""
        }
        
        <p style="margin: 0; font-size: 11pt; color: #666;">
          ${wordCountLimit} word limit • ${wordCount} words • ${versionName}<br>
          Last saved ${savedTimeFormatted} • Downloaded ${now.toLocaleDateString()} • ${appName}
        </p>
      </div>
    `
  }

  private static getStyles(customStyles?: string): string {
    const defaultStyles = `
      <style>
        @page {
          margin: 1in;
        }
        body {
          font-family: "Times New Roman", Times, serif;
          font-size: 12pt;
          line-height: 1.6;
          color: #000;
          max-width: none;
          margin: 0;
          padding: 0;
        }
        h1 {
          font-family: "Times New Roman", Times, serif;
        }
        .content {
          margin-top: 0;
        }
      </style>
    `

    return customStyles
      ? `${defaultStyles}<style>${customStyles}</style>`
      : defaultStyles
  }
}
