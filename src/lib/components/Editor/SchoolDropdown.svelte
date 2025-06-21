<!-- src/lib/components/Editor/SchoolDropdown.svelte -->
<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { ChevronDown } from 'lucide-svelte';
	import type { School } from '$lib/../DatabaseDefinitions';
	import { supabase } from '$lib/supabase';

	export let currentSchool: string = '';
	export let disabled: boolean = false;

	const dispatch = createEventDispatcher<{
		schoolChange: string;
	}>();

	let schools: School[] = [];
	let isOpen = false;
	let dropdownContainer: HTMLDivElement;
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
		isOpen = false;
	}

	// Handle clicks outside dropdown
	function handleClickOutside(event: MouseEvent) {
		if (
			dropdownContainer &&
			!dropdownContainer.contains(event.target as Node)
		) {
			isOpen = false;
		}
	}

	// Handle keyboard navigation
	function handleKeydown(event: KeyboardEvent) {
		if (disabled) return;

		if (event.key === 'Escape') {
			isOpen = false;
		} else if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			isOpen = !isOpen;
		} else if (event.key === 'ArrowDown' && !isOpen) {
			event.preventDefault();
			isOpen = true;
		}
	}

	// Get current school display info
	$: currentSchoolData = getSchoolByName(currentSchool);
	$: displayName = currentSchoolData?.name || currentSchool || 'Select School';

	onMount(() => {
		loadSchools();

		// Add click outside listener
		document.addEventListener('click', handleClickOutside);

		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<div class="school-dropdown" bind:this={dropdownContainer}>
	<button
		type="button"
		class="school-button"
		class:disabled
		class:open={isOpen}
		on:click={() => !disabled && (isOpen = !isOpen)}
		on:keydown={handleKeydown}
		aria-label="Select school"
		aria-expanded={isOpen}
		aria-haspopup="listbox"
		{disabled}
	>
		<div class="school-info">
			{#if currentSchoolData?.image_url}
				<img
					src={currentSchoolData.image_url}
					alt={currentSchoolData.name}
					class="school-logo"
					loading="lazy"
				/>
			{:else}
				<div class="school-logo-placeholder">
					<span class="school-initial"
						>{displayName.charAt(0).toUpperCase()}</span
					>
				</div>
			{/if}
			<span class="school-name">{displayName}</span>
		</div>
		<ChevronDown size={16} class="chevron {isOpen ? 'rotated' : ''}" />
	</button>

	{#if isOpen}
		<div class="dropdown-menu" role="listbox" aria-label="School options">
			{#if loading}
				<div class="dropdown-item loading">
					<div class="loading-spinner"></div>
					<span>Loading schools...</span>
				</div>
			{:else if error}
				<div class="dropdown-item error">
					<span>{error}</span>
				</div>
			{:else if schools.length === 0}
				<div class="dropdown-item empty">
					<span>No schools available</span>
				</div>
			{:else}
				{#each schools as school (school.id)}
					<button
						type="button"
						class="dropdown-item"
						class:selected={school.name === currentSchool}
						on:click={() => selectSchool(school.name)}
						role="option"
						aria-selected={school.name === currentSchool}
					>
						<div class="school-info">
							{#if school.image_url}
								<img
									src={school.image_url}
									alt={school.name}
									class="school-logo"
									loading="lazy"
								/>
							{:else}
								<div class="school-logo-placeholder">
									<span class="school-initial"
										>{school.name.charAt(0).toUpperCase()}</span
									>
								</div>
							{/if}
							<span class="school-name">{school.name}</span>
						</div>
					</button>
				{/each}
			{/if}
		</div>
	{/if}
</div>

<style>
	.school-dropdown {
		position: relative;
		display: inline-block;
		min-width: 180px;
	}

	.school-button {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 0.625rem 0.875rem;
		background: hsl(var(--color-base-000));
		border: 1px solid hsl(var(--color-base-300));
		border-radius: 0.625rem;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		font-size: 0.8125rem;
		font-weight: 500;
		color: hsl(var(--color-base-content));
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
		gap: 0.5rem;
	}

	.school-button:hover:not(.disabled) {
		background: hsl(var(--color-base-100));
		border-color: hsl(var(--color-primary));
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.school-button:focus {
		outline: 2px solid hsl(var(--color-primary));
		outline-offset: 2px;
	}

	.school-button.disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.school-button.open {
		border-color: hsl(var(--color-primary));
		background: hsl(var(--color-base-100));
	}

	.school-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-width: 0;
		flex: 1;
	}

	.school-logo {
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 0.25rem;
		object-fit: cover;
		flex-shrink: 0;
	}

	.school-logo-placeholder {
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 0.25rem;
		background: hsl(var(--color-primary));
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.school-initial {
		color: white;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.school-name {
		font-size: 0.8125rem;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		min-width: 0;
	}

	:global(.chevron) {
		transition: transform 0.2s ease;
		flex-shrink: 0;
		color: hsl(var(--color-base-content));
	}

	:global(.chevron.rotated) {
		transform: rotate(180deg);
	}

	.dropdown-menu {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		margin-top: 0.25rem;
		background: hsl(var(--color-base-000));
		border: 1px solid hsl(var(--color-base-300));
		border-radius: 0.625rem;
		box-shadow:
			0 10px 25px -3px rgba(0, 0, 0, 0.1),
			0 4px 6px -4px rgba(0, 0, 0, 0.1);
		z-index: 50;
		max-height: 300px;
		overflow-y: auto;
		padding: 0.25rem;
	}

	.dropdown-item {
		display: flex;
		align-items: center;
		width: 100%;
		padding: 0.75rem;
		background: transparent;
		border: none;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: all 0.15s ease;
		text-align: left;
		color: hsl(var(--color-base-content));
		font-size: 0.8125rem;
	}

	.dropdown-item:hover:not(.loading):not(.error):not(.empty) {
		background: hsl(var(--color-base-100));
	}

	.dropdown-item.selected {
		background: hsl(var(--color-primary) / 0.1);
		color: hsl(var(--color-primary));
	}

	.dropdown-item.loading,
	.dropdown-item.error,
	.dropdown-item.empty {
		cursor: default;
		color: hsl(var(--color-base-400));
		justify-content: center;
		gap: 0.5rem;
	}

	.dropdown-item.error {
		color: hsl(var(--color-error));
	}

	.loading-spinner {
		width: 1rem;
		height: 1rem;
		border: 2px solid hsl(var(--color-base-300));
		border-top: 2px solid hsl(var(--color-primary));
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	/* Mobile responsiveness */
	@media (max-width: 600px) {
		.school-dropdown {
			min-width: 140px;
		}

		.school-button {
			padding: 0.5rem 0.75rem;
			font-size: 0.75rem;
		}

		.school-logo,
		.school-logo-placeholder {
			width: 1.25rem;
			height: 1.25rem;
		}

		.school-initial {
			font-size: 0.625rem;
		}

		.school-name {
			font-size: 0.75rem;
		}

		.dropdown-item {
			padding: 0.625rem;
			font-size: 0.75rem;
		}
	}
</style>
