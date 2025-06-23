<!-- src/routes/(app)/schools/[school]/write/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import { Loader2 } from 'lucide-svelte';
	import { WebsiteName } from '../../../../../config';
	import type { PageData } from './$types';

	export let data: PageData;

	$: schoolDisplayName = data.school; // Use the resolved school name from server

	let form: HTMLFormElement;

	onMount(() => {
		// Automatically submit the form when the page loads
		form.requestSubmit();
	});
</script>

<svelte:head>
	<title>Creating {schoolDisplayName} Essay | {WebsiteName}</title>
</svelte:head>

<div class="fixed inset-0 flex items-center justify-center bg-background">
	<form
		bind:this={form}
		method="POST"
		use:enhance
		class="flex flex-col items-center gap-4"
	>
		<Loader2 class="h-8 w-8 animate-spin text-primary" />
		<p class="text-muted-foreground">
			Creating new {schoolDisplayName} essay...
		</p>
	</form>
</div>
