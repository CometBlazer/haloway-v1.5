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
	import { createEventDispatcher } from 'svelte';
	import * as Select from '$lib/components/ui/select/index.js';

	const dispatch = createEventDispatcher();

	// Props
	export let currentStatus: Status = 'not-started';
	export let disabled = false;
	export let size: 'xs' | 'sm' | 'md' | 'lg' = 'md';
	export let showText = false;

	// Configuration for each status
	const statusConfig: Record<Status, { label: string; badgeClass: string }> = {
		'not-started': {
			label: 'Not Started',
			badgeClass: 'badge-default',
		},
		'in-progress': {
			label: 'In Progress',
			badgeClass: 'badge-warning',
		},
		finished: {
			label: 'Finished',
			badgeClass: 'badge-info',
		},
		polished: {
			label: 'Polished',
			badgeClass: 'badge-future',
		},
		submitted: {
			label: 'Submitted',
			badgeClass: 'badge-success',
		},
		scrapped: {
			label: 'Scrapped',
			badgeClass: 'badge-danger',
		},
	};

	// All possible status options for the select
	const statusOptions = Object.entries(statusConfig).map(([value, config]) => ({
		value: value as Status,
		label: config.label,
		badgeClass: config.badgeClass,
	}));

	// Map size prop to size classes
	const sizeClasses = {
		xs: 'status-select-xs',
		sm: 'status-select-sm',
		md: 'status-select-md',
		lg: 'status-select-lg',
	};

	function handleValueChange(value: Status | undefined) {
		if (value && value !== currentStatus) {
			currentStatus = value;
			dispatch('statusChange', {
				status: value,
				label: statusConfig[value].label,
			});
		}
	}

	// Reactive values
	$: currentConfig = statusConfig[currentStatus];
	$: triggerClasses = sizeClasses[size];

	// Create the selected value object for the Select component
	$: selectedValue = {
		value: currentStatus,
		label: currentConfig.label,
	};

	// Determine if text should be displayed (either showText prop or large screen)
	$: shouldShowText = showText;
</script>

<Select.Root
	portal={null}
	selected={selectedValue}
	onSelectedChange={(v) => handleValueChange(v?.value)}
	{disabled}
>
	<Select.Trigger
		class="status-trigger {triggerClasses} {shouldShowText
			? 'status-with-text'
			: 'status-no-text'} rounded-xl hover:bg-accent"
	>
		<div class="status-display">
			<div class="status-badge {currentConfig.badgeClass}">
				<div class="status-dot"></div>
			</div>
			<span class="status-label" class:visible={showText}
				>{currentConfig.label}</span
			>
		</div>
	</Select.Trigger>
	<Select.Content class="status-content">
		<Select.Group>
			{#each statusOptions as status}
				<Select.Item
					value={status.value}
					label={status.label}
					class="status-item"
				>
					<div class="status-item-content">
						<div class="status-badge {status.badgeClass} badge-small">
							<div class="status-dot status-dot-small"></div>
						</div>
						<span class="item-label">{status.label}</span>
					</div>
				</Select.Item>
			{/each}
		</Select.Group>
	</Select.Content>
	<Select.Input name="status" />
</Select.Root>

<style>
	/* Status display in trigger */
	.status-display {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
	}

	.status-display:hover {
		cursor: pointer;
	}

	/* Width classes based on text visibility */
	:global(.status-with-text) {
		width: 11rem;
	}

	:global(.status-no-text) {
		width: 5rem;
	}

	/* Trigger size classes */
	:global(.status-select-xs) {
		height: auto;
		padding: 0.25rem 0.75rem;
		font-size: 0.75rem;
	}

	:global(.status-select-sm) {
		height: 2rem;
		padding: 0.375rem 0.875rem;
		font-size: 0.875rem;
	}

	:global(.status-select-md) {
		height: 2.5rem;
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
	}

	:global(.status-select-lg) {
		height: auto;
		padding: 0.625rem 1.25rem;
		font-size: 1rem;
	}

	/* Content sizing */
	:global(.status-content) {
		width: 11rem !important;
		min-width: 11rem !important;
	}

	@media (min-width: 768px) {
		:global(.status-content) {
			width: 13rem !important;
			min-width: 13rem !important;
		}
	}

	/* Status item content */
	.status-item-content {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
	}

	@media (min-width: 768px) {
		.status-item-content {
			gap: 0.75rem;
		}
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
		background-color: hsl(var(--color-warning) / 0.3);
		color: hsl(var(--color-warning));
	}

	.badge-success {
		background-color: hsl(var(--color-success) / 0.3);
		color: hsl(var(--color-success));
	}

	.badge-info {
		background-color: hsl(var(--color-info) / 0.3);
		color: hsl(var(--color-info));
	}

	.badge-future {
		background: hsl(var(--color-primary) / 0.3);
		color: hsl(var(--color-primary));
	}

	.badge-danger {
		background: hsl(var(--color-error) / 0.3);
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

	.status-label.visible {
		display: inline;
	}

	/* 1280px = xl breakpoint */
	/* @media (min-width: 1280px) {
		/* .status-label:not(.visible) {
			display: inline;
		} 

		/* Override width on large screens to always show text width
		:global(.status-no-text) {
			width: 11rem;
		}
	} */

	/* Item label */
	.item-label {
		flex: 1;
		text-align: left;
	}
</style>
