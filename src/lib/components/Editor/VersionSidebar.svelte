<!-- src/lib/components/Editor/VersionSidebar.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { createEventDispatcher } from 'svelte';
	import { formatDistanceToNow } from 'date-fns';
	import { Bookmark, X, History, Edit2, Copy, Trash2 } from 'lucide-svelte';
	import type { ComponentVersion } from '../../../DatabaseDefinitions';
	import { enhance } from '$app/forms';

	export let documentId: string;
	export let currentVersionId: string;
	export let versions: ComponentVersion[];

	const dispatch = createEventDispatcher<{
		createVersion: { name: string };
		renameVersion: { id: string; name: string };
		duplicateVersion: string;
		deleteVersion: string;
		closeSidebar: void;
	}>();

	let isCreatingVersion = false;
	let newVersionName = '';
	let renamingVersionId: string | null = null;
	let tempVersionName = '';

	// Loading states
	let isCreatingLoading = false;
	let isRenamingLoading = false;
	let isDuplicatingId: string | null = null;
	let isDeletingId: string | null = null;

	const focus = (node: HTMLElement) => {
		node.focus();
		return {};
	};

	// Enhanced submit function for form enhancement
	const handleCreateVersion = ({
		formData,
		cancel,
	}: {
		formData: FormData;
		cancel: () => void;
	}) => {
		isCreatingLoading = true;

		// Optional: Add any pre-submit validation here
		const name = formData.get('name') as string;
		if (!name?.trim()) {
			cancel();
			isCreatingLoading = false;
			return;
		}

		return async ({
			result,
			update,
		}: {
			result: { type: string; data?: { version?: ComponentVersion } };
			update: () => Promise<void>;
		}) => {
			isCreatingLoading = false;

			if (result.type === 'success' && result.data?.version) {
				const version = result.data.version as ComponentVersion;
				// Update the versions array in-memory
				versions = [version, ...versions];
				// Navigate to the new version
				await goto(`/dashboard/write/${documentId}/${version.id}`, {
					replaceState: true,
				});
				// Reset form state
				newVersionName = '';
				isCreatingVersion = false;
			} else if (result.type === 'failure') {
				// Handle validation errors
				console.error('Failed to create checkpoint:', result.data);
				// You might want to show the error to the user
			} else {
				// Handle other error types
				console.error('Unexpected result:', result);
			}

			// Update the page data if needed
			await update();
		};
	};

	function handleRenameVersion() {
		if (renamingVersionId && tempVersionName.trim()) {
			isRenamingLoading = true;
			dispatch('renameVersion', {
				id: renamingVersionId,
				name: tempVersionName,
			});
			// Reset state after delay
			setTimeout(() => {
				renamingVersionId = null;
				tempVersionName = '';
				isRenamingLoading = false;
			}, 1000);
		}
	}

	function handleDuplicateVersion(versionId: string) {
		isDuplicatingId = versionId;
		dispatch('duplicateVersion', versionId);
		// Reset after delay
		setTimeout(() => {
			isDuplicatingId = null;
		}, 1000);
	}

	function handleDeleteVersion(versionId: string) {
		if (
			confirm(
				'Are you sure you want to permanently delete this checkpoint? This action cannot be undone.',
			)
		) {
			isDeletingId = versionId;
			dispatch('deleteVersion', versionId);
			// Reset after delay
			setTimeout(() => {
				isDeletingId = null;
			}, 1000);
		}
	}

	function startRename(version: (typeof versions)[0]) {
		renamingVersionId = version.id;
		tempVersionName = version.version_name;
	}

	function cancelRename() {
		renamingVersionId = null;
		tempVersionName = '';
		isRenamingLoading = false;
	}

	// Navigate to version - simplified approach without form submission
	function navigateToVersion(versionId: string) {
		if (versionId === currentVersionId) {
			// Already on this version, just close sidebar
			closeSidebar();
			return;
		}

		// Navigate directly - the server load function will handle setting current_version_id
		goto(`/dashboard/write/${documentId}/${versionId}`);
		closeSidebar();
	}

	function closeSidebar() {
		dispatch('closeSidebar');
	}

	// Get current version name for display
	$: currentVersion = versions.find((v) => v.id === currentVersionId);
	$: currentVersionName = currentVersion?.version_name || 'Unknown Checkpoint';

	// Parse dates safely
	function parseDate(dateString: string): Date {
		try {
			return new Date(dateString);
		} catch {
			return new Date();
		}
	}

	// Sort versions by updated_at desc (most recent first)
	$: sortedVersions = [...versions].sort((a, b) => {
		// 1) always put the "current" checkpoint first
		if (a.id === currentVersionId) return -1;
		if (b.id === currentVersionId) return 1;
		// 2) otherwise, sort by updated_at descending
		return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
	});
</script>

<div class="checkpoint-sidebar">
	<!-- Header -->
	<div class="sidebar-header">
		<div class="header-content">
			<div class="header-icon">
				<History size={20} class="icon-primary" />
			</div>
			<div class="header-text">
				<h2 class="sidebar-title">Checkpoint Manager</h2>
				<p class="sidebar-description">
					Current: <span class="current-checkpoint">{currentVersionName}</span>
				</p>
			</div>
		</div>

		<button
			type="button"
			class="close-btn"
			on:click={closeSidebar}
			aria-label="Close checkpoint sidebar"
		>
			<X size={18} />
		</button>
	</div>

	<!-- Status Messages -->
	{#if isCreatingLoading || isRenamingLoading || isDuplicatingId || isDeletingId}
		<div class="status-section">
			{#if isCreatingLoading}
				<div class="status-message creating">
					<div class="spinner"></div>
					<span>Creating checkpoint...</span>
				</div>
			{/if}

			{#if isRenamingLoading}
				<div class="status-message renaming">
					<div class="spinner"></div>
					<span>Renaming checkpoint...</span>
				</div>
			{/if}

			{#if isDuplicatingId}
				<div class="status-message duplicating">
					<div class="spinner"></div>
					<span>Duplicating checkpoint...</span>
				</div>
			{/if}

			{#if isDeletingId}
				<div class="status-message deleting">
					<div class="spinner"></div>
					<span>Deleting checkpoint...</span>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Create New Checkpoint -->
	<div class="create-section">
		{#if isCreatingVersion}
			<form
				method="POST"
				action="?/createVersion"
				use:enhance={handleCreateVersion}
				class="create-form"
			>
				<input type="hidden" name="documentId" value={documentId} />

				<div class="form-control">
					<label for="checkpoint-name" class="form-label">
						<span class="label-text">Checkpoint Name:</span>
					</label>
					<input
						id="checkpoint-name"
						name="name"
						type="text"
						bind:value={newVersionName}
						on:keydown={(e) => {
							if (e.key === 'Escape') {
								isCreatingVersion = false;
								newVersionName = '';
							}
						}}
						class="form-input"
						placeholder="e.g., First draft complete"
						use:focus
						disabled={isCreatingLoading}
						required
					/>
				</div>

				<div class="form-actions">
					<button
						type="submit"
						class="primary-btn flex-1"
						disabled={!newVersionName.trim() || isCreatingLoading}
					>
						{#if isCreatingLoading}
							<div class="spinner spinner-sm"></div>
							Creating…
						{:else}
							<Bookmark size={16} />
							Save Checkpoint
						{/if}
					</button>

					<button
						type="button"
						class="secondary-btn"
						on:click={() => {
							isCreatingVersion = false;
							newVersionName = '';
						}}
						disabled={isCreatingLoading}
					>
						Cancel
					</button>
				</div>
			</form>
		{:else}
			<button
				type="button"
				class="primary-btn w-full"
				on:click={() => {
					// generate your default timestamped name
					const now = new Date();
					newVersionName = `Checkpoint ${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
					isCreatingVersion = true;
				}}
				disabled={isCreatingLoading}
			>
				<Bookmark size={18} />
				Save Checkpoint
			</button>

			<div class="create-hint">
				Capture your current progress. You can always come back to this
				checkpoint or start from here again.
			</div>
		{/if}
	</div>

	<!-- Checkpoints List -->
	<div class="checkpoints-section">
		<div class="section-header">
			<h3 class="section-title">Your Checkpoints</h3>
			<span class="counter-badge">{versions.length}</span>
		</div>

		<div class="checkpoints-list">
			{#each sortedVersions as version (version.id)}
				<div
					class="checkpoint-card"
					class:current={version.id === currentVersionId}
					class:deleting={isDeletingId === version.id}
				>
					{#if renamingVersionId === version.id}
						<!-- Rename Mode -->
						<div class="rename-form">
							<div class="form-control">
								<input
									type="text"
									bind:value={tempVersionName}
									on:keydown={(e) => {
										if (e.key === 'Enter') handleRenameVersion();
										if (e.key === 'Escape') cancelRename();
									}}
									class="form-input form-input-sm"
									placeholder="Checkpoint name"
									use:focus
									disabled={isRenamingLoading}
								/>
							</div>

							<div class="form-actions">
								<button
									type="button"
									class="primary-btn btn-sm"
									on:click={handleRenameVersion}
									disabled={!tempVersionName.trim() || isRenamingLoading}
								>
									{#if isRenamingLoading}
										<div class="spinner spinner-xs"></div>
										Saving...
									{:else}
										Save
									{/if}
								</button>

								<button
									type="button"
									class="secondary-btn btn-sm"
									on:click={cancelRename}
									disabled={isRenamingLoading}
								>
									Cancel
								</button>
							</div>
						</div>
					{:else}
						<!-- Normal Display Mode -->
						<div class="checkpoint-content">
							<!-- Main Info (Clickable) -->
							<button
								type="button"
								class="checkpoint-main"
								on:click={() => navigateToVersion(version.id)}
								disabled={isDeletingId === version.id}
							>
								<div class="checkpoint-header">
									<div class="checkpoint-name">
										{version.version_name}
									</div>
									{#if version.id === currentVersionId}
										<span class="current-badge">Current</span>
									{/if}
								</div>

								<div class="checkpoint-meta">
									<div class="checkpoint-timestamps">
										<span class="checkpoint-time created">
											Created {formatDistanceToNow(
												parseDate(version.created_at),
												{
													addSuffix: true,
												},
											)}
										</span>
										<span class="checkpoint-time edited">
											Last edited {formatDistanceToNow(
												parseDate(version.updated_at),
												{
													addSuffix: true,
												},
											)}
										</span>
									</div>
								</div>
							</button>

							<!-- Actions -->
							<div class="checkpoint-actions">
								<button
									type="button"
									class="action-btn"
									on:click={() => startRename(version)}
									disabled={isDeletingId === version.id || isRenamingLoading}
									title="Rename Checkpoint"
								>
									<Edit2 size={14} />
								</button>

								<button
									type="button"
									class="action-btn"
									on:click={() => handleDuplicateVersion(version.id)}
									disabled={isDuplicatingId === version.id ||
										isDeletingId === version.id}
									title="Duplicate Checkpoint"
								>
									{#if isDuplicatingId === version.id}
										<div class="spinner spinner-xs"></div>
									{:else}
										<Copy size={14} />
									{/if}
								</button>

								{#if versions.length > 1 && version.id !== currentVersionId && !version.id.startsWith('temp-')}
									<button
										type="button"
										class="action-btn delete"
										on:click={() => handleDeleteVersion(version.id)}
										disabled={isDeletingId === version.id}
										title="Delete Checkpoint"
									>
										{#if isDeletingId === version.id}
											<div class="spinner spinner-xs"></div>
										{:else}
											<Trash2 size={14} />
										{/if}
									</button>
								{/if}
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.checkpoint-sidebar {
		height: 100vh;
		width: 380px;
		background: hsl(var(--color-base-100));
		border-left: 1px solid hsl(var(--color-base-300));
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	/* Header */
	.sidebar-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		padding: 1.5rem;
		border-bottom: 1px solid hsl(var(--color-base-200));
		background: hsl(var(--color-base-100) / 0.8);
	}

	.header-content {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		flex: 1;
	}

	.header-icon {
		padding: 0.5rem;
		background: hsl(var(--color-primary) / 0.1);
		border-radius: 0.5rem;
		flex-shrink: 0;
	}

	/* .icon-primary {
		color: hsl(var(--color-primary));
	} */

	.header-text {
		flex: 1;
		min-width: 0;
	}

	.sidebar-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: hsl(var(--color-base-content));
		margin: 0 0 0.25rem 0;
		line-height: 1.3;
	}

	.sidebar-description {
		font-size: 0.875rem;
		color: hsl(var(--color-neutral-content));
		margin: 0;
		line-height: 1.4;
	}

	.current-checkpoint {
		font-weight: 500;
		color: hsl(var(--color-primary));
	}

	.close-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		background: transparent;
		border: none;
		border-radius: 50%;
		color: hsl(var(--color-base-content));
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.close-btn:hover {
		background: hsl(var(--color-base-200));
	}

	.close-btn:focus {
		outline: 2px solid hsl(var(--color-primary));
		outline-offset: 2px;
	}

	/* Status Section */
	.status-section {
		padding: 1rem 1.5rem;
		border-bottom: 1px solid hsl(var(--color-base-200));
		background: hsl(var(--color-base-100) / 0.8);
	}

	.status-message {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		padding: 0.5rem 0;
	}

	.status-message.creating,
	.status-message.renaming,
	.status-message.duplicating {
		color: hsl(var(--color-primary));
	}

	.status-message.deleting {
		color: hsl(var(--color-error));
	}

	/* Spinner */
	.spinner {
		width: 1rem;
		height: 1rem;
		border: 2px solid hsl(var(--color-base-300));
		border-top: 2px solid currentColor;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	.spinner-sm {
		width: 0.875rem;
		height: 0.875rem;
	}

	.spinner-xs {
		width: 0.75rem;
		height: 0.75rem;
		border-width: 1.5px;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	/* Create Section */
	.create-section {
		padding: 1.5rem;
		border-bottom: 1px solid hsl(var(--color-base-200));
	}

	.create-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.form-control {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form-label {
		display: block;
		margin-bottom: 0.5rem;
	}

	.label-text {
		font-weight: 600;
		font-size: 0.875rem;
		color: hsl(var(--color-base-content));
	}

	.form-input {
		width: 100%;
		padding: 0.75rem;
		background: hsl(var(--color-base-000));
		border: 1px solid hsl(var(--color-base-300));
		border-radius: 0.375rem;
		font-size: 0.875rem;
		color: hsl(var(--color-base-content));
		transition: all 0.2s ease;
	}

	.form-input:focus {
		outline: none;
		border-color: hsl(var(--color-primary));
		box-shadow: 0 0 0 3px hsl(var(--color-primary) / 0.1);
	}

	.form-input::placeholder {
		color: hsl(var(--color-base-400));
	}

	.form-input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.form-input-sm {
		padding: 0.5rem;
		font-size: 0.8125rem;
	}

	.form-actions {
		display: flex;
		gap: 0.5rem;
	}

	/* Buttons */
	.primary-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: hsl(var(--color-primary));
		color: hsl(var(--color-primary-content));
		border: 1px solid hsl(var(--color-primary));
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		text-decoration: none;
	}

	.primary-btn:hover:not(:disabled) {
		background: hsl(var(--color-primary) / 0.9);
	}

	.primary-btn:focus {
		outline: 2px solid hsl(var(--color-primary));
		outline-offset: 2px;
	}

	.primary-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.secondary-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: transparent;
		color: hsl(var(--color-base-content));
		border: 1px solid hsl(var(--color-base-300));
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.secondary-btn:hover:not(:disabled) {
		background: hsl(var(--color-base-200));
	}

	.secondary-btn:focus {
		outline: 2px solid hsl(var(--color-primary));
		outline-offset: 2px;
	}

	.secondary-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-sm {
		padding: 0.375rem 0.75rem;
		font-size: 0.8125rem;
	}

	.w-full {
		width: 100%;
	}

	.flex-1 {
		flex: 1;
	}

	.create-hint {
		margin-top: 0.75rem;
		font-size: 0.8125rem;
		color: hsl(var(--color-neutral-content));
		line-height: 1.4;
		font-style: italic;
	}

	/* Checkpoints Section */
	.checkpoints-section {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.5rem 0.75rem 1.5rem;
	}

	.section-title {
		font-size: 0.9375rem;
		font-weight: 600;
		color: hsl(var(--color-base-content));
		margin: 0;
	}

	.counter-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.125rem 0.5rem;
		background: hsl(var(--color-neutral));
		color: hsl(var(--color-neutral-content));
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 500;
	}

	.checkpoints-list {
		flex: 1;
		overflow-y: auto;
		padding: 0 1.5rem 1.5rem 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	/* Checkpoint Cards */
	.checkpoint-card {
		border: 1px solid hsl(var(--color-base-200));
		border-radius: 0.75rem;
		background: hsl(var(--color-base-100));
		transition: all 0.2s ease;
	}

	.checkpoint-card:hover {
		border-color: hsl(var(--color-base-300));
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
	}

	.checkpoint-card.current {
		border-color: hsl(var(--color-primary));
		background: hsl(var(--color-primary) / 0.05);
		box-shadow: 0 0 0 1px hsl(var(--color-primary) / 0.1);
	}

	.checkpoint-card.deleting {
		opacity: 0.6;
		pointer-events: none;
	}

	.checkpoint-content {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem;
	}

	.checkpoint-main {
		background: none;
		border: none;
		padding: 0;
		text-align: left;
		cursor: pointer;
		width: 100%;
		transition: all 0.2s ease;
		color: hsl(var(--color-base-content));
	}

	.checkpoint-main:hover:not(:disabled) {
		opacity: 0.8;
	}

	.checkpoint-main:focus {
		outline: 2px solid hsl(var(--color-primary));
		outline-offset: 2px;
		border-radius: 0.25rem;
	}

	.checkpoint-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.75rem;
		margin-bottom: 0.5rem;
	}

	.checkpoint-name {
		font-size: 0.9375rem;
		font-weight: 600;
		color: hsl(var(--color-base-content));
		line-height: 1.3;
		flex: 1;
	}

	.current-badge {
		display: inline-flex;
		align-items: center;
		padding: 0.125rem 0.5rem;
		background: hsl(var(--color-primary));
		color: hsl(var(--color-primary-content));
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 500;
		flex-shrink: 0;
	}

	.checkpoint-meta {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.checkpoint-timestamps {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.checkpoint-time {
		font-size: 0.8125rem;
		color: hsl(var(--color-neutral-content));
	}

	.checkpoint-time.created {
		opacity: 0.8;
	}

	.checkpoint-time.edited {
		font-weight: 500;
		color: hsl(var(--color-primary));
	}

	.checkpoint-actions {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding-top: 0.5rem;
		border-top: 1px solid hsl(var(--color-base-200));
	}

	.action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		background: transparent;
		border: none;
		border-radius: 0.375rem;
		cursor: pointer;
		transition: all 0.2s ease;
		color: hsl(var(--color-neutral-content));
	}

	.action-btn:hover:not(:disabled) {
		background: hsl(var(--color-base-200));
		color: hsl(var(--color-base-content));
	}

	.action-btn:focus {
		outline: 2px solid hsl(var(--color-primary));
		outline-offset: 2px;
	}

	.action-btn.delete {
		color: hsl(var(--color-error));
	}

	.action-btn.delete:hover:not(:disabled) {
		background: hsl(var(--color-error) / 0.1);
		color: hsl(var(--color-error));
	}

	.action-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Rename Form */
	.rename-form {
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	/* Scrollbar */
	.checkpoints-list::-webkit-scrollbar {
		width: 6px;
	}

	.checkpoints-list::-webkit-scrollbar-track {
		background: transparent;
	}

	.checkpoints-list::-webkit-scrollbar-thumb {
		background: hsl(var(--color-base-300));
		border-radius: 3px;
	}

	.checkpoints-list::-webkit-scrollbar-thumb:hover {
		background: hsl(var(--color-base-400));
	}

	/* Mobile Responsiveness */
	@media (max-width: 768px) {
		.checkpoint-sidebar {
			width: 100vw;
		}

		.sidebar-header {
			padding: 1rem;
		}

		.create-section {
			padding: 1rem;
		}

		.checkpoints-list {
			padding: 0 1rem 1rem 1rem;
		}

		.section-header {
			padding: 0.75rem 1rem 0.5rem 1rem;
		}

		.form-actions {
			flex-direction: column;
		}

		.checkpoint-actions {
			justify-content: center;
		}
	}

	/* Touch handling */
	.primary-btn,
	.secondary-btn,
	.action-btn,
	.close-btn,
	.checkpoint-main {
		-webkit-tap-highlight-color: transparent;
		touch-action: manipulation;
	}

	/* High contrast mode support */
	@media (prefers-contrast: high) {
		.checkpoint-sidebar {
			border-left-width: 2px;
		}

		.sidebar-header {
			border-bottom-width: 2px;
		}

		.checkpoint-card {
			border-width: 2px;
		}

		.form-input {
			border-width: 2px;
		}

		.primary-btn,
		.secondary-btn {
			border-width: 2px;
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		* {
			transition: none !important;
			animation: none !important;
		}
	}

	/* Focus visible for better accessibility */
	.primary-btn:focus-visible,
	.secondary-btn:focus-visible,
	.action-btn:focus-visible,
	.close-btn:focus-visible,
	.checkpoint-main:focus-visible,
	.form-input:focus-visible {
		outline: 2px solid hsl(var(--color-primary));
		outline-offset: 2px;
	}

	/* Dark mode adjustments */
	@media (prefers-color-scheme: dark) {
		.sidebar-header {
			background: hsl(var(--color-base-200));
		}

		.status-section {
			background: hsl(var(--color-base-200));
		}

		.checkpoint-card.current {
			background: hsl(var(--color-primary) / 0.1);
		}
	}
</style>
