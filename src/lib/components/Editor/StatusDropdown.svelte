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

	// Configuration for each status using DatePicker color scheme
	const statusConfig: Record<
		Status,
		{ label: string; colorClass: string; badgeClass: string }
	> = {
		'not-started': {
			label: 'Not Started',
			colorClass: 'status-default',
			badgeClass: 'badge-default',
		},
		'in-progress': {
			label: 'In Progress',
			colorClass: 'status-warning',
			badgeClass: 'badge-warning',
		},
		finished: {
			label: 'Finished',
			colorClass: 'status-info',
			badgeClass: 'badge-info',
		},
		polished: {
			label: 'Polished',
			colorClass: 'status-future',
			badgeClass: 'badge-future',
		},
		submitted: {
			label: 'Submitted',
			colorClass: 'status-success',
			badgeClass: 'badge-success',
		},
		scrapped: {
			label: 'Scrapped',
			colorClass: 'status-danger',
			badgeClass: 'badge-danger',
		},
	};

	// All possible status keys
	const statusOptions = Object.keys(statusConfig) as Status[];

	// Map size prop to size classes
	const sizeClasses = {
		xs: 'btn-xs',
		sm: 'btn-sm',
		md: 'btn-md',
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
		class="status-btn {buttonClasses}"
		{disabled}
		on:click={toggleDropdown}
		on:touchstart={toggleDropdown}
		tabindex="0"
		aria-haspopup="true"
		aria-expanded={isOpen}
		title={currentConfig.label}
	>
		<div class="status-badge {currentConfig.badgeClass}">
			<div class="status-dot"></div>
		</div>
		<span class="status-label">{currentConfig.label}</span>
		<div class="chevron" class:rotate-180={isOpen}>
			<ChevronDown size={16} class="opacity-60" />
		</div>
	</button>

	<!-- Dropdown menu -->
	{#if isOpen}
		<div
			class="dropdown-menu"
			in:slide={{ duration: 200 }}
			out:slide={{ duration: 200 }}
			role="menu"
		>
			{#each statusOptions as status}
				{@const cfg = statusConfig[status]}
				<button
					type="button"
					class="dropdown-item {status === currentStatus ? 'active' : ''}"
					on:click={(e) => handleStatusChange(status, e)}
					on:touchstart={(e) => handleStatusChange(status, e)}
					{disabled}
					role="menuitem"
				>
					<div class="status-badge {cfg.badgeClass} badge-small">
						<div class="status-dot status-dot-small"></div>
					</div>
					<span class="item-label">{cfg.label}</span>
					{#if status === currentStatus}
						<svg class="check-icon" fill="currentColor" viewBox="0 0 20 20">
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
	/* Base button styles */
	.status-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		border-radius: 12px;
		border: 1px solid;
		font-weight: 500;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		touch-action: manipulation;
		white-space: nowrap;
	}

	.status-btn:hover {
		background-color: hsl(var(--accent));
		/* transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); */
	}

	.status-btn:focus {
		outline: 2px solid hsl(var(--color-primary));
		outline-offset: 2px;
	}

	.status-btn:active {
		transform: translateY(0);
	}

	.status-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
	}

	/* Button sizes */
	.btn-xs {
		padding: 0.25rem 0.75rem;
		font-size: 0.75rem;
		width: 4rem;
	}

	.btn-sm {
		height: 2rem;
		padding: 0.375rem 0.875rem;
		font-size: 0.875rem;
		width: 5rem;
	}

	.btn-md {
		height: 2.5rem;
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		width: 5rem;
	}

	.btn-lg {
		padding: 0.625rem 1.25rem;
		font-size: 1rem;
		width: 11.25rem;
	}

	@media (min-width: 768px) {
		.btn-md {
			width: 11.25rem;
		}
	}

	/* Status color variations using DatePicker color scheme */
	.status-default {
		background: hsl(var(--background));
		color: hsl(var(--foreground));
		border-color: hsl(var(--border));
	}

	.status-warning {
		background: hsl(var(--color-warning));
		color: white;
		border-color: hsl(var(--color-warning));
	}

	.status-danger {
		background: hsl(var(--color-error));
		color: white;
		border-color: hsl(var(--color-error));
	}

	.status-info {
		background: hsl(var(--color-info));
		color: white;
		border-color: hsl(var(--color-info));
	}

	.status-future {
		background: hsl(var(--color-primary));
		color: white;
		border-color: hsl(var(--color-primary));
	}

	.status-success {
		background: hsl(var(--color-success));
		color: hsl(var(--color-success-content));
		border-color: hsl(var(--color-success));
	}

	/* Status badges */
	.status-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 9999px;
		padding: 0.125rem 0.25rem;
		font-size: 0.75rem;
		font-weight: 500;
	}

	.badge-small {
		padding: 0.0625rem 0.1875rem;
		font-size: 0.625rem;
	}

	.badge-default {
		background: hsl(var(--muted));
		color: hsl(var(--muted-foreground));
	}

	.badge-warning {
		background: hsl(var(--color-warning-content));
		color: hsl(var(--color-warning));
	}

	.badge-success {
		background: hsl(var(--color-success-content));
		color: hsl(var(--color-success));
	}

	.badge-info {
		background: hsl(var(--color-info-content));
		color: hsl(var(--color-info));
	}

	.badge-future {
		background: white;
		color: hsl(var(--color-primary));
	}

	.badge-danger {
		background: hsl(var(--color-error-content));
		color: hsl(var(--color-error));
	}

	/* Status dots */
	.status-dot {
		height: 0.5rem;
		width: 0.5rem;
		border-radius: 50%;
		background-color: currentColor;
		opacity: 0.8;
	}

	.status-dot-small {
		height: 0.375rem;
		width: 0.375rem;
	}

	@media (min-width: 768px) {
		.status-dot-small {
			height: 0.5rem;
			width: 0.5rem;
		}
	}

	/* Status label */
	.status-label {
		display: none;
		font-weight: 500;
		flex: 1;
		text-align: left;
	}

	@media (min-width: 768px) {
		.status-label {
			display: inline;
		}
	}

	/* Chevron animation */
	.chevron {
		transition: transform 0.2s ease;
		display: flex;
		align-items: center;
	}

	.rotate-180 {
		transform: rotate(180deg);
	}

	/* Dropdown menu */
	.dropdown-menu {
		position: absolute;
		left: 0;
		top: 100%;
		z-index: 50;
		margin-top: 0.5rem;
		width: 11rem;
		background: hsl(var(--popover));
		border: 1px solid hsl(var(--border));
		border-radius: 0.75rem;
		padding: 0.25rem;
		box-shadow:
			0 10px 15px -3px rgba(0, 0, 0, 0.1),
			0 4px 6px -2px rgba(0, 0, 0, 0.05);
	}

	@media (min-width: 768px) {
		.dropdown-menu {
			width: 13rem;
			padding: 0.5rem;
		}
	}

	/* Dropdown items */
	.dropdown-item {
		display: flex;
		width: 100%;
		align-items: center;
		gap: 0.5rem;
		border-radius: 0.5rem;
		padding: 0.5rem;
		font-size: 0.875rem;
		background: transparent;
		border: none;
		color: hsl(var(--popover-foreground));
		transition: all 0.2s ease;
		cursor: pointer;
		text-align: left;
		-webkit-tap-highlight-color: transparent;
		touch-action: manipulation;
	}

	@media (min-width: 768px) {
		.dropdown-item {
			gap: 0.75rem;
			padding: 0.75rem;
			font-size: 1rem;
		}
	}

	.dropdown-item:hover {
		background: hsl(var(--accent));
		color: hsl(var(--accent-foreground));
	}

	.dropdown-item.active {
		background: hsl(var(--accent));
		color: hsl(var(--accent-foreground));
		font-weight: 600;
	}

	.dropdown-item:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Item label */
	.item-label {
		flex: 1;
		text-align: left;
	}

	/* Check icon */
	.check-icon {
		height: 0.75rem;
		width: 0.75rem;
		color: hsl(var(--color-success));
	}

	@media (min-width: 768px) {
		.check-icon {
			height: 1rem;
			width: 1rem;
		}
	}

	/* Ensure proper touch handling on mobile */
	@media (hover: hover) {
		.status-btn:hover {
			transform: translateY(-1px);
		}
	}

	/* Ensure the dropdown appears above other elements */
	.relative {
		position: relative;
	}
</style>
