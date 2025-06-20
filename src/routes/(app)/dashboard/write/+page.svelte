<!-- src/routes/(app)/dashboard/write/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';

	let form: HTMLFormElement;

	onMount(() => {
		// Automatically submit the form when the page loads
		form.requestSubmit();
	});
</script>

<div class="flex min-h-screen items-center justify-center">
	<form
		bind:this={form}
		method="POST"
		use:enhance
		class="flex flex-col items-center gap-4"
	>
		<div class="loading loading-spinner loading-lg"></div>
		<p class="text-base-content/70">Creating new essay...</p>
	</form>
</div>
