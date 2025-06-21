<!-- src/lib/components/ui/toast/ToastContainer.svelte -->
<script lang="ts">
	import { toastStore } from '$lib/stores/toast';
	import Toast from './Toast.svelte';
</script>

{#if $toastStore.length > 0}
	<div class="toast-container">
		{#each $toastStore as toast (toast.id)}
			<Toast {toast} />
		{/each}
	</div>
{/if}

<style>
	.toast-container {
		position: fixed;
		top: 1rem;
		right: 1rem;
		z-index: 9999;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		pointer-events: none;
	}

	.toast-container :global(.toast) {
		pointer-events: auto;
	}

	/* Mobile responsiveness */
	@media (max-width: 640px) {
		.toast-container {
			top: 1rem;
			left: 1rem;
			right: 1rem;
			align-items: stretch;
		}

		.toast-container :global(.toast) {
			min-width: unset;
			max-width: unset;
		}
	}
</style>
