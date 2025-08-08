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
</script>

<span class="typewriter-wrapper {className}">
	<span class="typewriter-text">{displayText}</span><span
		class="typewriter-cursor"
	></span>
</span>

<style>
	.typewriter-wrapper {
		display: inline-flex;
		align-items: baseline;
		position: relative;
		vertical-align: baseline;
		min-height: 1.2em;
	}

	.typewriter-text {
		display: inline-block;
		min-width: 7ch; /* Use character units for better responsiveness */
		text-align: left;
		vertical-align: baseline;
	}

	/* Responsive width adjustments */
	@media (max-width: 640px) {
		.typewriter-text {
			min-width: 5ch;
		}
	}

	@media (min-width: 641px) and (max-width: 768px) {
		.typewriter-text {
			min-width: 6ch;
		}
	}

	@media (min-width: 769px) {
		.typewriter-text {
			min-width: 8ch;
		}
	}

	.typewriter-cursor {
		display: inline-block;
		width: 3px;
		height: 1em;
		background-color: currentColor;
		margin-left: 2px;
		animation: blink 1s infinite;
		vertical-align: baseline;
		transform: translateY(0.1em); /* Fine-tune cursor alignment */
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
