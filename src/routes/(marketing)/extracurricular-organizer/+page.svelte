<!-- src/routes/(marketing)/extracurricular-organizer/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import KanbanBoard from '$lib/components/EC-Organizer/KanbanBoard.svelte';
	import { WebsiteName } from '../../../config';
	import type { PageData } from './$types';
	import { toastStore } from '$lib/stores/toast';
	import { activitiesChangeTracker } from '$lib/stores/activitiesChangeTracker';
	import type { Activity } from '$lib/types/activity';

	export let data: PageData;

	let kanbanBoard: KanbanBoard;

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
				} catch {
					// Ignore errors
				}
			}
		}
	});

	async function handleSaveActivities(
		event: CustomEvent<{ activities: Activity[] }>,
	) {
		if (!data.isAuthenticated) {
			toastStore.show('Please sign in to save your activities', 'error');
			return;
		}

		// Set saving state
		activitiesChangeTracker.setSaving();

		try {
			const activities = event.detail.activities;

			const formData = new FormData();
			formData.append('activities', JSON.stringify(activities));

			const response = await fetch('?/saveActivities', {
				method: 'POST',
				body: formData,
			});

			if (response.ok) {
				// Mark as saved
				activitiesChangeTracker.setSaved();
				toastStore.show('Activities saved successfully!', 'success');
			} else {
				const errorData = await response.text();
				console.error('Save failed:', errorData);
				activitiesChangeTracker.setError();
				toastStore.show('Failed to save activities', 'error');
			}
		} catch (error) {
			console.error('Save error:', error);
			activitiesChangeTracker.setError();
			toastStore.show('Failed to save activities', 'error');
		}
	}
</script>

<svelte:head>
	<title
		>Easy Drag and Drop Extracurricular Activities Organizer | {WebsiteName}</title
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
		<h1 class="text-4xl font-bold tracking-tight md:text-5xl">
			Drag & Drop Common App Activities Organizer
		</h1>
		<h2 class="mt-4 text-xl font-semibold text-foreground md:text-2xl">
			Modeled after the Common App Activities List. Completely free to use.
		</h2>

		<hr class="mx-auto my-6 max-w-5xl border-2 border-t border-accent" />

		<p class="mt-4 text-base text-muted-foreground">
			Drag and drop to reorder. Prefilled with character limits and Common App
			input requirements. Add and remove activities as needed.
		</p>
		{#if !data.isAuthenticated}
			<p class="mt-1 text-base text-muted-foreground">
				To save your work,
				<a
					href="/register"
					class="text-foreground underline hover:text-foreground/80"
					>create a free account</a
				>
				or
				<a
					href="/login"
					class="text-foreground underline hover:text-foreground/80">sign in</a
				>.
			</p>
		{/if}
		<p class="mt-1 text-base text-muted-foreground">
			Want another feature?
			<a
				href="/contact"
				class="text-foreground underline hover:text-foreground/80">Request it</a
			>.
		</p>
	</div>

	<KanbanBoard
		bind:this={kanbanBoard}
		initialActivities={data.activities}
		isAuthenticated={data.isAuthenticated}
		on:saveActivities={handleSaveActivities}
	/>
	<div class="mb-10 px-6">
		<p class="text-center text-sm text-muted-foreground">
			Note: This tool is for organizational purposes only. To submit your
			activities to the Common App, please copy individual elements from the
			organizer and paste them into the Common App Activities Section. Common
			App is a registered trademark of The Common Application, Inc. {WebsiteName}
			is not endorsed by or affiliated with The Common Application, Inc. or the College
			Board.
		</p>
	</div>
</div>
