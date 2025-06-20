// 📁 src/lib/versions/manager.ts
import { enhance } from '$app/forms';
import type { ActionResult } from '@sveltejs/kit';
import type { Editor } from '@tiptap/core';
import type { ComponentVersion } from '../../DatabaseDefinitions';
import type { VersionCallbacks, CreateVersionResponse } from './types';

export class VersionManager {
	private callbacks: VersionCallbacks;

	constructor(callbacks: VersionCallbacks) {
		this.callbacks = callbacks;
	}

	createVersion(
		name: string,
		editor: Editor | null,
		userId: string,
		documentId: string,
		currentVersions: ComponentVersion[],
	): {
		tempVersion: ComponentVersion;
		updatedVersions: ComponentVersion[];
		cleanup: () => void;
	} {
		// Create optimistic update
		const tempId = `temp-${Date.now()}`;
		const tempVersion: ComponentVersion = {
			id: tempId,
			version_name: name,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			created_by: userId,
			document_id: documentId,
			content: editor ? editor.getJSON() : { type: 'doc', content: [] },
		};

		const updatedVersions = [tempVersion, ...currentVersions];

		// Create form and submit
		const form = document.createElement('form');
		form.method = 'POST';
		form.action = '?/createVersion';
		const input = document.createElement('input');
		input.type = 'hidden';
		input.name = 'name';
		input.value = name;
		form.appendChild(input);
		document.body.appendChild(form);

		const cleanup = () => document.body.removeChild(form);

		enhance(form, () => {
			return async ({ result }: { result: ActionResult }) => {
				if (result.type === 'success' && result.data?.version) {
					const version = result.data.version;
					this.callbacks.onSuccess('Checkpoint created successfully');
					this.callbacks.onNavigate(
						`/dashboard/write/${documentId}/${version.id}`,
					);
				} else {
					this.callbacks.onError('Failed to create checkpoint');
				}
				cleanup();
			};
		});
		form.submit();

		return { tempVersion, updatedVersions, cleanup };
	}

	renameVersion(
		versionId: string,
		newName: string,
		currentVersions: ComponentVersion[],
	): {
		originalVersion: ComponentVersion | undefined;
		updatedVersions: ComponentVersion[];
		cleanup: () => void;
	} {
		// Optimistic update
		const originalVersion = currentVersions.find((v) => v.id === versionId);
		const updatedVersions = currentVersions.map((v) =>
			v.id === versionId
				? { ...v, version_name: newName, updated_at: new Date().toISOString() }
				: v,
		);

		// Create form and submit
		const form = document.createElement('form');
		form.method = 'POST';
		form.action = '?/renameVersion';

		const versionInput = document.createElement('input');
		versionInput.type = 'hidden';
		versionInput.name = 'renameVersionId';
		versionInput.value = versionId;
		form.appendChild(versionInput);

		const nameInput = document.createElement('input');
		nameInput.type = 'hidden';
		nameInput.name = 'name';
		nameInput.value = newName;
		form.appendChild(nameInput);
		document.body.appendChild(form);

		const cleanup = () => document.body.removeChild(form);

		enhance(form, () => {
			return async ({ result }: { result: ActionResult }) => {
				if (result.type === 'success') {
					this.callbacks.onSuccess('Checkpoint renamed successfully');
				} else {
					this.callbacks.onError('Failed to rename checkpoint');
				}
				cleanup();
			};
		});
		form.submit();

		return { originalVersion, updatedVersions, cleanup };
	}

	duplicateVersion(
		sourceVersionId: string,
		currentVersions: ComponentVersion[],
		documentId: string,
	): {
		tempVersion: ComponentVersion;
		updatedVersions: ComponentVersion[];
		cleanup: () => void;
	} {
		const sourceVersion = currentVersions.find((v) => v.id === sourceVersionId);
		if (!sourceVersion) {
			throw new Error('Source version not found');
		}

		// Optimistic update
		const tempId = `temp-dup-${Date.now()}`;
		const tempVersion: ComponentVersion = {
			...sourceVersion,
			id: tempId,
			version_name: `${sourceVersion.version_name} (Copy)`,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};

		const updatedVersions = [tempVersion, ...currentVersions];

		// Create form and submit
		const form = document.createElement('form');
		form.method = 'POST';
		form.action = '?/duplicateVersion';
		const input = document.createElement('input');
		input.type = 'hidden';
		input.name = 'sourceVersionId';
		input.value = sourceVersionId;
		form.appendChild(input);
		document.body.appendChild(form);

		const cleanup = () => document.body.removeChild(form);

		enhance(form, () => {
			return async ({ result }: { result: ActionResult }) => {
				if (result.type === 'success' && result.data?.version) {
					const version = result.data.version;
					this.callbacks.onSuccess('Checkpoint duplicated successfully');
					this.callbacks.onNavigate(
						`/dashboard/write/${documentId}/${version.id}`,
					);
				} else {
					this.callbacks.onError('Failed to duplicate checkpoint');
				}
				cleanup();
			};
		});
		form.submit();

		return { tempVersion, updatedVersions, cleanup };
	}

	deleteVersion(
		versionId: string,
		currentVersions: ComponentVersion[],
		currentVersionId: string,
		documentId: string,
	): {
		versionToDelete: ComponentVersion | undefined;
		updatedVersions: ComponentVersion[];
		cleanup: () => void;
	} {
		const versionToDelete = currentVersions.find((v) => v.id === versionId);
		const updatedVersions = currentVersions.filter((v) => v.id !== versionId);

		// Create form and submit
		const form = document.createElement('form');
		form.method = 'POST';
		form.action = '?/deleteVersion';
		const input = document.createElement('input');
		input.type = 'hidden';
		input.name = 'versionId';
		input.value = versionId;
		form.appendChild(input);
		document.body.appendChild(form);

		const cleanup = () => document.body.removeChild(form);

		enhance(form, () => {
			return async ({ result }: { result: ActionResult }) => {
				if (result.type === 'success') {
					this.callbacks.onSuccess('Checkpoint deleted successfully');

					if (versionId === currentVersionId) {
						if (updatedVersions.length > 0) {
							const sortedRemaining = [...updatedVersions].sort(
								(a, b) =>
									new Date(b.updated_at).getTime() -
									new Date(a.updated_at).getTime(),
							);
							this.callbacks.onNavigate(
								`/dashboard/write/${documentId}/${sortedRemaining[0].id}`,
							);
						} else {
							this.callbacks.onNavigate('/dashboard/documents');
						}
					}
				} else {
					this.callbacks.onError('Failed to delete checkpoint');
				}
				cleanup();
			};
		});
		form.submit();

		return { versionToDelete, updatedVersions, cleanup };
	}

	async createQuickCheckpoint(
		documentId: string,
		saveContentFn: () => Promise<void>,
	): Promise<string | null> {
		// First save current content
		await saveContentFn();

		// Generate default checkpoint name
		const now = new Date();
		const defaultName = `Checkpoint ${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

		try {
			const formData = new FormData();
			formData.append('name', defaultName);

			const response = await fetch('?/createVersion', {
				method: 'POST',
				body: formData,
			});

			const result = (await response.json()) as CreateVersionResponse;

			if (response.ok && result.type === 'success' && result.data?.version) {
				const version = result.data.version;
				this.callbacks.onSuccess('Checkpoint saved successfully');
				return `/dashboard/write/${documentId}/${version.id}`;
			} else {
				throw new Error('Failed to create checkpoint');
			}
		} catch (error) {
			console.error('Quick save failed:', error);
			this.callbacks.onError('Failed to save checkpoint');
			return null;
		}
	}

	async createNamedCheckpoint(
		name: string,
		documentId: string,
		saveContentFn: () => Promise<void>,
	): Promise<string | null> {
		if (!name.trim()) {
			this.callbacks.onError('Please enter a checkpoint name');
			return null;
		}

		await saveContentFn();

		try {
			const formData = new FormData();
			formData.append('name', name.trim());

			const response = await fetch('?/createVersion', {
				method: 'POST',
				body: formData,
			});

			const result = (await response.json()) as CreateVersionResponse;

			if (response.ok && result.type === 'success' && result.data?.version) {
				const version = result.data.version;
				this.callbacks.onSuccess('Checkpoint saved successfully');
				return `/dashboard/write/${documentId}/${version.id}`;
			} else {
				throw new Error('Failed to create checkpoint');
			}
		} catch (error) {
			console.error('Named save failed:', error);
			this.callbacks.onError('Failed to save checkpoint');
			return null;
		}
	}
}
