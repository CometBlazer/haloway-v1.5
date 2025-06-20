<!-- src/lib/components/Editor/TagManager.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { ComponentTag } from '../../../DatabaseDefinitions';

	export let tags: ComponentTag[];
	export let selectedTags: string[] = [];

	const dispatch = createEventDispatcher<{
		addTag: string;
		removeTag: string;
		createTag: { name: string; color: string };
		deleteTag: string;
	}>();

	let isCreatingTag = false;
	let newTagName = '';
	let newTagColor = '#3b82f6'; // Default blue color

	function handleCreateTag() {
		if (newTagName.trim()) {
			dispatch('createTag', {
				name: newTagName.trim(),
				color: newTagColor,
			});
			isCreatingTag = false;
			newTagName = '';
			newTagColor = '#3b82f6';
		}
	}

	function toggleTag(tagId: string) {
		if (selectedTags.includes(tagId)) {
			dispatch('removeTag', tagId);
		} else {
			dispatch('addTag', tagId);
		}
	}

	function handleDeleteTag(tagId: string) {
		if (confirm('Are you sure you want to delete this tag?')) {
			dispatch('deleteTag', tagId);
		}
	}
</script>

<div class="p-4">
	<div class="mb-4 flex items-center justify-between">
		<h2 class="text-lg font-semibold">Tags</h2>
		<button
			type="button"
			class="btn btn-primary btn-sm"
			on:click={() => (isCreatingTag = true)}
			aria-label="Create new tag"
		>
			New Tag
		</button>
	</div>

	{#if isCreatingTag}
		<div class="mb-4">
			<input
				type="text"
				bind:value={newTagName}
				on:keydown={(e) => e.key === 'Enter' && handleCreateTag()}
				class="input input-bordered mb-2 w-full"
				placeholder="Tag name"
				aria-label="New tag name"
			/>
			<input
				type="color"
				bind:value={newTagColor}
				class="mb-2 h-10 w-full"
				aria-label="Tag color"
			/>
			<div class="flex gap-2">
				<button type="button" class="btn btn-sm" on:click={handleCreateTag}>
					Create
				</button>
				<button
					type="button"
					class="btn btn-ghost btn-sm"
					on:click={() => (isCreatingTag = false)}
				>
					Cancel
				</button>
			</div>
		</div>
	{/if}

	<div class="space-y-2">
		{#each tags as tag}
			<div
				class="hover:bg-base-200 flex items-center justify-between rounded-lg p-2"
			>
				<button
					type="button"
					class="flex flex-1 items-center gap-2"
					on:click={() => toggleTag(tag.id)}
				>
					<div
						class="h-3 w-3 rounded-full"
						style="background-color: {tag.color}"
					></div>
					<span class="font-medium">{tag.name}</span>
					{#if selectedTags.includes(tag.id)}
						<span class="i-lucide-check text-primary"></span>
					{/if}
				</button>
				<button
					type="button"
					class="btn btn-ghost btn-xs"
					on:click={() => handleDeleteTag(tag.id)}
					aria-label="Delete tag"
				>
					<span class="i-lucide-trash"></span>
				</button>
			</div>
		{/each}
	</div>
</div>
