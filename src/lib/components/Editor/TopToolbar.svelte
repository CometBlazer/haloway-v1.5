<!-- src/lib/components/Editor/TopToolbar.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import {
		History,
		Download,
		FileText,
		Text,
		Save,
		MoreHorizontal,
		// Check,
	} from 'lucide-svelte';
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
	import * as Menubar from '$lib/components/ui/menubar';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Separator } from '$lib/components/ui/separator';
	// import { cn } from '$lib/utils';

	export let wordCount: number;
	export let wordCountLimit: number = 250;
	export let currentVersionName: string = 'Unknown Checkpoint';
	export let zenMode: boolean = false;
	export let initialStatus: Status = 'not-started';
	export let initialDueDate: Date | null = null;
	export let currentSchool: string = '';
	export let schoolChangeDisabled: boolean = false;

	// Save state props
	import type { SaveState } from '$lib/autosave';

	export let saveState: SaveState;
	export let statusDisplay: {
		text: string;
		class: string;
		icon: string;
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
		saveContent: boolean;
		downloadAsTxt: void;
		downloadAsDoc: void;
	}>();

	let innerWidth = 0;
	let essayStatus: Status = initialStatus;
	let mobileDropdownOpen = false;

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
		innerWidth >= 1700
			? ('large' as const)
			: innerWidth >= 1024
				? ('medium' as const)
				: ('small' as const);
	$: dropdownSize =
		innerWidth >= 1024
			? ('md' as const)
			: innerWidth >= 768
				? ('md' as const)
				: innerWidth >= 640
					? ('sm' as const)
					: ('xs' as const);

	// Determine if we should show text in StatusDropdown (only on xl+ screens)
	$: showStatusText = innerWidth >= 1600;

	// Auto-close mobile dropdown when screen becomes lg or larger
	$: if (innerWidth >= 1280 && mobileDropdownOpen) {
		mobileDropdownOpen = false;
	}

	// Status icon component
	// function getStatusIcon(icon: string) {
	// 	switch (icon) {
	// 		case 'saved':
	// 			return Check;
	// 		case 'saving':
	// 			return 'spinner';
	// 		case 'error':
	// 			return 'error';
	// 		default:
	// 			return 'clock';
	// 	}
	// }
</script>

<svelte:window bind:innerWidth />

<div class="document-header" class:zen-mode={zenMode}>
	<Menubar.Root class="h-auto border-none bg-transparent p-0">
		<div class="flex w-full items-center justify-between gap-1">
			<!-- Left section: Status and Save -->
			<div class="flex items-center gap-2">
				<!-- Save State Display -->
				<div class="flex items-center gap-2">
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
						<span class="status-text text-xs sm:text-sm"
							>{statusDisplay.text}</span
						>
					</div>

					<!-- Manual Save Button -->
					{#if saveState.status === 'error' || saveState.status === 'offline' || (saveState.hasUnsavedChanges && !saveState.isOnline)}
						<Button
							variant="outline"
							size="sm"
							on:click={handleSaveContent}
							disabled={saveState.status === 'saving' ||
								saveState.status === 'retrying'}
							class="h-8 px-3 text-xs"
						>
							<Save class="mr-1 h-3 w-3" />
							<span class="hidden sm:inline">
								{#if saveState.status === 'error'}
									Retry
								{:else if saveState.status === 'offline'}
									Save When Online
								{:else}
									Save
								{/if}
							</span>
						</Button>
					{/if}
				</div>

				<Separator orientation="vertical" class="h-6" />

				<!-- Export Menu -->
				<DropdownMenu.Root>
					<DropdownMenu.Trigger asChild let:builder>
						<Button
							builders={[builder]}
							variant="ghost"
							size="sm"
							class="h-8 gap-1 rounded-xl px-3 text-sm md:h-10"
						>
							<Download class="h-5 w-5" />
							<!-- <span class="hidden sm:inline">Export</span> -->
						</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="start" class="w-48">
						<DropdownMenu.Item on:click={handleDownloadAsTxt} class="gap-2">
							<Text class="h-4 w-4" />
							<div class="flex flex-col">
								<span class="font-medium">Plain Text</span>
								<span class="text-xs text-muted-foreground">.txt file</span>
							</div>
						</DropdownMenu.Item>
						<DropdownMenu.Item on:click={handleDownloadAsDoc} class="gap-2">
							<FileText class="h-4 w-4" />
							<div class="flex flex-col">
								<span class="font-medium">Word Document</span>
								<span class="text-xs text-muted-foreground">.doc file</span>
							</div>
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>

			<!-- Center section: Main controls (hidden on mobile, shown in dropdown) -->
			<div class="hidden items-center gap-2 xl:flex">
				<DatePicker
					selectedDate={picked}
					onSelect={handleDueDateChange}
					size={componentSize}
					placeholder="Set due date"
				/>

				<Separator orientation="vertical" class="h-6" />

				<StatusDropdown
					bind:currentStatus={essayStatus}
					on:statusChange={handleStatusChange}
					size={dropdownSize}
					showText={showStatusText}
				/>

				<Separator orientation="vertical" class="h-6" />

				<SchoolDropdown
					{currentSchool}
					disabled={schoolChangeDisabled}
					on:schoolChange={handleSchoolChange}
					size={componentSize}
				/>

				<Separator orientation="vertical" class="h-6" />

				<Button
					variant="ghost"
					size="sm"
					on:click={handleToggleSidebar}
					class="h-8 gap-2 rounded-xl px-3 text-xs md:h-10"
				>
					<History class="h-5 w-5" />
					<!-- Only show version name on xl+ screens -->
					{#if innerWidth >= 1280}
						<span class="max-w-20 truncate text-xs text-muted-foreground">
							{currentVersionName}
						</span>
					{/if}
				</Button>
			</div>

			<!-- Right section: Word count and mobile menu -->
			<div class="flex items-center gap-3">
				<!-- Word Count (always visible) -->
				<div class="hidden sm:block">
					<WordCountEditor
						{wordCount}
						{wordCountLimit}
						size={componentSize}
						on:updateWordCountLimit={handleWordCountLimitUpdate}
					/>
				</div>

				<!-- Mobile dropdown menu -->
				<div class="xl:hidden">
					<DropdownMenu.Root bind:open={mobileDropdownOpen}>
						<DropdownMenu.Trigger asChild let:builder>
							<Button
								builders={[builder]}
								variant="ghost"
								size="sm"
								class="h-8 w-8 p-0"
							>
								<MoreHorizontal class="h-4 w-4" />
								<span class="sr-only">More options</span>
							</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content align="end" class="w-56">
							<DropdownMenu.Group>
								<DropdownMenu.Label>Document Settings</DropdownMenu.Label>
								<DropdownMenu.Separator />

								<!-- Due Date -->
								<div class="px-2 py-1.5">
									<span class="mb-2 block text-sm font-medium">Due Date</span>
									<DatePicker
										selectedDate={picked}
										onSelect={handleDueDateChange}
										size="small"
										placeholder="Set due date"
									/>
								</div>

								<DropdownMenu.Separator />

								<!-- Status -->
								<div class="px-2 py-1.5">
									<span class="mb-2 block text-sm font-medium">Status</span>
									<StatusDropdown
										bind:currentStatus={essayStatus}
										on:statusChange={handleStatusChange}
										size="sm"
										showText={true}
									/>
								</div>

								<DropdownMenu.Separator />

								<!-- School -->
								<div class="px-2 py-1.5">
									<span class="mb-2 block text-sm font-medium">School</span>
									<SchoolDropdown
										{currentSchool}
										disabled={schoolChangeDisabled}
										on:schoolChange={handleSchoolChange}
										size="small"
									/>
								</div>

								<DropdownMenu.Separator />

								<!-- Word Count -->
								<div class="px-2 py-1.5">
									<span class="mb-2 block text-sm font-medium">Word Limit</span>
									<WordCountEditor
										{wordCount}
										{wordCountLimit}
										size="small"
										on:updateWordCountLimit={handleWordCountLimitUpdate}
									/>
								</div>

								<DropdownMenu.Separator />

								<!-- Checkpoints -->
								<DropdownMenu.Item on:click={handleToggleSidebar} class="gap-2">
									<History class="h-4 w-4" />
									<div class="flex flex-col">
										<span>Manage Checkpoints</span>
										<span class="text-xs text-muted-foreground">
											Current: {currentVersionName}
										</span>
									</div>
								</DropdownMenu.Item>
							</DropdownMenu.Group>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
			</div>
		</div>
	</Menubar.Root>
</div>

<style>
	.document-header {
		container-type: inline-size;
		container-name: document-header;
		width: 100%;
		background: hsl(var(--background));
		border-radius: 1rem;
		padding: 0.875rem 1rem;
		border: 1px solid hsl(var(--border));
		transition: all 0.3s ease;
		box-shadow:
			0 1px 3px 0 rgb(0 0 0 / 0.1),
			0 1px 2px -1px rgb(0 0 0 / 0.1);
	}

	.document-header.zen-mode {
		background: transparent;
		border-radius: 0;
		padding: 0.5rem 0;
		box-shadow: none;
		border: none;
		border-bottom: 1px solid hsl(var(--border));
	}

	/* Status Section */
	.status-indicator {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.375rem 0.625rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 500;
		transition: all 0.2s ease;
	}

	@container document-header (min-width: 640px) {
		.status-indicator {
			padding: 0.5rem 0.75rem;
			font-size: 0.875rem;
		}
	}

	@container document-header (min-width: 768px) {
		.status-indicator {
			gap: 0.5rem;
		}
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

	/* Mobile responsive adjustments */
	@media (max-width: 640px) {
		.document-header {
			padding: 0.5rem 0.75rem;
		}
	}

	/* Print styles */
	@media print {
		.document-header {
			display: none !important;
		}
	}
</style>
