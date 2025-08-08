<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	// Props
	export let items: string[] = [];
	export let interval: number = 2000; // milliseconds
	export let className: string = '';
	export let transition: 'fade' | 'slide' | 'fly' = 'slide';
	export let duration: number = 300;
	export let onIndexChange: ((index: number) => void) | undefined = undefined;

	// State
	let currentIndex = 0;
	let intervalId: ReturnType<typeof setInterval>;

	// Lifecycle
	onMount(() => {
		if (items.length > 1) {
			intervalId = setInterval(() => {
				currentIndex = (currentIndex + 1) % items.length;
				onIndexChange?.(currentIndex);
			}, interval);
		}
	});

	onDestroy(() => {
		if (intervalId) {
			clearInterval(intervalId);
		}
	});

	// Custom slide transition
	function slideTransition(_node: Element, _params: Record<string, unknown>) {
		return {
			delay: 0,
			duration: duration,
			css: (t: number) => {
				const opacity = t;
				const transform = `translateY(${(1 - t) * 20}px)`;
				return `opacity: ${opacity}; transform: ${transform};`;
			},
		};
	}
</script>

<div class="relative inline-block whitespace-nowrap {className}">
	{#key currentIndex}
		{#if transition === 'fade'}
			<div
				in:fade={{ duration }}
				out:fade={{ duration }}
				class="absolute inset-0"
			>
				{items[currentIndex]}
			</div>
		{:else if transition === 'fly'}
			<div
				in:fly={{ y: 20, duration }}
				out:fly={{ y: -20, duration }}
				class="absolute inset-0"
			>
				{items[currentIndex]}
			</div>
		{:else}
			<div
				in:slideTransition={{}}
				out:slideTransition={{}}
				class="absolute inset-0"
			>
				{items[currentIndex]}
			</div>
		{/if}
	{/key}
	<!-- Invisible element to maintain container size -->
	<div class="invisible">
		{items[0] || ''}
	</div>
</div>
