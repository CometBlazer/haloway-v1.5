// 📁 src/lib/autosave/backup.ts
import { browser } from '$app/environment';
import type { BackupData } from './types';

export class LocalBackupManager {
	private backupKey = 'haloway_backup';

	backup(
		content: unknown,
		documentId: string,
		versionId: string,
		title: string,
	): void {
		if (!browser) return;

		try {
			const backup: BackupData = {
				content,
				timestamp: Date.now(),
				documentId,
				versionId,
				title,
			};
			localStorage.setItem(this.backupKey, JSON.stringify(backup));
		} catch (error) {
			console.warn('Local backup failed:', error);
		}
	}

	checkForBackup(documentId: string): Promise<BackupData | null> {
		return new Promise((resolve) => {
			if (!browser) {
				resolve(null);
				return;
			}

			try {
				const backup = localStorage.getItem(this.backupKey);
				if (backup) {
					const parsed = JSON.parse(backup) as BackupData;
					const age = Date.now() - parsed.timestamp;

					// If backup is recent and for same document
					if (age < 24 * 60 * 60 * 1000 && parsed.documentId === documentId) {
						resolve(parsed);
						return;
					}
				}
			} catch (error) {
				console.warn('Backup recovery failed:', error);
			}

			resolve(null);
		});
	}

	clearBackup(): void {
		if (!browser) return;
		try {
			localStorage.removeItem(this.backupKey);
		} catch (error) {
			console.warn('Failed to clear backup:', error);
		}
	}
}
