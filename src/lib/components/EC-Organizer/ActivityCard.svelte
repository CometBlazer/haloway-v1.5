<!-- ActivityCard.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import { GripVertical, BookOpen } from 'lucide-svelte';
	import type { Activity } from '$lib/types/activity';
	import { SHADOW_ITEM_MARKER_PROPERTY_NAME } from 'svelte-dnd-action';

	export let activity: Activity;

	const dispatch = createEventDispatcher<{
		delete: { id: string };
	}>();

	// Check if this is a shadow item (being dragged)
	$: isDragged =
		activity &&
		SHADOW_ITEM_MARKER_PROPERTY_NAME in activity &&
		Boolean(activity[SHADOW_ITEM_MARKER_PROPERTY_NAME]);

	function handleDelete() {
		dispatch('delete', { id: activity.id });
	}
</script>

<div class="activity-card" class:is-dragged={isDragged} data-is-handle="true">
	<Card
		class="w-full border-2 bg-white transition-all duration-200 hover:border-primary/20 hover:shadow-lg"
	>
		<CardHeader class="pb-3">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<BookOpen class="h-5 w-5 text-primary" />
					<span class="text-sm font-medium text-muted-foreground"
						>Activity #{activity.id.slice(-4)}</span
					>
				</div>
				<div class="flex items-center gap-2">
					<button
						class="delete-btn"
						on:click|stopPropagation|preventDefault={handleDelete}
						data-no-dnd="true"
						title="Delete"
					>
						×
					</button>
					<GripVertical
						class="h-5 w-5 cursor-grab text-muted-foreground active:cursor-grabbing"
					/>
				</div>
			</div>
		</CardHeader>

		<CardContent class="space-y-4">
			<div class="py-8 text-center">
				<h3 class="mb-2 text-lg font-semibold">Activity Card</h3>
				<p class="text-muted-foreground">Drag to reorder</p>
			</div>
		</CardContent>
	</Card>
</div>

<style>
	.activity-card {
		position: relative;
		width: 100%;
		margin-bottom: 16px;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
		transform: rotate(-1deg);
	}

	.activity-card:nth-child(even) {
		transform: rotate(1deg);
	}

	.activity-card:nth-child(3n) {
		transform: rotate(-1.5deg);
	}

	.activity-card:nth-child(5n) {
		transform: rotate(2deg);
	}

	/* Special styling for when the card is being dragged */
	.activity-card.is-dragged {
		transition: none !important;
		transform: none !important;
		box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.2) !important;
		z-index: 10 !important;
	}

	/* Disable all transitions within a dragged card */
	.activity-card.is-dragged * {
		transition: none !important;
		animation: none !important;
	}

	/* Prevent hover effects during drag */
	.activity-card.is-dragged:hover {
		transform: none !important;
	}

	.activity-card:not(.is-dragged):hover {
		transform: scale(1.02) rotate(0deg);
		box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.2);
		z-index: 1;
	}

	.delete-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background-color: rgba(239, 68, 68, 0.1);
		color: rgb(239, 68, 68);
		border: none;
		font-size: 16px;
		cursor: pointer;
		transition: all 0.2s;
		opacity: 0;
	}

	.activity-card:hover .delete-btn {
		opacity: 1;
	}

	.delete-btn:hover {
		background-color: rgba(239, 68, 68, 0.2);
		transform: scale(1.1);
	}
</style>
