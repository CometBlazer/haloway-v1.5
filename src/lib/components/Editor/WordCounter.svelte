<!-- WordCounter.svelte -->
<script lang="ts">
	export let currentWordCount: number = 0;
	export let wordLimit: number = 250;
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let showText: boolean = true;

	// Reactive calculations
	$: percentage = Math.min(
		100,
		Math.round((100 / wordLimit) * currentWordCount),
	);
	$: isNearLimit = currentWordCount >= wordLimit * 0.8;
	$: isAtLimit = currentWordCount === wordLimit;
	$: isOverLimit = currentWordCount > wordLimit;

	// Size configurations - only scaling, same proportions
	const sizeConfig = {
		sm: {
			scale: 0.8,
			fontSize: '0.6rem',
		},
		md: {
			scale: 1.0,
			fontSize: '0.75rem',
		},
		lg: {
			scale: 1.2,
			fontSize: '0.875rem',
		},
	};

	$: config = sizeConfig[size];
	// Use the exact same dimensions as original, just scaled
	$: baseSize = 20;
	$: actualSize = baseSize * config.scale;
	// $: radius = 10;
	// $: strokeRadius = 5;
	$: circumference = 31.4; // 2 * Math.PI * 5, matching original
	$: strokeDasharray = `${(percentage * circumference) / 100} ${circumference}`;
</script>

<div
	class="word-counter-display"
	class:limit-near={isNearLimit}
	class:limit-reached={isAtLimit}
	class:limit-over={isOverLimit}
	class:size-sm={size === 'sm'}
	class:size-md={size === 'md'}
	class:size-lg={size === 'lg'}
	style="--font-size: {config.fontSize};"
>
	<svg
		height={actualSize}
		width={actualSize}
		viewBox="0 0 20 20"
		class="word-counter-circle"
	>
		<!-- Background circle - exact same as original -->
		<circle r="10" cx="10" cy="10" fill="hsl(var(--color-base-300))" />

		<!-- Progress circle - exact same as original -->
		<circle
			r="5"
			cx="10"
			cy="10"
			fill="transparent"
			stroke="currentColor"
			stroke-width="10"
			stroke-dasharray={strokeDasharray}
			transform="rotate(-90) translate(-20)"
			class="progress-circle"
		/>

		<!-- Inner circle - exact same as original -->
		<circle r="6" cx="10" cy="10" fill="hsl(var(--color-base-100))" />
	</svg>

	{#if showText}
		<span class="word-count-text">
			{currentWordCount} words {isOverLimit
				? '(limit reached)'
				: `/ ${wordLimit} limit`}
		</span>
	{/if}
</div>

<style>
	.word-counter-display {
		display: flex;
		align-items: center;
		color: hsl(var(--color-neutral-content));
		font-size: var(--font-size);
		gap: 0.5rem;
	}

	.word-counter-circle {
		color: hsl(var(--color-primary));
		flex-shrink: 0;
	}

	/* .progress-circle {
		/* No transition needed - matches original 
	} */

	.word-counter-display.limit-near .word-counter-circle {
		color: hsl(var(--color-warning));
	}

	.word-counter-display.limit-reached .word-counter-circle {
		color: hsl(var(--color-info));
	}

	.word-counter-display.limit-over .word-counter-circle {
		color: hsl(var(--color-error));
	}

	.word-count-text {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		min-width: 0;
	}

	/* Size-specific adjustments */
	.size-sm .word-count-text {
		font-weight: 500;
	}

	.size-lg .word-count-text {
		font-weight: 600;
	}

	/* Mobile responsiveness - matches original */
	@media (max-width: 768px) {
		.word-count-text {
			font-size: 0.7rem;
			word-break: break-word;
		}
	}

	/* For very small screens - matches original */
	@media (max-width: 480px) {
		.word-count-text {
			font-size: 0.65rem;
		}
	}

	/* High contrast mode support */
	@media (prefers-contrast: high) {
		.word-counter-circle {
			stroke-width: 2;
		}
	}

	/* Reduced motion support - matches original */
	@media (prefers-reduced-motion: reduce) {
		/* No transitions to remove since original had none */
	}
</style>
