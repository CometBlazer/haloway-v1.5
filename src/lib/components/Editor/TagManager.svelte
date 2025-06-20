<!-- src/lib/components/Editor/TagManager.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { ComponentTag } from '../../../DatabaseDefinitions';
	import { Check, Trash2 } from 'lucide-svelte';

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

<div class="tag-manager">
	<div class="header">
		<h2 class="title">Tags</h2>
		<button
			type="button"
			class="new-tag-btn"
			on:click={() => (isCreatingTag = true)}
			aria-label="Create new tag"
		>
			New Tag
		</button>
	</div>

	{#if isCreatingTag}
		<div class="create-tag-form">
			<input
				type="text"
				bind:value={newTagName}
				on:keydown={(e) => e.key === 'Enter' && handleCreateTag()}
				class="tag-name-input"
				placeholder="Tag name"
				aria-label="New tag name"
			/>
			<input
				type="color"
				bind:value={newTagColor}
				class="color-picker"
				aria-label="Tag color"
			/>
			<div class="form-actions">
				<button type="button" class="create-btn" on:click={handleCreateTag}>
					Create
				</button>
				<button
					type="button"
					class="cancel-btn"
					on:click={() => (isCreatingTag = false)}
				>
					Cancel
				</button>
			</div>
		</div>
	{/if}

	<div class="tags-list">
		{#each tags as tag}
			<div class="tag-item">
				<button
					type="button"
					class="tag-button"
					on:click={() => toggleTag(tag.id)}
				>
					<div
						class="tag-color-dot"
						style="background-color: {tag.color}"
					></div>
					<span class="tag-name">{tag.name}</span>
					{#if selectedTags.includes(tag.id)}
						<Check size={16} class="check-icon" />
					{/if}
				</button>
				<button
					type="button"
					class="delete-btn"
					on:click={() => handleDeleteTag(tag.id)}
					aria-label="Delete tag"
				>
					<Trash2 size={14} />
				</button>
			</div>
		{/each}
	</div>
</div>

<style>
	.tag-manager {
		padding: 1rem;
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;
	}

	.title {
		font-size: 1.125rem;
		font-weight: 600;
		color: hsl(var(--color-base-content));
		margin: 0;
	}

	.new-tag-btn {
		display: inline-flex;
		align-items: center;
		padding: 0.375rem 0.875rem;
		background: hsl(var(--color-primary));
		color: hsl(var(--color-primary-content));
		border: 1px solid hsl(var(--color-primary));
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
	}

	.new-tag-btn:hover {
		background: hsl(var(--color-primary) / 0.9);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.new-tag-btn:focus {
		outline: 2px solid hsl(var(--color-primary));
		outline-offset: 2px;
	}

	.new-tag-btn:active {
		transform: translateY(0);
	}

	.create-tag-form {
		margin-bottom: 1rem;
		padding: 1rem;
		background: hsl(var(--color-base-100));
		border: 1px solid hsl(var(--color-base-300));
		border-radius: 0.5rem;
	}

	.tag-name-input {
		width: 100%;
		padding: 0.75rem;
		margin-bottom: 0.5rem;
		background: hsl(var(--color-base-000));
		border: 1px solid hsl(var(--color-base-300));
		border-radius: 0.375rem;
		font-size: 0.875rem;
		color: hsl(var(--color-base-content));
		transition: all 0.2s ease;
	}

	.tag-name-input:focus {
		outline: none;
		border-color: hsl(var(--color-primary));
		box-shadow: 0 0 0 3px hsl(var(--color-primary) / 0.1);
	}

	.tag-name-input::placeholder {
		color: hsl(var(--color-base-400));
	}

	.color-picker {
		width: 100%;
		height: 2.5rem;
		margin-bottom: 0.5rem;
		border: 1px solid hsl(var(--color-base-300));
		border-radius: 0.375rem;
		cursor: pointer;
		background: hsl(var(--color-base-000));
	}

	.color-picker:focus {
		outline: 2px solid hsl(var(--color-primary));
		outline-offset: 2px;
	}

	.form-actions {
		display: flex;
		gap: 0.5rem;
	}

	.create-btn {
		padding: 0.375rem 0.875rem;
		background: hsl(var(--color-primary));
		color: hsl(var(--color-primary-content));
		border: 1px solid hsl(var(--color-primary));
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.create-btn:hover {
		background: hsl(var(--color-primary) / 0.9);
	}

	.create-btn:focus {
		outline: 2px solid hsl(var(--color-primary));
		outline-offset: 2px;
	}

	.cancel-btn {
		padding: 0.375rem 0.875rem;
		background: transparent;
		color: hsl(var(--color-base-content));
		border: 1px solid hsl(var(--color-base-300));
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.cancel-btn:hover {
		background: hsl(var(--color-base-200));
	}

	.cancel-btn:focus {
		outline: 2px solid hsl(var(--color-primary));
		outline-offset: 2px;
	}

	.tags-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.tag-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem;
		background: transparent;
		border-radius: 0.5rem;
		transition: background-color 0.2s ease;
	}

	.tag-item:hover {
		background: hsl(var(--color-base-200));
	}

	.tag-button {
		display: flex;
		flex: 1;
		align-items: center;
		gap: 0.5rem;
		background: transparent;
		border: none;
		padding: 0;
		cursor: pointer;
		color: hsl(var(--color-base-content));
		transition: all 0.2s ease;
		text-align: left;
	}

	.tag-button:focus {
		outline: 2px solid hsl(var(--color-primary));
		outline-offset: 2px;
		border-radius: 0.25rem;
	}

	.tag-color-dot {
		height: 0.75rem;
		width: 0.75rem;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.tag-name {
		font-weight: 500;
		color: hsl(var(--color-base-content));
	}

	/* .check-icon {
		color: hsl(var(--color-primary));
		flex-shrink: 0;
	} */

	.delete-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.25rem;
		background: transparent;
		color: hsl(var(--color-base-content));
		border: none;
		border-radius: 0.25rem;
		cursor: pointer;
		transition: all 0.2s ease;
		opacity: 0.6;
	}

	.delete-btn:hover {
		background: hsl(var(--color-error) / 0.1);
		color: hsl(var(--color-error));
		opacity: 1;
	}

	.delete-btn:focus {
		outline: 2px solid hsl(var(--color-primary));
		outline-offset: 2px;
		opacity: 1;
	}

	/* Touch handling for mobile */
	@media (max-width: 768px) {
		.tag-manager {
			padding: 0.75rem;
		}

		.title {
			font-size: 1rem;
		}

		.new-tag-btn {
			padding: 0.25rem 0.75rem;
			font-size: 0.8125rem;
		}

		.create-tag-form {
			padding: 0.75rem;
		}

		.tag-name-input {
			padding: 0.625rem;
		}

		.color-picker {
			height: 2rem;
		}

		.create-btn,
		.cancel-btn {
			padding: 0.25rem 0.75rem;
			font-size: 0.8125rem;
		}

		.tag-item {
			padding: 0.375rem;
		}

		.tag-color-dot {
			height: 0.625rem;
			width: 0.625rem;
		}

		.tag-name {
			font-size: 0.875rem;
		}
	}

	/* Ensure proper touch handling */
	.tag-button,
	.delete-btn,
	.new-tag-btn,
	.create-btn,
	.cancel-btn {
		-webkit-tap-highlight-color: transparent;
		touch-action: manipulation;
	}

	/* Focus visible for better accessibility */
	.tag-button:focus-visible,
	.delete-btn:focus-visible,
	.new-tag-btn:focus-visible,
	.create-btn:focus-visible,
	.cancel-btn:focus-visible {
		outline: 2px solid hsl(var(--color-primary));
		outline-offset: 2px;
	}

	/* High contrast mode support */
	@media (prefers-contrast: high) {
		.tag-item {
			border: 1px solid hsl(var(--color-base-400));
		}

		.create-tag-form {
			border-width: 2px;
		}

		.tag-name-input,
		.color-picker {
			border-width: 2px;
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		* {
			transition: none !important;
		}
	}
</style>
