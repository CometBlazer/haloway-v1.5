<!-- src/routes/(app)/schools/[school]/write/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import { Loader2, ArrowLeft } from 'lucide-svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { WebsiteName } from '../../../../../config';

	$: school = $page.params.school;
	$: schoolDisplayName = school.charAt(0).toUpperCase() + school.slice(1);

	let isCreating = false;
</script>

<svelte:head>
	<title>New {schoolDisplayName} Essay | {WebsiteName}</title>
</svelte:head>

<div class="mx-auto max-w-2xl space-y-6 p-6">
	<div class="flex items-center gap-3">
		<Button
			variant="ghost"
			size="sm"
			on:click={() => goto(`/schools/${school}`)}
			class="px-2"
		>
			<ArrowLeft class="h-4 w-4" />
		</Button>
		<h1 class="text-2xl font-semibold">New {schoolDisplayName} Essay</h1>
	</div>

	<div class="space-y-4 text-center">
		<p class="text-muted-foreground">
			Create a new essay for {schoolDisplayName}. You'll be taken to the editor
			where you can start writing.
		</p>

		<form
			method="post"
			use:enhance={() => {
				isCreating = true;
				return async ({ result, update }) => {
					// Always reset loading state for non-redirect results
					if (result.type !== 'redirect') {
						isCreating = false;
					}
					// Let SvelteKit handle all result types naturally
					await update();
				};
			}}
		>
			<Button type="submit" size="lg" disabled={isCreating}>
				{#if isCreating}
					<Loader2 class="mr-2 h-5 w-5 animate-spin" />
					Creating Essay...
				{:else}
					Create {schoolDisplayName} Essay
				{/if}
			</Button>
		</form>
	</div>
</div>
