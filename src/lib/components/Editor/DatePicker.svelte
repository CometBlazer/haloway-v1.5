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

<div class="relative inline-block" bind:this={containerEl}>
	<button
		bind:this={buttonEl}
		type="button"
		class="btn btn-sm md:btn-md btn-soft rounded-full {buttonColor} flex justify-start pl-4"
		on:click={toggleCalendar}
	>
		<AlarmClock class="mr-1 h-4 w-4" />
		{buttonText}
	</button>

	<input type="hidden" bind:this={inputEl} />
</div>

<style>
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

	/* dark-mode Pikaday header selects */
	:global(html.dark .pika-single .pika-title select),
	:global(html.dark .pika-single .pika-select-month),
	:global(html.dark .pika-single .pika-select-year) {
		background-color: var(--color-base-200) !important;
		color: var(--color-base-content) !important;
		border: 1px solid var(--color-base-300) !important;
		box-shadow: none !important;
		/* remove the system arrow background on WebKit/Edge if desired */
		-webkit-appearance: none !important;
		-moz-appearance: none !important;
		appearance: none !important;
	}

	/* if you want the dropdown arrow icon itself to invert in WebKit */
	:global(html.dark .pika-single .pika-title select::-ms-expand) {
		filter: invert(1) !important;
	}

	:global(.pika-single) {
		background: var(--color-base-100);
		border: 1px solid var(--color-base-300);
		border-radius: 0.75rem;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
		font-family: var(--font-sans);
		padding: 0.75rem;
		width: max-content;
		margin-top: 0.5rem;
	}

	:global(.pika-title) {
		margin-bottom: 0.5rem;
		text-align: center;
		font-weight: 500;
		font-size: 1rem;
		color: var(--color-base-content);
	}

	:global(.pika-prev),
	:global(.pika-next) {
		color: var(--color-base-content) !important;
		transition: color 0.2s ease;
	}

	:global(.pika-prev:hover),
	:global(.pika-next:hover) {
		color: var(--color-base-content) !important;
	}

	:global(.pika-table) {
		width: 100%;
		border-collapse: collapse;
	}

	:global(.pika-table th) {
		color: var(--color-base-content);
		font-size: 0.75rem;
		font-weight: 500;
		padding-bottom: 0.25rem;
	}

	:global(.pika-button) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 0.75rem !important;
		font-size: 0.875rem;
		background-color: var(--color-base-100);
		font-weight: 500;
		color: var(--color-base-content);
		transition: background 0.2s ease;
		border: none;
	}

	:global(.pika-button:hover) {
		background-color: var(--color-base-300) !important;
		color: var(--color-base-content) !important;
	}

	:global(.pika-button.is-selected) {
		background-color: var(--color-primary) !important;
		color: var(--color-primary-content) !important;
	}

	:global(.pika-button.is-today) {
		background-color: var(--color-warning-content) !important;
		color: var(--color-warning) !important;
	}

	:global(.pika-button.is-disabled) {
		color: var(--color-base-300) !important;
		pointer-events: none;
	}
</style>
