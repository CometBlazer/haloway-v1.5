<script>
	import { enhance } from '$app/forms';
	import { Loader2 } from 'lucide-svelte';
</script>

<div class="fixed inset-0 flex items-center justify-center bg-background">
	<form method="POST" use:enhance class="flex flex-col items-center gap-4">
		<Loader2 class="h-8 w-8 animate-spin text-primary" />
		<p class="text-muted-foreground">Creating new essay...</p>
	</form>
</div>
