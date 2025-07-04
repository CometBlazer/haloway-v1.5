<script>
	import KanbanBoard from '$lib/components/EC-Organizer/KanbanBoard.svelte';
	import { WebsiteName } from '../../../config';
</script>

<svelte:head>
	<title
		>Free College Extracurricular Activities Organizer | {WebsiteName}</title
	>
	<meta
		name="description"
		content="Organize your extracurricular activities for college applications with our free tool. Easily track your achievements, leadership roles, and community service to enhance your Common App profile."
	/>
</svelte:head>

<div class="container mx-auto px-6">
	<!-- Header -->
	<div class="mt-2 w-full text-center sm:text-center">
		<div
			class="relative mx-auto mb-6 w-[80px] sm:w-[100px] md:w-[100px] lg:w-[150px] xl:w-[200px]"
		>
			<div class="aspect-square">
				<div class="absolute inset-0 rounded-full bg-white"></div>
				<img
					src="https://illustrations.popsy.co/purple/weight-lifting.svg"
					alt="Weight lifting illustration"
					class="relative z-10 h-full w-full object-contain"
					loading="lazy"
				/>
			</div>
		</div>
		<h1 class="text-3xl font-bold tracking-tight md:text-4xl">
			Free College Extracurricular Activities Organizer
		</h1>
		<h2 class="mt-2 text-lg text-muted-foreground md:text-xl">
			Modeled after the Common App Activities List
		</h2>
		<h3 class="mt-4 text-base text-muted-foreground">
			No account is necessary to try it out. To save your work,
			<a
				href="/register"
				class="text-foreground underline hover:text-foreground/80"
				>create a free account</a
			>
			today.
		</h3>
		<h3 class=" text-base text-muted-foreground">
			Want a feature?
			<a
				href="/contact"
				class="text-foreground underline hover:text-foreground/80">Request it</a
			>.
		</h3>
	</div>

	<KanbanBoard />
</div>
