<!-- src/lib/components/Editor/Chatbot/Chatbot.svelte -->
<script lang="ts">
	import { MoreVertical, Copy, Check, Sparkles, User } from 'lucide-svelte';

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
	let showDropdown: boolean = false;
	let copiedMessageId: number | null = null;

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

	function clearChat(): void {
		messages = [];
		showDropdown = false;
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
	class="flex flex-col rounded-lg border bg-background"
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
				<div class="group flex max-w-[80%] items-start space-x-2">
					{#if message.sender === 'ai'}
						<div
							class="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary"
						>
							<Sparkles class="h-4 w-4 text-primary-foreground" />
						</div>
					{/if}

					<div class="flex flex-col">
						<div
							class="relative rounded-lg px-3 py-2 {message.sender === 'user'
								? 'ml-auto bg-primary text-primary-foreground'
								: 'bg-muted text-foreground'}"
						>
							<p class="whitespace-pre-wrap pr-6 text-sm">{message.text}</p>

							<!-- Copy Button -->
							<button
								on:click={() => copyMessage(message.id, message.text)}
								class="absolute right-2 top-2 rounded p-1 opacity-0 transition-all duration-200 hover:bg-black/10 group-hover:opacity-100 {message.sender ===
								'user'
									? 'text-primary-foreground/70 hover:text-primary-foreground'
									: 'text-muted-foreground hover:text-foreground'}"
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

					{#if message.sender === 'user'}
						<div
							class="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-secondary"
						>
							<User class="h-4 w-4 text-secondary-foreground" />
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
