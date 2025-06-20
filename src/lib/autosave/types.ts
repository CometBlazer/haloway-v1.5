// 📁 src/lib/autosave/types.ts
export type SaveStatus =
	| 'saved'
	| 'saving'
	| 'unsaved'
	| 'error'
	| 'retrying'
	| 'offline'
	| 'conflict';

export type ErrorType = 'timeout' | 'network' | 'conflict' | 'auth' | 'unknown';

export interface SaveConfig {
	debounceMs: number;
	maxRetryAttempts: number;
	retryDelays: number[];
	timeoutMs: number;
	backupIntervalMs: number;
}

export interface SaveState {
	status: SaveStatus;
	lastSavedTime: Date;
	hasUnsavedChanges: boolean;
	consecutiveFailures: number;
	isOnline: boolean;
	isSaveInProgress: boolean;
}

export interface BackupData {
	content: unknown;
	timestamp: number;
	documentId: string;
	versionId: string;
	title: string;
}

export interface ToastOptions {
	duration?: number;
	action?: {
		label: string;
		handler: () => void;
	};
}
