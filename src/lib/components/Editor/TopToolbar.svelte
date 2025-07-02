<!-- src/lib/components/Editor/DocumentHeader.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { History } from 'lucide-svelte';
	import {
		// DateFormatter,
		type DateValue,
		getLocalTimeZone,
		fromDate,
		// toCalendarDate,
	} from '@internationalized/date';
	import WordCountEditor from './WordCountEditor.svelte';
	import StatusDropdown, {
		type Status,
	} from '$lib/components/Editor/StatusDropdown.svelte';
	import SchoolDropdown from '$lib/components/Editor/SchoolDropdown.svelte';
	import DatePicker from '$lib/components/Editor/DatePicker.svelte';

	// const focus = (node: HTMLElement) => {
	// 	node.focus();
	// 	return {};
	// };

	export let wordCount: number;
	export let wordCountLimit: number = 250;
	export let currentVersionName: string = 'Unknown Checkpoint';
	export let zenMode: boolean = false;
	export let initialStatus: Status = 'not-started';
	export let initialDueDate: Date | null = null;
	export let currentSchool: string = '';
	export let schoolChangeDisabled: boolean = false;

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
		// Convert DateValue back to Date for the parent component
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

	/* .control-row {
		display: flex;
		align-items: center;
		justify-content: normal;
		gap: 0.75rem;
		width: 100%;
	} */

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
	/* Container Query for medium-sized containers (tablet-like) */
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
