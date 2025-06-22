<!-- src/routes/(app)/schools/[school]/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { FileText, Plus, Trash, Loader2, ArrowLeft } from 'lucide-svelte';
	import type { PageData } from './$types';
	import { WebsiteName } from '../../../../config';
	import { toastStore } from '$lib/stores/toast';
	import { enhance } from '$app/forms';
	import type { Status } from '$lib/components/Editor/StatusDropdown.svelte';

	// Components
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Alert from '$lib/components/ui/alert';
	import EssayCard from '$lib/components/EssayCard.svelte';

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
		school: string; // Add school field for EssayCard component
	}

	function createNewDocument(): void {
		goto(`/schools/${url_safe_school}/write`);
	}

	// Handle card events
	function handleCardClick(
		event: CustomEvent<{
			documentId: string;
			currentVersion: DocumentVersion | null;
			school: string;
		}>,
	) {
		const { documentId, currentVersion } = event.detail;
		console.log('Opening document:', documentId, currentVersion);

		if (currentVersion?.id) {
			goto(
				`/schools/${url_safe_school}/write/${documentId}/${currentVersion.id}`,
			);
		} else {
			goto(`/schools/${url_safe_school}/write/${documentId}`);
		}
	}

	function handleCardDelete(
		event: CustomEvent<{
			documentId: string;
			documentTitle: string;
		}>,
	) {
		const { documentId, documentTitle } = event.detail;
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

	// Add school field to documents for EssayCard component
	$: documents = (data.documents || []).map((doc) => ({
		...doc,
		school: school,
	})) as Document[];
</script>

<svelte:head>
	<title>{school} Essays | {WebsiteName}</title>
</svelte:head>

<svelte:window on:keydown={handleKeydown} />

<div class="school-dashboard-container">
	<!-- Header -->
	<div class="school-header">
		<div class="header-content">
			<div class="title-with-back">
				<button
					class="back-button"
					on:click={() => goto('/dashboard')}
					aria-label="Back to dashboard"
				>
					<ArrowLeft class="h-4 w-4" />
				</button>
				<h1 class="school-title">{school}</h1>
			</div>
			<p class="school-subtitle">
				{documents.length} essay{documents.length !== 1 ? 's' : ''} for {school}
			</p>
		</div>
		<Button size="lg" on:click={createNewDocument}>
			<Plus class="mr-2 h-5 w-5" />
			New {school} Essay
		</Button>
	</div>

	<!-- Info Banner -->
	<Alert.Root class="school-info-banner">
		<Alert.Description class="text-center">
			<p class="banner-text">
				Organize your essays by school to stay focused on each application. All
				your {school} essays are in one place.
			</p>
		</Alert.Description>
	</Alert.Root>

	<!-- Documents Grid -->
	{#if documents.length === 0}
		<!-- Empty State -->
		<div class="empty-state">
			<div class="empty-content">
				<FileText class="empty-icon" />
				<h3 class="empty-title">No {school} essays yet</h3>
				<p class="empty-description">
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
		<div class="documents-grid">
			{#each documents as document (document.id)}
				<EssayCard
					{document}
					on:click={handleCardClick}
					on:delete={handleCardDelete}
				/>
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
	/* School Dashboard Container */
	.school-dashboard-container {
		max-width: 1280px;
		margin: 0 auto;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		width: 100%;
	}

	/* Header Styles */
	.school-header {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	@media (min-width: 640px) {
		.school-header {
			flex-direction: row;
			align-items: flex-start;
			justify-content: space-between;
		}
	}

	.header-content {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.title-with-back {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.back-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		background: transparent;
		border: none;
		border-radius: 0.375rem;
		color: hsl(var(--color-neutral-content));
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.back-button:hover {
		background: hsl(var(--color-base-200));
		color: hsl(var(--color-base-content));
	}

	.back-button:focus {
		outline: 2px solid hsl(var(--color-primary));
		outline-offset: 2px;
	}

	.school-title {
		font-size: 1.875rem;
		font-weight: 600;
		line-height: 1.2;
		color: hsl(var(--color-base-content));
		letter-spacing: -0.025em;
		margin: 0;
	}

	.school-subtitle {
		font-size: 1.125rem;
		color: hsl(var(--color-neutral-content));
		margin: 0;
	}

	/* Banner Styles */
	:global(.school-info-banner) {
		border: 1px solid hsl(var(--color-info) / 0.3) !important;
		background: linear-gradient(
			to right,
			hsl(var(--color-info) / 0.05),
			hsl(var(--color-primary) / 0.05)
		) !important;
		border-radius: 0.75rem !important;
		padding: 1rem !important;
	}

	.banner-text {
		font-size: 0.875rem;
		line-height: 1.6;
		color: hsl(var(--color-base-content));
		margin: 0;
	}

	/* Empty State */
	.empty-state {
		display: flex;
		min-height: 400px;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	.empty-content {
		max-width: 384px;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		text-align: center;
	}

	/* .empty-icon {
		width: 4rem;
		height: 4rem;
		color: hsl(var(--color-neutral-content));
		margin: 0 auto;
	} */

	.empty-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: hsl(var(--color-base-content));
		margin: 0;
	}

	.empty-description {
		line-height: 1.6;
		color: hsl(var(--color-neutral-content));
		margin: 0;
	}

	/* Documents Grid */
	.documents-grid {
		display: grid;
		gap: 1.5rem;
		grid-template-columns: 1fr;
	}

	@media (min-width: 640px) {
		.documents-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.documents-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	/* Mobile Responsiveness */
	@media (max-width: 640px) {
		.school-dashboard-container {
			padding: 1rem;
		}

		.school-title {
			font-size: 1.5rem;
		}

		.title-with-back {
			gap: 0.5rem;
		}
	}

	/* High contrast mode support */
	@media (prefers-contrast: high) {
		:global(.school-info-banner) {
			border-width: 2px !important;
		}

		.back-button {
			border: 1px solid hsl(var(--color-base-400));
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.back-button {
			transition: none !important;
		}
	}

	/* Focus visible for better accessibility */
	.back-button:focus-visible {
		outline: 2px solid hsl(var(--color-primary));
		outline-offset: 2px;
	}
</style>
