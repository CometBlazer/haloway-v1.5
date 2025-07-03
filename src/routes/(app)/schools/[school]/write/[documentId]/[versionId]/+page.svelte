<!-- src/routes/(app)/schools/[school]/write/[documentId]/[versionId]/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { beforeNavigate } from '$app/navigation';
	import { browser } from '$app/environment';
	import { onMount, onDestroy } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import * as Section from '$lib/components/landing/section';
	import DocumentHeader from '../../../../../../../lib/components/Editor/DocumentHeader.svelte';
	import VersionSidebar from '../../../../../../../lib/components/Editor/VersionSidebar.svelte';
	import TiptapEditor from '$lib/components/Editor/TiptapEditor.svelte';
	import { toastStore } from '$lib/stores/toast';
	import type { PageData } from './$types';
	import type { ActionResult } from '@sveltejs/kit';
	import type { Editor } from '@tiptap/core';
	import type { ComponentVersion } from '../../../../../../../DatabaseDefinitions';
	import { WebsiteName } from '../../../../../../../config';
	import type { Status } from '$lib/components/Editor/StatusDropdown.svelte';
	import AIFeedback from '$lib/components/Editor/AIFeedback.svelte';

	// Import modular systems
	import { AutoSaveManager, getStatusDisplay } from '$lib/autosave';
	import type { SaveState } from '$lib/autosave';
	import { DocumentExporter } from '$lib/export';
	import type { DocumentMetadata } from '$lib/export';
	import TopToolbar from '$lib/components/Editor/TopToolbar.svelte';

	export let data: PageData;

	// Editor and content state
	let editor: Editor;
	let content = '';
	let editorReady = false;

	let contentLoaded = false;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let contentLocked = false;

	// Document state
	let documentTitle = data.document.title || '';
	let documentPrompt = data.document.prompt || '';
	let wordCountLimit = data.document.word_count_limit || 250;
	let wordCount = 0;
	let isSidebarOpen = false;
	let editorZenMode = false;
	let currentWordCount = 0;

	// Checkpoint creation state
	let isCreatingCheckpoint = false;
	let showCheckpointModal = false;
	let checkpointModalName = '';

	// Modular managers
	let autoSaveManager: AutoSaveManager;
	let documentExporter: DocumentExporter;
	let saveState: SaveState = {
		status: 'saved',
		lastSavedTime: new Date(),
		hasUnsavedChanges: false,
		consecutiveFailures: 0,
		isOnline: true,
		isSaveInProgress: false,
	};

	function scrollToFeedback() {
		if (!browser) return;

		// Use requestAnimationFrame to ensure DOM is fully rendered
		requestAnimationFrame(() => {
			const feedbackElement = document.getElementById('feedback');
			if (feedbackElement) {
				feedbackElement.scrollIntoView({
					behavior: 'smooth',
					block: 'start',
				});
				console.log('Scrolled to feedback section');
			} else {
				console.log('Feedback element not found');
			}
		});
	}

	// Create autosave manager with callbacks
	function createAutoSaveManager() {
		autoSaveManager = new AutoSaveManager(
			{
				debounceMs: 2000,
				maxRetryAttempts: 3,
				retryDelays: [2000, 5000, 10000],
				timeoutMs: 30000,
				backupIntervalMs: 30000,
			},
			{
				onSave: async (content: string) => {
					const formData = new FormData();
					formData.append('content', content);
					formData.append('lastKnownVersion', data.currentVersion.updated_at);

					return await fetch('?/updateVersion', {
						method: 'POST',
						body: formData,
					});
				},
				onToast: (message: string, type: 'success' | 'error' | 'info') => {
					toastStore.show(message, type);
				},
				onConflict: () => {
					toastStore.show(
						'Document was modified elsewhere. Please refresh to see latest version.',
						'error',
					);
					// Optionally add a refresh button to the toast
					setTimeout(() => {
						if (
							confirm(
								'Document conflict detected. Refresh page to see latest version?',
							)
						) {
							window.location.reload();
						}
					}, 1000);
				},
				onAuthError: () => {
					goto('/login');
				},
			},
		);

		// Subscribe to save state changes
		autoSaveManager.getState().subscribe((state) => {
			saveState = state;
		});
	}

	// Create document exporter when editor is ready
	function createDocumentExporter() {
		if (!editor) return;

		const metadata: DocumentMetadata = {
			title: documentTitle,
			prompt: documentPrompt,
			wordCount: currentWordCount,
			wordCountLimit: wordCountLimit,
			versionName: currentVersionName,
			lastSaved: saveState.lastSavedTime,
			appName: `${WebsiteName}`,
		};

		documentExporter = new DocumentExporter(editor, metadata, {
			onSuccess: (message) => toastStore.show(message, 'success'),
			onError: (message) => toastStore.show(message, 'error'),
		});
	}

	// Initialize managers
	$: if (browser && !autoSaveManager) {
		createAutoSaveManager();
	}

	$: if (editor && editorReady && !documentExporter) {
		createDocumentExporter();
	}

	// Update exporter metadata when document changes
	$: if (documentExporter) {
		documentExporter.updateMetadata({
			title: documentTitle,
			prompt: documentPrompt,
			wordCount: currentWordCount,
			lastSaved: saveState.lastSavedTime,
		});
	}

	// Get status display for UI
	$: statusDisplay = getStatusDisplay(
		saveState.status,
		saveState.hasUnsavedChanges,
		saveState.lastSavedTime,
		saveState.isOnline,
	);

	$: initialStatus = (data.document.status as Status) || 'not-started';

	// Add feedback-related state
	let currentFeedback = data.currentVersion.latest_ai_response || null;

	// Add feedback handler
	async function handleFeedbackReceived(
		event: CustomEvent<{ feedback: string; wordCount: number }>,
	) {
		const newFeedback = event.detail.feedback;
		currentFeedback = newFeedback;

		// Safe to update AI fields - won't trigger content reload
		if (data.currentVersion) {
			data.currentVersion.latest_ai_response = newFeedback;
			// Future: Add more AI fields here without breaking anything
			// data.currentVersion.ai_suggestions = suggestions;
			// data.currentVersion.ai_score = score;
			// data.currentVersion.ai_analysis = analysis;
		}

		// Save feedback to database using server action
		if ($page.params.versionId) {
			try {
				const formData = new FormData();
				formData.append('feedback', newFeedback);

				const saveResponse = await fetch('?/saveFeedback', {
					method: 'POST',
					body: formData,
				});

				if (!saveResponse.ok) {
					console.error('Failed to save feedback to database');
					toastStore.show(
						'Feedback generated but not saved. Please try again.',
						'error',
					);
				} else {
					console.log('Feedback saved successfully to database');
				}
			} catch (error) {
				console.error('Error saving feedback to database:', error);
			}
		}

		console.log('Feedback received and processed');
	}

	// Watch for version changes and update feedback
	$: if (data.currentVersion?.latest_ai_response !== currentFeedback) {
		currentFeedback = data.currentVersion?.latest_ai_response || null;
	}

	// Initialize editor with existing content
	function handleEditorReady() {
		if (editor && !editorReady) {
			loadVersionContent();
			editorReady = true;

			// Initialize autosave manager with editor
			if (autoSaveManager) {
				const initialContent = data.currentVersion.content || {
					type: 'doc',
					content: [],
				};
				autoSaveManager.initialize(
					editor,
					initialContent,
					$page.params.documentId,
				);
			}
		}
	}

	// Load version content into editor
	function loadVersionContent() {
		if (!editor) return;
		try {
			const versionContent = data.currentVersion.content;
			let parsedContent;

			if (
				!versionContent ||
				versionContent === '' ||
				(typeof versionContent === 'object' &&
					Object.keys(versionContent).length === 0)
			) {
				parsedContent = { type: 'doc', content: [] };
			} else if (typeof versionContent === 'string') {
				try {
					const jsonContent = JSON.parse(versionContent);
					if (
						jsonContent &&
						typeof jsonContent === 'object' &&
						jsonContent.type === 'doc'
					) {
						parsedContent = jsonContent;
					} else {
						parsedContent = {
							type: 'doc',
							content: [
								{
									type: 'paragraph',
									content: [{ type: 'text', text: versionContent }],
								},
							],
						};
					}
				} catch {
					parsedContent = {
						type: 'doc',
						content: [
							{
								type: 'paragraph',
								content: [{ type: 'text', text: versionContent }],
							},
						],
					};
				}
			} else {
				parsedContent = versionContent;
			}

			editor.commands.setContent(parsedContent);

			// Update the content variable with the actual text content
			content = editor.getText();
			contentLoaded = true;

			console.log('Content loaded and initialized');
		} catch (error) {
			console.error('Failed to load checkpoint content:', error);
			toastStore.show('Warning: Could not load checkpoint content', 'error');
			const emptyContent = { type: 'doc', content: [] };
			editor.commands.setContent(emptyContent);
			content = '';
			contentLoaded = true;
		}
	}

	// Content and save handlers
	function handleContentUpdate() {
		// Update content with plain text when editor content changes
		if (editor && contentLoaded) {
			content = editor.getText();
		}

		if (autoSaveManager) {
			autoSaveManager.onContentChange();
		}
	}

	async function saveContent(fromKeyboard = false) {
		if (autoSaveManager) {
			await autoSaveManager.manualSave(fromKeyboard);
		}
	}

	// Export functions - now much simpler!
	function downloadAsTxt() {
		documentExporter?.exportAsText();
	}

	function downloadAsDoc() {
		documentExporter?.exportAsDoc();
	}

	// function downloadAsHtml() {
	//   documentExporter?.exportAsHtml()
	// }

	// Document management functions
	async function handleTitleUpdate(event: CustomEvent<string>) {
		const newTitle = event.detail.trim();
		if (newTitle === documentTitle) return;
		documentTitle = newTitle;
		try {
			const formData = new FormData();
			formData.append('title', newTitle);
			const response = await fetch('?/updateDocument', {
				method: 'POST',
				body: formData,
			});
			if (response.ok) {
				toastStore.show('Title updated successfully', 'success');
			} else {
				throw new Error('Failed to update title');
			}
		} catch (error) {
			console.error('Failed to update title:', error);
			toastStore.show('Failed to update title', 'error');
			documentTitle = data.document.title || '';
		}
	}

	async function handlePromptUpdate(event: CustomEvent<string>) {
		const newPrompt = event.detail.trim();
		if (newPrompt === documentPrompt) return;
		documentPrompt = newPrompt;
		try {
			const formData = new FormData();
			formData.append('prompt', newPrompt);
			const response = await fetch('?/updateDocument', {
				method: 'POST',
				body: formData,
			});
			if (response.ok) {
				toastStore.show('Prompt updated successfully', 'success');
			} else {
				throw new Error('Failed to update prompt');
			}
		} catch (error) {
			console.error('Failed to update prompt:', error);
			toastStore.show('Failed to update prompt', 'error');
			documentPrompt = data.document.prompt || '';
		}
	}

	async function handleWordCountLimitUpdate(event: CustomEvent<number>) {
		const newLimit = event.detail;
		if (newLimit === wordCountLimit) return;
		wordCountLimit = newLimit;
		try {
			const formData = new FormData();
			formData.append('wordCountLimit', newLimit.toString());
			const response = await fetch('?/updateDocument', {
				method: 'POST',
				body: formData,
			});
			if (response.ok) {
				toastStore.show('Word count limit updated successfully', 'success');
				if (editor && editorReady) {
					editor = editor;
				}
			} else {
				throw new Error('Failed to update word count limit');
			}
		} catch (error) {
			console.error('Failed to update word count limit:', error);
			toastStore.show('Failed to update word count limit', 'error');
			wordCountLimit = data.document.word_count_limit || 250;
		}
	}

	function handleWordCountUpdate(event: CustomEvent<number>) {
		wordCount = event.detail;
		currentWordCount = event.detail;
	}

	async function handleStatusUpdate(event: CustomEvent<Status>) {
		const newStatus = event.detail;
		try {
			const formData = new FormData();
			formData.append('status', newStatus);
			const response = await fetch('?/updateDocument', {
				method: 'POST',
				body: formData,
			});
			if (response.ok) {
				toastStore.show('Status updated successfully', 'success');
			} else {
				throw new Error('Failed to update status');
			}
		} catch (error) {
			console.error('Failed to update status:', error);
			toastStore.show('Failed to update status', 'error');
		}
	}

	async function handleDueDateUpdate(event: CustomEvent<Date | null>) {
		const newDate = event.detail;
		try {
			const formData = new FormData();
			formData.append('dueDate', newDate ? newDate.toISOString() : '');
			const response = await fetch('?/updateDocument', {
				method: 'POST',
				body: formData,
			});
			if (response.ok) {
				toastStore.show('Deadline updated successfully', 'success');
			} else {
				throw new Error('Failed to update deadline');
			}
		} catch (error) {
			console.error('Failed to update deadline:', error);
			toastStore.show('Failed to update deadline', 'error');
		}
	}

	async function handleSchoolUpdate(event: CustomEvent<string>) {
		const newSchool = event.detail;
		try {
			const formData = new FormData();
			formData.append('school', newSchool);
			const response = await fetch('?/updateDocument', {
				method: 'POST',
				body: formData,
			});

			if (response.ok) {
				// Update the local data
				data.document.school = newSchool;
				toastStore.show('School updated successfully', 'success');

				// Navigate to the new URL if the school changed
				const currentSchool = $page.params.school;
				const { getSchoolUrlSafeNameStrict } = await import(
					'$lib/utils/validation'
				);
				const newSchoolSlug = await getSchoolUrlSafeNameStrict(newSchool);

				if (currentSchool !== newSchoolSlug) {
					// Navigate to the new school-based URL
					goto(
						`/schools/${newSchoolSlug}/write/${$page.params.documentId}/${$page.params.versionId}`,
					);
				}
			} else {
				throw new Error('Failed to update school');
			}
		} catch (error) {
			console.error('Failed to update school:', error);
			toastStore.show('Failed to update school', 'error');
		}
	}

	// Sidebar functions
	function toggleSidebar() {
		isSidebarOpen = !isSidebarOpen;
	}

	function closeSidebar() {
		isSidebarOpen = false;
	}

	// Checkpoint functions
	// async function handleQuickSaveCheckpoint() {
	//   if (!editor || !editorReady) {
	//     toastStore.show("Editor not ready", "error")
	//     return
	//   }

	//   // First save current content
	//   await saveContent()

	//   // Generate default checkpoint name
	//   const now = new Date()
	//   const defaultName = `Checkpoint ${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`

	//   isCreatingCheckpoint = true

	//   try {
	//     const formData = new FormData()
	//     formData.append("name", defaultName)

	//     const response = await fetch("?/createVersion", {
	//       method: "POST",
	//       body: formData,
	//     })

	//     const result = await response.json()

	//     if (response.ok && result.type === "success" && result.data?.version) {
	//       const version = result.data.version
	//       toastStore.show("Checkpoint saved successfully", "success")
	//       await goto(`/dashboard/write/${$page.params.documentId}/${version.id}`)
	//     } else {
	//       throw new Error("Failed to create checkpoint")
	//     }
	//   } catch (error) {
	//     console.error("Quick save failed:", error)
	//     toastStore.show("Failed to save checkpoint", "error")
	//   } finally {
	//     isCreatingCheckpoint = false
	//   }
	// }

	// function handleOpenCheckpointModal() {
	//   showCheckpointModal = true
	//   const now = new Date()
	//   checkpointModalName = `Checkpoint ${now.toLocaleDateString()}`
	// }

	async function handleSaveNamedCheckpoint() {
		if (!checkpointModalName.trim() || !editor || !editorReady) {
			toastStore.show('Please enter a checkpoint name', 'error');
			return;
		}

		await saveContent();

		isCreatingCheckpoint = true;
		showCheckpointModal = false;

		try {
			const formData = new FormData();
			formData.append('name', checkpointModalName.trim());

			const response = await fetch('?/createVersion', {
				method: 'POST',
				body: formData,
			});

			const result = await response.json();
			if (response.ok && result.type === 'success' && result.data?.version) {
				const version = result.data.version;
				toastStore.show('Checkpoint saved successfully', 'success');
				// FIX: Use the correct school-based route
				await goto(
					`/schools/${$page.params.school}/write/${$page.params.documentId}/${version.id}`,
				);
			} else {
				throw new Error('Failed to create checkpoint');
			}
		} catch (error) {
			console.error('Named save failed:', error);
			toastStore.show('Failed to save checkpoint', 'error');
		} finally {
			isCreatingCheckpoint = false;
			checkpointModalName = '';
		}
	}

	function closeCheckpointModal() {
		showCheckpointModal = false;
		checkpointModalName = '';
	}

	// Version management functions with optimistic UI updates
	function handleVersionCreate(event: CustomEvent<{ name: string }>) {
		const tempId = `temp-${Date.now()}`;
		const newVersion: ComponentVersion = {
			id: tempId,
			version_name: event.detail.name,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			created_by: data.session.user.id,
			document_id: $page.params.documentId,
			content: editor ? editor.getJSON() : { type: 'doc', content: [] },
		};

		data.versions = [newVersion, ...data.versions];

		const form = document.createElement('form');
		form.method = 'POST';
		form.action = '?/createVersion';
		const input = document.createElement('input');
		input.type = 'hidden';
		input.name = 'name';
		input.value = event.detail.name;
		form.appendChild(input);
		document.body.appendChild(form);

		enhance(form, () => {
			return async ({ result }: { result: ActionResult }) => {
				if (result.type === 'success' && result.data?.version) {
					const version = result.data.version;
					toastStore.show('Checkpoint created successfully', 'success');
					// FIX: Use the correct school-based route
					goto(
						`/schools/${$page.params.school}/write/${$page.params.documentId}/${version.id}`,
					);
				} else {
					data.versions = data.versions.filter((v) => v.id !== tempId);
					toastStore.show('Failed to create checkpoint', 'error');
				}
				document.body.removeChild(form);
			};
		});
		form.submit();
	}

	function handleVersionRename(
		event: CustomEvent<{ id: string; name: string }>,
	) {
		const originalVersion = data.versions.find((v) => v.id === event.detail.id);
		if (originalVersion) {
			const updatedVersions = data.versions.map((v) =>
				v.id === event.detail.id
					? {
							...v,
							version_name: event.detail.name,
							updated_at: new Date().toISOString(),
						}
					: v,
			);
			data.versions = updatedVersions;
		}

		const form = document.createElement('form');
		form.method = 'POST';
		form.action = '?/renameVersion';

		const versionInput = document.createElement('input');
		versionInput.type = 'hidden';
		versionInput.name = 'renameVersionId';
		versionInput.value = event.detail.id;
		form.appendChild(versionInput);

		const nameInput = document.createElement('input');
		nameInput.type = 'hidden';
		nameInput.name = 'name';
		nameInput.value = event.detail.name;
		form.appendChild(nameInput);
		document.body.appendChild(form);

		enhance(form, () => {
			return async ({ result }: { result: ActionResult }) => {
				if (result.type === 'success') {
					toastStore.show('Checkpoint renamed successfully', 'success');
				} else {
					if (originalVersion) {
						data.versions = data.versions.map((v) =>
							v.id === event.detail.id ? originalVersion : v,
						);
					}
					toastStore.show('Failed to rename checkpoint', 'error');
				}
				document.body.removeChild(form);
			};
		});
		form.submit();
	}

	function handleVersionDuplicate(event: CustomEvent<string>) {
		const sourceVersion = data.versions.find((v) => v.id === event.detail);
		if (!sourceVersion) return;

		const tempId = `temp-dup-${Date.now()}`;
		const duplicatedVersion: ComponentVersion = {
			...sourceVersion,
			id: tempId,
			version_name: `${sourceVersion.version_name} (Copy)`,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};

		data.versions = [duplicatedVersion, ...data.versions];

		const form = document.createElement('form');
		form.method = 'POST';
		form.action = '?/duplicateVersion';
		const input = document.createElement('input');
		input.type = 'hidden';
		input.name = 'sourceVersionId';
		input.value = event.detail;
		form.appendChild(input);
		document.body.appendChild(form);

		enhance(form, () => {
			return async ({ result }: { result: ActionResult }) => {
				if (result.type === 'success' && result.data?.version) {
					const version = result.data.version;
					toastStore.show('Checkpoint duplicated successfully', 'success');
					// FIX: Use the correct school-based route
					goto(
						`/schools/${$page.params.school}/write/${$page.params.documentId}/${version.id}`,
					);
				} else {
					data.versions = data.versions.filter((v) => v.id !== tempId);
					toastStore.show('Failed to duplicate checkpoint', 'error');
				}
				document.body.removeChild(form);
			};
		});
		form.submit();
	}

	function handleVersionDelete(event: CustomEvent<string>) {
		const versionToDelete = data.versions.find((v) => v.id === event.detail);
		if (!versionToDelete) return;

		const updatedVersions = data.versions.filter((v) => v.id !== event.detail);
		data.versions = updatedVersions;

		const form = document.createElement('form');
		form.method = 'POST';
		form.action = '?/deleteVersion';
		const input = document.createElement('input');
		input.type = 'hidden';
		input.name = 'versionId';
		input.value = event.detail;
		form.appendChild(input);
		document.body.appendChild(form);

		enhance(form, () => {
			return async ({ result }: { result: ActionResult }) => {
				if (result.type === 'success') {
					toastStore.show('Checkpoint deleted successfully', 'success');

					if (event.detail === $page.params.versionId) {
						if (updatedVersions.length > 0) {
							const sortedRemaining = [...updatedVersions].sort(
								(a, b) =>
									new Date(b.updated_at).getTime() -
									new Date(a.updated_at).getTime(),
							);
							// FIX: Use the correct school-based route
							goto(
								`/schools/${$page.params.school}/write/${$page.params.documentId}/${sortedRemaining[0].id}`,
							);
						} else {
							goto('/dashboard');
						}
					}
				} else {
					data.versions = [...data.versions, versionToDelete].sort(
						(a, b) =>
							new Date(b.updated_at).getTime() -
							new Date(a.updated_at).getTime(),
					);
					toastStore.show('Failed to delete checkpoint', 'error');
				}
				document.body.removeChild(form);
			};
		});
		form.submit();
	}

	// Event handlers
	function handleKeydown(event: KeyboardEvent) {
		if ((event.ctrlKey || event.metaKey) && event.key === 's') {
			event.preventDefault();
			event.stopPropagation();
			saveContent(true);
		}
	}

	// Navigation guards
	beforeNavigate(({ cancel }) => {
		if (browser && saveState.hasUnsavedChanges) {
			if (
				!confirm(
					"You have unsaved changes. Are you sure you want to leave? You'll lose your work.",
				)
			) {
				cancel();
			}
		}
	});

	function handleBeforeUnload(event: BeforeUnloadEvent) {
		if (saveState.hasUnsavedChanges) {
			if (autoSaveManager) {
				autoSaveManager.createBackup(
					$page.params.documentId,
					$page.params.versionId,
					documentTitle,
				);
			}
			event.preventDefault();
			event.returnValue =
				'You have unsaved changes. Are you sure you want to leave?';
			return event.returnValue;
		}
	}

	function handleSaveContent(event: { detail: boolean }) {
		const fromKeyboard = event.detail;
		saveContent(fromKeyboard);
	}

	function handleContentLocked(event: CustomEvent<{ locked: boolean }>) {
		const { locked } = event.detail;
		// Just log the state change, AIFeedback handles the editor directly
		console.log('Content lock state changed:', locked);
	}

	async function handleSaveRequired() {
		try {
			if (autoSaveManager) {
				await autoSaveManager.manualSave(false);
				console.log('Content saved before feedback generation');
			}
		} catch (error) {
			console.error('Failed to save content before feedback:', error);
			toastStore.show('Failed to save content. Please try again.', 'error');
			throw error;
		}
	}

	// Lifecycle management
	onMount(() => {
		if (browser) {
			window.addEventListener('beforeunload', handleBeforeUnload);
			window.addEventListener('keydown', handleKeydown);

			// Network status listeners
			window.addEventListener('online', () => {
				if (autoSaveManager) {
					autoSaveManager.setOnlineStatus(true);
				}
			});

			window.addEventListener('offline', () => {
				if (autoSaveManager) {
					autoSaveManager.setOnlineStatus(false);
				}
			});

			// Periodic connectivity check
			const connectivityInterval = setInterval(() => {
				if (autoSaveManager) {
					autoSaveManager.setOnlineStatus(navigator.onLine);
				}
			}, 5000);

			// Periodic backup
			const backupInterval = setInterval(() => {
				if (autoSaveManager && saveState.hasUnsavedChanges) {
					autoSaveManager.createBackup(
						$page.params.documentId,
						$page.params.versionId,
						documentTitle,
					);
				}
			}, 30000);

			const hash = window.location.hash;
			console.log('Page mounted with hash:', hash);

			if (hash === '#feedback') {
				// Wait a bit longer to ensure everything is loaded
				setTimeout(() => {
					scrollToFeedback();
				}, 500);
			}

			return () => {
				clearInterval(connectivityInterval);
				clearInterval(backupInterval);
			};
		}
	});

	onDestroy(() => {
		if (autoSaveManager) {
			autoSaveManager.cleanup();
		}

		if (browser) {
			window.removeEventListener('beforeunload', handleBeforeUnload);
			window.removeEventListener('keydown', handleKeydown);
		}
	});

	// Watch for editor initialization
	$: if (editor && !editorReady) {
		handleEditorReady();
	}

	let lastLoadedVersionId = data.currentVersion?.id;
	let lastLoadedVersionContent = data.currentVersion?.content;

	// Watch for version changes and reload content
	$: {
		const shouldLoadContent =
			editorReady &&
			data.currentVersion &&
			(data.currentVersion.id !== lastLoadedVersionId ||
				JSON.stringify(data.currentVersion.content) !==
					JSON.stringify(lastLoadedVersionContent));

		if (shouldLoadContent) {
			console.log('Loading content due to version/content change');
			console.log(
				'Version ID changed:',
				data.currentVersion.id !== lastLoadedVersionId,
			);
			console.log(
				'Content changed:',
				JSON.stringify(data.currentVersion.content) !==
					JSON.stringify(lastLoadedVersionContent),
			);

			loadVersionContent();
			lastLoadedVersionId = data.currentVersion.id;
			lastLoadedVersionContent = data.currentVersion.content;
		}
	}

	// Watch for hash changes during navigation
	$: if (
		browser &&
		$page.url.hash === '#feedback' &&
		editorReady &&
		contentLoaded
	) {
		console.log(
			'Hash changed to feedback, editor ready:',
			editorReady,
			'content loaded:',
			contentLoaded,
		);
		setTimeout(() => {
			scrollToFeedback();
		}, 100);
	}

	// Also trigger when editor becomes ready (in case hash was there before editor loaded)
	$: if (
		browser &&
		editorReady &&
		contentLoaded &&
		window.location.hash === '#feedback'
	) {
		console.log('Editor ready with feedback hash');
		setTimeout(() => {
			scrollToFeedback();
		}, 200);
	}

	// Get current checkpoint name for display
	$: currentVersion = data.versions.find(
		(v: ComponentVersion) => v.id === $page.params.versionId,
	);
	$: currentVersionName = currentVersion?.version_name || 'Unknown Checkpoint';
</script>

<svelte:head>
	<title>{documentTitle || 'Rich Text Editor'} | {WebsiteName}</title>
</svelte:head>

<div class="container">
	<header>
		<!-- Header with document controls -->
		<TopToolbar
			{wordCount}
			{wordCountLimit}
			{currentVersionName}
			zenMode={editorZenMode}
			{initialStatus}
			initialDueDate={data.document.due_date
				? new Date(data.document.due_date)
				: null}
			currentSchool={data.document.school || ''}
			schoolChangeDisabled={false}
			{saveState}
			{statusDisplay}
			on:updateWordCountLimit={handleWordCountLimitUpdate}
			on:toggleSidebar={toggleSidebar}
			on:updateStatus={handleStatusUpdate}
			on:updateDueDate={handleDueDateUpdate}
			on:updateSchool={handleSchoolUpdate}
			on:saveContent={handleSaveContent}
			on:downloadAsTxt={downloadAsTxt}
			on:downloadAsDoc={downloadAsDoc}
		/>
	</header>
	<div class="editor-container">
		<header class:zen-mode={editorZenMode} class="mb-8 lg:mb-12">
			<div class="w-full">
				<DocumentHeader
					documentTitle={documentTitle || ''}
					{documentPrompt}
					zenMode={editorZenMode}
					on:updateTitle={handleTitleUpdate}
					on:updatePrompt={handlePromptUpdate}
				/>
			</div>
		</header>

		<!-- Editor container -->
		<div class:px-4={editorZenMode}>
			<div class="min-h-[600px] rounded-xl">
				<TiptapEditor
					bind:editor
					bind:body={content}
					bind:zenMode={editorZenMode}
					bind:wordCountLimit
					bind:wordCount={currentWordCount}
					on:update={handleContentUpdate}
					on:wordCount={handleWordCountUpdate}
				/>
			</div>

			<!-- AI Feedback section -->
			<Section.Root anchor="feedback">
				<div id="feedback" class="feedback-section">
					<AIFeedback
						essayText={content}
						{wordCountLimit}
						{currentWordCount}
						existingFeedback={currentFeedback}
						disabled={!editorReady || !contentLoaded}
						{documentPrompt}
						{editor}
						on:feedbackReceived={handleFeedbackReceived}
						on:contentLocked={handleContentLocked}
						on:saveRequired={handleSaveRequired}
					/>
				</div>
			</Section.Root>
		</div>

		<!-- Checkpoint sidebar -->
		{#if isSidebarOpen}
			<div
				class="fixed inset-0 z-40 bg-black/50"
				transition:fade={{ duration: 200 }}
				on:click={() => (isSidebarOpen = false)}
				role="button"
				tabindex="0"
				on:keydown={(e) => e.key === 'Escape' && (isSidebarOpen = false)}
			></div>
			<div
				class="fixed right-0 top-0 z-50 h-screen"
				transition:slide={{ duration: 300, axis: 'x' }}
			>
				<VersionSidebar
					documentId={$page.params.documentId}
					currentVersionId={$page.params.versionId}
					versions={data.versions}
					schoolUrlSafeName={data.schoolUrlSafeName}
					on:createVersion={handleVersionCreate}
					on:renameVersion={handleVersionRename}
					on:duplicateVersion={handleVersionDuplicate}
					on:deleteVersion={handleVersionDelete}
					on:closeSidebar={closeSidebar}
				/>
			</div>
		{/if}

		<!-- Checkpoint Modal -->
		{#if showCheckpointModal}
			<dialog
				class="modal modal-open"
				transition:fade={{ duration: 200 }}
				open
				aria-label="Save checkpoint modal"
			>
				<!-- Use a button as a backdrop for proper accessibility -->
				<button
					class="modal-backdrop absolute inset-0 h-full w-full cursor-default bg-transparent"
					on:click={closeCheckpointModal}
					on:keydown={(e) => e.key === 'Escape' && closeCheckpointModal()}
					aria-label="Close modal"
				></button>
				<div class="modal-box" role="document">
					<div class="mb-4 flex items-center justify-between">
						<h3 class="text-lg font-semibold">Save Checkpoint</h3>
						<button
							type="button"
							class="btn btn-sm btn-circle btn-ghost"
							on:click={closeCheckpointModal}
							aria-label="Close modal"
						>
							<svg
								class="h-5 w-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>

					<div class="space-y-4">
						<p class="text-base-content/70 text-sm">
							Give this checkpoint a meaningful name to help you remember what
							progress you've made.
						</p>

						<div class="form-control">
							<label for="checkpoint-name-modal" class="label">
								<span class="label-text">Checkpoint Name</span>
							</label>
							<input
								id="checkpoint-name-modal"
								type="text"
								bind:value={checkpointModalName}
								on:keydown={(e) => {
									if (e.key === 'Enter') handleSaveNamedCheckpoint();
									if (e.key === 'Escape') closeCheckpointModal();
								}}
								class="input input-bordered"
								placeholder="e.g., First draft complete, Added conclusion, Final revision"
								disabled={isCreatingCheckpoint}
							/>
						</div>
					</div>

					<div class="modal-action">
						<button
							type="button"
							class="btn btn-ghost"
							on:click={closeCheckpointModal}
							disabled={isCreatingCheckpoint}
						>
							Cancel
						</button>

						<button
							type="button"
							class="btn btn-primary"
							on:click={handleSaveNamedCheckpoint}
							disabled={!checkpointModalName.trim() || isCreatingCheckpoint}
						>
							{#if isCreatingCheckpoint}
								<span class="loading loading-spinner loading-sm"></span>
								Saving...
							{:else}
								Save Checkpoint
							{/if}
						</button>
					</div>
				</div>
			</dialog>
		{/if}
	</div>
</div>

<style>
	/* Loading spinner */
	.loading-spinner {
		width: 16px;
		height: 16px;
		border: 2px solid transparent;
		border-top: 2px solid currentColor;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* Add feedback section styling */
	.feedback-section {
		margin-top: 2rem;
		margin-bottom: 2rem;
	}

	/* Ensure feedback section is properly spaced on mobile */
	@media (max-width: 768px) {
		.feedback-section {
			margin-top: 1.5rem;
			margin-bottom: 1.5rem;
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		* {
			transition: none !important;
			animation: none !important;
		}
	}

	.container {
		max-width: none;
		margin: 0 auto;
		padding: 1rem 0rem;
		min-height: 100vh;
		/* background: var(--color-base-300); */
	}

	.editor-container {
		max-width: 1400px;
		margin: 0 auto;
		min-height: 100vh;
	}

	header {
		margin-bottom: 2rem;
		background: transparent;
		border-radius: 0;
		padding: 0;
		box-shadow: none;
	}

	/* TipTap editor responsive styling */
	:global(.tiptap) {
		min-height: 800px;
		padding: 4rem 7rem;
		font-size: 18px;
		line-height: 1.6;
	}

	@media (max-width: 1400px) {
		:global(.tiptap) {
			padding: 4rem 5rem;
		}
	}

	@media (max-width: 1024px) {
		:global(.tiptap) {
			min-height: 700px;
			padding: 3rem 4rem;
			font-size: 18px;
			line-height: 1.5;
		}
	}

	@media (max-width: 768px) {
		.container {
			padding: 0.5rem;
			max-width: none;
		}

		header {
			margin-bottom: 1.5rem;
		}

		:global(.tiptap) {
			min-height: 400px;
			padding: 1.5rem 1.5rem;
			font-size: 17px;
			line-height: 1.4;
		}
	}

	@media (max-width: 480px) {
		.container {
			padding: 0.25rem;
		}

		:global(.tiptap) {
			min-height: 450px;
			padding: 1.5rem 2rem;
			font-size: 16px;
			line-height: 1.4;
		}
	}

	/* Print styles */
	@media print {
		/* .dropdown, */
		.btn {
			display: none !important;
		}
	}
</style>
