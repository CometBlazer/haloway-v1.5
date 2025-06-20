<!-- src/lib/components/Editor/WordCountEditor.svelte -->
<script lang="ts">
	// import { Pencil } from "lucide-svelte"
	import { createEventDispatcher } from 'svelte';

	const focus = (node: HTMLElement) => {
		node.focus();
		return {};
	};

	export let wordCount: number;
	export let wordCountLimit: number = 250;
	export let size: 'small' | 'medium' | 'large' = 'medium';

	const dispatch = createEventDispatcher<{
		updateWordCountLimit: number;
	}>();

	let isEditingWordCount = false;
	let tempWordCountLimit = wordCountLimit;
	let originalWordCountLimit = wordCountLimit;

	function isValidWordCountLimit(value: number): boolean {
		// Must be a positive integer between 1 and 10,000
		return Number.isInteger(value) && value >= 1 && value <= 10000;
	}

	function handleWordCountSubmit() {
		// Validate the input
		if (!isValidWordCountLimit(tempWordCountLimit)) {
			// Invalid input - cancel changes and revert
			handleWordCountCancel();
			return;
		}

		// Only dispatch if the value actually changed
		if (tempWordCountLimit !== originalWordCountLimit) {
			dispatch('updateWordCountLimit', tempWordCountLimit);
			originalWordCountLimit = tempWordCountLimit;
		}
		isEditingWordCount = false;
	}

	function handleWordCountCancel() {
		tempWordCountLimit = wordCountLimit;
		isEditingWordCount = false;
	}

	function handleInputChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const value = target.value;

		// Allow empty string for intermediate editing
		if (value === '') {
			tempWordCountLimit = 0;
			return;
		}

		// Parse the input
		const numValue = parseFloat(value);

		// If it's not a valid number, revert to previous valid value
		if (isNaN(numValue)) {
			target.value = tempWordCountLimit.toString();
			return;
		}

		// Convert to integer (truncate decimals)
		const intValue = Math.floor(Math.abs(numValue)); // Remove decimals and make positive

		// Clamp to valid range
		const clampedValue = Math.max(1, Math.min(10000, intValue));

		// Update the input field and temp value
		tempWordCountLimit = clampedValue;
		target.value = clampedValue.toString();
	}

	function handleKeydown(event: KeyboardEvent) {
		// Allow: backspace, delete, tab, escape, enter
		if (
			[8, 9, 27, 13, 46].indexOf(event.keyCode) !== -1 ||
			// Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
			(event.keyCode === 65 && event.ctrlKey === true) ||
			(event.keyCode === 67 && event.ctrlKey === true) ||
			(event.keyCode === 86 && event.ctrlKey === true) ||
			(event.keyCode === 88 && event.ctrlKey === true)
		) {
			if (event.key === 'Enter' && !event.shiftKey) {
				event.preventDefault();
				handleWordCountSubmit();
				return;
			} else if (event.key === 'Escape') {
				handleWordCountCancel();
				return;
			}

			return; // Let it happen, don't do anything
		}

		// Ensure that it is a number and stop the keypress
		if (
			(event.shiftKey || event.keyCode < 48 || event.keyCode > 57) &&
			(event.keyCode < 96 || event.keyCode > 105)
		) {
			event.preventDefault();
		}
	}

	function handlePaste(event: ClipboardEvent) {
		event.preventDefault();
		const paste = event.clipboardData?.getData('text') || '';
		const numValue = parseFloat(paste);

		if (!isNaN(numValue)) {
			const intValue = Math.floor(Math.abs(numValue));
			const clampedValue = Math.max(1, Math.min(10000, intValue));
			tempWordCountLimit = clampedValue;

			const target = event.target as HTMLInputElement;
			target.value = clampedValue.toString();
		}
	}

	// Update temp values when props change
	$: if (!isEditingWordCount) {
		tempWordCountLimit = wordCountLimit;
		originalWordCountLimit = wordCountLimit;
	}

	// Calculate word count status
	$: isNearLimit = wordCount >= wordCountLimit * 0.8;
	$: isAtLimit = wordCount == wordCountLimit;
	$: isOverLimit = wordCount > wordCountLimit;
</script>

{#if isEditingWordCount}
	<div
		class="word-count-input-wrapper"
		class:size-small={size === 'small'}
		class:size-medium={size === 'medium'}
		class:size-large={size === 'large'}
	>
		<input
			type="number"
			bind:value={tempWordCountLimit}
			on:blur={handleWordCountSubmit}
			on:input={handleInputChange}
			on:keydown={handleKeydown}
			on:paste={handlePaste}
			class="word-count-input"
			min="1"
			max="10000"
			step="1"
			aria-label="Word count limit"
			use:focus
		/>
		<div class="word-count-hint">Set word limit (1-10,000)</div>
	</div>
{:else}
	<button
		type="button"
		class="word-count-badge editable-word-count"
		class:limit-near={isNearLimit}
		class:limit-reached={isAtLimit}
		class:limit-over={isOverLimit}
		class:size-small={size === 'small'}
		class:size-medium={size === 'medium'}
		class:size-large={size === 'large'}
		on:click={() => {
			isEditingWordCount = true;
			tempWordCountLimit = wordCountLimit;
		}}
		on:keydown={(e) => e.key === 'Enter' && (isEditingWordCount = true)}
		title="Click to edit word count limit"
	>
		<div class="word-count-content">
			<span class="word-count-text">{wordCount}</span>
			<span class="word-count-separator">/</span>
			<span class="word-count-limit">{wordCountLimit}</span>
			<span class="word-count-label">word limit</span>
		</div>
		<div class="edit-icon">
			<!-- <Pencil size={14} /> -->
			<svg viewBox="0 0 20 20" fill="currentColor">
				<path
					d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
				/>
			</svg>
		</div>
	</button>
{/if}

<style>
	/* Base Word Count Badge - Using your color system */
	.word-count-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.875rem;
		background: var(--color-base-000);
		border: 1px solid var(--color-neutral);
		border-radius: var(--radius-box);
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-base-content);
		cursor: pointer;
		transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
		position: relative;
	}

	.editable-word-count:hover {
		background: var(--color-base-100);
		border-color: var(--color-primary);
		box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
	}

	.editable-word-count:focus {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
		border-color: var(--color-primary);
	}

	.editable-word-count:active {
		transform: translateY(1px);
		box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
	}

	.word-count-content {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-variant-numeric: tabular-nums;
	}

	.word-count-text {
		font-weight: 600;
		color: var(--color-base-content-accent);
	}

	.word-count-separator {
		color: var(--color-neutral-content);
		font-weight: 400;
	}

	.word-count-limit {
		color: var(--color-neutral-content);
		font-weight: 500;
	}

	.word-count-label {
		color: var(--color-neutral-content);
		font-weight: 400;
		font-size: 0.8125rem;
	}

	.edit-icon {
		width: 0.875rem;
		height: 0.875rem;
		color: var(--color-neutral-content);
		opacity: 100;
		transition: color 0.15s ease;
		flex-shrink: 0;
	}

	.editable-word-count:hover .edit-icon {
		color: var(--color-primary);
		opacity: 1;
	}

	.editable-word-count:focus .edit-icon {
		opacity: 1;
	}

	/* Size Variants */
	.word-count-badge.size-small {
		padding: 0.25rem 0.375rem;
		font-size: 0.75rem;
		gap: 0.375rem;
	}

	.word-count-badge.size-small .edit-icon {
		width: 0.75rem;
		height: 0.75rem;
	}

	.word-count-badge.size-small .word-count-label {
		font-size: 0.7rem;
	}

	.word-count-badge.size-medium {
		padding: 0.375rem 0.5rem;
		font-size: 0.8125rem;
	}

	.word-count-badge.size-large {
		padding: 0.5rem 0.75rem;
		font-size: 0.875rem;
	}

	/* Word Count Status Colors - Using your color system */
	.word-count-badge.limit-near {
		border-color: var(--color-warning);
		color: var(--color-warning);
	}

	.word-count-badge.limit-reached {
		border-color: var(--color-info);
		color: var(--color-info);
	}

	.word-count-badge.limit-over {
		border-color: var(--color-error);
		color: var(--color-error);
	}

	.word-count-badge.limit-near:hover {
		/* background: var(--color-warning-content); */
		border-color: var(--color-warning);
	}

	.word-count-badge.limit-reached:hover {
		/* background: var(--color-error-content); */
		border-color: var(--color-info);
	}

	.word-count-badge.limit-over:hover {
		/* background: var(--color-error-content); */
		border-color: var(--color-error);
	}

	.word-count-badge.limit-near .word-count-text,
	.word-count-badge.limit-near .word-count-separator {
		color: var(--color-warning);
	}

	.word-count-badge.limit-reached .word-count-text,
	.word-count-badge.limit-reached .word-count-separator {
		color: var(--color-info);
	}

	.word-count-badge.limit-over .word-count-text,
	.word-count-badge.limit-over .word-count-separator {
		color: var(--color-error);
	}

	/* Word Count Input - Using your color system */
	.word-count-input-wrapper {
		position: relative;
		margin-bottom: 1rem;
	}

	.word-count-input {
		width: 120px;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-base-content);
		background: var(--color-base-000);
		border: 1px solid var(--color-neutral);
		border-radius: var(--radius-field);
		padding: 0.5rem 0.75rem;
		outline: none;
		transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
		text-align: center;
		box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
	}

	.word-count-input:hover {
		border-color: var(--color-primary);
	}

	.word-count-input:focus {
		border-color: var(--color-primary);
		box-shadow: 0 0 0 2px rgba(168, 139, 254, 0.2);
	}

	.word-count-input::placeholder {
		color: var(--color-neutral-content);
		font-weight: 400;
	}

	.word-count-hint {
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		margin-top: 0.5rem;
		font-size: 0.75rem;
		color: var(--color-neutral-content);
		background: var(--color-base-000);
		padding: 0.25rem 0.5rem;
		border-radius: var(--radius-field);
		border: 1px solid var(--color-neutral);
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -1px rgba(0, 0, 0, 0.06);
		white-space: nowrap;
		z-index: 50;
	}

	/* Size-specific input styling */
	.word-count-input-wrapper.size-small .word-count-input {
		width: 80px;
		font-size: 0.75rem;
		padding: 0.25rem 0.375rem;
	}

	.word-count-input-wrapper.size-small .word-count-hint {
		font-size: 0.7rem;
		padding: 0.2rem 0.375rem;
	}

	.word-count-input-wrapper.size-medium .word-count-input {
		width: 100px;
		font-size: 0.8125rem;
		padding: 0.375rem 0.5rem;
	}

	.word-count-input-wrapper.size-large .word-count-input {
		width: 120px;
		font-size: 0.875rem;
		padding: 0.5rem 0.75rem;
	}

	@media (prefers-color-scheme: dark) {
		.word-count-badge {
			background: var(--color-base-100);
			border-color: var(--color-neutral-content);
		}

		.editable-word-count:hover {
			background: var(--color-base-200);
			border-color: var(--color-primary);
		}

		.word-count-input {
			background: var(--color-base-100);
			border-color: var(--color-neutral-content);
		}

		.word-count-input:hover {
			border-color: var(--color-primary);
		}

		.word-count-hint {
			background: var(--color-base-100);
			border-color: var(--color-neutral-content);
		}
	}

	/* Mobile optimizations */
	@media (max-width: 768px) {
		.word-count-badge {
			font-size: 0.8125rem;
			padding: 0.375rem 0.5rem;
		}

		.word-count-input {
			width: 100px;
			font-size: 0.8125rem;
			padding: 0.375rem 0.5rem;
		}
	}

	@media (max-width: 480px) {
		.word-count-badge {
			padding: 0.25rem 0.375rem;
			font-size: 0.75rem;
		}

		.word-count-input {
			width: 80px;
			font-size: 0.75rem;
			padding: 0.25rem 0.375rem;
		}

		.word-count-hint {
			font-size: 0.7rem;
			padding: 0.2rem 0.375rem;
		}
	}

	@media print {
		/* .edit-icon-small, */
		.word-count-hint {
			display: none !important;
		}

		.editable-word-count {
			border: none !important;
			background: transparent !important;
			padding: 0 !important;
		}
	}
</style>
