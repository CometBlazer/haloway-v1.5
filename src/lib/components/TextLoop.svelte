<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	// Props
	export let items: string[] = [];
	export const interval: number = 3000;
	export let className: string = '';
	export let typeSpeed: number = 80;
	export let deleteSpeed: number = 40;
	export let pauseTime: number = 1500;
	export let onIndexChange: ((index: number) => void) | undefined = undefined;

	// State
	let currentIndex = 0;
	let displayText = '';
	let isTyping = true;
	let timeoutId: ReturnType<typeof setTimeout>;
	let currentCharIndex = 0;

	onMount(() => {
		if (items.length > 0) {
			startTypewriter();
		}
	});

	onDestroy(() => {
		if (timeoutId) {
			clearTimeout(timeoutId);
		}
	});

	function startTypewriter() {
		const currentWord = items[currentIndex];

		if (isTyping) {
			if (currentCharIndex < currentWord.length) {
				displayText = currentWord.slice(0, currentCharIndex + 1);
				currentCharIndex++;
				timeoutId = setTimeout(startTypewriter, typeSpeed);
			} else {
				timeoutId = setTimeout(() => {
					isTyping = false;
					startTypewriter();
				}, pauseTime);
			}
		} else {
			if (currentCharIndex > 0) {
				displayText = currentWord.slice(0, currentCharIndex - 1);
				currentCharIndex--;
				timeoutId = setTimeout(startTypewriter, deleteSpeed);
			} else {
				currentIndex = (currentIndex + 1) % items.length;
				onIndexChange?.(currentIndex);
				isTyping = true;
				timeoutId = setTimeout(startTypewriter, 200);
			}
		}
	}

	// Find the longest word for minimum width reservation
	$: longestWord = items.reduce(
		(longest, current) => (current.length > longest.length ? current : longest),
		'',
	);
</script>

<span class="typewriter-wrapper {className}">
	<!-- Invisible spacer that actually reserves width -->
	<span class="invisible-spacer" aria-hidden="true">{longestWord}</span>
	<!-- Actual text overlaid on top -->
	<span class="typewriter-text"
		>{displayText}<span class="typewriter-cursor"></span></span
	>
</span>

<style>
	.typewriter-wrapper {
		display: inline-block;
		position: relative;
		vertical-align: bottom;
	}

	.invisible-spacer {
		display: inline-block;
		visibility: hidden;
		height: auto;
		white-space: pre;
		pointer-events: none;
		user-select: none;
	}

	.typewriter-text {
		position: absolute;
		left: 0;
		top: 0;
		display: inline-block;
		vertical-align: baseline;
		white-space: pre;
	}

	.typewriter-cursor {
		display: inline-block;
		width: 2px;
		height: 0.9em;
		background-color: currentColor;
		margin-left: 2px;
		animation: blink 1s infinite;
		vertical-align: baseline;
		transform: translateY(0.1rem);
	}

	@keyframes blink {
		0%,
		50% {
			opacity: 1;
		}
		51%,
		100% {
			opacity: 0;
		}
	}
</style>
