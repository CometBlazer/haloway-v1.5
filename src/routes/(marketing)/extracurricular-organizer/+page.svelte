<!-- src/routes/(marketing)/extracurricular-organizer/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import KanbanBoard from '$lib/components/EC-Organizer/KanbanBoard.svelte';
	import { WebsiteName } from '../../../config';
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import { Save, RefreshCw } from 'lucide-svelte';
	import { toastStore } from '$lib/stores/toast';

	export let data: PageData;

	let kanbanBoard: KanbanBoard;
	let isSaving = false;

	onMount(() => {
		// Check if user has sessionStorage data when they're authenticated
		if (data.isAuthenticated && data.activities.length > 0) {
			const stored = sessionStorage.getItem('college-extracurriculars');
			if (stored) {
				try {
					const sessionData = JSON.parse(stored);
					if (
						sessionData.length > 0 &&
						sessionData.length !== data.activities.length
					) {
						toastStore.show(
							'Loaded your saved activities from the database. Your session work is preserved in the browser.',
							'info',
						);
					}
				} catch (_error) {
					// Ignore errors
				}
			}
		}
	});

	async function handleSave() {
		if (!data.isAuthenticated) {
			toastStore.show('Please sign in to save your activities', 'error');
			return;
		}

		if (!kanbanBoard) {
			toastStore.show('Unable to access activities data', 'error');
			return;
		}

		isSaving = true;

		try {
			// Get current activities from the KanbanBoard component
			const currentActivities = kanbanBoard.getCurrentActivities();

			const formData = new FormData();
			formData.append('activities', JSON.stringify(currentActivities));

			const response = await fetch('?/saveActivities', {
				method: 'POST',
				body: formData,
			});

			if (response.ok) {
				toastStore.show('Activities saved successfully!', 'success');
			} else {
				const errorData = await response.text();
				console.error('Save failed:', errorData);
				toastStore.show('Failed to save activities', 'error');
			}
		} catch (error) {
			console.error('Save error:', error);
			toastStore.show('Failed to save activities', 'error');
		} finally {
			isSaving = false;
		}
	}

	function handleRefresh() {
		if (!data.isAuthenticated) {
			toastStore.show('Please sign in to load saved activities', 'error');
			return;
		}

		// Reload the page to get fresh data from server
		window.location.reload();
	}
</script>

<svelte:head>
	<title
		>Free College Extracurricular Activities Organizer | {WebsiteName}</title
	>
	<meta
		name="description"
		content="Organize your extracurricular activities for college applications with our free tool. Easily track your achievements, leadership roles, and community service to enhance your Common App profile."
	/>
</svelte:head>

<div class="container mx-auto px-6">
	<!-- Header -->
	<div class="mt-2 w-full text-center sm:text-center">
		<div
			class="relative mx-auto mb-6 w-[80px] sm:w-[100px] md:w-[100px] lg:w-[150px] xl:w-[200px]"
		>
			<div class="aspect-square">
				<div class="absolute inset-0 rounded-full bg-white"></div>
				<img
					src="https://illustrations.popsy.co/purple/weight-lifting.svg"
					alt="Weight lifting illustration"
					class="relative z-10 h-full w-full object-contain"
					loading="lazy"
				/>
			</div>
		</div>
		<h1 class="text-3xl font-bold tracking-tight md:text-4xl">
			Free College Extracurricular Activities Organizer
		</h1>
		<h2 class="mt-2 text-lg text-muted-foreground md:text-xl">
			Modeled after the Common App Activities List
		</h2>

		{#if !data.isAuthenticated}
			<h3 class="mt-4 text-base text-muted-foreground">
				To save your work,
				<a
					href="/register"
					class="text-foreground underline hover:text-foreground/80"
					>create a free account</a
				>
				today.
			</h3>
		{:else}
			<div class="mt-4 flex justify-center gap-2">
				<Button on:click={handleSave} disabled={isSaving} size="sm">
					<Save class="mr-2 h-4 w-4" />
					{isSaving ? 'Saving...' : 'Save Activities'}
				</Button>
				<Button
					on:click={handleRefresh}
					variant="outline"
					size="sm"
					title="Refresh to load latest saved activities"
				>
					<RefreshCw class="mr-2 h-4 w-4" />
					Refresh
				</Button>
			</div>
		{/if}

		<h3 class="mt-2 text-base text-muted-foreground">
			Want a feature?
			<a
				href="/contact"
				class="text-foreground underline hover:text-foreground/80">Request it</a
			>.
		</h3>
	</div>

	<KanbanBoard
		bind:this={kanbanBoard}
		initialActivities={data.activities}
		isAuthenticated={data.isAuthenticated}
	/>
</div>
