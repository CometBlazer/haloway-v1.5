<!-- src/lib/components/Editor/DocumentHeader.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { History } from 'lucide-svelte';
	import WordCountEditor from './WordCountEditor.svelte';
	import StatusDropdown, {
		type Status,
	} from '$lib/components/Editor/StatusDropdown.svelte';

	import DatePicker from '$lib/components/Editor/DatePicker.svelte';

	const focus = (node: HTMLElement) => {
		node.focus();
		return {};
	};

	export let documentTitle: string;
	export let documentPrompt: string;
	export let wordCount: number;
	export let wordCountLimit: number = 250;
	export let currentVersionName: string = 'Unknown Checkpoint';
	export let zenMode: boolean = false;
	export let initialStatus: Status = 'not-started';
	export let initialDueDate: Date | null = null;

	$: picked = initialDueDate;

	const dispatch = createEventDispatcher<{
		updateTitle: string;
		updatePrompt: string;
		updateWordCountLimit: number;
		toggleSidebar: void;
		updateStatus: Status;
		updateDueDate: Date | null;
	}>();

	let isEditingTitle = false;
	let isEditingPrompt = false;
	let tempTitle = documentTitle;
	let tempPrompt = documentPrompt;
	let originalTitle = documentTitle;
	let originalPrompt = documentPrompt;

	let essayStatus: Status = initialStatus;
	// let projectStatus: Status = "in-progress"

	function handleStatusChange(
		event: CustomEvent<{ status: Status; label: string }>,
	) {
		const newStatus = event.detail.status;
		essayStatus = newStatus;
		dispatch('updateStatus', newStatus);
	}

	function handleDueDateChange(date: Date) {
		picked = date;
		dispatch('updateDueDate', date);
	}

	function handleTitleSubmit() {
		const trimmedTitle = tempTitle.trim();
		if (trimmedTitle && trimmedTitle !== originalTitle) {
			dispatch('updateTitle', trimmedTitle);
			originalTitle = trimmedTitle;
		}
		isEditingTitle = false;
	}

	function handlePromptSubmit() {
		const trimmedPrompt = tempPrompt.trim();
		if (trimmedPrompt !== originalPrompt) {
			dispatch('updatePrompt', trimmedPrompt);
			originalTitle = trimmedPrompt;
		}
		isEditingPrompt = false;
	}

	function handleTitleCancel() {
		tempTitle = documentTitle;
		isEditingTitle = false;
	}

	function handlePromptCancel() {
		tempPrompt = documentPrompt;
		isEditingPrompt = false;
	}

	function handleKeydown(event: KeyboardEvent, type: 'title' | 'prompt') {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			if (type === 'title') {
				handleTitleSubmit();
			} else if (type === 'prompt') {
				handlePromptSubmit();
			}
		} else if (event.key === 'Escape') {
			if (type === 'title') {
				handleTitleCancel();
			} else if (type === 'prompt') {
				handlePromptCancel();
			}
		}
	}

	function handleWordCountLimitUpdate(event: CustomEvent<number>) {
		dispatch('updateWordCountLimit', event.detail);
	}

	function handleToggleSidebar() {
		dispatch('toggleSidebar');
	}

	// Update temp values when props change
	$: if (!isEditingTitle) {
		tempTitle = documentTitle;
		originalTitle = documentTitle;
	}
	$: if (!isEditingPrompt) {
		tempPrompt = documentPrompt;
		originalPrompt = documentPrompt;
	}
</script>

<div class="document-header" class:zen-mode={zenMode}>
	<!-- Unified Control Bar -->
	<div class="control-bar">
		<div class="control-group left">
			<div class="control-item">
				<DatePicker bind:selectedDate={picked} onSelect={handleDueDateChange} />
			</div>
			<div class="control-item">
				<button
					type="button"
					class="control-btn checkpoint-btn"
					on:click={handleToggleSidebar}
					title="Manage checkpoints"
				>
					<History size={16} />
					{#if !zenMode}
						<div class="btn-content">
							<span class="btn-label">Checkpoints</span>
							<span class="current-checkpoint">{currentVersionName}</span>
						</div>
					{/if}
				</button>
			</div>
		</div>

		<div class="control-group right">
			<div class="control-item">
				<StatusDropdown
					bind:currentStatus={essayStatus}
					on:statusChange={handleStatusChange}
				/>
			</div>
			<div class="control-item">
				<WordCountEditor
					{wordCount}
					{wordCountLimit}
					size="medium"
					on:updateWordCountLimit={handleWordCountLimitUpdate}
				/>
			</div>
		</div>
	</div>

	<div class="header-content">
		<!-- Title Section -->
		<div class="title-section">
			{#if isEditingTitle}
				<div class="title-input-wrapper">
					<input
						type="text"
						bind:value={tempTitle}
						on:blur={handleTitleSubmit}
						on:keydown={(e) => handleKeydown(e, 'title')}
						class="title-input"
						placeholder="Title (e.g., Harvard Supplement #1, Personal Statement)"
						aria-label="Document title"
						use:focus
					/>
					<div class="input-hint">Press Enter to save, Escape to cancel</div>
				</div>
			{:else}
				<button
					type="button"
					class="title-button"
					on:click={() => {
						isEditingTitle = true;
						tempTitle = documentTitle;
					}}
					on:keydown={(e) => e.key === 'Enter' && (isEditingTitle = true)}
				>
					<h1 class="document-title">
						{documentTitle || 'Untitled Document'}
					</h1>
					<svg class="edit-icon" viewBox="0 0 20 20" fill="currentColor">
						<path
							d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
						/>
					</svg>
				</button>
			{/if}
		</div>
	</div>

	<!-- Prompt Section -->
	<div class="prompt-section">
		{#if isEditingPrompt}
			<div class="prompt-input-wrapper">
				<textarea
					bind:value={tempPrompt}
					on:blur={handlePromptSubmit}
					on:keydown={(e) => handleKeydown(e, 'prompt')}
					class="prompt-textarea"
					placeholder="Paste your essay prompt here..."
					aria-label="Document prompt"
					use:focus
				></textarea>
				<div class="input-hint">
					Press Shift + Enter for new line, Enter to save, Escape to cancel
				</div>
			</div>
		{:else}
			<button
				type="button"
				class="prompt-button"
				on:click={() => {
					isEditingPrompt = true;
					tempPrompt = documentPrompt;
				}}
				on:keydown={(e) => e.key === 'Enter' && (isEditingPrompt = true)}
			>
				<div class="prompt-content">
					{#if documentPrompt}
						<div class="prompt-text">
							{documentPrompt}
						</div>
					{:else}
						<div class="prompt-placeholder">
							<svg
								class="placeholder-icon"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
									clip-rule="evenodd"
								/>
							</svg>
							<span>then copy paste your essay prompt here</span>
						</div>
					{/if}
					<svg class="edit-icon-small" viewBox="0 0 20 20" fill="currentColor">
						<path
							d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
						/>
					</svg>
				</div>
			</button>
		{/if}
	</div>
</div>

<style>
	/* Container Query Setup */
	.document-header {
		container-type: inline-size;
		container-name: document-header;
		width: 100%;
		background: hsl(var(--color-base-000));
		border-radius: 1.125rem;
		padding: 1.5rem;
		border: 1px solid hsl(var(--color-base-300));
		transition: all 0.3s ease;
		box-shadow:
			0 1px 3px 0 rgb(0 0 0 / 0.1),
			0 1px 2px -1px rgb(0 0 0 / 0.1);
	}

	.document-header.zen-mode {
		background: hsl(var(--color-base-100));
		border-radius: 0;
		padding: 0;
		box-shadow: none;
		border: none;
	}

	/* Unified Control Bar */
	.control-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.5rem;
		padding: 0.75rem 1rem;
		background: hsl(var(--color-base-100) / 0.8);
		border: 1px solid hsl(var(--color-base-200));
		border-radius: 0.875rem;
		backdrop-filter: blur(8px);
		position: relative;
		z-index: 10;
	}

	.zen-mode .control-bar {
		background: hsl(var(--color-base-100));
		border-color: hsl(var(--color-base-300));
		margin-bottom: 1rem;
		padding: 0.5rem 0.75rem;
		overflow: visible;
	}

	.control-group {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.control-group.left {
		flex-shrink: 0;
	}

	.control-group.right {
		flex-shrink: 0;
	}

	.control-item {
		display: flex;
		align-items: center;
		position: relative;
		z-index: auto;
		overflow: visible;
	}

	/* Enhanced Control Button Styles */
	.control-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 0.875rem;
		background: hsl(var(--color-base-000));
		border: 1px solid hsl(var(--color-base-300));
		border-radius: 0.625rem;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		font-size: 0.8125rem;
		font-weight: 500;
		color: hsl(var(--color-base-content));
		white-space: nowrap;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
	}

	.control-btn:hover {
		background: hsl(var(--color-base-100));
		border-color: hsl(var(--color-primary));
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.control-btn:focus {
		outline: 2px solid hsl(var(--color-primary));
		outline-offset: 2px;
	}

	.control-btn:active {
		transform: translateY(0);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.checkpoint-btn {
		min-width: 140px;
	}

	.zen-mode .checkpoint-btn {
		min-width: auto;
		padding: 0.625rem;
	}

	.btn-content {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		min-width: 0;
		flex: 1;
	}

	.btn-label {
		font-size: 0.7rem;
		font-weight: 600;
		line-height: 1;
		color: hsl(var(--color-neutral-content));
		margin-bottom: 0.125rem;
		text-transform: uppercase;
		letter-spacing: 0.025em;
		opacity: 0.8;
	}

	.current-checkpoint {
		font-size: 0.75rem;
		font-weight: 500;
		line-height: 1.2;
		color: hsl(var(--color-base-content));
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		width: 100%;
		max-width: 100px;
		opacity: 0.9;
	}

	/* Base Layout */
	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 2rem;
		margin-bottom: 0.25rem;
	}

	.zen-mode .header-content {
		margin-bottom: 0.25rem;
	}

	.title-section {
		flex: 1;
		min-width: 0;
	}

	.title-button {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		padding: 0.75rem 1rem;
		background: transparent;
		border: 2px dashed transparent;
		border-radius: 0.75rem;
		cursor: text;
		transition: all 0.2s ease;
		text-align: left;
	}

	.title-button:hover {
		background: hsl(var(--color-base-100));
		border-color: hsl(var(--color-primary));
	}

	.title-button:focus {
		outline: none;
		background: hsl(var(--color-base-100));
		border-color: hsl(var(--color-primary));
	}

	.document-title {
		font-size: 2rem;
		font-weight: 700;
		color: hsl(var(--color-base-content));
		margin: 0;
		line-height: 1.2;
	}

	.edit-icon {
		width: 1.25rem;
		height: 1.25rem;
		color: hsl(var(--color-base-content));
		opacity: 0;
		transition: opacity 0.2s ease;
	}

	.title-button:hover .edit-icon {
		opacity: 1;
	}

	.title-input-wrapper {
		position: relative;
		margin-bottom: 0.5rem;
	}

	.title-input {
		width: 100%;
		font-size: 2rem;
		font-weight: 700;
		color: hsl(var(--color-base-content));
		background: hsl(var(--color-base-100));
		border: 2px solid hsl(var(--color-primary));
		border-radius: 0.75rem;
		padding: 0.75rem 1rem;
		outline: none;
		transition: all 0.2s ease;
	}

	.title-input::placeholder {
		color: hsl(var(--color-base-400));
		font-weight: 400;
		font-style: italic;
	}

	/* Prompt Section */
	.prompt-section {
		position: relative;
	}

	.prompt-button {
		width: 100%;
		background: transparent;
		border: 2px dashed transparent;
		border-radius: 0.75rem;
		padding: 1rem;
		cursor: text;
		transition: all 0.2s ease;
		text-align: left;
	}

	.prompt-button:hover {
		background: hsl(var(--color-base-100) / 0.5);
		border-color: hsl(var(--color-primary));
	}

	.prompt-button:focus {
		outline: none;
		background: hsl(var(--color-base-100) / 0.5);
		border-color: hsl(var(--color-primary));
	}

	.prompt-content {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
	}

	.prompt-text {
		font-size: 1rem;
		line-height: 1.6;
		color: hsl(var(--color-base-content));
		white-space: pre-wrap;
		flex: 1;
	}

	.prompt-placeholder {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: hsl(var(--color-base-400));
		font-style: italic;
		flex: 1;
	}

	.placeholder-icon {
		width: 1rem;
		height: 1rem;
	}

	.edit-icon-small {
		width: 0.875rem;
		height: 0.875rem;
		color: hsl(var(--color-neutral-content));
		opacity: 0;
		transition: opacity 0.2s ease;
		flex-shrink: 0;
	}

	.prompt-button:hover .edit-icon-small {
		opacity: 1;
	}

	.prompt-input-wrapper {
		position: relative;
		margin-bottom: 0.5rem;
	}

	.prompt-textarea {
		width: 100%;
		min-height: 120px;
		font-size: 0.9375rem;
		line-height: 1.6;
		color: hsl(var(--color-base-content));
		background: hsl(var(--color-base-100));
		border: 2px solid hsl(var(--color-primary));
		border-radius: 0.75rem;
		padding: 1rem;
		outline: none;
		resize: vertical;
		transition: all 0.2s ease;
	}

	.prompt-textarea::placeholder {
		color: hsl(var(--color-base-400));
	}

	.input-hint {
		position: absolute;
		top: 100%;
		left: 0;
		margin-top: 0.5rem;
		font-size: 0.75rem;
		color: hsl(var(--color-base-content));
		background: hsl(var(--color-base-100));
		padding: 0.25rem 0.5rem;
		border-radius: 0.375rem;
		backdrop-filter: blur(4px);
		border: 1px solid hsl(var(--color-base-300));
		z-index: 25;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	/* Container Query for medium-sized containers (tablet-like) */
	@container document-header (max-width: 1000px) {
		.control-bar {
			flex-direction: column;
			gap: 0.75rem;
			align-items: stretch;
		}

		.control-group {
			justify-content: center;
			flex-wrap: wrap;
		}

		.control-group.left,
		.control-group.right {
			width: 100%;
			justify-content: space-between;
		}

		.control-btn {
			flex: 1;
			min-width: 0;
			max-width: 200px;
		}

		.checkpoint-btn {
			min-width: 120px;
		}

		.btn-label {
			font-size: 0.65rem;
		}

		.current-checkpoint {
			font-size: 0.7rem;
			max-width: 80px;
		}

		.document-title {
			font-size: 1.75rem;
		}

		.title-input {
			font-size: 1.75rem;
			padding: 0.625rem 0.875rem;
		}
	}

	/* Container query for small containers (mobile-like) */
	@container document-header (max-width: 600px) {
		.document-header {
			padding: 1rem;
		}

		.control-bar {
			margin-bottom: 1rem;
			padding: 0.5rem 0.75rem;
		}

		.control-group.left,
		.control-group.right {
			gap: 0.5rem;
		}

		.control-btn {
			padding: 0.5rem 0.75rem;
			font-size: 0.75rem;
			max-width: 150px;
		}

		.checkpoint-btn {
			min-width: 0;
		}

		.checkpoint-btn .btn-content {
			display: none;
		}

		.zen-mode .checkpoint-btn {
			padding: 0.5rem;
		}

		.document-title {
			font-size: 1.5rem;
		}

		.title-input {
			font-size: 1.5rem;
			padding: 0.5rem 0.75rem;
		}

		.prompt-button {
			padding: 0.75rem;
		}

		.prompt-textarea {
			padding: 0.75rem;
			min-height: 80px;
		}
	}

	/* Container query for very small containers */
	@container document-header (max-width: 400px) {
		.control-bar {
			padding: 0.375rem 0.5rem;
		}

		.control-group.left,
		.control-group.right {
			gap: 0.375rem;
		}

		.control-btn {
			padding: 0.5rem;
			font-size: 0.7rem;
			min-width: 0;
			flex: 1;
		}

		.checkpoint-btn {
			min-width: 0;
		}
	}

	/* Fallback media queries for browsers that don't support container queries */
	@supports not (container-type: inline-size) {
		@media (max-width: 1000px) {
			.control-bar {
				flex-direction: column;
				gap: 0.75rem;
				align-items: stretch;
			}

			.control-group {
				justify-content: center;
				flex-wrap: wrap;
			}

			.control-group.left,
			.control-group.right {
				width: 100%;
				justify-content: space-between;
			}

			.control-btn {
				flex: 1;
				min-width: 0;
				max-width: 200px;
			}

			.checkpoint-btn {
				min-width: 120px;
			}

			.document-title {
				font-size: 1.75rem;
			}

			.title-input {
				font-size: 1.75rem;
				padding: 0.625rem 0.875rem;
			}
		}

		@media (max-width: 600px) {
			.document-header {
				padding: 1rem;
			}

			.control-bar {
				margin-bottom: 1rem;
				padding: 0.5rem 0.75rem;
			}

			.control-group.left,
			.control-group.right {
				gap: 0.5rem;
			}

			.control-btn {
				padding: 0.5rem 0.75rem;
				font-size: 0.75rem;
				max-width: 150px;
			}

			.checkpoint-btn {
				min-width: 0;
			}

			.checkpoint-btn .btn-content {
				display: none;
			}

			.zen-mode .checkpoint-btn {
				padding: 0.5rem;
			}

			.document-title {
				font-size: 1.5rem;
			}

			.title-input {
				font-size: 1.5rem;
				padding: 0.5rem 0.75rem;
			}

			.prompt-button {
				padding: 0.75rem;
			}

			.prompt-textarea {
				padding: 0.75rem;
				min-height: 80px;
			}
		}

		@media (max-width: 400px) {
			.control-bar {
				padding: 0.375rem 0.5rem;
			}

			.control-group.left,
			.control-group.right {
				gap: 0.375rem;
			}

			.control-btn {
				padding: 0.5rem;
				font-size: 0.7rem;
				min-width: 0;
				flex: 1;
			}

			.checkpoint-btn {
				min-width: 0;
			}

			.document-title {
				font-size: 1.25rem;
			}

			.title-input {
				font-size: 1.25rem;
				padding: 0.5rem 0.625rem;
			}
		}
	}

	/* Print styles */
	@media print {
		.control-bar,
		.edit-icon,
		.edit-icon-small,
		.input-hint {
			display: none !important;
		}

		.title-button,
		.prompt-button {
			border: none !important;
			background: transparent !important;
			padding: 0 !important;
		}

		.document-header {
			box-shadow: none !important;
			border: none !important;
		}
	}
</style>
