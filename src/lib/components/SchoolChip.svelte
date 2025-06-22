<!-- src/lib/components/SchoolChip.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { GraduationCap } from 'lucide-svelte';

	export let school: {
		name: string;
		urlSafeName: string;
		documentCount: number;
	};
	export let variant: 'default' | 'secondary' | 'destructive' | 'outline' =
		'outline';
	export let size: 'sm' | 'md' | 'lg' = 'md';

	function handleClick() {
		goto(`/schools/${school.urlSafeName}`);
	}

	// Dynamic classes based on size
	$: sizeClasses = {
		sm: 'text-xs px-2 py-1',
		md: 'text-sm px-3 py-1.5',
		lg: 'text-base px-4 py-2',
	}[size];

	$: iconSize = {
		sm: 12,
		md: 14,
		lg: 16,
	}[size];
</script>

<button
	type="button"
	class="school-chip inline-flex items-center gap-2 rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 {sizeClasses}"
	class:bg-primary={variant === 'default'}
	class:text-primary-foreground={variant === 'default'}
	class:bg-secondary={variant === 'secondary'}
	class:text-secondary-foreground={variant === 'secondary'}
	class:bg-destructive={variant === 'destructive'}
	class:text-destructive-foreground={variant === 'destructive'}
	class:border={variant === 'outline'}
	class:border-input={variant === 'outline'}
	class:bg-background={variant === 'outline'}
	class:hover:bg-accent={variant === 'outline'}
	class:hover:text-accent-foreground={variant === 'outline'}
	on:click={handleClick}
	title="View {school.name} essays"
>
	<GraduationCap size={iconSize} />
	<span class="font-medium">{school.name}</span>
	{#if school.documentCount > 0}
		<span
			class="ml-1 rounded-full bg-background/20 px-1.5 py-0.5 text-xs font-semibold"
		>
			{school.documentCount}
		</span>
	{/if}
</button>

<style>
	.school-chip {
		cursor: pointer;
		user-select: none;
	}

	.school-chip:hover {
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}
</style>
