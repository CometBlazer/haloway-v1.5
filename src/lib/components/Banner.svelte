<!-- src/lib/components/Banner.svelte -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	/**
	 * text: the main banner copy
	 * showBullets: whether to render the pulsing dots
	 */
	export let text: string;
	export let showBullets: boolean = true;

	let bannerEl: HTMLElement;
	let ro: ResizeObserver | undefined;

	onMount(() => {
		// Only run in browser environment and if ResizeObserver is available
		if (browser && typeof ResizeObserver !== 'undefined' && bannerEl) {
			try {
				// whenever the banner resizes, update --banner-height on <html>
				ro = new ResizeObserver((entries) => {
					if (entries && entries[0] && entries[0].contentRect) {
						const h = entries[0].contentRect.height;
						document.documentElement.style.setProperty(
							'--banner-height',
							`${h}px`,
						);
					}
				});
				ro.observe(bannerEl);
			} catch (error) {
				console.warn('ResizeObserver failed to initialize:', error);
			}
		}
	});

	onDestroy(() => {
		// Only disconnect if ro exists and we're in browser
		if (browser && ro && typeof ro.disconnect === 'function') {
			try {
				ro.disconnect();
			} catch (error) {
				console.warn('ResizeObserver failed to disconnect:', error);
			}
		}
	});
</script>

<div
	bind:this={bannerEl}
	class="banner-container fixed left-0 right-0 top-0 z-50"
>
	<div
		class="glass-banner bg-base-100/70 text-base-content relative
           overflow-hidden px-4 py-1.5 text-center text-xs
           font-medium backdrop-blur-3xl md:py-3 md:text-sm"
	>
		<!-- subtle blurred gradient glows behind -->
		<div
			class="pointer-events-none absolute left-[calc(50%-20rem)] top-1/2 h-[18rem]
             w-[36rem] -translate-y-1/2 rotate-[30deg]
             transform bg-gradient-to-r from-pink-500/20
             to-purple-500/20 blur-[60px]"
			aria-hidden="true"
		></div>

		<div
			class="pointer-events-none absolute right-[calc(50%-20rem)] top-1/2 h-[18rem]
             w-[36rem] -translate-y-1/2 rotate-[60deg]
             transform bg-gradient-to-r from-pink-500/20
             to-purple-500/20 blur-[60px]"
			aria-hidden="true"
		></div>

		<div class="relative flex items-center justify-center space-x-2">
			{#if showBullets}
				<div
					class="bg-base-content/70 h-2 w-2 animate-pulse rounded-full"
				></div>
			{/if}

			<span class="font-semibold tracking-wide">{text}</span>

			{#if showBullets}
				<div
					class="bg-base-content/70 h-2 w-2 animate-pulse rounded-full"
					style="animation-delay: 0.5s"
				></div>
			{/if}
		</div>
	</div>
</div>

<style>
	.glass-banner::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			90deg,
			transparent,
			rgba(255, 255, 255, 0.15),
			transparent
		);
		animation: shimmer 30s infinite;
	}

	.glass-banner::after {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(
			ellipse at center,
			rgba(255, 255, 255, 0.05) 0%,
			transparent 70%
		);
		pointer-events: none;
	}

	@keyframes shimmer {
		0% {
			left: -100%;
		}
		100% {
			left: 100%;
		}
	}
</style>
