<!-- src/lib/components/Editor/DatePicker.svelte -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import dayjs from 'dayjs';
	import 'pikaday/css/pikaday.css';
	import type Pikaday from 'pikaday';
	import { AlarmClock } from 'lucide-svelte';

	export let selectedDate: Date | null = null;
	export let onSelect: (date: Date) => void = () => {};
	export const size: 'small' | 'medium' | 'large' = 'medium';

	let picker: Pikaday;
	let inputEl: HTMLInputElement;
	let buttonEl: HTMLButtonElement;
	let containerEl: HTMLDivElement;
	let isOpen = false;

	function toggleCalendar() {
		if (!picker) return;
		if (picker.isVisible()) {
			picker.hide();
		} else {
			picker.show();
		}
	}

	// Watch for changes to selectedDate prop and update Pikaday
	$: if (picker && selectedDate) {
		// Set the date in Pikaday without triggering the onSelect callback
		picker.setDate(selectedDate, true); // true = silent mode
	}

	$: buttonText = (() => {
		// When calendar is open, show date or selection prompt
		if (isOpen) {
			if (selectedDate) {
				return dayjs(selectedDate).format('MMM D, YYYY');
			} else {
				return 'Click to set deadline';
			}
		}

		// When calendar is closed
		if (!selectedDate) {
			return 'Click to set deadline';
		}

		const diff = dayjs(selectedDate)
			.startOf('day')
			.diff(dayjs().startOf('day'), 'day');

		if (diff < 0) {
			return 'Deadline past';
		} else if (diff === 0) {
			return 'Due today';
		} else if (diff <= 7) {
			if (diff === 1) {
				return 'Due in 1 day';
			} else {
				return `Due in ${diff} days`;
			}
		} else {
			return `Due on ${dayjs(selectedDate).format('MMM D, YYYY')}`;
		}
	})();

	// Also make getButtonColor reactive:
	$: buttonColor = (() => {
		if (!selectedDate) return 'btn-primary';
		const diff = dayjs(selectedDate)
			.startOf('day')
			.diff(dayjs().startOf('day'), 'day');

		if (diff < 0) return 'btn-info';
		if (diff <= 3) return 'btn-error';
		if (diff <= 7) return 'btn-warning';
		return 'btn-primary';
	})();

	onMount(async () => {
		if (!browser) return;

		const { default: Pikaday } = await import('pikaday');
		picker = new Pikaday({
			field: inputEl,
			trigger: buttonEl, // click this to open
			container: containerEl, // append calendar here
			bound: true, // auto-show/hide on focus/blur
			format: 'YYYY-MM-DD',
			defaultDate: selectedDate || undefined, // Set initial date
			setDefaultDate: selectedDate !== null, // Only set if we have a date
			onSelect(date: Date) {
				// Create a new date at noon to avoid timezone issues
				const normalizedDate = new Date(
					date.getFullYear(),
					date.getMonth(),
					date.getDate(),
					12,
					0,
					0,
					0,
				);
				selectedDate = normalizedDate;
				onSelect(normalizedDate);
			},
			onOpen() {
				isOpen = true;
			},
			onClose() {
				isOpen = false;
			},
		});

		// Set initial date if we have one
		if (selectedDate) {
			picker.setDate(selectedDate, true); // true = silent mode
		}
	});

	onDestroy(() => picker?.destroy());
</script>

<div class="date-picker-container" bind:this={containerEl}>
	<button
		bind:this={buttonEl}
		type="button"
		class="date-picker-btn {buttonColor}"
		on:click={toggleCalendar}
	>
		<AlarmClock class="icon" />
		{buttonText}
	</button>

	<input type="hidden" bind:this={inputEl} />
</div>

<style>
	.date-picker-container {
		position: relative;
		display: inline-block;
	}

	.date-picker-btn {
		display: inline-flex;
		align-items: center;
		justify-content: flex-start;
		gap: 0.25rem;
		padding: 0.375rem 1rem;
		border: 1px solid;
		border-radius: 9999px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		background: hsl(var(--color-base-000));
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
		white-space: nowrap;
	}

	@media (min-width: 768px) {
		.date-picker-btn {
			padding: 0.5rem 1rem;
			font-size: 0.875rem;
		}
	}

	.date-picker-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.date-picker-btn:focus {
		outline: 2px solid hsl(var(--color-primary));
		outline-offset: 2px;
	}

	.date-picker-btn:active {
		transform: translateY(0);
	}

	.icon {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
	}

	/* Button color variants */
	.btn-primary {
		background: hsl(var(--color-primary));
		color: hsl(var(--color-primary-content));
		border-color: hsl(var(--color-primary));
	}

	.btn-primary:hover {
		background: hsl(var(--color-primary) / 0.9);
	}

	.btn-warning {
		background: hsl(var(--color-warning));
		color: hsl(var(--color-warning-content));
		border-color: hsl(var(--color-warning));
	}

	.btn-warning:hover {
		background: hsl(var(--color-warning) / 0.9);
	}

	.btn-error {
		background: hsl(var(--color-error));
		color: hsl(var(--color-error-content));
		border-color: hsl(var(--color-error));
	}

	.btn-error:hover {
		background: hsl(var(--color-error) / 0.9);
	}

	.btn-info {
		background: hsl(var(--color-info));
		color: hsl(var(--color-info-content));
		border-color: hsl(var(--color-info));
	}

	.btn-info:hover {
		background: hsl(var(--color-info) / 0.9);
	}

	/* Pikaday Calendar Styling */
	:global(.pika-title) {
		background: transparent !important;
		border: none !important;
		box-shadow: none !important;
	}

	:global(.pika-label),
	:global(.pika-select-month),
	:global(.pika-select-year) {
		background: transparent !important;
		border: none !important;
		box-shadow: none !important;
	}

	/* Dark-mode Pikaday header selects */
	:global(html.dark .pika-single .pika-title select),
	:global(html.dark .pika-single .pika-select-month),
	:global(html.dark .pika-single .pika-select-year) {
		background-color: hsl(var(--color-base-200)) !important;
		color: hsl(var(--color-base-content)) !important;
		border: 1px solid hsl(var(--color-base-300)) !important;
		box-shadow: none !important;
		-webkit-appearance: none !important;
		-moz-appearance: none !important;
		appearance: none !important;
	}

	:global(html.dark .pika-single .pika-title select::-ms-expand) {
		filter: invert(1) !important;
	}

	:global(.pika-single) {
		background: hsl(var(--color-base-100)) !important;
		border: 1px solid hsl(var(--color-base-300)) !important;
		border-radius: 0.75rem !important;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1) !important;
		font-family: var(--font-sans) !important;
		padding: 0.75rem !important;
		width: max-content !important;
		margin-top: 0.5rem !important;
	}

	:global(.pika-title) {
		margin-bottom: 0.5rem !important;
		text-align: center !important;
		font-weight: 500 !important;
		font-size: 1rem !important;
		color: hsl(var(--color-base-content)) !important;
	}

	:global(.pika-prev),
	:global(.pika-next) {
		color: hsl(var(--color-base-content)) !important;
		transition: color 0.2s ease !important;
	}

	:global(.pika-prev:hover),
	:global(.pika-next:hover) {
		color: hsl(var(--color-base-content)) !important;
	}

	:global(.pika-table) {
		width: 100% !important;
		border-collapse: collapse !important;
	}

	:global(.pika-table th) {
		color: hsl(var(--color-base-content)) !important;
		font-size: 0.75rem !important;
		font-weight: 500 !important;
		padding-bottom: 0.25rem !important;
	}

	:global(.pika-button) {
		display: inline-flex !important;
		align-items: center !important;
		justify-content: center !important;
		width: 2.25rem !important;
		height: 2.25rem !important;
		border-radius: 0.75rem !important;
		font-size: 0.875rem !important;
		background-color: hsl(var(--color-base-100)) !important;
		font-weight: 500 !important;
		color: hsl(var(--color-base-content)) !important;
		transition: background 0.2s ease !important;
		border: none !important;
	}

	:global(.pika-button:hover) {
		background-color: hsl(var(--color-base-300)) !important;
		color: hsl(var(--color-base-content)) !important;
	}

	:global(.pika-button.is-selected) {
		background-color: hsl(var(--color-primary)) !important;
		color: hsl(var(--color-primary-content)) !important;
	}

	:global(.pika-button.is-today) {
		background-color: hsl(var(--color-warning-content)) !important;
		color: hsl(var(--color-warning)) !important;
	}

	:global(.pika-button.is-disabled) {
		color: hsl(var(--color-base-300)) !important;
		pointer-events: none !important;
	}

	/* Mobile responsiveness */
	@media (max-width: 768px) {
		.date-picker-btn {
			font-size: 0.8125rem;
			padding: 0.25rem 0.75rem;
		}

		.icon {
			width: 0.875rem;
			height: 0.875rem;
		}

		:global(.pika-single) {
			font-size: 0.875rem !important;
			padding: 0.5rem !important;
		}

		:global(.pika-button) {
			width: 2rem !important;
			height: 2rem !important;
			font-size: 0.8125rem !important;
		}
	}

	/* Touch handling */
	.date-picker-btn {
		-webkit-tap-highlight-color: transparent;
		touch-action: manipulation;
	}

	/* High contrast mode support */
	@media (prefers-contrast: high) {
		.date-picker-btn {
			border-width: 2px;
		}

		:global(.pika-single) {
			border-width: 2px !important;
		}

		:global(.pika-button) {
			border: 1px solid hsl(var(--color-base-400)) !important;
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.date-picker-btn {
			transition: none !important;
		}

		:global(.pika-button) {
			transition: none !important;
		}

		:global(.pika-prev),
		:global(.pika-next) {
			transition: none !important;
		}
	}

	/* Focus visible for better accessibility */
	.date-picker-btn:focus-visible {
		outline: 2px solid hsl(var(--color-primary));
		outline-offset: 2px;
	}

	/* Enhanced calendar styling for dark mode */
	@media (prefers-color-scheme: dark) {
		:global(.pika-single) {
			box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3) !important;
		}
	}
</style>
