<script lang="ts">
	import { MoreVertical, Copy, Check, Sparkles } from 'lucide-svelte';
	import * as Avatar from '$lib/components/ui/avatar';
	import ThinkingIndicator from './ThinkingIndicator.svelte';

	export let width: string = '100%';
	export let height: string = '400px';

	interface Message {
		id: number;
		text: string;
		sender: 'user' | 'ai';
		thinking?: {
			steps: string[];
			currentStep: number;
			isComplete: boolean;
		};
	}

	let messages: Message[] = [];
	let inputValue: string = '';
	let messagesContainer: HTMLDivElement;
	let showDropdown: boolean = false;
	let copiedMessageId: number | null = null;
	let isThinking: boolean = false;
	let currentThinking: {
		steps: string[];
		currentStep: number;
		isComplete: boolean;
	} | null = null;
	let inputFocused: boolean = false;
	let showSuggestions: boolean = false;

	// Configurable suggestions - adjust this JSON as needed
	const suggestions = [
		"What's the weather like today?",
		'Help me write a professional email',
		'Explain quantum computing in simple terms',
	];

	function sendMessage(): void {
		if (!inputValue.trim()) return;

		// Add user message
		messages = [
			...messages,
			{
				id: Date.now(),
				text: inputValue,
				sender: 'user',
			},
		];

		inputValue = '';
		hideSuggestions();

		// Auto-scroll to bottom
		setTimeout(() => {
			if (messagesContainer) {
				messagesContainer.scrollTop = messagesContainer.scrollHeight;
			}
		}, 0);

		// Start thinking process
		startThinking();
	}

	function startThinking(): void {
		isThinking = true;
		currentThinking = {
			steps: [
				"Analyzing the user's question...",
				'Searching knowledge base...',
				'Processing context and intent...',
				'Formulating comprehensive response...',
				'Reviewing and refining answer...',
			],
			currentStep: 0,
			isComplete: false,
		};

		// Simulate thinking steps
		const thinkingInterval = setInterval(() => {
			if (
				currentThinking &&
				currentThinking.currentStep < currentThinking.steps.length - 1
			) {
				currentThinking.currentStep++;
				currentThinking = { ...currentThinking };
			} else {
				clearInterval(thinkingInterval);
				completeThinking();
			}
		}, 800);
	}

	function completeThinking(): void {
		if (currentThinking) {
			currentThinking.isComplete = true;
			currentThinking = { ...currentThinking };
		}

		// Add AI response after thinking is complete
		setTimeout(() => {
			const aiResponse =
				'This is a longer, more comprehensive response that demonstrates the improved AI capabilities. The system has carefully analyzed your input and is providing a detailed answer that shows the thinking process was worthwhile. This response includes multiple sentences and provides substantial value to continue the conversation effectively.';

			messages = [
				...messages,
				{
					id: Date.now() + 1,
					text: aiResponse,
					sender: 'ai',
					thinking: currentThinking ? { ...currentThinking } : undefined,
				},
			];

			isThinking = false;
			currentThinking = null;

			// Auto-scroll to bottom
			setTimeout(() => {
				if (messagesContainer) {
					messagesContainer.scrollTop = messagesContainer.scrollHeight;
				}
			}, 0);
		}, 1000);
	}

	function handleKeyPress(event: KeyboardEvent): void {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	}

	function handleInputFocus(): void {
		inputFocused = true;
		if (inputValue.length === 0) {
			showSuggestions = true;
		}
	}

	function handleInputBlur(): void {
		inputFocused = false;
		// Delay hiding suggestions to allow clicking on them
		setTimeout(() => {
			if (!inputFocused) {
				hideSuggestions();
			}
		}, 150);
	}

	function handleInputChange(): void {
		if (inputValue.length > 0) {
			hideSuggestions();
		} else if (inputFocused) {
			showSuggestions = true;
		}
	}

	function hideSuggestions(): void {
		showSuggestions = false;
	}

	function selectSuggestion(suggestion: string): void {
		inputValue = suggestion;
		hideSuggestions();
		// Focus back on input after suggestion selection
		setTimeout(() => {
			const input = document.querySelector('input');
			if (input) input.focus();
		}, 0);
	}

	function clearChat(): void {
		messages = [];
		showDropdown = false;
		isThinking = false;
		currentThinking = null;
	}

	function toggleDropdown(): void {
		showDropdown = !showDropdown;
	}

	function closeDropdown(): void {
		showDropdown = false;
	}

	async function copyMessage(messageId: number, text: string): Promise<void> {
		try {
			await navigator.clipboard.writeText(text);
			copiedMessageId = messageId;
			setTimeout(() => {
				copiedMessageId = null;
			}, 2000);
		} catch (err) {
			console.error('Failed to copy text: ', err);
		}
	}
</script>

<svelte:window
	on:click={closeDropdown}
	on:keydown={(e) => e.key === 'Escape' && closeDropdown()}
/>

<div
	class="relative flex flex-col rounded-lg border bg-background"
	style="width: {width}; height: {height};"
>
	<!-- Header -->
	<div class="flex items-center justify-between border-b bg-muted/50 p-4">
		<div class="flex items-center space-x-3">
			<h3 class="font-semibold text-foreground">Chat Assistant</h3>
			<div class="flex items-center space-x-2">
				<div class="h-2 w-2 rounded-full bg-green-500"></div>
				<span class="text-sm text-muted-foreground">Online</span>
			</div>
		</div>

		<!-- Dropdown Menu -->
		<div class="dropdown-container relative">
			<button
				on:click|stopPropagation={toggleDropdown}
				class="rounded-md p-1 transition-colors hover:bg-muted"
				aria-label="Menu"
			>
				<MoreVertical class="h-4 w-4 text-muted-foreground" />
			</button>

			{#if showDropdown}
				<div
					class="absolute right-0 top-full z-10 mt-1 w-36 rounded-md border bg-background shadow-lg"
				>
					<button
						on:click={clearChat}
						class="w-full rounded-md px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
					>
						Clear Chat
					</button>
				</div>
			{/if}
		</div>
	</div>

	<!-- Messages Container -->
	<div
		bind:this={messagesContainer}
		class="flex-1 space-y-4 overflow-y-auto bg-background p-4"
	>
		{#if messages.length === 0}
			<div class="py-8 text-center text-muted-foreground">
				<p class="text-sm">Start a conversation...</p>
			</div>
		{/if}

		{#each messages as message (message.id)}
			<div
				class="flex {message.sender === 'user'
					? 'justify-end'
					: 'justify-start'}"
			>
				<div class="flex max-w-[80%] items-start space-x-2">
					{#if message.sender === 'ai'}
						<div
							class="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary"
						>
							<Avatar.Root>
								<Avatar.Image
									src="https://res.cloudinary.com/dqdasxxho/image/upload/v1752903474/Clara-headshot_aeowlr.png"
									alt="Clara"
								/>
								<Avatar.Fallback
									><Sparkles
										class="h-4 w-4 text-primary-foreground"
									/></Avatar.Fallback
								>
							</Avatar.Root>
						</div>
					{/if}

					<div class="flex w-full flex-col space-y-2">
						<!-- Main message -->
						<div class="relative">
							<div
								class="relative {message.sender === 'user'
									? 'ml-auto bg-primary text-primary-foreground'
									: 'bg-muted text-foreground'} ml-2 rounded-lg px-3 py-2"
							>
								<p class="whitespace-pre-wrap pb-6 text-sm">{message.text}</p>

								<!-- Always visible copy button -->
								<button
									on:click={() => copyMessage(message.id, message.text)}
									class="absolute bottom-2 right-2 rounded p-1 transition-all duration-200 {message.sender ===
									'user'
										? 'text-primary-foreground/50 hover:bg-white/10 hover:text-primary-foreground'
										: 'text-muted-foreground hover:bg-black/10 hover:text-foreground'}"
									aria-label="Copy message"
								>
									{#if copiedMessageId === message.id}
										<Check class="h-3 w-3" />
									{:else}
										<Copy class="h-3 w-3" />
									{/if}
								</button>
							</div>
						</div>
					</div>

					<!-- {#if message.sender === 'user'}
						<div
							class="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-secondary"
						>
							<User class="h-4 w-4 text-secondary-foreground" />
						</div>
					{/if} -->
				</div>
			</div>
		{/each}

		<!-- Live Thinking Indicator -->
		{#if isThinking && currentThinking}
			<div class="flex justify-start">
				<div class="flex max-w-[80%] items-start space-x-2">
					<div
						class="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary"
					>
						<Avatar.Root>
							<Avatar.Image
								src="https://res.cloudinary.com/dqdasxxho/image/upload/v1752903474/Clara-headshot_aeowlr.png"
								alt="Clara"
							/>
							<Avatar.Fallback
								><Sparkles
									class="h-4 w-4 text-primary-foreground"
								/></Avatar.Fallback
							>
						</Avatar.Root>
					</div>
					<div class="flex-1">
						<ThinkingIndicator isComplete={false} />
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Floating Suggestions -->
	{#if showSuggestions}
		<div class="suggestion-container absolute bottom-20 left-4 right-4 z-20">
			<div class="flex flex-wrap justify-center gap-2">
				{#each suggestions as suggestion, index}
					<button
						on:click={() => selectSuggestion(suggestion)}
						class="suggestion-button rounded-full border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-lg transition-all duration-200 hover:bg-muted hover:shadow-xl"
						style="animation-delay: {index * 100}ms"
					>
						{suggestion}
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Input Area -->
	<div class="border-t bg-background p-4">
		<div class="flex space-x-2">
			<input
				bind:value={inputValue}
				on:keydown={handleKeyPress}
				on:focus={handleInputFocus}
				on:blur={handleInputBlur}
				on:input={handleInputChange}
				placeholder="Type your message..."
				class="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
			/>
			<button
				on:click={sendMessage}
				disabled={!inputValue.trim()}
				class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
			>
				Send
			</button>
		</div>
	</div>
</div>

<style>
	/* Custom scrollbar styling */
	div::-webkit-scrollbar {
		width: 6px;
	}

	div::-webkit-scrollbar-track {
		background: transparent;
	}

	div::-webkit-scrollbar-thumb {
		background: hsl(var(--muted-foreground) / 0.3);
		border-radius: 3px;
	}

	div::-webkit-scrollbar-thumb:hover {
		background: hsl(var(--muted-foreground) / 0.5);
	}

	/* Suggestion animations */
	.suggestion-container {
		animation: fadeIn 0.3s ease-out;
	}

	.suggestion-button {
		animation: slideUpFade 0.4s ease-out both;
		transform: translateY(10px);
		opacity: 0;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes slideUpFade {
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}
</style>
