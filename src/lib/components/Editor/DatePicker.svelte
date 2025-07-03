<!-- src/lib/components/Editor/DatePicker.svelte -->
<script lang="ts">
	import { AlarmClock } from 'lucide-svelte';
	import {
		DateFormatter,
		type DateValue,
		getLocalTimeZone,
		today,
	} from '@internationalized/date';
	import { cn } from '$lib/utils';
	import { buttonVariants } from '$lib/components/ui/button';
	import * as Popover from '$lib/components/ui/popover';
	import { Calendar as CalendarPrimitive } from 'bits-ui';
	import * as Calendar from '$lib/components/ui/calendar';
	import * as Select from '$lib/components/ui/select';

	// Props
	export let selectedDate: DateValue | undefined = undefined;
	export let onSelect: (date: DateValue | undefined) => void = () => {};
	export let placeholder: string = 'Select date';
	export let size: 'small' | 'medium' | 'large' = 'medium';
	export let disabled: boolean = false;
	export let clearable: boolean = true;

	// Date formatter
	const df = new DateFormatter('en-US', {
		dateStyle: 'medium',
	});

	// Internal state
	let open = false;
	let calendarPlaceholder = today(getLocalTimeZone());

	// Month and year options for dropdowns
	const monthOptions = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December',
	].map((month, i) => ({ value: i + 1, label: month }));

	const monthFmt = new DateFormatter('en-US', {
		month: 'long',
	});

	const currentYear = new Date().getFullYear();
	const yearOptions = Array.from({ length: 100 }, (_, i) => ({
		label: String(currentYear - i + 50),
		value: currentYear - i + 50,
	}));

	// Handle date selection from calendar
	function handleDateSelect(date: DateValue | undefined) {
		selectedDate = date;
		onSelect(date);
		open = false;
	}

	// Handle clear
	function handleClear(event: Event) {
		event.stopPropagation();
		selectedDate = undefined;
		onSelect(undefined);
	}

	// Size variants
	const sizeClasses = {
		small: 'h-8 px-2 text-xs',
		medium: 'h-10 px-3 text-sm',
		large: 'h-10 px-4 text-sm',
	};

	// Color variants - updated to use your CSS variables
	const colorClasses = {
		default: '', // Use default button styling
		warning: 'border-[hsl(var(--color-warning))]',
		danger:
			'bg-[hsl(var(--color-error))] text-[hsl(var(--color-error-content))] border-[hsl(var(--color-error))]',
		info: 'border-[hsl(var(--color-info))]',
		future: 'border-[hsl(var(--accent))]',
	};

	// Get relative time text and determine status
	function getDateStatus(
		date: DateValue,
	): 'default' | 'warning' | 'danger' | 'info' | 'future' {
		const todayDate = new Date();
		todayDate.setHours(0, 0, 0, 0); // Reset to start of day for accurate comparison

		const selectedDateObj = date.toDate(getLocalTimeZone());
		selectedDateObj.setHours(0, 0, 0, 0); // Reset to start of day

		const diffTime = selectedDateObj.getTime() - todayDate.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays < 0) {
			return 'info'; // deadline past = info (blue)
		}
		if (diffDays === 0) {
			return 'danger'; // Due today = danger (red)
		}
		if (diffDays === 1) {
			return 'danger'; // Due tomorrow = danger (red)
		}
		if (diffDays === 2 || diffDays === 3) {
			return 'danger'; // Very imminent (0-3 days) = danger (red)
		}
		if (diffDays >= 4 && diffDays <= 7) {
			return 'warning'; // Upcoming = warning (yellow)
		}

		return 'future'; // Anything further in the future = future (purple)
	}

	function getRelativeTimeText(date: DateValue): string {
		const todayDate = new Date();
		todayDate.setHours(0, 0, 0, 0);

		const selectedDateObj = date.toDate(getLocalTimeZone());
		selectedDateObj.setHours(0, 0, 0, 0);

		const diffTime = selectedDateObj.getTime() - todayDate.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays === 0) {
			return 'Due Today';
		}
		if (diffDays === 1) {
			return 'Due Tomorrow';
		}
		if (diffDays > 1 && diffDays <= 7) {
			return `Due in ${diffDays} days`;
		}
		if (diffDays < 0) {
			// const pastDays = Math.abs(diffDays);
			// return pastDays === 1 ? 'Due yesterday' : `${pastDays} days overdue`;
			return 'Deadline past';
		}

		return `Due on ${df.format(selectedDateObj)}`;
	}

	// Reactive values
	$: dateStatus = selectedDate ? getDateStatus(selectedDate) : 'default';
	$: displayText = selectedDate
		? getRelativeTimeText(selectedDate)
		: placeholder;

	// Reactive month/year for dropdowns
	$: defaultYear = calendarPlaceholder
		? {
				value: calendarPlaceholder.year,
				label: String(calendarPlaceholder.year),
			}
		: undefined;

	$: defaultMonth = calendarPlaceholder
		? {
				value: calendarPlaceholder.month,
				label: monthFmt.format(calendarPlaceholder.toDate(getLocalTimeZone())),
			}
		: undefined;
</script>

<Popover.Root bind:open>
	<Popover.Trigger
		class={cn(
			buttonVariants({ variant: 'outline' }),
			sizeClasses[size],
			colorClasses[dateStatus],
			'justify-between rounded-xl border-border font-normal transition-colors',
			disabled && 'cursor-not-allowed opacity-50',
		)}
		{disabled}
	>
		<div class="flex items-center gap-2">
			<AlarmClock class="h-4 w-4" />
			<span class="truncate font-semibold">{displayText}</span>
		</div>

		{#if clearable && selectedDate && !disabled}
			<button
				type="button"
				class="ml-4 flex h-4 w-4 items-center justify-center rounded-full bg-black/20 text-current transition-colors hover:bg-accent"
				on:click={handleClear}
				aria-label="Clear date"
			>
				<svg
					class="h-3 w-3"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path d="M18 6L6 18M6 6l12 12" />
				</svg>
			</button>
		{/if}
	</Popover.Trigger>

	<Popover.Content class="mt-2 w-auto p-0" align="start">
		<CalendarPrimitive.Root
			weekdayFormat="short"
			class="rounded-md border p-6"
			bind:value={selectedDate}
			bind:placeholder={calendarPlaceholder}
			on:keydown
			let:months
			let:weekdays
		>
			<Calendar.Header>
				<Calendar.Heading
					class="flex w-full items-center justify-between gap-2"
				>
					<!-- Previous Month Button -->
					<Calendar.PrevButton
						class="inline-flex h-7 w-7 items-center justify-center whitespace-nowrap rounded-md border-border bg-background text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
					>
						<svg
							class="h-4 w-4"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path d="M15 18l-6-6 6-6" />
						</svg>
					</Calendar.PrevButton>

					<!-- Month Dropdown -->
					<Select.Root
						selected={defaultMonth}
						items={monthOptions}
						onSelectedChange={(v) => {
							if (!v || !calendarPlaceholder) return;
							if (v.value === calendarPlaceholder?.month) return;
							calendarPlaceholder = calendarPlaceholder.set({ month: v.value });
						}}
					>
						<Select.Trigger aria-label="Select month" class="w-[60%] min-w-0">
							<Select.Value placeholder="Select month" class="truncate" />
						</Select.Trigger>
						<Select.Content class="max-h-[200px] overflow-y-auto">
							{#each monthOptions as { value, label }}
								<Select.Item
									{value}
									{label}
									class="justify-start pl-2 pr-2 data-[highlighted]:bg-primary data-[selected]:bg-primary/20 data-[highlighted]:text-primary-foreground [&>span:last-child]:hidden [&>span:last-child]:w-0"
								>
									{label}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>

					<!-- Year Dropdown -->
					<Select.Root
						selected={defaultYear}
						items={yearOptions}
						portal=".year-dropdown-portal"
						onSelectedChange={(v) => {
							if (!v || !calendarPlaceholder) return;
							if (v.value === calendarPlaceholder?.year) return;
							calendarPlaceholder = calendarPlaceholder.set({ year: v.value });
						}}
						onOpenChange={(open) => {
							if (open) {
								// Focus on current year when dropdown opens
								setTimeout(() => {
									const currentYearItem = document.querySelector(
										`[data-value="${currentYear}"]`,
									);
									if (currentYearItem) {
										currentYearItem.scrollIntoView({ block: 'center' });
									}
								}, 50);
							}
						}}
					>
						<Select.Trigger aria-label="Select year" class="w-[40%] min-w-0">
							<Select.Value placeholder="Select year" class="truncate" />
						</Select.Trigger>
						<Select.Content class="max-h-[200px] overflow-y-auto">
							{#each yearOptions as { value, label }}
								<Select.Item
									{value}
									{label}
									data-value={value}
									class="justify-start pl-2 pr-2 data-[highlighted]:bg-primary data-[selected]:bg-primary/20 data-[highlighted]:text-primary-foreground [&>span:last-child]:hidden [&>span:last-child]:w-0"
								>
									{label}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>

					<!-- Next Month Button -->
					<Calendar.NextButton
						class="inline-flex h-7 w-7 items-center justify-center whitespace-nowrap rounded-md border-border bg-background text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
					>
						<svg
							class="h-4 w-4"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path d="M9 18l6-6-6-6" />
						</svg>
					</Calendar.NextButton>
				</Calendar.Heading>
			</Calendar.Header>

			<Calendar.Months>
				{#each months as month}
					<Calendar.Grid>
						<Calendar.GridHead>
							<Calendar.GridRow class="flex">
								{#each weekdays as weekday}
									<Calendar.HeadCell>
										{weekday.slice(0, 2)}
									</Calendar.HeadCell>
								{/each}
							</Calendar.GridRow>
						</Calendar.GridHead>
						<Calendar.GridBody>
							{#each month.weeks as weekDates}
								<Calendar.GridRow class="mt-2 w-full">
									{#each weekDates as date}
										<Calendar.Cell {date}>
											<Calendar.Day
												{date}
												month={month.value}
												on:click={() => handleDateSelect(date)}
											/>
										</Calendar.Cell>
									{/each}
								</Calendar.GridRow>
							{/each}
						</Calendar.GridBody>
					</Calendar.Grid>
				{/each}
			</Calendar.Months>
		</CalendarPrimitive.Root>
	</Popover.Content>
</Popover.Root>
