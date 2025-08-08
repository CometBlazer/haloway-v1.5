<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	// Props
	export let items: string[] = [];
	export const interval: number = 3000;
	export let className: string = '';
	export let typeSpeed: number = 80;
	export const deleteSpeed: number = 40;
	export const pauseTime: number = 1500;
	export let fixedWidth: string = ''; // Optional: custom width like "200px" or "12rem"
	export let onIndexChange: ((index: number) => void) | undefined = undefined;

	// State
	let currentIndex = 0;
	let displayText = '';
	let isTyping = true;
	let timeoutId: ReturnType<typeof setTimeout>;
	let currentCharIndex = 0;

	// Find the longest word to reserve space
	$: longestWord = items.reduce(
		(longest, current) => (current.length > longest.length ? current : longest),
		'',
	);

	$: containerWidth = fixedWidth || `${longestWord.length * 0.6}em`;

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
</script>

<span class="typewriter-container {className}" style="width: {containerWidth};">
	<span class="text-content">{displayText}</span><span class="cursor"></span>
</span>

<style>
	.typewriter-container {
		display: inline-block;
		position: relative;
		vertical-align: baseline;
	}

	.text-content {
		display: inline-block;
		vertical-align: baseline;
	}

	.cursor {
		display: inline-block;
		width: 2px;
		height: 0.9em;
		background-color: currentColor;
		margin-left: 2px;
		vertical-align: bottom;
		animation: blink 1s infinite;
	}

	.invisible-spacer {
		visibility: hidden;
		position: absolute;
		top: 0;
		left: 0;
		white-space: nowrap;
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
