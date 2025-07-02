<!-- KanbanBoard.svelte -->
<script lang="ts">
	import { onMount, afterUpdate, onDestroy, tick } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
	} from '$lib/components/ui/card';
	import { Plus } from 'lucide-svelte';
	import ActivityCard from './ActivityCard.svelte';
	import type { Activity } from '$lib/types/activity';
	import Sortable from 'sortablejs';

	let activities: Activity[] = [];
	let sortableContainer: HTMLElement;
	let sortableInstance: Sortable | null = null;
	let mounted = false;

	const STORAGE_KEY = 'college-extracurriculars';

	onMount(async () => {
		mounted = true;
		loadFromStorage();
		await tick(); // Wait for DOM to update
		initializeSortable();
	});

	onDestroy(() => {
		if (sortableInstance) {
			sortableInstance.destroy();
			sortableInstance = null;
		}
	});

	afterUpdate(async () => {
		if (mounted && sortableContainer && !sortableInstance) {
			await tick();
			initializeSortable();
		}
	});

	function loadFromStorage() {
		try {
			const stored = sessionStorage.getItem(STORAGE_KEY);
			if (stored) {
				activities = JSON.parse(stored);
			}
		} catch (error) {
			console.error('Failed to load from storage:', error);
		}
	}

	function saveToStorage() {
		try {
			sessionStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
		} catch (error) {
			console.error('Failed to save to storage:', error);
		}
	}

	function initializeSortable() {
		if (!sortableContainer || !mounted) return;

		// Destroy existing instance
		if (sortableInstance) {
			sortableInstance.destroy();
			sortableInstance = null;
		}

		// Make sure we have sortable items before initializing
		const items = sortableContainer.querySelectorAll('.sortable-item');
		if (items.length === 0) return;

		try {
			sortableInstance = Sortable.create(sortableContainer, {
				handle: '.sortable-handle',
				animation: 300,
				ghostClass: 'sortable-ghost',
				chosenClass: 'sortable-chosen',
				dragClass: 'sortable-drag',
				forceFallback: false, // Changed to false for better browser support
				fallbackClass: 'sortable-fallback',
				fallbackOnBody: true,
				swapThreshold: 0.65,
				scroll: true,
				scrollSensitivity: 30,
				scrollSpeed: 10,
				bubbleScroll: true,
				onStart: () => {
					document.body.classList.add('is-dragging');
					console.log('Drag started');
				},
				onEnd: (evt) => {
					document.body.classList.remove('is-dragging');
					console.log('Drag ended', evt);

					const { oldIndex, newIndex } = evt;

					if (
						oldIndex !== undefined &&
						newIndex !== undefined &&
						oldIndex !== newIndex
					) {
						console.log(`Moving item from ${oldIndex} to ${newIndex}`);

						// Reorder the activities array
						const newActivities = [...activities];
						const [movedItem] = newActivities.splice(oldIndex, 1);
						newActivities.splice(newIndex, 0, movedItem);

						activities = newActivities;
						saveToStorage();
					}
				},
				onMove: () => {
					// Optional: Add custom move validation here
					return true;
				},
			});

			console.log('Sortable initialized successfully');
		} catch (error) {
			console.error('Failed to initialize Sortable:', error);
		}
	}

	function createNewActivity(): Activity {
		return {
			id: crypto.randomUUID(),
			activityType: '',
			organizationName: '',
			activityDescription: '',
			participationLevels: {},
			timingOfParticipation: {},
			hoursPerWeek: 0,
			weeksPerYear: 0,
			collegeParticipation: false,
		};
	}

	async function addNewActivity() {
		activities = [createNewActivity(), ...activities];
		saveToStorage();
		await tick(); // Wait for DOM update

		// Reinitialize sortable after adding new item
		if (sortableInstance) {
			sortableInstance.destroy();
			sortableInstance = null;
		}
		initializeSortable();
	}

	async function handleDeleteActivity(event: CustomEvent<{ id: string }>) {
		activities = activities.filter((a) => a.id !== event.detail.id);
		saveToStorage();
		await tick(); // Wait for DOM update

		// Reinitialize sortable after removing item
		if (activities.length > 0) {
			if (sortableInstance) {
				sortableInstance.destroy();
				sortableInstance = null;
			}
			initializeSortable();
		}
	}

	function handleUpdateActivity(
		event: CustomEvent<{ id: string; activity: Partial<Activity> }>,
	) {
		activities = activities.map((a) =>
			a.id === event.detail.id ? { ...a, ...event.detail.activity } : a,
		);
		saveToStorage();
	}

	// Reactive statement to reinitialize sortable when activities change
	$: if (mounted && activities.length > 0 && sortableContainer) {
		tick().then(() => {
			if (!sortableInstance) {
				initializeSortable();
			}
		});
	}
</script>

<div class="min-h-screen space-y-6 bg-background p-4">
	<!-- Header -->
	<div class="flex flex-col items-start justify-between gap-4 sm:flex-row">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">
				College Extracurriculars
			</h1>
			<p class="text-muted-foreground">
				Organize your activities for Common App
			</p>
		</div>
		<Button on:click={addNewActivity}>
			<Plus class="mr-2 h-4 w-4" />
			Add Activity
		</Button>
	</div>

	<!-- Statistics -->
	<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
		<Card>
			<CardHeader class="pb-2">
				<CardTitle class="text-sm font-medium">Total Activities</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{activities.length}</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="pb-2">
				<CardTitle class="text-sm font-medium">Total Hours/Week</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">
					{activities.reduce(
						(sum, activity) => sum + (activity.hoursPerWeek || 0),
						0,
					)}
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="pb-2">
				<CardTitle class="text-sm font-medium">College Continuing</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">
					{activities.filter((activity) => activity.collegeParticipation)
						.length}
				</div>
			</CardContent>
		</Card>
	</div>

	<!-- Main Board -->
	<div class="w-full">
		<div class="rounded-lg bg-muted/30 p-6">
			<div class="mb-6">
				<h2 class="text-xl font-semibold">Activities ({activities.length})</h2>
			</div>

			{#if activities.length === 0}
				<div
					class="flex flex-col items-center justify-center space-y-4 py-16 text-center"
				>
					<div class="rounded-full bg-muted p-4">
						<Plus class="h-8 w-8 text-muted-foreground" />
					</div>
					<h3 class="text-lg font-semibold">No activities yet</h3>
					<p class="max-w-sm text-muted-foreground">
						Start organizing your extracurricular activities for your college
						applications.
					</p>
					<Button on:click={addNewActivity}>
						<Plus class="mr-2 h-4 w-4" />
						Add Activity
					</Button>
				</div>
			{:else}
				<div bind:this={sortableContainer} class="sortable-container space-y-6">
					{#each activities as activity (activity.id)}
						<ActivityCard
							{activity}
							on:delete={handleDeleteActivity}
							on:update={handleUpdateActivity}
						/>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	/* SortableJS styling */
	:global(.sortable-ghost) {
		opacity: 0.4;
		transform: rotate(2deg);
	}

	:global(.sortable-chosen) {
		cursor: grabbing !important;
	}

	:global(.sortable-drag) {
		transform: rotate(5deg);
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
		opacity: 1;
	}

	:global(.sortable-fallback) {
		display: block !important;
		transform: rotate(5deg);
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
		background: hsl(var(--background));
		border-radius: 8px;
		opacity: 0.9;
		cursor: grabbing !important;
	}

	/* Prevent text selection during drag */
	:global(.is-dragging) {
		user-select: none;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
	}

	/* Smooth transitions when not dragging */
	.sortable-container :global(.sortable-item) {
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}

	/* Disable transitions during drag */
	:global(.is-dragging) .sortable-container :global(.sortable-item) {
		transition: none !important;
	}

	/* Handle styling */
	:global(.sortable-handle) {
		touch-action: none;
		cursor: grab;
		border-radius: 4px;
		transition: background-color 0.2s ease;
	}

	:global(.sortable-handle:hover) {
		background-color: hsl(var(--muted));
	}

	:global(.sortable-handle:active) {
		cursor: grabbing;
	}

	/* Ensure the sortable container has proper styling */
	.sortable-container {
		min-height: 100px;
		position: relative;
	}
</style>
