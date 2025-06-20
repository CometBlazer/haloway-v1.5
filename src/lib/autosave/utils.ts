// 📁 src/lib/autosave/utils.ts
import type { ErrorType, SaveStatus } from './types';

export function categorizeError(error: unknown): ErrorType {
	if (error instanceof Error) {
		if (error.name === 'AbortError') return 'timeout';
		if (error.message.includes('Failed to fetch')) return 'network';
		if (error.message.includes('409')) return 'conflict';
		if (error.message.includes('401')) return 'auth';
	}
	return 'unknown';
}

export function formatSaveTime(time: Date): string {
	const now = new Date();
	const diff = Math.floor((now.getTime() - time.getTime()) / 1000);
	if (diff < 60) return 'just now';
	if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
	if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
	if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
	if (diff < 2419200) return `${Math.floor(diff / 604800)}w ago`;
	return time.toLocaleDateString();
}

export function getStatusDisplay(
	status: SaveStatus,
	hasChanges: boolean,
	lastSavedTime: Date,
	isOnline: boolean,
): { text: string; icon: string; class: string } {
	if (!isOnline) {
		return {
			text: 'Offline - Changes will save when reconnected',
			icon: 'offline',
			class: 'offline',
		};
	}

	switch (status) {
		case 'saved':
			return hasChanges
				? { text: 'Changes detected', icon: 'pending', class: 'pending' }
				: {
						text: `Saved ${formatSaveTime(lastSavedTime)}`,
						icon: 'saved',
						class: 'saved',
					};
		case 'saving':
			return { text: 'Saving...', icon: 'saving', class: 'saving' };
		case 'retrying':
			return { text: 'Retrying save...', icon: 'saving', class: 'retrying' };
		case 'unsaved':
			return { text: 'Unsaved changes', icon: 'unsaved', class: 'unsaved' };
		case 'error':
			return { text: 'Save failed', icon: 'error', class: 'error' };
		case 'offline':
			return { text: 'Offline', icon: 'offline', class: 'offline' };
		case 'conflict':
			return { text: 'Version conflict', icon: 'error', class: 'error' };
		default:
			return { text: 'Unknown status', icon: 'error', class: 'error' };
	}
}
