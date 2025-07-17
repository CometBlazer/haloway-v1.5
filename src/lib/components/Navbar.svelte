<script lang="ts">
	import { onNavigate } from '$app/navigation';
	import PersonalMenu from '$lib/components/personal-menu.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import * as Drawer from '$lib/components/ui/drawer';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Separator } from '$lib/components/ui/separator';
	import ChevronsUpDown from 'virtual:icons/lucide/chevrons-up-down';
	import ChevronDown from 'virtual:icons/lucide/chevron-down';
	import MenuIcon from 'virtual:icons/lucide/menu';
	import XIcon from 'virtual:icons/lucide/x';
	import HomeButton from '../../routes/(marketing)/components/HomeButton.svelte';
	import ThemeSwitchButton from '../../routes/(marketing)/components/ThemeSwitchButton.svelte';
	import { ArrowRight } from 'lucide-svelte';

	export let user;

	type MenuItem =
		| {
				type: 'link';
				href: string;
				text: string;
		  }
		| {
				type: 'dropdown';
				text: string;
				items: Array<{
					href: string;
					text: string;
				}>;
		  };

	const menuItems: MenuItem[] = [
		{
			type: 'link',
			href: '/#features',
			text: 'Features',
		},
		{
			type: 'dropdown',
			text: 'Tools',
			items: [
				{
					href: '/extracurricular-organizer',
					text: 'Drag & Drop Activities Organizer',
				},
				{
					href: '/essayfeedback',
					text: 'AI Essay Feedback',
				},
			],
		},
		{
			type: 'link',
			href: '/contact',
			text: 'Contact',
		},
	];

	let menuOpen = false;
	let openDropdowns: Record<number, boolean> = {};

	onNavigate((_) => {
		menuOpen = false;
		openDropdowns = {};
	});

	function toggleDropdown(index: number) {
		openDropdowns[index] = !openDropdowns[index];
	}
</script>

<header class="sticky top-0 z-50 border-b border-border bg-card py-4">
	<div
		class="container grid grid-cols-2 flex-nowrap items-center justify-between lg:grid-cols-[auto,auto,auto]"
	>
		<HomeButton />
		<nav class="hidden lg:block">
			<ul class="hidden flex-wrap px-1 text-base font-bold lg:flex">
				{#each menuItems as item, _index}
					<li class="lg:mx-2">
						{#if item.type === 'link'}
							<Button
								variant="ghost"
								href={item.href}
								class="px-4 py-2 text-base text-foreground hover:bg-accent hover:text-accent-foreground"
							>
								{item.text}
							</Button>
						{:else if item.type === 'dropdown'}
							<DropdownMenu.Root>
								<DropdownMenu.Trigger asChild let:builder>
									<Button
										variant="ghost"
										class="flex items-center gap-1 px-4 py-2 text-base text-foreground hover:bg-accent hover:text-accent-foreground"
										builders={[builder]}
									>
										{item.text}
										<ChevronDown class="h-4 w-4" />
									</Button>
								</DropdownMenu.Trigger>
								<DropdownMenu.Content align="start" class="min-w-[200px]">
									{#each item.items as subItem}
										<DropdownMenu.Item class="p-0">
											<a
												href={subItem.href}
												class="w-full rounded-sm px-3 py-2 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
											>
												{subItem.text}
											</a>
										</DropdownMenu.Item>
									{/each}
								</DropdownMenu.Content>
							</DropdownMenu.Root>
						{/if}
					</li>
				{/each}
			</ul>
		</nav>
		<div class="hidden justify-self-end lg:flex lg:gap-4">
			{#if user}
				<Button variant="default" href="/dashboard">Dashboard</Button>
				<PersonalMenu {user} />
			{:else}
				<PersonalMenu {user} />
				<Button
					variant="outline"
					class="h-10 border-color-primary text-base hover:bg-accent hover:text-accent-foreground"
					href="/login"
					>Start writing <ArrowRight class="ml-1 h-4 w-4" /></Button
				>
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
							{#each menuItems as item, index}
								{#if item.type === 'link'}
									<li>
										<Button
											href={item.href}
											variant="ghost"
											class="w-full py-6 text-base"
										>
											{item.text}
										</Button>
									</li>
								{:else if item.type === 'dropdown'}
									<li>
										<Collapsible.Root bind:open={openDropdowns[index]}>
											<Collapsible.Trigger asChild let:builder>
												<Button
													variant="ghost"
													class="flex w-full items-center justify-between py-6 text-base"
													builders={[builder]}
													on:click={() => toggleDropdown(index)}
												>
													{item.text}
													<ChevronsUpDown class="h-4 w-4" />
												</Button>
											</Collapsible.Trigger>
											<Collapsible.Content>
												<ul class="space-y-1 pl-4">
													{#each item.items as subItem}
														<li>
															<Button
																href={subItem.href}
																variant="ghost"
																class="w-full justify-start py-4 text-left text-sm"
															>
																{subItem.text}
															</Button>
														</li>
													{/each}
												</ul>
											</Collapsible.Content>
										</Collapsible.Root>
									</li>
								{/if}
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
