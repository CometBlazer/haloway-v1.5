<!-- src/routes/(app)/dashboard/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { FileText, Plus, Trash, Loader2 } from 'lucide-svelte';
	import type { PageData, ActionData } from './$types';
	import { WebsiteBaseUrl, WebsiteName } from '../../../config';
	import { toastStore } from '$lib/stores/toast';
	import { enhance } from '$app/forms';
	import type { Status } from '$lib/components/Editor/StatusDropdown.svelte';

	// shadcn-svelte components
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Alert from '$lib/components/ui/alert';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import CompleteProfileModal from '$lib/components/CompleteProfileModal.svelte';
	import SchoolDropdown from '$lib/components/Editor/SchoolDropdown.svelte';
	import EssayCard from '$lib/components/EssayCard.svelte';

	export let data: PageData;
	export let form: ActionData;

	// Modal state
	let showDeleteModal = false;
	let isDeleting = false;
	let documentToDelete: { id: string; title: string } | null = null;

	// New essay modal state
	let showNewEssayModal = false;
	let isCreatingEssay = false;

	// New essay form data
	let newEssayForm = {
		school: '',
		title: '',
		prompt: '',
		dueDate: '',
	};

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

	// Set admin section context for sidebar highlighting
	onMount(async () => {
		try {
			const { getContext } = await import('svelte');
			const adminSectionStore = getContext<{ set: (value: string) => void }>(
				'adminSection',
			);
			if (adminSectionStore && typeof adminSectionStore.set === 'function') {
				adminSectionStore.set('home');
			}
		} catch {
			// Context might not be available, that's ok
			console.debug('Admin section context not available');
		}
	});

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
		// Convert school name to URL-safe format using the helper function
		const { getSchoolUrlSafeName } = await import('$lib/utils/validation');
		const schoolSlug = await getSchoolUrlSafeName(school);

		if (currentVersion?.id) {
			goto(`/schools/${schoolSlug}/write/${documentId}/${currentVersion.id}`);
		} else {
			goto(`/schools/${schoolSlug}/write/${documentId}`);
		}
	}

	function createNewDocument(): void {
		showNewEssayModal = true;
	}

	function closeNewEssayModal(): void {
		if (isCreatingEssay) return;
		showNewEssayModal = false;
		// Reset form
		newEssayForm = {
			school: '',
			title: '',
			prompt: '',
			dueDate: '',
		};
	}

	function handleSchoolChange(event: CustomEvent<string>) {
		newEssayForm.school = event.detail;
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

	// Handle escape key to close modal
	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape' && showDeleteModal && !isDeleting) {
			closeDeleteModal();
		}
		if (event.key === 'Escape' && showNewEssayModal && !isCreatingEssay) {
			closeNewEssayModal();
		}
	}

	$: documents = (data.documents || []) as Document[];
</script>

<svelte:head>
	<title>Dashboard | {WebsiteName}</title>
</svelte:head>

<svelte:window on:keydown={handleKeydown} />

<div class="dashboard-container">
	<!-- Header -->
	<div class="dashboard-header">
		<div class="header-content">
			<h1 class="header-title">All Essays</h1>
			<a href="/test" class="header-link">View your drafts</a>
			<p class="header-subtitle">
				{documents.length} essay{documents.length !== 1 ? 's' : ''} total
			</p>
		</div>
		<Button size="lg" on:click={createNewDocument}>
			<Plus class="mr-2 h-5 w-5" />
			New Essay
		</Button>
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

	<!-- Documents Grid -->
	{#if documents.length === 0}
		<!-- Empty State -->
		<div class="empty-state">
			<div class="empty-content">
				<FileText class="empty-icon" />
				<h3 class="empty-title">No essays yet</h3>
				<p class="empty-description">
					Get started by creating your first essay. Click the "New Essay" button
					above to begin writing.
				</p>
				<Button size="lg" on:click={createNewDocument}>
					<Plus class="mr-2 h-5 w-5" />
					Create Your First Essay
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

<!-- New Essay Modal -->
<Dialog.Root bind:open={showNewEssayModal}>
	<Dialog.Content class="sm:max-w-lg">
		<Dialog.Header>
			<Dialog.Title>Create a New Essay</Dialog.Title>
			<Dialog.Description>
				Fill in the details below to create a new essay.
			</Dialog.Description>
		</Dialog.Header>

		{#if isCreatingEssay}
			<div class="flex flex-col items-center justify-center space-y-4 py-8">
				<Loader2 class="h-8 w-8 animate-spin text-primary" />
				<p class="text-center text-muted-foreground">Creating essay...</p>
			</div>
		{:else}
			<form
				method="POST"
				action="?/createDocument"
				use:enhance={() => {
					isCreatingEssay = true;
					return async ({ result, update }) => {
						// Always reset loading state for non-redirect results
						if (result.type !== 'redirect') {
							isCreatingEssay = false;
							if (
								result.type === 'failure' &&
								result.data?.error &&
								typeof result.data.error === 'object' &&
								'message' in result.data.error
							) {
								toastStore.show(String(result.data.error.message), 'error');
							} else if (result.type === 'failure') {
								toastStore.show('Failed to create essay', 'error');
							}
						} else {
							// For redirects, show success but don't reset loading
							toastStore.show('Essay created successfully', 'success');
							closeNewEssayModal();
						}
						// Let SvelteKit handle all result types naturally
						await update();
					};
				}}
			>
				<div class="space-y-4">
					<div class="space-y-2">
						<Label for="school" class="text-sm font-medium">
							School <span class="text-destructive">*</span>
						</Label>
						<SchoolDropdown
							currentSchool={newEssayForm.school}
							on:schoolChange={handleSchoolChange}
							disabled={false}
						/>
						<input type="hidden" name="school" value={newEssayForm.school} />
					</div>

					<div class="space-y-2">
						<Label for="title" class="text-sm font-medium">Title</Label>
						<Input
							id="title"
							name="title"
							bind:value={newEssayForm.title}
							placeholder="Enter essay title (optional)"
						/>
					</div>

					<div class="space-y-2">
						<Label for="prompt" class="text-sm font-medium">Prompt</Label>
						<Textarea
							id="prompt"
							name="prompt"
							bind:value={newEssayForm.prompt}
							placeholder="Enter essay prompt (optional)"
							rows={3}
						/>
					</div>

					<div class="space-y-2">
						<Label for="dueDate" class="text-sm font-medium"
							>Due Date (optional)</Label
						>
						<Input
							id="dueDate"
							name="dueDate"
							type="date"
							bind:value={newEssayForm.dueDate}
							placeholder="Select due date (optional)"
						/>
					</div>

					<input type="hidden" name="status" value="not-started" />
				</div>

				<Dialog.Footer class="mt-4 gap-2">
					<Button
						type="button"
						variant="outline"
						on:click={closeNewEssayModal}
						class="w-full sm:w-auto"
						disabled={isCreatingEssay}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						disabled={!newEssayForm.school || isCreatingEssay}
						class="w-full sm:w-auto"
					>
						{#if isCreatingEssay}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							Creating...
						{:else}
							<Plus class="mr-2 h-4 w-4" />
							Create Essay
						{/if}
					</Button>
				</Dialog.Footer>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<style>
	/* Dashboard Container */
	.dashboard-container {
		max-width: 1280px;
		margin: 0 auto;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	/* Header Styles */
	.dashboard-header {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	@media (min-width: 640px) {
		.dashboard-header {
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

	.header-title {
		font-size: 1.875rem;
		font-weight: 600;
		line-height: 1.2;
		color: hsl(var(--color-base-content));
		letter-spacing: -0.025em;
	}

	.header-link {
		font-size: 0.875rem;
		color: hsl(var(--color-neutral-content));
		text-decoration: none;
		transition: text-decoration 0.2s ease;
	}

	.header-link:hover {
		text-decoration: underline;
	}

	.header-subtitle {
		font-size: 1.125rem;
		color: hsl(var(--color-neutral-content));
		margin: 0;
	}

	/* Banner Styles */
	/* .info-banner {
		border: 1px solid hsl(var(--color-info) / 0.3);
		background: linear-gradient(
			to right,
			hsl(var(--color-info) / 0.05),
			hsl(var(--color-primary) / 0.05)
		);
		border-radius: 0.75rem;
		padding: 1rem;
	} */

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
		.dashboard-container {
			padding: 1rem;
		}

		.header-title {
			font-size: 1.5rem;
		}
	}

	/* High contrast mode support */
	/* @media (prefers-contrast: high) {
		.info-banner {
			border-width: 2px;
		}
	} */

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		* {
			transition: none !important;
		}
	}
</style>
