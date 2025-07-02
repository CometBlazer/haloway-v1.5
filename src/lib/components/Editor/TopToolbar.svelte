<!-- src/lib/components/Editor/TopToolbar.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { History, Download, FileText, Text, Save } from 'lucide-svelte';
	import {
		type DateValue,
		getLocalTimeZone,
		fromDate,
	} from '@internationalized/date';
	import WordCountEditor from './WordCountEditor.svelte';
	import StatusDropdown, {
		type Status,
	} from '$lib/components/Editor/StatusDropdown.svelte';
	import SchoolDropdown from '$lib/components/Editor/SchoolDropdown.svelte';
	import DatePicker from '$lib/components/Editor/DatePicker.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import Button from '$lib/components/ui/button/button.svelte';

	export let wordCount: number;
	export let wordCountLimit: number = 250;
	export let currentVersionName: string = 'Unknown Checkpoint';
	export let zenMode: boolean = false;
	export let initialStatus: Status = 'not-started';
	export let initialDueDate: Date | null = null;
	export let currentSchool: string = '';
	export let schoolChangeDisabled: boolean = false;

	// NEW: Save state props - import the actual types
	import type { SaveState } from '$lib/autosave';

	export let saveState: SaveState;
	export let statusDisplay: {
		text: string;
		class: string;
		icon: string; // Change to string to match getStatusDisplay return type
	};

	// Convert Date to DateValue for the DatePicker
	$: picked = initialDueDate
		? fromDate(initialDueDate, getLocalTimeZone())
		: undefined;

	const dispatch = createEventDispatcher<{
		updateWordCountLimit: number;
		toggleSidebar: void;
		updateStatus: Status;
		updateDueDate: Date | null;
		updateSchool: string;
		// NEW: Export and save events
		saveContent: boolean; // boolean indicates if from keyboard
		downloadAsTxt: void;
		downloadAsDoc: void;
	}>();

	let innerWidth = 0;
	let essayStatus: Status = initialStatus;

	function handleStatusChange(
		event: CustomEvent<{ status: Status; label: string }>,
	) {
		const newStatus = event.detail.status;
		essayStatus = newStatus;
		dispatch('updateStatus', newStatus);
	}

	function handleDueDateChange(date: DateValue | undefined) {
		const jsDate = date ? date.toDate(getLocalTimeZone()) : null;
		dispatch('updateDueDate', jsDate);
	}

	function handleSchoolChange(event: CustomEvent<string>) {
		const newSchool = event.detail;
		dispatch('updateSchool', newSchool);
	}

	function handleWordCountLimitUpdate(event: CustomEvent<number>) {
		dispatch('updateWordCountLimit', event.detail);
	}

	function handleToggleSidebar() {
		dispatch('toggleSidebar');
	}

	// NEW: Export and save handlers
	function handleSaveContent() {
		dispatch('saveContent', false);
	}

	function handleDownloadAsTxt() {
		dispatch('downloadAsTxt');
	}

	function handleDownloadAsDoc() {
		dispatch('downloadAsDoc');
	}

	// Reactive size based on screen width
	$: componentSize =
		innerWidth >= 1024
			? ('large' as const)
			: innerWidth >= 768
				? ('medium' as const)
				: ('small' as const);
	$: dropdownSize =
		innerWidth >= 1024
			? ('lg' as const)
			: innerWidth >= 768
				? ('md' as const)
				: innerWidth >= 640
					? ('sm' as const)
					: ('xs' as const);
</script>

<svelte:window bind:innerWidth />
<div class="document-header" class:zen-mode={zenMode}>
	<!-- Enhanced toolbar integrated into header -->
	<div class="enhanced-toolbar">
		<!-- Status Section -->
		<div class="status-section">
			<div
				class="status-indicator"
				class:status-saved={statusDisplay.class === 'saved'}
				class:status-saving={statusDisplay.class === 'saving' ||
					statusDisplay.class === 'retrying'}
				class:status-unsaved={statusDisplay.class === 'unsaved' ||
					statusDisplay.class === 'pending'}
				class:status-error={statusDisplay.class === 'error'}
				class:status-offline={statusDisplay.class === 'offline'}
				class:animate-pulse={saveState.status === 'error'}
			>
				<!-- Status Icon -->
				<div class="status-icon">
					{#if statusDisplay.icon === 'saved'}
						<svg
							class="h-4 w-4"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path d="M20 6L9 17l-5-5" />
						</svg>
					{:else if statusDisplay.icon === 'saving'}
						<div class="loading-spinner"></div>
					{:else if statusDisplay.icon === 'unsaved' || statusDisplay.icon === 'pending' || statusDisplay.icon === 'retrying'}
						<svg
							class="h-4 w-4"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<circle cx="12" cy="12" r="10" />
							<polyline points="12,6 12,12 16,14" />
						</svg>
					{:else if statusDisplay.icon === 'error'}
						<svg
							class="h-4 w-4"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<circle cx="12" cy="12" r="10" />
							<line x1="15" y1="9" x2="9" y2="15" />
							<line x1="9" y1="9" x2="15" y2="15" />
						</svg>
					{:else if statusDisplay.icon === 'offline'}
						<svg
							class="h-4 w-4"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path d="M3 12h18m-9-9v18" />
							<path d="M3 12L21 12" />
						</svg>
					{/if}
				</div>

				<!-- Status Text -->
				<span class="status-text">{statusDisplay.text}</span>
			</div>

			<!-- Manual Save Button (conditional) -->
			{#if saveState.status === 'error' || saveState.status === 'offline' || (saveState.hasUnsavedChanges && !saveState.isOnline)}
				<button
					on:click={handleSaveContent}
					class="save-button"
					class:save-error={saveState.status === 'error'}
					class:save-offline={saveState.status === 'offline'}
					disabled={saveState.status === 'saving' ||
						saveState.status === 'retrying'}
					title={saveState.status === 'error'
						? 'Auto-save failed - click to retry'
						: saveState.status === 'offline'
							? 'Currently offline'
							: 'Save changes manually'}
				>
					<Save size={16} />
					<span class="save-text">
						{#if saveState.status === 'error'}
							Retry Save
						{:else if saveState.status === 'offline'}
							Save When Online
						{:else}
							Save Now
						{/if}
					</span>
				</button>
			{/if}
		</div>

		<!-- Actions Section -->
		<div class="actions-section">
			<!-- Export Dropdown using shadcn-svelte -->
			<DropdownMenu.Root>
				<DropdownMenu.Trigger asChild let:builder>
					<Button
						builders={[builder]}
						variant="outline"
						size="sm"
						class="gap-2"
					>
						<Download size={18} />
						<span class="action-text">Export</span>
						<svg
							class="dropdown-arrow h-4 w-4"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<polyline points="6,9 12,15 18,9" />
						</svg>
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end" class="w-56">
					<DropdownMenu.Item on:click={handleDownloadAsTxt} class="gap-3">
						<Text size={16} />
						<div class="flex flex-col">
							<span class="font-medium">Plain Text</span>
							<span class="text-xs text-muted-foreground">.txt file</span>
						</div>
					</DropdownMenu.Item>
					<DropdownMenu.Item on:click={handleDownloadAsDoc} class="gap-3">
						<FileText size={16} />
						<div class="flex flex-col">
							<span class="font-medium">Word Document</span>
							<span class="text-xs text-muted-foreground">.doc file</span>
						</div>
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	</div>

	<!-- Unified Control Bar -->
	<div
		class="control-bar flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
	>
		<div class="flex flex-wrap items-center gap-3">
			<div class="date-picker-item">
				<DatePicker
					selectedDate={picked}
					onSelect={handleDueDateChange}
					size={componentSize}
					placeholder="Click to set due date"
				/>
			</div>
			<div class="status-dropdown-item">
				<StatusDropdown
					bind:currentStatus={essayStatus}
					on:statusChange={handleStatusChange}
					size={dropdownSize}
				/>
			</div>
			<div class="school-dropdown-item">
				<SchoolDropdown
					{currentSchool}
					disabled={schoolChangeDisabled}
					on:schoolChange={handleSchoolChange}
					size={componentSize}
				/>
			</div>
			<div class="control-item checkpoint-item">
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
			<div class="word-count-item block lg:hidden">
				<WordCountEditor
					{wordCount}
					{wordCountLimit}
					size={componentSize}
					on:updateWordCountLimit={handleWordCountLimitUpdate}
				/>
			</div>
		</div>

		<div class="word-count-item hidden lg:block">
			<WordCountEditor
				{wordCount}
				{wordCountLimit}
				size={componentSize}
				on:updateWordCountLimit={handleWordCountLimitUpdate}
			/>
		</div>
	</div>
</div>

<style>
	/* Enhanced toolbar styles */
	.enhanced-toolbar {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 1.5rem;
		border-radius: 1rem;
		margin-bottom: 1.5rem;
		flex-wrap: nowrap;
	}

	/* Status Section */
	.status-section {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.status-indicator {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.875rem;
		font-weight: 500;
		transition: all 0.2s ease;
	}

	.status-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.status-text {
		white-space: nowrap;
	}

	/* Status variants */
	.status-saved {
		background: hsl(var(--color-success) / 0.1);
		color: hsl(var(--color-success));
		border: 1px solid hsl(var(--color-success) / 0.2);
	}

	.status-saving {
		background: hsl(var(--color-info) / 0.1);
		color: hsl(var(--color-info));
		border: 1px solid hsl(var(--color-info) / 0.2);
	}

	.status-unsaved {
		background: hsl(var(--color-warning) / 0.1);
		color: hsl(var(--color-warning));
		border: 1px solid hsl(var(--color-warning) / 0.2);
	}

	.status-error {
		background: hsl(var(--color-error) / 0.1);
		color: hsl(var(--color-error));
		border: 1px solid hsl(var(--color-error) / 0.2);
	}

	.status-offline {
		background: hsl(var(--color-base-300) / 0.5);
		color: hsl(var(--color-base-content) / 0.7);
		border: 1px solid hsl(var(--color-base-300));
	}

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

	/* Save Button */
	.save-button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: hsl(var(--color-primary));
		color: white;
		border: none;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.save-button:hover:not(:disabled) {
		background: hsl(var(--color-primary) / 0.9);
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	.save-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
	}

	.save-button.save-error {
		background: hsl(var(--color-error));
	}

	.save-button.save-error:hover:not(:disabled) {
		background: hsl(var(--color-error) / 0.9);
	}

	.save-button.save-offline {
		background: hsl(var(--color-warning));
	}

	.save-button.save-offline:hover:not(:disabled) {
		background: hsl(var(--color-warning) / 0.9);
	}

	/* Actions Section */
	.actions-section {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.dropdown-arrow {
		width: 16px;
		height: 16px;
		transition: transform 0.2s ease;
	}

	:global([data-state='open']) .dropdown-arrow {
		transform: rotate(180deg);
	}

	/* Mobile Responsive */
	@media (max-width: 768px) {
		.enhanced-toolbar {
			display: flex;
			justify-content: right;
			gap: 1.5rem;
			margin-bottom: 1.5rem;
		}

		.status-section {
			width: 100%;
			justify-content: center;
		}

		.actions-section {
			width: 100%;
			justify-content: center;
		}

		.action-text,
		.save-text {
			display: none;
		}

		.status-text {
			font-size: 0.8rem;
		}
	}

	@media (max-width: 480px) {
		.status-indicator {
			padding: 0.375rem 0.5rem;
			font-size: 0.75rem;
		}

		.save-button {
			padding: 0.375rem 0.75rem;
			font-size: 0.75rem;
		}
	}

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
		background: hsl(var(--bg-background));
		border-radius: 0;
		padding: 0;
		box-shadow: none;
		border: none;
	}

	/* Unified Control Bar */
	.control-bar {
		margin-bottom: 1.5rem;
		padding: 1rem;
		background: hsl(var(--color-base-100) / 0.8);
		border: 1px solid hsl(var(--color-base-200));
		border-radius: 0.875rem;
		backdrop-filter: blur(8px);
		position: relative;
		z-index: 10;
	}

	/* Keep zen-mode and other non-layout styles */
	.zen-mode .control-bar {
		background: hsl(var(--color-base-100));
		border-color: hsl(var(--color-base-300));
		margin-bottom: 1rem;
		padding: 0.75rem;
		overflow: visible;
	}

	.control-item {
		display: flex;
		align-items: center;
		position: relative;
		z-index: auto;
		overflow: visible;
		flex-shrink: 0;
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

	/* All the container query and media query styles from the original */
	@container document-header (max-width: 1000px) {
		.control-bar {
			flex-direction: column;
			gap: 0.5rem;
			align-items: stretch;
			padding: 0.625rem 0.75rem;
		}

		.control-group {
			justify-content: center;
			flex-wrap: wrap;
			gap: 0.5rem;
		}

		.control-group.left,
		.control-group.right {
			width: 100%;
			justify-content: space-between;
		}

		.control-group.left {
			gap: 0.375rem;
		}

		.control-btn {
			flex: 1;
			min-width: 0;
			max-width: 160px;
			padding: 0.5rem 0.75rem;
			font-size: 0.75rem;
		}

		.checkpoint-btn {
			min-width: 80px;
		}

		.btn-label {
			font-size: 0.65rem;
		}

		.current-checkpoint {
			font-size: 0.7rem;
			max-width: 60px;
		}
	}

	/* Container query for small containers (mobile-like) */
	@container document-header (max-width: 600px) {
		.document-header {
			padding: 0.75rem;
		}

		.control-bar {
			margin-bottom: 0.75rem;
			padding: 0.5rem;
		}

		.control-group.left,
		.control-group.right {
			gap: 0.25rem;
		}

		.control-btn {
			padding: 0.375rem 0.6rem;
			font-size: 0.7rem;
			max-width: 100px;
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

		.date-picker-item :global(.date-picker-btn) {
			font-size: 0.75rem !important;
			padding: 0.375rem 0.625rem !important;
		}

		.status-dropdown-item :global(.status-btn) {
			font-size: 0.75rem !important;
			padding: 0.375rem 0.625rem !important;
		}

		.word-count-item :global(.word-count-badge) {
			font-size: 0.75rem !important;
			padding: 0.375rem 0.625rem !important;
		}

		.school-dropdown-item :global(.school-button) {
			font-size: 0.75rem !important;
			padding: 0.375rem 0.625rem !important;
		}
	}

	/* Container query for very small containers */
	@container document-header (max-width: 400px) {
		.document-header {
			padding: 0.5rem;
		}

		.control-bar {
			padding: 0.375rem;
			gap: 0.375rem;
		}

		.control-group.left,
		.control-group.right {
			gap: 0.2rem;
		}

		.control-btn {
			padding: 0.375rem 0.6rem;
			font-size: 0.65rem;
			min-width: 0;
			flex: 1;
			max-width: 80px;
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
				gap: 0.5rem;
				align-items: stretch;
				padding: 0.625rem 0.75rem;
			}

			.control-group {
				justify-content: center;
				flex-wrap: wrap;
				gap: 0.5rem;
			}

			.control-group.left,
			.control-group.right {
				width: 100%;
				justify-content: space-between;
			}

			.control-group.left {
				gap: 0.375rem;
			}

			.control-btn {
				flex: 1;
				min-width: 0;
				max-width: 160px;
				padding: 0.5rem 0.75rem;
				font-size: 0.75rem;
			}

			.checkpoint-btn {
				min-width: 80px;
			}
		}

		@media (max-width: 600px) {
			.document-header {
				padding: 0.75rem;
			}

			.control-bar {
				margin-bottom: 0.75rem;
				padding: 0.5rem;
			}

			.control-group.left,
			.control-group.right {
				gap: 0.25rem;
			}

			.control-btn {
				padding: 0.375rem 0.5rem;
				font-size: 0.7rem;
				max-width: 100px;
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
		}

		@media (max-width: 400px) {
			.document-header {
				padding: 0.5rem;
			}

			.control-bar {
				padding: 0.375rem;
				gap: 0.375rem;
			}

			.control-group.left,
			.control-group.right {
				gap: 0.2rem;
			}

			.control-btn {
				padding: 0.25rem 0.375rem;
				font-size: 0.65rem;
				min-width: 0;
				flex: 1;
				max-width: 80px;
			}

			.checkpoint-btn {
				min-width: 0;
			}
		}
	}

	/* Print styles */
	@media print {
		.control-bar {
			display: none !important;
		}

		.document-header {
			box-shadow: none !important;
			border: none !important;
		}
	}
</style>
