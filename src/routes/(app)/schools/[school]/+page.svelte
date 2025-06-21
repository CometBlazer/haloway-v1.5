<!-- src/routes/(app)/schools/[school]/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		FileText,
		Calendar,
		Edit3,
		Plus,
		Trash,
		Loader2,
		Clock,
		ArrowLeft,
	} from 'lucide-svelte';
	import type { PageData } from './$types';
	import { WebsiteName } from '../../../../config';
	import { toastStore } from '$lib/stores/toast';
	import { enhance } from '$app/forms';
	import type { Status } from '$lib/components/Editor/StatusDropdown.svelte';
	import dayjs from 'dayjs';

	// shadcn-svelte components
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Alert from '$lib/components/ui/alert';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	export let data: PageData;

	// Modal state
	let showDeleteModal = false;
	let isDeleting = false;
	let documentToDelete: { id: string; title: string } | null = null;

	// Get school from data (already the display name)
	$: school = data.school;
	$: url_safe_school = data.url_safe_school;

	// Type definitions
	interface DocumentVersion {
		id: string;
	}

	interface Document {
		id: string;
		title: string | null;
		prompt: string | null;
		due_date: Date | null;
		created_at: string | Date;
		updated_at: string | Date | null;
		versions_count: number;
		status: Status | null;
		current_version: DocumentVersion | null;
	}

	function formatDate(dateInput: string | Date | null): string {
		if (!dateInput) return 'Unknown';

		const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
		const now = new Date();
		const diffInDays = Math.floor(
			(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
		);

		if (diffInDays === 0) return 'Today';
		if (diffInDays === 1) return 'Yesterday';
		if (diffInDays < 7) return `${diffInDays} days ago`;
		if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
		if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;

		return date.toLocaleDateString();
	}

	function openDocument(
		documentId: string,
		currentVersion: DocumentVersion | null,
	): void {
		console.log('Opening document:', documentId, currentVersion);
		if (currentVersion?.id) {
			goto(
				`/schools/${url_safe_school}/write/${documentId}/${currentVersion.id}`,
			);
		} else {
			goto(`/schools/${url_safe_school}/write/${documentId}`);
		}
	}

	function createNewDocument(): void {
		goto(`/schools/${url_safe_school}/write`);
	}

	function handleDeleteClick(
		event: Event,
		documentId: string,
		documentTitle: string,
	): void {
		event.stopPropagation();
		showDeleteConfirmation(documentId, documentTitle);
	}

	function showDeleteConfirmation(
		documentId: string,
		documentTitle: string,
	): void {
		documentToDelete = { id: documentId, title: documentTitle };
		showDeleteModal = true;
	}

	function closeDeleteModal(): void {
		if (isDeleting) return;
		showDeleteModal = false;
		documentToDelete = null;
	}

	async function confirmDelete(): Promise<void> {
		if (!documentToDelete || isDeleting) return;

		isDeleting = true;

		try {
			const form = document.createElement('form');
			form.method = 'POST';
			form.action = '?/deleteDocument';
			const input = document.createElement('input');
			input.type = 'hidden';
			input.name = 'documentId';
			input.value = documentToDelete.id;
			form.appendChild(input);
			document.body.appendChild(form);

			enhance(form, () => {
				return async ({ result }) => {
					if (result.type === 'success') {
						toastStore.show('Essay deleted successfully', 'success');
						window.location.reload();
					} else {
						toastStore.show('Failed to delete essay', 'error');
						isDeleting = false;
						closeDeleteModal();
					}
					document.body.removeChild(form);
				};
			});
			form.submit();
		} catch {
			toastStore.show('Failed to delete essay', 'error');
			isDeleting = false;
			closeDeleteModal();
		}
	}

	// Handle escape key to close modal
	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape' && showDeleteModal && !isDeleting) {
			closeDeleteModal();
		}
	}

	// Status configuration with updated colors
	const statusConfig: Record<
		Status,
		{
			label: string;
			variant: 'default' | 'secondary' | 'destructive' | 'outline';
		}
	> = {
		'not-started': {
			label: 'Not Started',
			variant: 'outline',
		},
		'in-progress': {
			label: 'In Progress',
			variant: 'secondary',
		},
		finished: {
			label: 'Finished',
			variant: 'default',
		},
		polished: {
			label: 'Polished',
			variant: 'default',
		},
		submitted: {
			label: 'Submitted',
			variant: 'default',
		},
		scrapped: {
			label: 'Scrapped',
			variant: 'destructive',
		},
	};

	function getDeadlineText(dueDate: Date | null): {
		text: string;
		variant: 'default' | 'secondary' | 'destructive' | 'outline';
	} {
		if (!dueDate) return { text: 'No deadline', variant: 'outline' };

		const diff = dayjs(dueDate)
			.startOf('day')
			.diff(dayjs().startOf('day'), 'day');

		if (diff < 0) return { text: 'Past deadline', variant: 'secondary' };
		if (diff === 0) return { text: 'Due today', variant: 'destructive' };
		if (diff === 1) return { text: 'Due tomorrow', variant: 'destructive' };
		if (diff <= 3)
			return { text: `Due in ${diff} days`, variant: 'destructive' };
		if (diff <= 7) return { text: `Due in ${diff} days`, variant: 'secondary' };
		return {
			text: `Due ${dayjs(dueDate).format('MMM D')}`,
			variant: 'default',
		};
	}

	$: documents = (data.documents || []) as Document[];
</script>

<svelte:head>
	<title>{school} Essays | {WebsiteName}</title>
</svelte:head>

<svelte:window on:keydown={handleKeydown} />

<div class="mx-auto max-w-7xl space-y-6 p-6">
	<!-- Header -->
	<div
		class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
	>
		<div class="space-y-1">
			<div class="flex items-center gap-3">
				<Button
					variant="ghost"
					size="sm"
					on:click={() => goto('/dashboard')}
					class="px-2"
				>
					<ArrowLeft class="h-4 w-4" />
				</Button>
				<h1 class="text-3xl font-semibold tracking-tight">
					{school} Essays
				</h1>
			</div>
			<p class="text-lg text-muted-foreground">
				{documents.length} essay{documents.length !== 1 ? 's' : ''} for {school}
			</p>
		</div>
		<Button size="lg" on:click={createNewDocument}>
			<Plus class="mr-2 h-5 w-5" />
			New {school} Essay
		</Button>
	</div>

	<!-- Info Banner -->
	<Alert.Root
		class="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50"
	>
		<Alert.Description class="text-center">
			<p class="text-sm leading-relaxed">
				Organize your essays by school to stay focused on each application. All
				your {school} essays are in one place.
			</p>
		</Alert.Description>
	</Alert.Root>

	<!-- Documents Grid -->
	{#if documents.length === 0}
		<!-- Empty State -->
		<div class="flex min-h-[400px] items-center justify-center p-8">
			<div class="max-w-md space-y-4 text-center">
				<FileText class="mx-auto h-16 w-16 text-muted-foreground" />
				<h3 class="text-xl font-semibold">No {school} essays yet</h3>
				<p class="leading-relaxed text-muted-foreground">
					Get started by creating your first essay for {school}. Click the "New {school}
					Essay" button above to begin writing.
				</p>
				<Button size="lg" on:click={createNewDocument}>
					<Plus class="mr-2 h-5 w-5" />
					Create Your First {school} Essay
				</Button>
			</div>
		</div>
	{:else}
		<!-- Documents Grid -->
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each documents as document}
				<Card.Root
					class="group cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
				>
					<div
						on:click={() => {
							console.log(
								'Card clicked! Opening document:',
								document.id,
								document.current_version,
							);
							openDocument(document.id, document.current_version);
						}}
						on:keydown={(e) => {
							console.log('Key pressed:', e.key);
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								console.log('Enter/Space pressed, opening document');
								openDocument(document.id, document.current_version);
							}
						}}
						class="h-full w-full cursor-pointer"
						tabindex="0"
						role="button"
						aria-label="Open document"
					>
						<Card.Header class="pb-3">
							<div class="flex items-start justify-between gap-3">
								<div class="flex min-w-0 flex-1 items-start gap-3">
									<div class="shrink-0 rounded-lg bg-muted p-2">
										<FileText class="h-5 w-5 text-primary" />
									</div>
									<div class="min-w-0 flex-1">
										<Card.Title class="line-clamp-2 text-base leading-tight">
											{document.title && document.title.length > 40
												? document.title.substring(0, 40) + '...'
												: document.title || 'Untitled Essay'}
										</Card.Title>
									</div>
								</div>
								<Button
									variant="ghost"
									size="sm"
									class="h-8 w-8 shrink-0 p-0 text-destructive opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
									on:click={(e) => {
										console.log('Delete button clicked');
										handleDeleteClick(
											e,
											document.id,
											document.title || 'Untitled Essay',
										);
									}}
									aria-label="Delete essay"
								>
									<Trash class="h-4 w-4" />
								</Button>
							</div>
						</Card.Header>

						<Card.Content class="pb-3 pt-0">
							<div class="space-y-3">
								{#if document.prompt}
									<p
										class="line-clamp-3 text-sm leading-relaxed text-muted-foreground"
									>
										{document.prompt.length > 120
											? document.prompt.substring(0, 120) + '...'
											: document.prompt}
									</p>
								{:else}
									<p class="text-sm italic text-muted-foreground">
										No prompt added yet
									</p>
								{/if}

								{#if document.due_date}
									{@const deadline = getDeadlineText(document.due_date)}
									<div class="flex items-center gap-2">
										<Clock class="h-4 w-4" />
										<Badge variant={deadline.variant} class="text-xs">
											{deadline.text}
										</Badge>
									</div>
								{/if}
							</div>
						</Card.Content>

						<Card.Footer class="border-t pt-3">
							<div class="w-full space-y-3">
								<div class="flex flex-col gap-1 text-xs text-muted-foreground">
									<div class="flex items-center gap-1.5">
										<Calendar class="h-3.5 w-3.5" />
										<span>Created {formatDate(document.created_at)}</span>
									</div>
									{#if document.updated_at && document.updated_at !== document.created_at}
										<div class="flex items-center gap-1.5">
											<Edit3 class="h-3.5 w-3.5" />
											<span>Updated {formatDate(document.updated_at)}</span>
										</div>
									{/if}
								</div>

								<div class="flex items-center justify-between gap-2">
									<span class="text-xs font-medium text-muted-foreground">
										{document.versions_count} checkpoint{document.versions_count !==
										1
											? 's'
											: ''} saved
									</span>
									{#if document.status}
										<Badge
											variant={statusConfig[document.status]?.variant ||
												'outline'}
											class="text-xs"
										>
											{statusConfig[document.status]?.label || document.status}
										</Badge>
									{/if}
								</div>
							</div>
						</Card.Footer>
					</div>
				</Card.Root>
			{/each}
		</div>
	{/if}
</div>

<!-- Delete Confirmation Modal -->
<Dialog.Root bind:open={showDeleteModal}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title class="text-destructive">Delete Essay</Dialog.Title>
			<Dialog.Description>
				This action cannot be undone and will delete all drafts and tags
				associated with this essay.
			</Dialog.Description>
		</Dialog.Header>

		{#if isDeleting}
			<div class="flex flex-col items-center justify-center space-y-4 py-8">
				<Loader2 class="h-8 w-8 animate-spin text-primary" />
				<p class="text-center text-muted-foreground">Deleting essay...</p>
			</div>
		{:else}
			<div class="py-4">
				<p class="text-sm">
					Are you sure you want to permanently delete
					<strong class="font-semibold">"{documentToDelete?.title}"</strong>?
				</p>
			</div>

			<Dialog.Footer class="gap-2">
				<Button variant="outline" on:click={closeDeleteModal}>Cancel</Button>
				<Button variant="destructive" on:click={confirmDelete}>
					<Trash class="mr-2 h-4 w-4" />
					Delete Essay
				</Button>
			</Dialog.Footer>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<style>
	.line-clamp-3 {
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
