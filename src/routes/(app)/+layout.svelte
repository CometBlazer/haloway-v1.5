<!-- src/routes/(app)/+layout.svelte -->
<script lang="ts">
	import Home from '~icons/lucide/home';
	import PanelLeft from '~icons/lucide/panel-left';
	import Settings from '~icons/lucide/settings';
	import {
		CirclePlus,
		PenLine,
		Loader2,
		Trophy,
		ExternalLink,
		NotebookPen,
		GraduationCap,
		Sparkles,
	} from 'lucide-svelte';

	import Logo from '$lib/components/Logo.svelte';
	import PersonalMenu from '$lib/components/personal-menu.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Sheet from '$lib/components/ui/sheet';
	import * as Dialog from '$lib/components/ui/dialog';
	import Breadcrumbs from './components/breadcrumbs.svelte';
	import NavLink from './components/nav-link.svelte';
	import { WebsiteName } from '../../config';
	import { enhance } from '$app/forms';
	import { toastStore } from '$lib/stores/toast';

	// Form components
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import SchoolDropdown from '$lib/components/Editor/SchoolDropdown.svelte';
	import Banner from '$lib/components/Banner.svelte';

	// Date picker components
	import CalendarIcon from 'lucide-svelte/icons/calendar';
	import {
		DateFormatter,
		type DateValue,
		getLocalTimeZone,
	} from '@internationalized/date';
	import { cn } from '$lib/utils';
	import { buttonVariants } from '$lib/components/ui/button';
	import * as Popover from '$lib/components/ui/popover';
	import { Calendar } from '$lib/components/ui/calendar';

	export let data;

	// Global new essay modal state
	let showNewEssayModal = false;
	let isCreatingEssay = false;

	// New essay form data
	let newEssayForm = {
		school: '',
		title: '',
		prompt: '',
		dueDate: '',
	};

	// Date formatter and picker state
	const df = new DateFormatter('en-US', {
		dateStyle: 'medium',
	});
	let dueDateValue: DateValue | undefined = undefined;

	// Update this reactive statement to sync date picker with form
	$: if (dueDateValue) {
		newEssayForm.dueDate = dueDateValue.toString();
	} else {
		newEssayForm.dueDate = '';
	}

	// Function to handle create essay button click
	function handleCreateEssay() {
		showNewEssayModal = true;
	}

	function closeNewEssayModal(): void {
		showNewEssayModal = false;
		// Always reset loading state when closing
		isCreatingEssay = false;
		// Reset form
		newEssayForm = {
			school: '',
			title: '',
			prompt: '',
			dueDate: '',
		};
		// Reset due date value
		dueDateValue = undefined;
	}

	function handleSchoolChange(event: CustomEvent<string>) {
		newEssayForm.school = event.detail;
	}

	// Handle escape key to close modal
	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape' && showNewEssayModal) {
			closeNewEssayModal();
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="lg:hidden">
	<Banner
		text="For the best experience and access to all features, please use a desktop."
		showBullets={true}
	/>
</div>

<div class="banner-offset flex min-h-screen w-full flex-col bg-muted/40">
	<aside
		class="fixed inset-y-0 left-0 !z-[60] hidden w-20 flex-col border-r bg-background sm:flex"
	>
		<nav class="flex flex-col items-center gap-4 px-2 sm:py-5">
			<a
				href="/"
				class="group flex flex-col items-center justify-center gap-1 py-2"
			>
				<Logo />
				<span class="text-xs font-medium text-muted-foreground">Home</span>
			</a>
			<NavLink
				href="/dashboard"
				class="flex flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-muted-foreground transition-colors hover:text-foreground"
				activeClass="bg-accent text-accent-foreground"
			>
				<Home class="h-5 w-5 text-color-primary" />
				<span class="text-center text-xs font-medium">Dashboard</span>
			</NavLink>
			<!-- Create Essay Button -->
			<button
				on:click={handleCreateEssay}
				class="flex flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-muted-foreground transition-colors hover:text-foreground"
			>
				<CirclePlus class="h-5 w-5 text-color-primary" />
				<span class="text-center text-xs font-medium">Create Essay</span>
			</button>
			<NavLink
				href="/consultant"
				class="flex flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-muted-foreground transition-colors hover:text-foreground"
				activeClass="bg-accent text-accent-foreground"
			>
				<GraduationCap class="h-5 w-5" />
				<span class="text-center text-xs font-medium">College Consultant</span>
			</NavLink>

			<NavLink
				href="/extracurricular-organizer"
				class="flex flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-muted-foreground transition-colors hover:text-foreground"
				activeClass="bg-accent text-accent-foreground"
			>
				<Trophy class="h-5 w-5" />
				<span class="text-center text-xs font-medium">Activities Organizer</span
				>
			</NavLink>
			<NavLink
				href="/background"
				class="flex flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-muted-foreground transition-colors hover:text-foreground"
				activeClass="bg-accent text-accent-foreground"
			>
				<NotebookPen class="h-5 w-5" />
				<span class="text-center text-xs font-medium">Background</span>
			</NavLink>
			<NavLink
				href="https://dan.haloway.co"
				class="flex flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-muted-foreground transition-colors hover:text-foreground"
				activeClass="bg-accent text-accent-foreground"
				target="_blank"
			>
				<Sparkles class="h-5 w-5" />
				<span class="text-center text-xs font-medium">Essay Coaching</span>
			</NavLink>
			<NavLink
				class="flex flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-muted-foreground transition-colors hover:text-foreground"
				activeClass="bg-accent text-accent-foreground"
				href="https://www.commonapp.org/blog/announcing-2025-2026-common-app-essay-prompts"
				target="_blank"
			>
				<ExternalLink class="h-5 w-5" />
				<span class="text-center text-xs font-medium text-muted-foreground"
					>Common App Prompts</span
				>
			</NavLink>
			<!-- Replace later with "T20 Sample Essays"-->
		</nav>
		<nav class="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
			<NavLink
				href="/settings"
				class="flex flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-muted-foreground transition-colors hover:text-foreground"
				activeClass="bg-accent text-accent-foreground"
			>
				<Settings class="h-5 w-5" />
				<span class="text-xs font-medium">Settings</span>
			</NavLink>
		</nav>
	</aside>
	<div class="flex flex-col sm:gap-4 sm:py-4 sm:pl-20">
		<header
			class="z-60 sticky top-0 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6"
		>
			<Sheet.Root>
				<Sheet.Trigger asChild let:builder>
					<Button
						builders={[builder]}
						size="icon"
						variant="outline"
						class="sm:hidden"
					>
						<PanelLeft class="h-5 w-5" />
						<span class="sr-only">Toggle Menu</span>
					</Button>
				</Sheet.Trigger>
				<Sheet.Content side="left" class="sm:max-w-xs">
					<nav class="grid gap-6 text-lg font-medium">
						<a
							href="/"
							class="mb-2 flex items-center gap-2 px-2.5 text-xl font-bold"
						>
							<Logo />
							<span class="ml-2">{WebsiteName}</span>
						</a>
						<a
							href="/dashboard"
							class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
						>
							<Home class="h-5 w-5 text-color-primary" />
							Dashboard
						</a>

						<!-- Create Essay Button for Mobile -->
						<button
							on:click={handleCreateEssay}
							class="flex items-center gap-4 px-2.5 text-left text-muted-foreground hover:text-foreground"
						>
							<CirclePlus class="h-5 w-5 text-color-primary" />
							Create Essay
						</button>

						<a
							href="/extracurricular-organizer"
							class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
						>
							<Trophy class="h-5 w-5" />
							Activities Organizer
						</a>
						<a
							href="/background"
							class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
						>
							<NotebookPen class="h-5 w-5" />
							Background
						</a>
						<a
							href="/consultant"
							target="_blank"
							class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
						>
							<GraduationCap class="h-5 w-5" />
							College Consultant
						</a>
						<a
							href="/essayfeedback"
							class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
						>
							<Sparkles class="h-5 w-5" />
							Essay Coaching
						</a>
						<a
							href="https://www.commonapp.org/blog/announcing-2025-2026-common-app-essay-prompts"
							target="_blank"
							class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
						>
							<ExternalLink class="h-5 w-5" />
							Common App Prompts
						</a>
						<!-- Replace later with "T20 Sample Essays"-->
						<a
							href="/settings"
							class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
						>
							<Settings class="h-5 w-5" />
							Settings
						</a>
					</nav>
				</Sheet.Content>
			</Sheet.Root>
			<Breadcrumbs />
			<PersonalMenu user={data.user} />
		</header>
		<main class="flex flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
			<slot />
		</main>
	</div>

	<!-- Global New Essay Modal -->
	<Dialog.Root bind:open={showNewEssayModal}>
		<Dialog.Content class="sm:max-w-lg">
			<Dialog.Header>
				<Dialog.Title class="mb-2 text-color-primary"
					>Add a New Essay</Dialog.Title
				>
				<Dialog.Description>
					Fill in as much information as you can — you can always edit it later.
				</Dialog.Description>
			</Dialog.Header>

			{#if isCreatingEssay}
				<div class="flex flex-col items-center justify-center space-y-4 py-8">
					<Loader2 class="h-8 w-8 animate-spin text-primary" />
					<p class="text-center text-muted-foreground">Creating essay...</p>
				</div>
			{:else}
				<form
					method="POST"
					action="/dashboard?/createDocument"
					use:enhance={() => {
						isCreatingEssay = true;
						return async ({ result, update }) => {
							if (result.type === 'redirect') {
								// For redirects, show success, close modal, then allow redirect
								toastStore.show('Essay created successfully', 'success');
								closeNewEssayModal();
								// Call update to allow the redirect to proceed
								await update();
							} else {
								// Always reset loading state for non-redirect results
								isCreatingEssay = false;

								if (result.type === 'failure') {
									// Handle errors
									if (
										result.data?.error &&
										typeof result.data.error === 'object' &&
										'message' in result.data.error
									) {
										toastStore.show(String(result.data.error.message), 'error');
									} else {
										toastStore.show('Failed to create essay', 'error');
									}
								}
								// Call update for non-redirect results
								await update();
							}
						};
					}}
				>
					<div class="space-y-4">
						<div class="space-y-2">
							<Label for="school" class="text-sm font-medium">
								Choose a school to assign this essay <span
									class="text-destructive">*</span
								>
							</Label>
							<p class="pb-2 text-xs text-muted-foreground">
								We're constantly adding new schools — if you can't find your
								school, please let us know and we'll add it as soon as possible.
							</p>
							<SchoolDropdown
								currentSchool={newEssayForm.school}
								on:schoolChange={handleSchoolChange}
								disabled={false}
								size="medium"
							/>
							<input type="hidden" name="school" value={newEssayForm.school} />
							<p class="pb-2 text-xs text-muted-foreground">
								*You can also select "Uncategorized" to create an uncategorized
								essay for essays that don't belong to a specific school, like
								your Common App personal statement.
							</p>
						</div>

						<div class="space-y-2">
							<Label for="title" class="text-sm font-medium">Essay Title</Label>
							<p class="pb-2 text-xs text-muted-foreground">
								Give your essay a descriptive title to help you find it later.
								This is optional, but recommended.
							</p>
							<Input
								id="title"
								name="title"
								bind:value={newEssayForm.title}
								placeholder="Eg. Harvard Supp #1, Personal Statement, etc. (optional)"
							/>
						</div>

						<div class="space-y-2">
							<Label for="prompt" class="text-sm font-medium"
								>Essay Prompt</Label
							>
							<Textarea
								id="prompt"
								name="prompt"
								bind:value={newEssayForm.prompt}
								placeholder="If you have your prompt, paste it here (optional)"
								rows={3}
							/>
						</div>

						<div class="space-y-2">
							<Label for="dueDate" class="text-sm font-medium"
								>Due date (optional)</Label
							>
							<p class="pb-2 text-xs text-muted-foreground">
								If you know your school's due date, you can add it here.
							</p>

							<Popover.Root>
								<Popover.Trigger
									class={cn(
										buttonVariants({
											variant: 'outline',
										}),
										'h-10 w-full justify-start text-left font-normal',
										!dueDateValue && 'text-muted-foreground',
									)}
								>
									<CalendarIcon class="mr-2 h-4 w-4" />
									{dueDateValue
										? df.format(dueDateValue.toDate(getLocalTimeZone()))
										: 'Select due date (optional)'}
								</Popover.Trigger>
								<Popover.Content class="w-auto p-0" align="start">
									<Calendar
										bind:value={dueDateValue}
										placeholder={dueDateValue}
										onValueChange={(date) => {
											dueDateValue = date;
										}}
									/>
								</Popover.Content>
							</Popover.Root>

							<!-- Keep the hidden input for form submission -->
							<input
								type="hidden"
								name="dueDate"
								value={newEssayForm.dueDate}
							/>
						</div>

						<Dialog.Footer class="mt-4 gap-2">
							<Button
								type="button"
								variant="outline"
								on:click={closeNewEssayModal}
								class="w-full sm:w-auto"
								disabled={isCreatingEssay}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={!newEssayForm.school || isCreatingEssay}
								class="w-full sm:w-auto"
							>
								{#if isCreatingEssay}
									<Loader2 class="mr-2 h-4 w-4 animate-spin" />
									Creating...
								{:else}
									<PenLine class="mr-2 h-4 w-4" />
									Finish Creating Essay
								{/if}
							</Button>
						</Dialog.Footer>
					</div>
				</form>
			{/if}
		</Dialog.Content>
	</Dialog.Root>
</div>

<style>
	:root {
		scroll-behavior: smooth;
	}

	:global(:root) {
		/* default in case JS hasn’t run yet */
		--banner-height: 0px;
	}

	.banner-offset {
		/* push everything below the banner */
		margin-top: var(--banner-height);
	}
</style>
