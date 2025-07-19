<!-- src/lib/components/Editor/Chatbot/ThinkingIndicator.svelte -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	export let isComplete = false;

	// Predefined thinking states with emojis and durations
	const thinkingStates = [
		{ text: 'Let me think', icon: '🤔', duration: 3500, id: 'thinking' },
		{
			text: 'Searching knowledge base',
			icon: '🧠',
			duration: 3500,
			id: 'processing',
		},
		{
			text: 'Digging even deeper',
			icon: '⚡',
			duration: 3500,
			id: 'analyzing',
		},
		{
			text: 'Cooking up something good',
			icon: '🤌',
			duration: 3500,
			id: 'pondering',
		},
		{
			text: 'Adding final touches',
			icon: '✨',
			duration: 3500,
			id: 'refining',
		},
		{ text: 'Almost ready', icon: '🚀', duration: 5000, id: 'ready' },
		{
			text: 'Hmm... let me think a bit longer',
			icon: '🔄',
			duration: 4000,
			id: 'retrying',
		},
	];

	let currentStateIndex = 0;
	let dots = '';
	let stateTimer: ReturnType<typeof setInterval>;
	let dotTimer: ReturnType<typeof setInterval>;
	let mounted = false;

	onMount(() => {
		mounted = true;
		startAnimations();
	});

	onDestroy(() => {
		if (stateTimer) clearInterval(stateTimer);
		if (dotTimer) clearInterval(dotTimer);
	});

	function startAnimations() {
		// Cycle through thinking states
		stateTimer = setInterval(() => {
			if (!isComplete) {
				currentStateIndex =
					currentStateIndex < thinkingStates.length - 1
						? currentStateIndex + 1
						: 0;
			}
		}, thinkingStates[currentStateIndex]?.duration || 2000);

		// Animate dots independently
		dotTimer = setInterval(() => {
			if (!isComplete) {
				dots = dots === '...' ? '' : dots + '.';
			}
		}, 500);
	}

	$: currentState = thinkingStates[currentStateIndex];
	$: if (isComplete && stateTimer && dotTimer) {
		clearInterval(stateTimer);
		clearInterval(dotTimer);
		dots = '';
	}
</script>

<div class="relative w-full">
	<!-- Breathing effect background -->
	<div
		class="absolute inset-0 -z-10 rounded-xl bg-primary/5 {isComplete
			? ''
			: 'animate-pulse'}"
		style="animation-duration: 3s;"
	></div>

	<div class="flex w-full gap-4 rounded-xl px-2">
		<div class="flex w-full flex-col gap-3 py-2">
			{#if !isComplete}
				<!-- Main thinking text with smooth transitions -->
				<div class="flex items-center gap-2 text-muted-foreground">
					<!-- Emoji icon with bounce animation -->
					<span
						class="font-medium transition-all duration-300 {mounted
							? 'scale-100'
							: 'scale-0'}"
						style="animation: bounce 1s ease-in-out infinite;"
					>
						{currentState?.text}

						<!-- Animated dots -->
						<span
							class="w-6 font-bold text-primary transition-all duration-200"
						>
							{dots}
						</span>
					</span>
				</div>
			{:else}
				<!-- Completion state -->
				<div class="flex items-center gap-2 text-muted-foreground">
					<span class="text-lg">✅</span>
					<span class="font-medium">Thinking Complete</span>
				</div>
			{/if}

			<!-- Progress indicator -->
			<div class="flex gap-1.5">
				{#each thinkingStates as state, index (state.id)}
					<div
						class="h-1 rounded-full transition-all duration-300 {index <=
							currentStateIndex || isComplete
							? 'bg-primary'
							: 'bg-muted'}"
						style="width: {index === currentStateIndex && !isComplete
							? '24px'
							: '8px'};"
					></div>
				{/each}
			</div>

			{#if isComplete}
				<!-- Final progress bar when complete -->
				<div class="h-1 w-full overflow-hidden rounded-full bg-muted">
					<div
						class="h-full bg-primary transition-all duration-1000 ease-out"
						style="width: 100%;"
					></div>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	@keyframes bounce {
		0%,
		20%,
		53%,
		80%,
		100% {
			transform: translate3d(0, 0, 0);
		}
		40%,
		43% {
			transform: translate3d(0, -8px, 0);
		}
		70% {
			transform: translate3d(0, -4px, 0);
		}
		90% {
			transform: translate3d(0, -2px, 0);
		}
	}
</style>
