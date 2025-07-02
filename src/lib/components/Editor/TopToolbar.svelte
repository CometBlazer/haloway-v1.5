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
		Check,
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
	import { cn } from '$lib/utils';

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
		<div class="flex w-full items-center justify-between gap-3">
			<!-- Left section: Status and Save -->
			<div class="flex items-center gap-3">
				<!-- Save State Display -->
				<div class="flex items-center gap-2">
					<div
						class={cn(
							'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
							statusDisplay.class === 'saved' &&
								'border border-green-200 bg-green-50 text-green-700',
							statusDisplay.class === 'saving' &&
								'border border-blue-200 bg-blue-50 text-blue-700',
							statusDisplay.class === 'unsaved' &&
								'border border-amber-200 bg-amber-50 text-amber-700',
							statusDisplay.class === 'error' &&
								'border border-red-200 bg-red-50 text-red-700',
							statusDisplay.class === 'offline' &&
								'border border-gray-200 bg-gray-50 text-gray-700',
						)}
					>
						<!-- Status Icon -->
						{#if statusDisplay.icon === 'saved'}
							<Check class="h-4 w-4" />
						{:else if statusDisplay.icon === 'saving'}
							<div
								class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
							></div>
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
						{:else}
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
						{/if}
						<span class="hidden text-xs sm:inline">{statusDisplay.text}</span>
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
							class="h-8 gap-1 px-3 text-xs"
						>
							<Download class="h-3 w-3" />
							<span class="hidden sm:inline">Export</span>
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
			<div class="hidden items-center gap-3 md:flex">
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
					class="h-8 gap-2 px-3 text-xs"
				>
					<History class="h-3 w-3" />
					<span>Checkpoints</span>
					<span class="max-w-20 truncate text-xs text-muted-foreground">
						{currentVersionName}
					</span>
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
				<div class="md:hidden">
					<DropdownMenu.Root>
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
										size="xs"
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
		border-radius: 0.75rem;
		padding: 0.75rem 1rem;
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
