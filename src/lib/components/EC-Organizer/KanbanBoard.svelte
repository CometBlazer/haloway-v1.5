<!-- src/lib/components/EC-Organizer/KanbanBoard.svelte -->
<script lang="ts">
	import { onMount, afterUpdate, onDestroy, tick } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Plus } from 'lucide-svelte';
	import ActivityCard from './ActivityCard.svelte';
	import type { Activity } from '$lib/types/activity';
	import Sortable from 'sortablejs';
	import { Download } from 'lucide-svelte';
	// import { activities } from '$lib/stores/activities';

	let localActivities: Activity[] = [];
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
				localActivities = JSON.parse(stored);
			}
		} catch (error) {
			console.error('Failed to load from storage:', error);
		}
	}

	function saveToStorage() {
		try {
			sessionStorage.setItem(STORAGE_KEY, JSON.stringify(localActivities));
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
				animation: 300, // Sortable's built-in animation
				easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)', // Material design easing
				ghostClass: 'sortable-ghost',
				chosenClass: 'sortable-chosen',
				dragClass: 'sortable-drag',
				forceFallback: false,
				fallbackClass: 'sortable-fallback',
				fallbackOnBody: true,
				swapThreshold: 0.8,
				scroll: true,
				scrollSensitivity: 30,
				scrollSpeed: 10,
				bubbleScroll: true,
				// Key settings for smooth transitions
				removeCloneOnHide: false,
				revertOnSpill: false,
				// Enable smooth dragging
				dragoverBubble: false,
				dropBubble: false,
				preventOnFilter: false,
				onStart: () => {
					document.body.classList.add('is-dragging');
					// Disable transitions during active drag
					if (sortableContainer) {
						sortableContainer.classList.add('dragging-active');
					}
					console.log('Drag started');
				},
				onEnd: (evt) => {
					document.body.classList.remove('is-dragging');

					// Re-enable transitions after a short delay
					setTimeout(() => {
						if (sortableContainer) {
							sortableContainer.classList.remove('dragging-active');
						}
					}, 50);

					console.log('Drag ended', evt);

					const { oldIndex, newIndex } = evt;

					if (
						oldIndex !== undefined &&
						newIndex !== undefined &&
						oldIndex !== newIndex
					) {
						console.log(`Moving item from ${oldIndex} to ${newIndex}`);

						// Reorder the activities array
						const newActivities = [...localActivities];
						const [movedItem] = newActivities.splice(oldIndex, 1);
						newActivities.splice(newIndex, 0, movedItem);

						localActivities = newActivities;
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
			positionDescription: '',
			activityDescription: '',
			participationLevels: {},
			timingOfParticipation: {},
			hoursPerWeek: 0,
			weeksPerYear: 0,
			collegeParticipation: false,
		};
	}

	async function addNewActivity() {
		localActivities = [createNewActivity(), ...localActivities];
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
		localActivities = localActivities.filter((a) => a.id !== event.detail.id);
		saveToStorage();
		await tick(); // Wait for DOM update

		// Reinitialize sortable after removing item
		if (localActivities.length > 0) {
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
		localActivities = localActivities.map((a) =>
			a.id === event.detail.id ? { ...a, ...event.detail.activity } : a,
		);
		saveToStorage();
	}

	// Reactive statement to reinitialize sortable when activities change
	$: if (mounted && localActivities.length > 0 && sortableContainer) {
		tick().then(() => {
			if (!sortableInstance) {
				initializeSortable();
			}
		});
	}

	function downloadActivitiesJSON() {
		// Use localActivities instead of $activities
		const currentActivities = localActivities;

		// Create the JSON data
		const jsonData = {
			exportDate: new Date().toISOString(),
			totalActivities: currentActivities.length,
			activities: currentActivities,
		};

		// Convert to JSON string with pretty formatting
		const jsonString = JSON.stringify(jsonData, null, 2);

		// Create blob and download
		const blob = new Blob([jsonString], { type: 'application/json' });
		const url = URL.createObjectURL(blob);

		// Create temporary download link
		const link = document.createElement('a');
		link.href = url;
		link.download = `extracurricular-activities-${new Date().toISOString().split('T')[0]}.json`;

		// Trigger download
		document.body.appendChild(link);
		link.click();

		// Cleanup
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}
</script>

<div class="min-h-screen space-y-6 bg-background p-4">
	<div class="flex w-full justify-end gap-2">
		<Button on:click={addNewActivity} size="sm" class="mt-4">
			<Plus class="mr-2 h-4 w-4" />
			Add Activity
		</Button>
		<Button
			on:click={downloadActivitiesJSON}
			variant="outline"
			size="sm"
			class="mt-4"
			disabled={localActivities.length === 0}
		>
			<Download class="h-4 w-4" />
		</Button>
	</div>
	<!-- Main Board -->
	<div class="w-full">
		<div class="rounded-lg bg-muted/30 p-6">
			<div class="mb-6">
				<h2 class="text-xl font-semibold">
					Activities ({localActivities.length})
				</h2>
			</div>

			{#if localActivities.length === 0}
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
				<div bind:this={sortableContainer} class="sortable-container">
					{#each localActivities as activity, index (activity.id)}
						<ActivityCard
							{activity}
							position={index + 1}
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
	/* Sortable.js styling - clean and minimal */
	:global(.sortable-ghost) {
		opacity: 0.4;
		/* transform: scale(1.02); */
	}

	:global(.sortable-chosen) {
		cursor: grabbing !important;
		z-index: 1000;
		/* transform: scale(1.03); */
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
	}

	:global(.sortable-drag) {
		opacity: 0.8 !important;
		transform: scale(1.05) !important;
		box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2) !important;
		z-index: 1001;
	}

	/* Prevent text selection during drag */
	:global(.is-dragging) {
		user-select: none;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
	}

	/* Default smooth transitions for all items when NOT dragging */
	.sortable-container:not(.dragging-active) :global(.sortable-item) {
		transition:
			transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
			margin 0.4s cubic-bezier(0.4, 0, 0.2, 1),
			box-shadow 0.3s ease;
	}

	/* Disable ALL transitions during active dragging to let Sortable.js handle it */

	/* Re-enable transitions after drag */
	.sortable-container :global(.sortable-item) {
		transform-origin: center center;
		will-change: transform;
	}

	/* Simple hover effect - just slight lift */
	.sortable-container:not(.dragging-active) :global(.sortable-item:hover) {
		/* transform: scale(1.01); */
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
		/* border-color: hsl(var(--color-primary)); */
	}

	/* Handle styling */
	:global(.sortable-handle) {
		touch-action: none;
		cursor: grab;
		border-radius: 6px;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		padding: 8px;
		margin: -8px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	:global(.sortable-handle:hover) {
		background-color: hsl(var(--muted));
		transform: scale(1.1);
	}

	:global(.sortable-handle:active) {
		cursor: grabbing;
		transform: scale(0.95);
	}

	/* Container setup for smooth animations */
	.sortable-container {
		min-height: 100px;
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	/* Ensure proper spacing without margin conflicts */
	.sortable-container > :global(.sortable-item) {
		margin: 0 !important;
		position: relative;
	}

	/* Simple entry animation for new items */
	/* .sortable-container :global(.sortable-item) {
		animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	} */

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
</style>
