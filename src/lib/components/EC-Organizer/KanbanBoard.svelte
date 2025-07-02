<!-- KanbanBoard.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
	} from '$lib/components/ui/card';
	import { Plus } from 'lucide-svelte';
	import ActivityCard from './ActivityCard.svelte';
	import type { Activity as BaseActivity } from '$lib/types/activity';
	import { dndzone, SHADOW_ITEM_MARKER_PROPERTY_NAME } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';

	import type { DndEvent } from 'svelte-dnd-action';

	// Extend the base Activity type to include the shadow item marker property
	type Activity = BaseActivity & {
		[SHADOW_ITEM_MARKER_PROPERTY_NAME]?: boolean;
	};

	let activities: Activity[] = [];

	const STORAGE_KEY = 'college-extracurriculars';
	const flipDurationMs = 200;

	onMount(() => {
		loadFromStorage();
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

	function addNewActivity() {
		// Add to the beginning of the array (top)
		activities = [createNewActivity(), ...activities];
		saveToStorage();
	}

	function handleDeleteActivity(event: CustomEvent<{ id: string }>) {
		activities = activities.filter((a) => a.id !== event.detail.id);
		saveToStorage();
	}

	function handleUpdateActivity(
		event: CustomEvent<{ id: string; activity: Partial<Activity> }>,
	) {
		activities = activities.map((a) =>
			a.id === event.detail.id ? { ...a, ...event.detail.activity } : a,
		);
		saveToStorage();
	}

	function handleDndConsider(e: CustomEvent<DndEvent<Activity>>) {
		activities = e.detail.items;
	}

	function handleDndFinalize(e: CustomEvent<DndEvent<Activity>>) {
		activities = e.detail.items;
		saveToStorage();
	}
</script>

<div class="kanban-container">
	<!-- Header -->
	<div class="header">
		<div class="header-content">
			<h1>College Extracurriculars</h1>
			<p>Organize your activities for Common App</p>
		</div>
		<Button on:click={addNewActivity} class="add-btn">
			<Plus class="mr-2 h-4 w-4" />
			Add Activity
		</Button>
	</div>

	<!-- Statistics -->
	<div class="stats">
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
	<div class="mx-auto max-w-7xl">
		<div class="column">
			<div class="column-header">
				<h2>Activities ({activities.length})</h2>
			</div>

			{#if activities.length === 0}
				<div class="empty-state">
					<div class="empty-icon">
						<Plus class="h-8 w-8 text-muted-foreground" />
					</div>
					<h3>No activities yet</h3>
					<p>
						Start organizing your extracurricular activities for your college
						applications.
					</p>
					<Button on:click={addNewActivity}>
						<Plus class="mr-2 h-4 w-4" />
						Add Activity
					</Button>
				</div>
			{:else}
				<div class="activities">
					<section
						class="activities-container"
						use:dndzone={{
							items: activities,
							flipDurationMs,
							type: 'activity',
							dropTargetStyle: { outline: 'none' },
						}}
						on:consider={handleDndConsider}
						on:finalize={handleDndFinalize}
					>
						{#each activities as activity (activity.id + (activity[SHADOW_ITEM_MARKER_PROPERTY_NAME] ? '_shadow' : ''))}
							<div
								class="activity-wrapper"
								class:has-shadow-item={activity[
									SHADOW_ITEM_MARKER_PROPERTY_NAME
								]}
								animate:flip={!activity[SHADOW_ITEM_MARKER_PROPERTY_NAME]
									? { duration: flipDurationMs }
									: undefined}
								data-is-dnd-shadow-item-hint={activity[
									SHADOW_ITEM_MARKER_PROPERTY_NAME
								]}
							>
								<ActivityCard
									{activity}
									on:delete={handleDeleteActivity}
									on:update={handleUpdateActivity}
								/>
							</div>
						{/each}
					</section>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	/* Minimal custom styles - rely on Tailwind/shadcn */
</style>
