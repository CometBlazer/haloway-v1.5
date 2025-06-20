// 📁 src/lib/export/manager.ts
import type { Editor } from '@tiptap/core';
import type { DocumentMetadata, ExportOptions, ExportFormat } from './types';
import { TextFormatter, HtmlFormatter } from './formatters';
import { FileDownloader } from './downloader';

export class DocumentExporter {
	private editor: Editor;
	private metadata: DocumentMetadata;
	private onSuccess?: (message: string) => void;
	private onError?: (message: string) => void;

	constructor(
		editor: Editor,
		metadata: DocumentMetadata,
		callbacks?: {
			onSuccess?: (message: string) => void;
			onError?: (message: string) => void;
		},
	) {
		this.editor = editor;
		this.metadata = metadata;
		this.onSuccess = callbacks?.onSuccess;
		this.onError = callbacks?.onError;
	}

	updateMetadata(metadata: Partial<DocumentMetadata>): void {
		this.metadata = { ...this.metadata, ...metadata };
	}

	async exportAs(
		format: ExportFormat,
		options: ExportOptions = {},
	): Promise<void> {
		try {
			if (!this.editor) {
				throw new Error('Editor not available');
			}

			const content = await this.getContentForFormat(format);
			const formattedContent = this.formatContent(content, format, options);
			const filename = this.generateFilename(format, options.filename);
			const mimeType = FileDownloader.getMimeType(format);

			FileDownloader.download(formattedContent, filename, mimeType);

			this.onSuccess?.(`Document exported as ${format.toUpperCase()}`);
		} catch (error) {
			console.error(`Export failed for format ${format}:`, error);
			this.onError?.(`Failed to export as ${format.toUpperCase()}`);
		}
	}

	private async getContentForFormat(format: ExportFormat): Promise<string> {
		switch (format) {
			case 'txt':
				return this.editor.getText();
			case 'doc':
			case 'html':
				return this.editor.getHTML();
			case 'pdf':
				// PDF would require additional library like jsPDF
				throw new Error('PDF export not yet implemented');
			default:
				return this.editor.getText();
		}
	}

	private formatContent(
		content: string,
		format: ExportFormat,
		options: ExportOptions,
	): string {
		const formatOptions = {
			includeHeader: true,
			includeMetadata: true,
			...options,
		};

		switch (format) {
			case 'txt':
				return TextFormatter.format(content, this.metadata, formatOptions);
			case 'doc':
			case 'html':
				return HtmlFormatter.format(content, this.metadata, formatOptions);
			default:
				return content;
		}
	}

	private generateFilename(
		format: ExportFormat,
		customFilename?: string,
	): string {
		if (customFilename) {
			return FileDownloader.sanitizeFilename(customFilename);
		}

		const baseFilename = this.metadata.title || 'document';
		const sanitized = FileDownloader.sanitizeFilename(baseFilename);
		const extension = FileDownloader.getFileExtension(format);

		return `${sanitized}.${extension}`;
	}

	// Convenience methods for common exports
	async exportAsText(options?: ExportOptions): Promise<void> {
		return this.exportAs('txt', options);
	}

	async exportAsDoc(options?: ExportOptions): Promise<void> {
		return this.exportAs('doc', options);
	}

	async exportAsHtml(options?: ExportOptions): Promise<void> {
		return this.exportAs('html', options);
	}

	// Batch export
	async exportMultiple(
		formats: ExportFormat[],
		options?: ExportOptions,
	): Promise<void> {
		const promises = formats.map((format) => this.exportAs(format, options));
		await Promise.allSettled(promises);
	}
}
