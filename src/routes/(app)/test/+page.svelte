<script>
	// import { enhance } from '$app/forms';
	// import { Loader2 } from 'lucide-svelte';

	import KanbanBoard from '$lib/components/EC-Organizer/KanbanBoard.svelte';
</script>

<div
	class="fixed inset-0 mx-auto mt-20 flex max-w-6xl items-center justify-center bg-background p-4"
>
	<KanbanBoard />
	<!-- <form method="POST" use:enhance class="flex flex-col items-center gap-4">
		<Loader2 class="h-8 w-8 animate-spin text-primary" />
		<p class="text-muted-foreground">Creating new essay...</p>
	</form> -->
</div>
