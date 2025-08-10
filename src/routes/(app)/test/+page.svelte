<script>
	// import { enhance } from '$app/forms';
	// import { Loader2 } from 'lucide-svelte';

	// import KanbanBoard from '$lib/components/EC-Organizer/KanbanBoard.svelte';
	import Chatbot from '$lib/components/General-Consultant/ConsultantChatbot.svelte';
</script>

<div
	class="max-w-8xl mx-auto mt-20 flex items-center justify-center bg-background p-4"
>
	<div class="container mx-auto p-8">
		<h1 class="mb-6 text-2xl font-bold">My App with Chatbot</h1>

		<!-- Default size -->
		<div class="mb-8">
			<h2 class="mb-4 text-lg font-semibold">Default Chatbot</h2>
			<Chatbot />
		</div>

		<!-- Custom size -->
		<div class="mb-8">
			<h2 class="mb-4 text-lg font-semibold">Large Chatbot</h2>
			<Chatbot width="800px" height="600px" />
		</div>

		<!-- Responsive width -->
		<div class="mb-8">
			<h2 class="mb-4 text-lg font-semibold">Responsive Chatbot</h2>
			<div class="max-w-md">
				<Chatbot width="100%" height="500px" />
			</div>
		</div>
	</div>
	<!-- <KanbanBoard /> -->
	<!-- <form method="POST" use:enhance class="flex flex-col items-center gap-4">
		<Loader2 class="h-8 w-8 animate-spin text-primary" />
		<p class="text-muted-foreground">Creating new essay...</p>
	</form> -->
</div>
