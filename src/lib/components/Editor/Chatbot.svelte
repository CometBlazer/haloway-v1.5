<!-- Chatbot.svelte -->
<script lang="ts">
	export let width: string = '100%';
	export let height: string = '400px';

	interface Message {
		id: number;
		text: string;
		sender: 'user' | 'ai';
	}

	let messages: Message[] = [];
	let inputValue: string = '';
	let messagesContainer: HTMLDivElement;

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

		// Auto-scroll to bottom
		setTimeout(() => {
			if (messagesContainer) {
				messagesContainer.scrollTop = messagesContainer.scrollHeight;
			}
		}, 0);

		// Add AI response after a short delay
		setTimeout(() => {
			messages = [
				...messages,
				{
					id: Date.now() + 1,
					text: 'testing',
					sender: 'ai',
				},
			];

			// Auto-scroll to bottom again
			setTimeout(() => {
				if (messagesContainer) {
					messagesContainer.scrollTop = messagesContainer.scrollHeight;
				}
			}, 0);
		}, 500);
	}

	function handleKeyPress(event: KeyboardEvent): void {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	}
</script>

<div
	class="flex flex-col rounded-lg border bg-background"
	style="width: {width}; height: {height};"
>
	<!-- Header -->
	<div class="flex items-center justify-between border-b bg-muted/50 p-4">
		<h3 class="font-semibold text-foreground">Chat Assistant</h3>
		<div class="flex items-center space-x-2">
			<div class="h-2 w-2 rounded-full bg-green-500"></div>
			<span class="text-sm text-muted-foreground">Online</span>
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
							<svg
								class="h-4 w-4 text-primary-foreground"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
								></path>
							</svg>
						</div>
					{/if}

					<div class="flex flex-col">
						<div
							class="rounded-lg px-3 py-2 {message.sender === 'user'
								? 'ml-auto bg-primary text-primary-foreground'
								: 'bg-muted text-foreground'}"
						>
							<p class="whitespace-pre-wrap text-sm">{message.text}</p>
						</div>
					</div>

					{#if message.sender === 'user'}
						<div
							class="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-secondary"
						>
							<svg
								class="h-4 w-4 text-secondary-foreground"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
								></path>
							</svg>
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>

	<!-- Input Area -->
	<div class="border-t bg-background p-4">
		<div class="flex space-x-2">
			<input
				bind:value={inputValue}
				on:keydown={handleKeyPress}
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
</style>
