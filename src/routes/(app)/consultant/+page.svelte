<script>
	import ConsultantChatbot from '$lib/components/General-Consultant/ConsultantChatbot.svelte';
	import { User, FileText, Award, Compass } from 'lucide-svelte';
</script>

<div class="mx-auto min-h-screen w-full max-w-6xl py-8">
	<div class="px-4">
		<div class="mb-8 text-center">
			<h1 class="mb-4 text-3xl font-bold text-foreground md:text-5xl">
				Personal College Consultant
			</h1>
			<p class="text-muted-foreground">
				Talk with a personalized college consultant to help you with your
				college application and get advice on how to get into your dream school.
			</p>
			<!-- <p class="my-2 text-sm text-muted-foreground">
				Please fill out the <a
					href="/background"
					class="text-primary underline hover:text-primary/80"
					>background form</a
				>
				and
				<a
					href="/extracurricular-organizer"
					class="text-primary underline hover:text-primary/80"
					>activities organizer</a
				> if you haven't done so already. Once completed, Chloe will be able to give
				you personalized advice on college applications.
			</p> -->
		</div>

		<ConsultantChatbot height="750px" />

		<!-- Enhanced Information Access Disclaimer -->
		<div class="mt-6 rounded-lg border bg-muted/30 p-6">
			<div class="mb-4 flex-col items-center gap-2">
				<h3 class="text-lg font-semibold text-foreground">
					What Chloe Can See
				</h3>
			</div>

			<div class="grid gap-4 md:grid-cols-2">
				<!-- Profile Information -->
				<div class="flex items-start gap-3">
					<User class="mt-0.5 h-4 w-4 text-primary" />
					<div>
						<p class="font-medium text-foreground">Your Profile</p>
						<p class="text-sm text-muted-foreground">
							Name, graduation year, dream school
						</p>
						<a
							href="/settings/profile"
							class="text-sm text-primary underline hover:text-primary/80"
						>
							Edit Profile
						</a>
					</div>
				</div>

				<!-- Background Information -->
				<div class="flex items-start gap-3">
					<Compass class="mt-0.5 h-4 w-4 text-primary" />
					<div>
						<p class="font-medium text-foreground">Your Background</p>
						<p class="text-sm text-muted-foreground">
							Academic stats, demographics, challenges
						</p>
						<a
							href="/background"
							class="text-sm text-primary underline hover:text-primary/80"
						>
							Edit Background
						</a>
					</div>
				</div>

				<!-- Activities Information -->
				<div class="flex items-start gap-3">
					<Award class="mt-0.5 h-4 w-4 text-primary" />
					<div>
						<p class="font-medium text-foreground">Your Activities</p>
						<p class="text-sm text-muted-foreground">
							Extracurriculars, leadership, time commitments
						</p>
						<a
							href="/extracurricular-organizer"
							class="text-sm text-primary underline hover:text-primary/80"
						>
							Edit Activities
						</a>
					</div>
				</div>

				<!-- Essays Information -->
				<div class="flex items-start gap-3">
					<FileText class="mt-0.5 h-4 w-4 text-primary" />
					<div>
						<p class="font-medium text-foreground">Your Essays</p>
						<p class="text-sm text-muted-foreground">
							Titles, prompts, schools, deadlines (not content)
						</p>
						<a
							href="/dashboard"
							class="text-sm text-primary underline hover:text-primary/80"
						>
							Manage Essays
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
