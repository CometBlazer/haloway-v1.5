<!-- src/lib/components/EC-Organizer/KanbanBoard.svelte -->
<script lang="ts">
	import {
		onMount,
		afterUpdate,
		onDestroy,
		tick,
		createEventDispatcher,
	} from 'svelte';
	import { beforeNavigate } from '$app/navigation';
	import { browser } from '$app/environment';
	import { Button } from '$lib/components/ui/button';
	import { Plus, Download, Save, AlertCircle } from 'lucide-svelte';
	import ActivityCard from './ActivityCard.svelte';
	import type { Activity } from '$lib/types/activity';
	import Sortable from 'sortablejs';
	import {
		activitiesChangeTracker,
		getChangeStatusDisplay,
	} from '$lib/stores/activitiesChangeTracker';

	const dispatch = createEventDispatcher<{
		saveActivities: { activities: Activity[] };
	}>();

	export let initialActivities: Activity[] = [];
	export let isAuthenticated: boolean = false;

	let localActivities: Activity[] = [];
	let sortableContainer: HTMLElement;
	let sortableInstance: Sortable | null = null;
	let mounted = false;

	const STORAGE_KEY = 'college-extracurriculars';

	// Subscribe to change tracker
	$: changeState = $activitiesChangeTracker;
	$: statusDisplay = getChangeStatusDisplay(changeState);

	// Public method to get current activities (for parent component)
	export function getCurrentActivities(): Activity[] {
		return activitiesChangeTracker.getCurrentActivities();
	}

	// Public method to load activities (for parent component)
	export function loadActivities(activities: Activity[]) {
		localActivities = activities;
		saveToStorage();
		activitiesChangeTracker.updateActivities(localActivities);
		if (mounted) {
			tick().then(() => {
				reinitializeSortable();
			});
		}
	}

	onMount(async () => {
		mounted = true;

		// Initialize change tracker
		activitiesChangeTracker.initialize(initialActivities, isAuthenticated);

		// Load from server data first, then fallback to sessionStorage
		if (initialActivities && initialActivities.length > 0) {
			localActivities = initialActivities;
			saveToStorage();
		} else {
			loadFromStorage();
		}

		// Update tracker with current activities
		activitiesChangeTracker.updateActivities(localActivities);

		await tick();
		initializeSortable();

		// Handle browser navigation
		if (browser) {
			window.addEventListener('beforeunload', handleBeforeUnload);
		}
	});

	onDestroy(() => {
		if (sortableInstance) {
			sortableInstance.destroy();
			sortableInstance = null;
		}

		if (browser) {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		}
	});

	// Navigation guard
	beforeNavigate(({ cancel }) => {
		if (activitiesChangeTracker.shouldWarnBeforeLeaving()) {
			if (
				!confirm('You have unsaved changes. Are you sure you want to leave?')
			) {
				cancel();
			}
		}
	});

	// Browser refresh/close guard
	function handleBeforeUnload(event: BeforeUnloadEvent) {
		if (activitiesChangeTracker.shouldWarnBeforeLeaving()) {
			event.preventDefault();
			event.returnValue =
				'You have unsaved changes. Are you sure you want to leave?';
			return event.returnValue;
		}
	}

	afterUpdate(async () => {
		if (mounted && sortableContainer && !sortableInstance) {
			await tick();
			initializeSortable();
		}
	});

	function loadFromStorage() {
		// Always load from sessionStorage for temporary work
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

	function updateActivitiesAndTrack() {
		// Update sessionStorage
		saveToStorage();
		// Update change tracker
		activitiesChangeTracker.updateActivities(localActivities);
	}

	function reinitializeSortable() {
		if (sortableInstance) {
			sortableInstance.destroy();
			sortableInstance = null;
		}
		initializeSortable();
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
				easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
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
				removeCloneOnHide: false,
				revertOnSpill: false,
				dragoverBubble: false,
				dropBubble: false,
				preventOnFilter: false,
				onStart: () => {
					document.body.classList.add('is-dragging');
					if (sortableContainer) {
						sortableContainer.classList.add('dragging-active');
					}
					console.log('Drag started');
				},
				onEnd: (evt) => {
					document.body.classList.remove('is-dragging');

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
						updateActivitiesAndTrack();
					}
				},
				onMove: () => {
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
		updateActivitiesAndTrack();
		await tick();
		reinitializeSortable();
	}

	async function handleDeleteActivity(event: CustomEvent<{ id: string }>) {
		localActivities = localActivities.filter((a) => a.id !== event.detail.id);
		updateActivitiesAndTrack();
		await tick();

		if (localActivities.length > 0) {
			reinitializeSortable();
		}
	}

	function handleUpdateActivity(
		event: CustomEvent<{ id: string; activity: Partial<Activity> }>,
	) {
		localActivities = localActivities.map((a) =>
			a.id === event.detail.id ? { ...a, ...event.detail.activity } : a,
		);
		updateActivitiesAndTrack();
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
		const currentActivities = localActivities;

		const jsonData = {
			exportDate: new Date().toISOString(),
			totalActivities: currentActivities.length,
			activities: currentActivities,
		};

		const jsonString = JSON.stringify(jsonData, null, 2);
		const blob = new Blob([jsonString], { type: 'application/json' });
		const url = URL.createObjectURL(blob);

		const link = document.createElement('a');
		link.href = url;
		link.download = `extracurricular-activities-${new Date().toISOString().split('T')[0]}.json`;

		document.body.appendChild(link);
		link.click();

		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}

	// Dispatch save event to parent
	function handleSave() {
		dispatch('saveActivities', { activities: localActivities });
	}
</script>

<div class="min-h-screen space-y-6 bg-background p-4">
	<!-- Status Bar -->
	{#if isAuthenticated}
		<div class="flex w-full items-center justify-between">
			<div class="flex items-center gap-3">
				<!-- Status Display -->
				<div class="flex items-center gap-2 text-sm {statusDisplay.class}">
					{#if changeState.status === 'saving'}
						<div class="loading-spinner h-4 w-4"></div>
					{:else if changeState.hasUnsavedChanges}
						<AlertCircle class="h-4 w-4" />
					{:else}
						<div class="h-2 w-2 rounded-full bg-green-500"></div>
					{/if}
					<span>{statusDisplay.text}</span>
				</div>

				<!-- Save Button -->
				{#if statusDisplay.showSaveButton}
					<Button
						on:click={handleSave}
						size="sm"
						variant="outline"
						disabled={changeState.status === 'saving'}
					>
						<Save class="mr-2 h-4 w-4" />
						{changeState.status === 'saving' ? 'Saving...' : 'Save Changes'}
					</Button>
				{/if}
			</div>

			<div class="flex items-center gap-2">
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
		</div>
	{:else}
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
	{/if}

	<!-- Main Board -->
	<div class="w-full">
		<div class="rounded-lg bg-muted/30 p-6">
			<div class="mb-6 flex items-center justify-between">
				<h2 class="text-xl font-semibold">
					Activities ({localActivities.length})
				</h2>
				{#if !isAuthenticated}
					<div class="text-sm text-muted-foreground">
						Sign in to save your work
					</div>
				{/if}
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
	/* Loading spinner */
	.loading-spinner {
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

	/* Sortable.js styling - clean and minimal */
	:global(.sortable-ghost) {
		opacity: 0.4;
	}

	:global(.sortable-chosen) {
		cursor: grabbing !important;
		z-index: 1000;
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
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
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
