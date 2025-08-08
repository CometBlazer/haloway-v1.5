<script>
	import ConsultantChatbot from '$lib/components/General-Consultant/ConsultantChatbot.svelte';
</script>

<div class="mx-auto min-h-screen w-full max-w-6xl py-8">
	<div class="px-4">
		<div class="mb-8 text-center">
			<h1 class="mb-4 text-3xl font-bold text-foreground md:text-5xl">
				Personal College Consultant
			</h1>
			<p class="text-muted-foreground">
				Talk with a personalized college consultant I'm here to help you with
				your college application and advising you on how to get into your dream
				school. Please fill out the background section if you haven't done so
				already. Once filled out, I'll be able to give you personalized advice
				on college applications and advising!
			</p>
		</div>

		<ConsultantChatbot height="750px" />
	</div>
</div>
