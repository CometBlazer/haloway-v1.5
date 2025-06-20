<!-- src/lib/components/Editor/StatusDropdown.svelte -->
<script context="module" lang="ts">
	/** The six possible statuses */
	export type Status =
		| 'not-started'
		| 'in-progress'
		| 'finished'
		| 'polished'
		| 'submitted'
		| 'scrapped';
</script>

<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { ChevronDown } from 'lucide-svelte';

	const dispatch = createEventDispatcher();

	// Props
	export let currentStatus: Status = 'not-started';
	export let disabled = false;
	export let size: 'xs' | 'sm' | 'md' | 'lg' = 'md';

	// State for controlling dropdown visibility
	let isOpen = false;
	let dropdownElement: HTMLElement;

	// Configuration for each status
	const statusConfig: Record<
		Status,
		{ label: string; colorClass: string; badgeClass: string }
	> = {
		'not-started': {
			label: 'Not Started',
			colorClass: 'btn-ghost text-base-content',
			badgeClass: 'badge-ghost',
		},
		'in-progress': {
			label: 'In Progress',
			colorClass: 'btn-warning',
			badgeClass: 'badge-warning',
		},
		finished: {
			label: 'Finished',
			colorClass: 'btn-success',
			badgeClass: 'badge-success',
		},
		polished: {
			label: 'Polished',
			colorClass: 'btn-info',
			badgeClass: 'badge-info',
		},
		submitted: {
			label: 'Submitted',
			colorClass: 'btn-primary',
			badgeClass: 'badge-primary',
		},
		scrapped: {
			label: 'Scrapped',
			colorClass: 'btn-error',
			badgeClass: 'badge-error',
		},
	};

	// All possible status keys
	const statusOptions = Object.keys(statusConfig) as Status[];

	// Map size prop to DaisyUI size classes
	const sizeClasses = {
		xs: 'btn-xs',
		sm: 'btn-sm',
		md: '',
		lg: 'btn-lg',
	};

	function toggleDropdown(event: Event) {
		event.preventDefault();
		event.stopPropagation();
		if (disabled) return;
		isOpen = !isOpen;
	}

	function handleStatusChange(newStatus: Status, event: Event) {
		event.preventDefault();
		event.stopPropagation();
		if (newStatus !== currentStatus) {
			currentStatus = newStatus;
			dispatch('statusChange', {
				status: newStatus,
				label: statusConfig[newStatus].label,
			});
		}
		isOpen = false; // Close dropdown after selection
	}

	function handleClickOutside(event: Event) {
		if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
			isOpen = false;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			isOpen = false;
		}
	}

	// Setup click outside listener
	onMount(() => {
		const handleClick = (event: Event) => handleClickOutside(event);
		const handleKey = (event: KeyboardEvent) => handleKeydown(event);

		document.addEventListener('click', handleClick, true);
		document.addEventListener('touchstart', handleClick, true);
		document.addEventListener('keydown', handleKey);

		return () => {
			document.removeEventListener('click', handleClick, true);
			document.removeEventListener('touchstart', handleClick, true);
			document.removeEventListener('keydown', handleKey);
		};
	});

	// Reactive values
	$: currentConfig = statusConfig[currentStatus];
	$: buttonClasses = `${currentConfig.colorClass} ${sizeClasses[size]}`;
</script>

<div class="relative" bind:this={dropdownElement}>
	<!-- Trigger button -->
	<button
		type="button"
		class="btn btn-soft btn-sm md:btn-md md:w-45 w-20 {buttonClasses} gap-2 rounded-full"
		{disabled}
		on:click={toggleDropdown}
		on:touchstart={toggleDropdown}
		tabindex="0"
		aria-haspopup="true"
		aria-expanded={isOpen}
		title={currentConfig.label}
	>
		<div class="badge {currentConfig.badgeClass} badge-sm">
			<div class="h-2 w-2 rounded-full bg-current opacity-80"></div>
		</div>
		<span class="hidden font-medium md:inline">{currentConfig.label}</span>
		<div class="transition-transform duration-200" class:rotate-180={isOpen}>
			<ChevronDown size={16} class="opacity-60" />
		</div>
	</button>

	<!-- Dropdown menu -->
	{#if isOpen}
		<div
			class="bg-base-100 rounded-box border-base-300 absolute left-0 top-full z-50 mt-2 w-44 border p-1 shadow-lg md:w-52 md:p-2"
			in:slide={{ duration: 200 }}
			out:slide={{ duration: 200 }}
			role="menu"
		>
			{#each statusOptions as status}
				{@const cfg = statusConfig[status]}
				<button
					type="button"
					class="hover:bg-base-200 flex w-full items-center gap-2 rounded-lg p-2 text-sm transition-colors md:gap-3 md:p-3 md:text-base {status ===
					currentStatus
						? 'bg-base-200 font-semibold'
						: ''}"
					on:click={(e) => handleStatusChange(status, e)}
					on:touchstart={(e) => handleStatusChange(status, e)}
					{disabled}
					role="menuitem"
				>
					<div class="badge {cfg.badgeClass} badge-xs md:badge-sm">
						<div
							class="h-1.5 w-1.5 rounded-full bg-current opacity-80 md:h-2 md:w-2"
						></div>
					</div>
					<span class="flex-1 text-left">{cfg.label}</span>
					{#if status === currentStatus}
						<svg
							class="text-success h-3 w-3 md:h-4 md:w-4"
							fill="currentColor"
							viewBox="0 0 20 20"
						>
							<path
								fill-rule="evenodd"
								d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0
                   011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
								clip-rule="evenodd"
							/>
						</svg>
					{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	/* Ensure proper touch handling on mobile */
	button {
		-webkit-tap-highlight-color: transparent;
		touch-action: manipulation;
	}

	/* Lift on hover for non-touch devices */
	@media (hover: hover) {
		button:hover {
			transform: translateY(-1px);
		}
	}

	/* Ensure the dropdown appears above other elements */
	.z-50 {
		z-index: 50;
	}
</style>
