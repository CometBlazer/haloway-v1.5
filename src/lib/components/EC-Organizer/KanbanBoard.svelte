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
	let isAddingActivity = false;

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
		activities = [...activities, createNewActivity()];
		saveToStorage();
		isAddingActivity = false;
	}

	function handleDeleteActivity(event: CustomEvent<{ id: string }>) {
		activities = activities.filter((a) => a.id !== event.detail.id);
		saveToStorage();
	}

	function handleDndConsider(e: CustomEvent<DndEvent<Activity>>) {
		activities = e.detail.items;
	}

	function handleDndFinalize(e: CustomEvent<DndEvent<Activity>>) {
		activities = e.detail.items;
		saveToStorage();
	}

	function handleAddBtn() {
		isAddingActivity = true;
	}

	function handleCancelBtn() {
		isAddingActivity = false;
	}
</script>

<div class="kanban-container">
	<!-- Header -->
	<div class="header">
		<div>
			<h1>College Extracurriculars</h1>
			<p>Organize your activities for Common App</p>
		</div>
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
	<div class="board">
		<div class="column">
			<div class="column-header">
				<h2>Activities ({activities.length})</h2>
				<div class="header-actions">
					{#if isAddingActivity}
						<button
							class="add-activity-btn"
							on:click|stopPropagation|preventDefault={handleCancelBtn}
							title="Cancel">✖</button
						>
					{:else}
						<button
							class="add-activity-btn"
							on:click|stopPropagation|preventDefault={handleAddBtn}
							title="Add new activity">+</button
						>
					{/if}
				</div>
			</div>

			{#if isAddingActivity}
				<button
					class="add-activity-form"
					on:click|stopPropagation={addNewActivity}
					on:keydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							addNewActivity();
						}
					}}
					tabindex="0"
					aria-label="Add new activity"
				>
					<div class="form-content">
						<p>Click to create a new activity card</p>
						<div class="form-actions">
							<button
								class="icon-btn cancel-btn"
								on:click|stopPropagation|preventDefault={handleCancelBtn}
								title="Cancel">❌</button
							>
							<button
								class="icon-btn save-btn"
								on:click|stopPropagation|preventDefault={addNewActivity}
								title="Add">➕</button
							>
						</div>
					</div>
				</button>
			{/if}

			<div class="activities">
				<section
					class="activities-container"
					class:empty={activities.length === 0}
					use:dndzone={{
						items: activities,
						flipDurationMs,
						type: 'activity',
						dropTargetStyle: { outline: 'none' },
					}}
					on:consider={handleDndConsider}
					on:finalize={handleDndFinalize}
				>
					{#if activities.length === 0}
						<div class="empty-state">
							<div class="empty-icon">
								<Plus class="h-8 w-8 text-muted-foreground" />
							</div>
							<h3>No activities yet</h3>
							<p>
								Start organizing your extracurricular activities for your
								college applications.
							</p>
							<Button on:click={addNewActivity}>
								<Plus class="mr-2 h-4 w-4" />
								Add Activity
							</Button>
						</div>
					{:else}
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
								<ActivityCard {activity} on:delete={handleDeleteActivity} />
							</div>
						{/each}
					{/if}
				</section>
			</div>
		</div>
	</div>
</div>

<style>
	.kanban-container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		width: 100%;
		overflow: hidden;
		box-sizing: border-box;
		padding: 16px;
		gap: 16px;
	}

	.header {
		flex-shrink: 0;
	}

	.header h1 {
		font-size: 2rem;
		font-weight: bold;
		margin: 0 0 4px 0;
	}

	.header p {
		color: hsl(var(--muted-foreground));
		margin: 0;
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 16px;
		flex-shrink: 0;
	}

	.board {
		display: flex;
		flex: 1;
		width: 100%;
		overflow: hidden;
		min-height: 0;
	}

	.column {
		display: flex;
		flex-direction: column;
		background-color: #f5f5f5;
		border-radius: 8px;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
		padding: 12px;
		box-sizing: border-box;
		flex: 1;
		height: 100%;
		max-height: 100%;
		overflow: hidden;
		min-width: 300px;
	}

	.column-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 12px;
		border-bottom: 1px solid #e0e0e0;
		margin-bottom: 12px;
		flex-shrink: 0;
	}

	.column-header h2 {
		margin: 0;
		font-size: 1.125rem;
		color: #333;
		font-weight: 600;
	}

	.header-actions {
		display: flex;
		gap: 12px;
		align-items: center;
	}

	.add-activity-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background-color: #6c6c6c;
		color: white;
		border: none;
		font-size: 16px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.add-activity-btn:hover {
		background-color: #555;
		transform: scale(1.05);
	}

	.activities {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		margin: 0 -6px;
		padding: 0 6px;
		display: flex;
		flex-direction: column;
		min-height: 0;
		position: relative;
	}

	.activities-container {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 6px 0;
		min-height: 120px;
		flex: 1;
		position: relative;
		z-index: 1;
	}

	.activities-container.empty {
		height: 100%;
		min-height: calc(100% - 40px);
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		transition: all 0.2s ease;
		background-color: transparent;
	}

	.activities-container:hover,
	.activities-container:focus-within {
		background-color: rgba(0, 0, 0, 0.02);
	}

	.activity-wrapper {
		width: 100%;
	}

	.activity-wrapper.has-shadow-item {
		transition: none !important;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 48px 24px;
	}

	.empty-icon {
		background-color: hsl(var(--muted));
		border-radius: 50%;
		padding: 12px;
		margin-bottom: 16px;
	}

	.empty-state h3 {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0 0 8px 0;
	}

	.empty-state p {
		color: hsl(var(--muted-foreground));
		margin: 0 0 16px 0;
		max-width: 320px;
	}

	.add-activity-form {
		margin-bottom: 16px;
		background-color: white;
		padding: 16px;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		flex-shrink: 0;
		border: 2px dashed #ccc;
		cursor: pointer;
		transition: all 0.2s ease;
		width: 100%;
		text-align: left;
	}

	.add-activity-form:hover {
		border-color: #999;
		background-color: #fafafa;
	}

	.add-activity-form:focus {
		outline: 2px solid #4a69bd;
		outline-offset: 2px;
	}

	.form-content {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.form-content p {
		margin: 0;
		text-align: center;
		color: #666;
	}

	.form-actions {
		display: flex;
		justify-content: center;
		gap: 8px;
	}

	.icon-btn {
		background: none;
		border: none;
		cursor: pointer;
		padding: 8px;
		font-size: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 32px;
		min-height: 32px;
		border-radius: 50%;
		transition: all 0.2s;
		background-color: rgba(200, 200, 200, 0.3);
		z-index: 2;
	}

	.icon-btn:hover {
		background-color: rgba(200, 200, 200, 0.6);
		transform: scale(1.1);
	}

	/* Scrollbar styling */
	.activities::-webkit-scrollbar {
		width: 6px;
	}

	.activities::-webkit-scrollbar-track {
		background: #f1f1f1;
		border-radius: 3px;
	}

	.activities::-webkit-scrollbar-thumb {
		background: #ddd;
		border-radius: 3px;
	}

	.activities::-webkit-scrollbar-thumb:hover {
		background: #ccc;
	}

	@media (max-width: 768px) {
		.kanban-container {
			padding: 12px;
		}

		.column {
			padding: 8px;
			min-width: 280px;
		}

		.stats {
			grid-template-columns: 1fr;
		}

		.empty-state {
			padding: 32px 16px;
		}
	}
</style>
