<!-- src/lib/components/Editor/Chatbot/Chatbot.svelte -->
<script lang="ts">
	import { MoreVertical, Copy, Check, Sparkles, Send } from 'lucide-svelte';
	import * as Avatar from '$lib/components/ui/avatar';
	import ThinkingIndicator from './ThinkingIndicator.svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	export let width: string = '100%';
	export let height: string = '400px';

	// Context props - passed from parent page
	export let essayContent: string = '';
	export let documentTitle: string = '';
	export let documentPrompt: string = '';
	export let wordCount: number = 0;
	export let wordCountLimit: number = 250;
	export let school: string = '';
	export let dueDate: string = '';
	export let status: string = '';
	export let initialMessages: any[] = [];

	interface Message {
		id: string;
		text: string;
		sender: 'user' | 'ai';
		timestamp: string;
		isStreaming?: boolean;
	}

	let messages: Message[] = [];
	let inputValue: string = '';
	let messagesContainer: HTMLDivElement;
	let showDropdown: boolean = false;
	let copiedMessageId: string | null = null;
	let isThinking: boolean = false;
	let currentThinking: {
		steps: string[];
		currentStep: number;
		isComplete: boolean;
	} | null = null;
	let inputFocused: boolean = false;
	let showSuggestions: boolean = false;
	let textareaElement: HTMLTextAreaElement;
	let isLoading: boolean = false;
	let streamingMessageId: string | null = null;

	// Configurable suggestions - adjust this JSON as needed
	const suggestions = [
		'Brainstorm ideas based on what you know about me',
		'Generate a first draft for my essay',
		'Fix all my grammar and spelling mistakes',
		'Improve the flow and structure of this paragraph: [copy and paste paragraph here]',
	];

	onMount(() => {
		loadInitialMessages();
	});

	async function loadInitialMessages() {
		try {
			const response = await fetch(
				`/api/ai-chatbot-messages/${$page.params.documentId}`,
			);

			if (response.ok) {
				const result = await response.json();
				if (result.success && result.messages) {
					messages = result.messages.map((msg: any) => ({
						id: msg.id,
						text: msg.content,
						sender: msg.role === 'user' ? 'user' : 'ai',
						timestamp: msg.timestamp,
					}));
					scrollToBottom();
				}
			} else if (response.status === 401) {
				// Handle unauthorized - redirect to login
				goto('/login');
			}
		} catch (error) {
			console.error('Failed to load initial messages:', error);
			// Fall back to using initialMessages prop if API fails
			if (initialMessages && initialMessages.length > 0) {
				messages = initialMessages.map((msg: any) => ({
					id: msg.id,
					text: msg.content,
					sender: msg.role === 'user' ? 'user' : 'ai',
					timestamp: msg.timestamp,
				}));
				scrollToBottom();
			}
		}
	}

	// Convert messages to the format expected by the server
	function messagesToServerFormat(): any[] {
		return messages.map((msg) => ({
			id: msg.id,
			role: msg.sender === 'user' ? 'user' : 'assistant',
			content: msg.text,
			timestamp: msg.timestamp,
		}));
	}

	async function sendMessage(): Promise<void> {
		if (!inputValue.trim() || isLoading) return;

		const userMessage = inputValue.trim();

		// Add user message immediately for better UX
		const userMsg: Message = {
			id: `user-${Date.now()}`,
			text: userMessage,
			sender: 'user',
			timestamp: new Date().toISOString(),
		};

		messages = [...messages, userMsg];
		inputValue = '';

		// Reset textarea height
		if (textareaElement) {
			textareaElement.style.height = 'auto';
		}
		hideSuggestions();
		scrollToBottom();

		// Start thinking animation
		startThinking();
		isLoading = true;

		try {
			// Get current user ID from page data or session
			const userId = $page.data.session?.user?.id;

			if (!userId) {
				throw new Error('User not authenticated');
			}

			// Create streaming assistant message
			const assistantId = `assistant-${Date.now()}`;
			streamingMessageId = assistantId;

			const streamingMsg: Message = {
				id: assistantId,
				text: '',
				sender: 'ai',
				timestamp: new Date().toISOString(),
				isStreaming: true,
			};

			// Complete thinking and add streaming message placeholder
			completeThinking();
			messages = [...messages, streamingMsg];
			scrollToBottom();

			// Send to streaming API route
			const response = await fetch('/api/ai-chatbot', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					message: userMessage,
					currentMessages: messagesToServerFormat().slice(0, -1), // Exclude the streaming message
					documentId: $page.params.documentId,
					versionId: $page.params.versionId,
					essayContent,
					documentTitle,
					documentPrompt,
					wordCount,
					wordCountLimit,
					school,
					dueDate,
					status,
				}),
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}

			// Handle streaming response
			const reader = response.body?.getReader();
			const decoder = new TextDecoder();
			let accumulatedText = '';

			if (reader) {
				while (true) {
					const { done, value } = await reader.read();

					if (done) break;

					const chunk = decoder.decode(value, { stream: true });
					const lines = chunk.split('\n');

					for (const line of lines) {
						if (line.startsWith('0:')) {
							// Parse AI SDK streaming format
							try {
								const jsonStr = line.slice(2); // Remove '0:' prefix
								const data = JSON.parse(jsonStr);
								if (data.type === 'textDelta' && data.textDelta) {
									accumulatedText += data.textDelta;

									// Update the streaming message
									messages = messages.map((msg) =>
										msg.id === assistantId
											? { ...msg, text: accumulatedText }
											: msg,
									);
									scrollToBottom();
								}
							} catch (e) {
								// Ignore parsing errors for partial chunks
							}
						}
					}
				}
			}

			// Mark streaming as complete
			messages = messages.map((msg) =>
				msg.id === assistantId ? { ...msg, isStreaming: false } : msg,
			);

			streamingMessageId = null;
			scrollToBottom();
		} catch (error) {
			console.error('Failed to send message:', error);

			// Remove the optimistic user message and show error
			messages = messages.filter((m) => m.id !== userMsg.id);

			const errorMsg: Message = {
				id: `error-${Date.now()}`,
				text: 'Sorry, I encountered an error processing your message. Please try again.',
				sender: 'ai',
				timestamp: new Date().toISOString(),
			};

			completeThinking();
			setTimeout(() => {
				messages = [...messages, errorMsg];
				scrollToBottom();
			}, 1000);
		} finally {
			isLoading = false;
			streamingMessageId = null;
		}
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
		}, 2500);
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
		autoResizeTextarea();
	}

	function hideSuggestions(): void {
		showSuggestions = false;
	}

	function selectSuggestion(suggestion: string): void {
		inputValue = suggestion;
		hideSuggestions();
		// Focus back on textarea after suggestion selection
		setTimeout(() => {
			if (textareaElement) {
				textareaElement.focus();
				autoResizeTextarea();
			}
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

	function autoResizeTextarea(): void {
		if (textareaElement) {
			// Reset height to auto to get the correct scrollHeight
			textareaElement.style.height = 'auto';

			// Set height based on content, with min and max constraints
			const newHeight = Math.min(
				Math.max(textareaElement.scrollHeight, 40),
				120,
			);
			textareaElement.style.height = newHeight + 'px';
		}
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
	class="relative flex flex-col rounded-xl border bg-background"
	style="width: {width};"
>
	<!-- Header -->
	<div
		class="flex items-center justify-between rounded-t-xl border-b bg-muted/50 p-4"
	>
		<div class="flex items-center space-x-3">
			<h3 class="font-semibold text-foreground">Essay Assistant</h3>
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
		class="space-y-4 overflow-y-auto bg-background p-4"
		style="height: {height};"
	>
		{#if messages.length === 0}
			<div class="py-6 text-center">
				<div class="mb-4 flex justify-center">
					<div
						class="flex h-24 w-24 items-center justify-center rounded-full bg-primary"
					>
						<Avatar.Root class="h-24 w-24">
							<Avatar.Image
								src="https://res.cloudinary.com/dqdasxxho/image/upload/v1752903474/Clara-headshot_aeowlr.png"
								alt="Clara"
							/>
							<Avatar.Fallback>
								<Sparkles class="h-10 w-10 text-primary-foreground" />
							</Avatar.Fallback>
						</Avatar.Root>
					</div>
				</div>
				<div class="space-y-2 text-foreground">
					<h4 class="text-xl font-semibold">Hi! I'm Clara 👋</h4>
					<p class="text-sm leading-relaxed text-muted-foreground">
						Select one of the suggestions below or ask me anything about your
						essay. Type away!
					</p>
					<p class="mt-3 text-xs text-muted-foreground">
						I'm your personal essay reviewer and brainstorming assistant! I can
						help you with revisions, feedback, and generating first drafts for
						your writing. For more in-depth essay coaching, ask <a
							href="https://dan.haloway.co"
							target="_blank"
							class="font-medium underline hover:text-foreground"
							>Dan the essay coach</a
						>.
					</p>
				</div>
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
						<!-- AI Avatar -->
						<div
							class="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary"
						>
							<Avatar.Root>
								<Avatar.Image
									src="https://res.cloudinary.com/dqdasxxho/image/upload/v1752903474/Clara-headshot_aeowlr.png"
									alt="Clara"
								/>
								<Avatar.Fallback>
									<Sparkles class="h-4 w-4 text-primary-foreground" />
								</Avatar.Fallback>
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
								<p class="whitespace-pre-wrap pb-6 text-sm">
									{message.text}
									{#if message.isStreaming}
										<span class="animate-pulse">|</span>
									{/if}
								</p>

								<!-- Copy button (hidden while streaming) -->
								{#if !message.isStreaming}
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
								{/if}
							</div>
						</div>

						<!-- Timestamp (hidden while streaming) -->
						{#if !message.isStreaming}
							<div
								class="text-xs text-muted-foreground {message.sender === 'user'
									? 'text-right'
									: 'text-left'}"
							>
								{formatTime(message.timestamp)}
							</div>
						{/if}

						<!-- {#if message.sender === 'user'}
						<div
							class="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-secondary"
						>
							<User class="h-4 w-4 text-secondary-foreground" />
						</div>
					{/if} -->
					</div>
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

	<!-- Input Area -->
	<div class="relative rounded-b-xl border-t bg-background p-4">
		<!-- Floating Suggestions -->
		{#if showSuggestions || messages.length === 0}
			<div
				class="suggestion-container absolute left-4 right-4 z-20 mb-2"
				style="bottom: 100%; transform: translateY(-0.5rem);"
			>
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

		<div class="flex items-end space-x-2">
			<textarea
				bind:this={textareaElement}
				bind:value={inputValue}
				on:keydown={handleKeyPress}
				on:focus={handleInputFocus}
				on:blur={handleInputBlur}
				on:input={handleInputChange}
				placeholder="Type your message..."
				rows="1"
				class="flex-1 resize-none overflow-hidden rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
				style="transform-origin: bottom;"
			></textarea>
			<button
				on:click={sendMessage}
				disabled={!inputValue.trim()}
				class="flex-shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
			>
				Send
			</button>
		</div>
	</div>
</div>

<style>
	/* Textarea styling */
	textarea {
		min-height: 40px;
		max-height: 120px;
		line-height: 1.4;
		vertical-align: bottom;
	}

	/* Ensure textarea expands downward and scrolls if it gets too tall */
	textarea:focus {
		overflow-y: auto;
	}

	/* Make sure the input container aligns items at the bottom */
	.flex.items-end {
		align-items: flex-end;
	}

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
