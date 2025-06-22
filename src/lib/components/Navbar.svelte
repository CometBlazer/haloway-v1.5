<script>
	import { onNavigate } from '$app/navigation';
	import PersonalMenu from '$lib/components/personal-menu.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import * as Drawer from '$lib/components/ui/drawer';
	import { Separator } from '$lib/components/ui/separator';
	import ChevronsUpDown from 'virtual:icons/lucide/chevrons-up-down';
	import MenuIcon from 'virtual:icons/lucide/menu';
	import XIcon from 'virtual:icons/lucide/x';
	import HomeButton from '../../routes/(marketing)/components/HomeButton.svelte';
	import ThemeSwitchButton from '../../routes/(marketing)/components/ThemeSwitchButton.svelte';

	export let user;

	const menuItems = {
		'/': 'Home',
		'/#features': 'Features',
		'/#security': 'Security',
		'/essayfeedback': 'AI Feedback',
		'/contact': 'Contact',
	};

	let menuOpen = false;
	onNavigate((_) => {
		menuOpen = false;
	});
</script>

<header class="sticky top-0 z-50 border-b border-border bg-card py-4">
	<div
		class="container grid grid-cols-2 flex-nowrap items-center justify-between lg:grid-cols-[auto,auto,auto]"
	>
		<HomeButton />
		<nav class="hidden lg:block">
			<ul class="hidden flex-wrap px-1 text-lg font-bold lg:flex">
				{#each Object.entries(menuItems) as [href, text]}
					<li class="lg:mx-2">
						<Button variant="ghost" {href} class="text-base text-foreground">
							{text}
						</Button>
					</li>
				{/each}
			</ul>
		</nav>
		<div class="hidden justify-self-end lg:flex lg:gap-4">
			{#if user}
				<Button href="/dashboard">Dashboard</Button>
				<PersonalMenu {user} />
			{:else}
				<PersonalMenu {user} />
				<Button href="/login">Start writing →</Button>
			{/if}
		</div>

		<div class="justify-self-end lg:hidden">
			<Drawer.Root bind:open={menuOpen}>
				<Drawer.Trigger asChild let:builder>
					<Button variant="ghost" size="icon" builders={[builder]}>
						<span class="sr-only">Menu</span>
						<MenuIcon />
					</Button>
				</Drawer.Trigger>
				<Drawer.Content>
					<Drawer.Header class="flex justify-end py-0">
						<Drawer.Close asChild let:builder>
							<Button variant="ghost" size="icon" builders={[builder]}>
								<span class="sr-only">Close</span>
								<XIcon />
							</Button>
						</Drawer.Close>
					</Drawer.Header>
					<Collapsible.Root>
						<Collapsible.Trigger asChild let:builder>
							<div class="p-2">
								<Button
									variant="ghost"
									class="flex w-full flex-nowrap gap-2 text-base"
									builders={[builder]}
								>
									Switch theme
									<ChevronsUpDown class="size-4" />
								</Button>
							</div>
						</Collapsible.Trigger>
						<Collapsible.Content>
							<ul
								class="grid grid-cols-[auto,auto] items-center gap-x-2 p-2 pt-0"
							>
								<li class="col-span-2 grid grid-cols-subgrid">
									<ThemeSwitchButton
										mode="system"
										class="col-span-2 grid grid-cols-subgrid"
									/>
								</li>
								<li class="col-span-2 grid grid-cols-subgrid">
									<ThemeSwitchButton
										mode="light"
										class="col-span-2 grid grid-cols-subgrid"
									/>
								</li>
								<li class="col-span-2 grid grid-cols-subgrid">
									<ThemeSwitchButton
										mode="dark"
										class="col-span-2 grid grid-cols-subgrid"
									/>
								</li>
							</ul>
						</Collapsible.Content>
					</Collapsible.Root>
					<Separator />
					<nav class="[&_ul]:flex [&_ul]:flex-col [&_ul]:p-2">
						<ul>
							{#each Object.entries(menuItems) as [href, text]}
								<li>
									<Button {href} variant="ghost" class="w-full py-6 text-base">
										{text}
									</Button>
								</li>
							{/each}
						</ul>
						<Separator />
						<ul class="">
							{#if !user}
								<li>
									<Button
										href="/register"
										variant="ghost"
										class="w-full py-6 text-base"
									>
										Register
									</Button>
								</li>
								<li>
									<Button
										href="/login"
										variant="ghost"
										class="w-full py-6 text-base"
									>
										Log in
									</Button>
								</li>
							{:else}
								<li>
									<Button
										href="/dashboard"
										variant="ghost"
										class="w-full py-6 text-base"
									>
										Dashboard
									</Button>
								</li>
								<li>
									<Button
										href="/settings"
										variant="ghost"
										class="w-full py-6 text-base"
									>
										Settings
									</Button>
								</li>
								<li>
									<Button
										href="/log-out"
										variant="ghost"
										class="w-full py-6 text-base"
									>
										Log out
									</Button>
								</li>
							{/if}
						</ul>
					</nav>
				</Drawer.Content>
			</Drawer.Root>
		</div>
	</div>
</header>
