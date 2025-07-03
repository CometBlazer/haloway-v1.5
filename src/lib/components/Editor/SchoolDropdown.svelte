<!-- src/lib/components/Editor/SchoolDropdown.svelte -->
<script lang="ts">
	import { createEventDispatcher, onMount, tick } from 'svelte';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils.js';
	import type { School } from '$lib/../DatabaseDefinitions';
	import { supabase } from '$lib/supabase';

	export let currentSchool: string = '';
	export let disabled: boolean = false;
	export let size: 'small' | 'medium' | 'large' = 'medium';

	const dispatch = createEventDispatcher<{
		schoolChange: string;
	}>();

	let schools: School[] = [];
	let open = false;
	let loading = true;
	let error: string | null = null;

	// Load schools from Supabase
	async function loadSchools() {
		try {
			loading = true;
			error = null;

			const { data, error: fetchError } = await supabase
				.from('schools')
				.select('*')
				.order('name');

			if (fetchError) {
				throw fetchError;
			}

			schools = data || [];
		} catch (err) {
			console.error('Error loading schools:', err);
			error = 'Failed to load schools';
		} finally {
			loading = false;
		}
	}

	// Find school by name
	function getSchoolByName(name: string): School | null {
		return schools.find((school) => school.name === name) || null;
	}

	// Handle school selection
	function selectSchool(schoolName: string) {
		if (schoolName !== currentSchool) {
			dispatch('schoolChange', schoolName);
		}
	}

	// Get current school display info
	$: currentSchoolData = getSchoolByName(currentSchool);
	$: selectedValue = currentSchool || 'Select School';

	// Size-based styling classes
	$: buttonSizeClass = {
		small: 'h-8 px-2 text-xs min-w-[180px]',
		medium: 'h-10 px-3 text-sm min-w-[200px]',
		large: 'h-12 px-4 text-sm min-w-[240px]',
	}[size];

	$: logoSizeClass = {
		small: 'w-4 h-4',
		medium: 'w-5 h-5',
		large: 'w-6 h-6',
	}[size];

	$: popoverWidthClass = {
		small: 'w-[200px]',
		medium: 'w-[220px]',
		large: 'w-[260px]',
	}[size];

	// Handle school selection and focus management
	function handleSchoolSelect(schoolName: string, triggerId: string) {
		selectSchool(schoolName);
		closeAndFocusTrigger(triggerId);
	}

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closeAndFocusTrigger(triggerId: string) {
		open = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}

	onMount(() => {
		loadSchools();
	});
</script>

<div class="school-dropdown">
	<Popover.Root bind:open let:ids>
		<Popover.Trigger asChild let:builder>
			<Button
				builders={[builder]}
				variant="outline"
				role="combobox"
				aria-expanded={open}
				class={cn('justify-between rounded-xl', buttonSizeClass)}
				{disabled}
			>
				<div class="flex min-w-0 flex-1 items-center gap-2 pl-1">
					{#if currentSchoolData?.image_url}
						<img
							src={currentSchoolData.image_url}
							alt={currentSchoolData.name}
							class={cn('flex-shrink-0 rounded object-cover', logoSizeClass)}
							loading="lazy"
						/>
					{:else if currentSchool}
						<div
							class={cn(
								'flex flex-shrink-0 items-center justify-center rounded bg-primary',
								logoSizeClass,
							)}
						>
							<span class="text-xs font-semibold text-primary-foreground">
								{currentSchool.charAt(0).toUpperCase()}
							</span>
						</div>
					{/if}
					<span class="truncate font-medium">{selectedValue}</span>
				</div>
				<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
			</Button>
		</Popover.Trigger>
		<Popover.Content class={cn('mt-2 p-0', popoverWidthClass)}>
			<Command.Root>
				<Command.Input placeholder="Search schools..." />
				{#if loading}
					<div
						class="flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground"
					>
						<div
							class="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"
						></div>
						<span>Loading schools...</span>
					</div>
				{:else if error}
					<div
						class="flex items-center justify-center p-4 text-sm text-destructive"
					>
						<span>{error}</span>
					</div>
				{:else if schools.length === 0}
					<Command.Empty>No schools available.</Command.Empty>
				{:else}
					<Command.Empty>No school found.</Command.Empty>
					<div class="max-h-[500px] overflow-y-auto">
						<Command.Group>
							{#each schools as school (school.id)}
								<Command.Item
									value={school.name}
									onSelect={(currentValue) =>
										handleSchoolSelect(currentValue, ids.trigger)}
									class={cn(
										'cursor-pointer',
										currentSchool === school.name &&
											'border-l-2 border-l-primary bg-primary/10 text-primary',
									)}
								>
									<div class="flex min-w-0 flex-1 items-center gap-2">
										{#if school.image_url}
											<img
												src={school.image_url}
												alt={school.name}
												class={cn(
													'flex-shrink-0 rounded object-cover',
													logoSizeClass,
												)}
												loading="lazy"
											/>
										{:else}
											<div
												class={cn(
													'flex flex-shrink-0 items-center justify-center rounded',
													logoSizeClass,
													currentSchool === school.name
														? 'bg-primary text-primary-foreground'
														: 'bg-muted text-muted-foreground',
												)}
											>
												<span class="text-xs font-semibold">
													{school.name.charAt(0).toUpperCase()}
												</span>
											</div>
										{/if}
										<span class="truncate">{school.name}</span>
									</div>
								</Command.Item>
							{/each}
						</Command.Group>
					</div>
				{/if}
			</Command.Root>
		</Popover.Content>
	</Popover.Root>
</div>

<style>
	.school-dropdown {
		display: inline-block;
	}
</style>
