// 📁 src/lib/export/types.ts
export interface DocumentMetadata {
	title: string;
	prompt?: string;
	wordCount: number;
	wordCountLimit: number;
	versionName: string;
	lastSaved: Date | string;
	downloadDate?: Date;
	appName: string;
}

export interface ExportOptions {
	includeMetadata?: boolean;
	includeHeader?: boolean;
	customStyles?: string;
	filename?: string;
}

export type ExportFormat = 'txt' | 'doc' | 'html' | 'pdf';
