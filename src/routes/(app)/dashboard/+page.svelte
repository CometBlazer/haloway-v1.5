<!-- src/routes/(app)/dashboard/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { FileText, Trash, Loader2 } from 'lucide-svelte';
	import type { PageData, ActionData } from './$types';
	import { WebsiteBaseUrl, WebsiteName } from '../../../config';
	import { toastStore } from '$lib/stores/toast';
	import { enhance } from '$app/forms';
	import type { Status } from '$lib/components/Editor/StatusDropdown.svelte';

	// shadcn-svelte components
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Alert from '$lib/components/ui/alert';
	import * as Section from '$lib/components/landing/section';
	import CompleteProfileModal from '$lib/components/CompleteProfileModal.svelte';
	import EssayCard from '$lib/components/EssayCard.svelte';
	import SchoolChip from '$lib/components/SchoolChip.svelte';

	export let data: PageData;
	export let form: ActionData;

	// Modal state
	let showDeleteModal = false;
	let isDeleting = false;
	let documentToDelete: { id: string; title: string } | null = null;

	// Profile completion modal state
	let showProfileModal = !data.profileComplete;

	// Handle profile completion
	function handleProfileCompleted() {
		showProfileModal = false;
		// Refresh the page to update the profile data
		goto('/dashboard', { replaceState: true, noScroll: true });
	}

	// Watch for successful form submission
	$: if (form?.success && showProfileModal) {
		handleProfileCompleted();
	}

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
		school: string; // Added school field for routing
	}

	interface School {
		name: string;
		urlSafeName: string;
		documentCount: number;
	}

	// Handle escape key to close modal
	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape' && showDeleteModal && !isDeleting) {
			closeDeleteModal();
		}
	}

	// Cache data to avoid unnecessary re-computations
	$: documents = data.documents as Document[];
	$: schools = data.schools as School[];

	async function openDocument(
		documentId: string,
		currentVersion: DocumentVersion | null,
		school: string,
	): Promise<void> {
		console.log(
			'Opening document:',
			documentId,
			currentVersion,
			'for school:',
			school,
		);

		// Validate inputs
		if (!documentId) {
			console.error('Document ID is required');
			return;
		}

		if (!school) {
			console.error('School name is required');
			return;
		}

		// Find school data
		const schoolData = schools.find((s) => s.name === school);

		if (!schoolData || !schoolData.urlSafeName) {
			console.error(`School "${school}" not found or has no URL-safe name`);
			return;
		}

		const schoolSlug = schoolData.urlSafeName;

		try {
			if (currentVersion?.id) {
				await goto(
					`/schools/${schoolSlug}/write/${documentId}/${currentVersion.id}`,
				);
			} else {
				await goto(`/schools/${schoolSlug}/write/${documentId}`);
			}
		} catch (error) {
			console.error('Navigation error:', error);
			// Handle navigation error appropriately
		}
	}

	// Handle card events
	function handleCardClick(
		event: CustomEvent<{
			documentId: string;
			currentVersion: DocumentVersion | null;
			school: string;
		}>,
	) {
		const { documentId, currentVersion, school } = event.detail;
		openDocument(documentId, currentVersion, school);
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
</script>

<svelte:head>
	<title>Dashboard | {WebsiteName}</title>
</svelte:head>

<svelte:window on:keydown={handleKeydown} />

<div class="dashboard-container">
	<!-- Header -->
	<div class="dashboard-header mx-auto mb-10">
		<div class="header-content">
			<h1 class="header-title">All Essays</h1>
			<p class="header-subtitle">
				{documents.length} essay{documents.length !== 1 ? 's' : ''} total
			</p>
		</div>

		<!-- Info Banner -->
		<Alert.Root class="info-banner">
			<Alert.Description class="text-center">
				<p class="banner-text">
					We're working on sorting, searching, due date notifications, AI
					feedback, and more. Love what you see? <strong
						>Share <a href={WebsiteBaseUrl} class="banner-link" target="_blank"
							>{WebsiteBaseUrl}</a
						>
						with your friends</strong
					> and help us grow!
				</p>
			</Alert.Description>
		</Alert.Root>

		<!-- Schools Filter -->
		{#if schools.length > 0}
			<Section.Root anchor="schools">
				<div class="schools-filter">
					<div class="schools-filter-header">
						<h2 class="schools-filter-title">Filter by school</h2>
						<p class="schools-filter-subtitle">
							{schools.length} school{schools.length !== 1 ? 's' : ''} with essays
						</p>
					</div>
					<div class="schools-chips">
						{#each schools as school (school.urlSafeName)}
							<SchoolChip {school} variant="outline" size="md" />
						{/each}
					</div>
				</div>
			</Section.Root>
		{/if}
	</div>

	<!-- Documents Grid -->
	{#if documents.length === 0}
		<!-- Empty State -->
		<div class="flex min-h-96 items-center justify-center p-8">
			<div class="flex max-w-sm flex-col gap-4 text-center">
				<FileText class="text-neutral-content mx-auto h-16 w-16" />
				<h3 class="text-base-content m-0 text-xl font-semibold">
					No essays yet
				</h3>
				<p class="text-neutral-content m-0 leading-relaxed">
					Get started by creating your first essay. Use the "Create Essay"
					button in the sidebar to begin writing.
				</p>
			</div>
		</div>
	{:else}
		<!-- Documents Grid -->
		<h3 class="text-md font-bold">Last Updated</h3>
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

<!-- Complete Profile Modal -->
{#if showProfileModal}
	<CompleteProfileModal
		bind:open={showProfileModal}
		userEmail={data.user?.email || ''}
		{form}
		profile={data.profile}
		on:completed={handleProfileCompleted}
	/>
{/if}

<style>
	/* Dashboard Container */
	.dashboard-container {
		max-width: 1680px;
		margin: 0 auto;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	/* Header Styles */
	.dashboard-header {
		max-width: 1080px;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 1rem;
	}

	.header-content {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		align-items: center;
	}

	.header-title {
		font-size: 3rem;
		font-weight: 600;
		line-height: 1.2;
		color: hsl(var(--color-base-content));
		letter-spacing: -0.025em;
	}

	.header-subtitle {
		font-size: 1.125rem;
		color: hsl(var(--color-neutral-content));
		margin: 0;
	}

	/* Banner Styles */
	.banner-text {
		font-size: 0.875rem;
		line-height: 1.6;
		color: hsl(var(--color-base-content));
		margin: 0;
	}

	.banner-link {
		color: hsl(var(--color-primary));
		text-decoration: underline;
		transition: text-decoration 0.2s ease;
	}

	.banner-link:hover {
		text-decoration: none;
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

	@media (min-width: 1280px) {
		.documents-grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	/* Schools Filter */
	.schools-filter {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.5rem;
		background: hsl(var(--color-base-100));
		border: 1px solid hsl(var(--color-base-300));
		border-radius: 0.75rem;
		width: 100%;
		max-width: 1080px;
		margin: 0 auto;
		box-sizing: border-box;
	}

	.schools-filter-header {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.schools-filter-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: hsl(var(--color-base-content));
		margin: 0;
	}

	.schools-filter-subtitle {
		font-size: 0.875rem;
		color: hsl(var(--color-neutral-content));
		margin: 0;
	}

	.schools-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		align-items: center;
	}

	@media (max-width: 640px) {
		.schools-filter {
			padding: 1rem;
		}

		.schools-chips {
			gap: 0.5rem;
		}
	}

	/* Mobile Responsiveness */
	@media (max-width: 640px) {
		.dashboard-container {
			padding: 1rem;
		}

		.header-title {
			font-size: 2rem;
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		* {
			transition: none !important;
		}
	}
</style>
