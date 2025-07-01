<!-- src/lib/components/Editor/DatePicker.svelte -->
<script lang="ts">
	import { CalendarIcon } from 'lucide-svelte';
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
	let dateStatus: 'default' | 'warning' | 'danger' | 'info' = 'default';

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

	const yearOptions = Array.from({ length: 100 }, (_, i) => ({
		label: String(new Date().getFullYear() - i + 50),
		value: new Date().getFullYear() - i + 50,
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
		large: 'h-12 px-4 text-base',
	};

	// color variants
	const colorClasses = {
		default: 'bg-color-primary text-white',
		warning: 'bg-color-warning text-white',
		danger: 'bg-color-error text-white',
		info: 'bg-color-info text-white',
	};

	// Get relative time text for better UX
	function getRelativeTimeText(date: DateValue): string {
		const todayDate = new Date();
		const selectedDateObj = date.toDate(getLocalTimeZone());

		const diffTime = selectedDateObj.getTime() - todayDate.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays === 0) {
			dateStatus = 'danger';
			return 'Due Today';
		}
		if (diffDays === 1) {
			dateStatus = 'warning';
			return 'Due Tomorrow';
		}
		if (diffDays > 1 && diffDays <= 7) {
			dateStatus = 'info';
			return `Due in ${diffDays} days`;
		}
		if (diffDays < 0) {
			dateStatus = 'danger';
			return `Deadline Past`;
		}

		return df.format(selectedDateObj);
	}

	// Reactive display text
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
			'justify-between rounded-full font-normal',
			disabled && 'cursor-not-allowed opacity-50',
		)}
		{disabled}
	>
		<div class="flex items-center gap-2">
			<CalendarIcon class="h-4 w-4" />
			<span class="truncate">{displayText}</span>
		</div>

		{#if clearable && selectedDate && !disabled}
			<button
				type="button"
				class="ml-2 flex h-4 w-4 items-center justify-center rounded-full bg-muted/40 text-muted-foreground transition-colors hover:bg-muted-foreground/20 hover:text-foreground"
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
						class="inline-flex h-7 w-7 items-center justify-center whitespace-nowrap rounded-md border border-input bg-background text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
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
						<Select.Trigger aria-label="Select month" class="w-[60%]">
							<Select.Value placeholder="Select month" />
						</Select.Trigger>
						<Select.Content class="max-h-[200px] overflow-y-auto">
							{#each monthOptions as { value, label }}
								<Select.Item {value} {label}>
									{label}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>

					<!-- Year Dropdown -->
					<Select.Root
						selected={defaultYear}
						items={yearOptions}
						onSelectedChange={(v) => {
							if (!v || !calendarPlaceholder) return;
							if (v.value === calendarPlaceholder?.year) return;
							calendarPlaceholder = calendarPlaceholder.set({ year: v.value });
						}}
					>
						<Select.Trigger aria-label="Select year" class="w-[40%]">
							<Select.Value placeholder="Select year" />
						</Select.Trigger>
						<Select.Content class="max-h-[200px] overflow-y-auto">
							{#each yearOptions as { value, label }}
								<Select.Item {value} {label}>
									{label}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>

					<!-- Next Month Button -->
					<Calendar.NextButton
						class="inline-flex h-7 w-7 items-center justify-center whitespace-nowrap rounded-md border border-input bg-background text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
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
