<script lang="ts">
	import Home from '~icons/lucide/home';
	import PanelLeft from '~icons/lucide/panel-left';
	import Settings from '~icons/lucide/settings';

	import Logo from '$lib/components/Logo.svelte';
	import PersonalMenu from '$lib/components/personal-menu.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Sheet from '$lib/components/ui/sheet';
	import Breadcrumbs from './components/breadcrumbs.svelte';
	import NavLink from './components/nav-link.svelte';
	import { WebsiteName } from '../../config';
	import { ExternalLink, Sparkles } from 'lucide-svelte';

	export let data;
</script>

<div class="flex min-h-screen w-full flex-col bg-muted/40">
	<aside
		class="fixed inset-y-0 left-0 z-10 hidden w-20 flex-col border-r bg-background sm:flex"
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
				<Home class="h-5 w-5" />
				<span class="text-center text-xs font-medium">Dashboard</span>
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
			<NavLink
				href="/essayfeedback"
				class="flex flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-muted-foreground transition-colors hover:text-foreground"
				activeClass="bg-accent text-accent-foreground"
			>
				<Sparkles class="h-5 w-5" />
				<span class="text-center text-xs font-medium">AI Feedback</span>
			</NavLink>
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
			class="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6"
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
							<Home class="h-5 w-5" />
							Dashboard
						</a>
						<a
							href="https://www.commonapp.org/blog/announcing-2025-2026-common-app-essay-prompts"
							target="_blank"
							class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
						>
							<ExternalLink class="h-5 w-5" />
							Common App Prompts
						</a>
						<a
							href="/essayfeedback"
							class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
						>
							<Sparkles class="h-5 w-5" />
							AI Feedback
						</a>
					</nav>
				</Sheet.Content>
			</Sheet.Root>
			<Breadcrumbs />
			<!-- <div class="relative ml-auto flex-1 md:grow-0">
				<Search
					class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
				/>
				<Input
					type="search"
					placeholder="Search..."
					class="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
				/>
			</div> -->
			<PersonalMenu user={data.user} />
		</header>
		<main class="flex flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
			<slot />
		</main>
	</div>
</div>
