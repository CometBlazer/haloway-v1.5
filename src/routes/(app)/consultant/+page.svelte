<script>
	import ConsultantChatbot from '$lib/components/General-Consultant/ConsultantChatbot.svelte';
</script>

<div class="mx-auto min-h-screen w-full max-w-6xl py-8">
	<div class="px-4">
		<div class="mb-8 text-center">
			<h1 class="mb-4 text-3xl font-bold text-foreground md:text-5xl">
				Consultant
			</h1>
			<p class="text-muted-foreground">
				Please fill out the following information to help our AI understand your
				background better. All fields are optional! However, the more you share,
				the more helpful your responses may be. Talk with a personalized college
				consultant trained on your data
			</p>
		</div>

		<ConsultantChatbot />
	</div>
</div>
