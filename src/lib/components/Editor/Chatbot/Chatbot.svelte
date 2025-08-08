<!-- src/lib/components/Editor/Chatbot/Chatbot.svelte -->
<script lang="ts">
	import { MoreVertical, Copy, Check, Sparkles } from 'lucide-svelte';
	import * as Avatar from '$lib/components/ui/avatar';
	import ThinkingIndicator from './ThinkingIndicator.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { ChatMessage } from '$lib/types/ai-chatbot.ts';

	export let width: string = '100%';
	export let height: string = '400px';

	// Context props - passed from parent page
	export let getCurrentContent: (() => string) | undefined = undefined;
	export let getCurrentFeedback: (() => string) | undefined = undefined;
	export let essayContent: string = '';
	export let documentTitle: string = '';
	export let documentPrompt: string = '';
	export let wordCount: number = 0;
	export let wordCountLimit: number = 250;
	export let school: string = '';
	export let dueDate: string = '';
	export let status: string = '';

	export let initialMessages: ChatMessage[] = [];

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

	// Configurable suggestions - adjust this JSON as needed
	const suggestions = [
		'Help me brainstorm ideas for this prompt',
		'Generate a first draft outline for my essay',
		'Fix all my grammar and spelling mistakes',
		'Help me shorten this sentence:',
	];

	onMount(() => {
		loadInitialMessages();
	});

	function scrollToBottom(): void {
		setTimeout(() => {
			if (messagesContainer) {
				messagesContainer.scrollTop = messagesContainer.scrollHeight;
			}
		}, 0);
	}

	// Format timestamp for display
	function formatTime(timestamp: string): string {
		const messageDate = new Date(timestamp);
		const today = new Date();

		// Check if the message is from today
		const isToday = messageDate.toDateString() === today.toDateString();

		if (isToday) {
			// Just show time for today's messages
			return messageDate.toLocaleTimeString([], {
				hour: '2-digit',
				minute: '2-digit',
			});
		} else {
			// Show date and time for older messages
			return (
				messageDate.toLocaleDateString([], {
					month: '2-digit',
					day: '2-digit',
					year: '2-digit',
				}) +
				' ' +
				messageDate.toLocaleTimeString([], {
					hour: '2-digit',
					minute: '2-digit',
				})
			);
		}
	}

	async function loadInitialMessages() {
		try {
			console.log(
				'Loading initial messages for document:',
				$page.params.documentId,
			);

			const response = await fetch(
				`/api/ai-chatbot-messages/${$page.params.documentId}`,
			);

			if (response.ok) {
				const result = await response.json();
				console.log('Initial API response:', result);

				if (result.success && result.messages) {
					console.log('Processing initial messages:', result.messages.length);

					messages = result.messages.map((msg: ChatMessage) => ({
						id: msg.id,
						text: msg.content, // Make sure we're using content, not text
						sender: msg.role === 'user' ? 'user' : 'ai',
						timestamp: msg.timestamp,
					}));

					console.log('Mapped initial messages:', messages.length);
					scrollToBottom();
				}
			} else if (response.status === 401) {
				goto('/login');
			} else {
				console.error(
					'Failed to load initial messages, status:',
					response.status,
				);
			}
		} catch (error) {
			console.error('Failed to load initial messages:', error);
			// Fall back to using initialMessages prop if API fails
			if (initialMessages && initialMessages.length > 0) {
				console.log('Using fallback initial messages:', initialMessages.length);
				messages = initialMessages.map((msg: ChatMessage) => ({
					id: msg.id,
					text: msg.content, // Make sure we're using content
					sender: msg.role === 'user' ? 'user' : 'ai',
					timestamp: msg.timestamp,
				}));
				scrollToBottom();
			}
		}
	}

	async function getCurrentEssayContent(): Promise<string> {
		// Try the callback first
		if (getCurrentContent) {
			try {
				const currentText = getCurrentContent();
				console.log(
					'Got current content from callback:',
					currentText.length,
					'characters',
				);
				return currentText;
			} catch (error) {
				console.error('Failed to get content from callback:', error);
			}
		}

		// Fallback to the prop
		console.log('Using fallback essayContent prop');
		return essayContent || '';
	}

	// Convert messages to the format expected by the server
	function messagesToServerFormat(): ChatMessage[] {
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
			console.log('Sending message to API...');

			// Send to streaming API route
			const response = await fetch('/api/ai-chatbot', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					message: userMessage,
					currentMessages: messagesToServerFormat().slice(0, -1), // Exclude user message since it's already in the array
					documentId: $page.params.documentId,
					versionId: $page.params.versionId,
					essayContent: await getCurrentEssayContent(),
					currentFeedback: getCurrentFeedback ? getCurrentFeedback() : '',
					documentTitle,
					documentPrompt,
					wordCount,
					wordCountLimit,
					school,
					dueDate,
					status,
				}),
			});

			console.log('API response status:', response.status);

			if (!response.ok) {
				const errorText = await response.text();
				console.error('API error response:', errorText);
				throw new Error(`HTTP ${response.status}: ${errorText}`);
			}

			// Create streaming assistant message IMMEDIATELY when first content arrives
			const assistantId = `assistant-${Date.now()}`;
			let streamingMsg: Message;

			// Handle streaming response
			const reader = response.body?.getReader();
			const decoder = new TextDecoder();
			let accumulatedText = '';
			let hasStartedStreaming = false;

			console.log('Starting to read stream...');

			if (reader) {
				try {
					// eslint-disable-next-line no-constant-condition
					while (true) {
						const { done, value } = await reader.read();

						if (done) {
							console.log(
								'Stream completed, final text length:',
								accumulatedText.length,
							);
							break;
						}

						const chunk = decoder.decode(value, { stream: true });
						const lines = chunk.split('\n');

						for (const line of lines) {
							// FIXED: Parse the correct Vercel AI SDK format
							if (line.startsWith('0:')) {
								try {
									// Extract the JSON string after "0:"
									const jsonStr = line.slice(2); // Remove '0:' prefix

									// Parse the JSON-encoded text chunk
									const textChunk = JSON.parse(jsonStr);

									console.log('Received text chunk:', textChunk);
									accumulatedText += textChunk;

									// PARALLEL TRANSITION: Create message AND complete thinking simultaneously
									if (!hasStartedStreaming) {
										console.log('Starting parallel transition...');

										// Create streaming message first
										streamingMsg = {
											id: assistantId,
											text: accumulatedText,
											sender: 'ai',
											timestamp: new Date().toISOString(),
											isStreaming: true,
										};

										messages = [...messages, streamingMsg];

										// Complete thinking immediately after (no delay)
										completeThinking();

										hasStartedStreaming = true;
									} else {
										// Update the streaming message
										messages = messages.map((msg) =>
											msg.id === assistantId
												? { ...msg, text: accumulatedText }
												: msg,
										);
									}
									scrollToBottom();
								} catch (error) {
									console.error(
										'Failed to parse text chunk:',
										error,
										'Line:',
										line,
									);
								}
							}
							// Handle other stream events if needed
							else if (line.startsWith('e:')) {
								// End/finish event
								console.log('Stream finish event:', line);
							} else if (line.startsWith('d:')) {
								// Data/metadata event
								console.log('Stream data event:', line);
							}
						}
					}
				} catch (streamError) {
					console.error('Stream reading error:', streamError);
				}
			}

			// After streaming completes, reload messages from database
			if (hasStartedStreaming && accumulatedText.length > 0) {
				console.log('Streaming completed successfully, marking as complete');
				// Mark streaming as complete
				messages = messages.map((msg) =>
					msg.id === assistantId ? { ...msg, isStreaming: false } : msg,
				);

				// Wait a moment for the database save to complete, then reload
				setTimeout(async () => {
					console.log('Reloading messages from database...');
					await reloadMessagesFromDatabase();
				}, 1000);
			} else {
				// Handle case where no streaming occurred
				console.log('No streaming data received');
				completeThinking();

				// Wait and try to reload from database in case it was saved anyway
				setTimeout(async () => {
					console.log('Checking database for saved messages...');
					await reloadMessagesFromDatabase();
				}, 2000);
			}

			scrollToBottom();
		} catch (error) {
			console.error('Failed to send message:', error);

			// Ensure thinking is completed on error
			completeThinking();

			// Remove the optimistic user message and show error
			messages = messages.filter((m) => m.id !== userMsg.id);

			// Check database before showing error - maybe it was saved despite the error
			setTimeout(async () => {
				const beforeErrorCount = messages.length;
				await reloadMessagesFromDatabase();

				// Only show error if no new messages were loaded
				if (messages.length === beforeErrorCount) {
					const errorMsg: Message = {
						id: `error-${Date.now()}`,
						text: 'Sorry, I encountered an error processing your message. Please try again.',
						sender: 'ai',
						timestamp: new Date().toISOString(),
					};

					messages = [...messages, errorMsg];
					scrollToBottom();
				}
			}, 1000);
		} finally {
			console.log('Cleaning up - setting isLoading to false');
			isLoading = false;
			// Ensure thinking is stopped
			if (isThinking) {
				console.log('Force completing thinking in finally block');
				completeThinking();
			}
		}
	}

	// Add this new function to reload messages from the database:
	async function reloadMessagesFromDatabase(): Promise<void> {
		try {
			console.log('Fetching latest messages from database...');

			const response = await fetch(
				`/api/ai-chatbot-messages/${$page.params.documentId}`,
			);

			if (response.ok) {
				const result = await response.json();
				if (result.success && result.messages) {
					console.log('Loaded messages from DB:', result.messages.length);

					const loadedMessages = result.messages.map((msg: ChatMessage) => ({
						id: msg.id,
						text: msg.content,
						sender: msg.role === 'user' ? 'user' : 'ai',
						timestamp: msg.timestamp,
					}));

					// Only update if we got more messages than we currently have
					if (loadedMessages.length > messages.length) {
						console.log('Updating UI with database messages');
						messages = loadedMessages;
						scrollToBottom();
					} else if (loadedMessages.length === messages.length) {
						// Same count, but check if the last message content is different
						const lastDbMessage = loadedMessages[loadedMessages.length - 1];
						const lastUiMessage = messages[messages.length - 1];

						if (
							lastDbMessage &&
							lastUiMessage &&
							lastDbMessage.text !== lastUiMessage.text &&
							lastDbMessage.sender === 'ai'
						) {
							console.log('Updating last message with database version');
							messages = loadedMessages;
							scrollToBottom();
						}
					}
				}
			} else {
				console.error('Failed to reload messages, status:', response.status);
			}
		} catch (error) {
			console.error('Error reloading messages from database:', error);
		}
	}

	function startThinking(): void {
		console.log('Starting thinking animation');

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
				currentThinking.currentStep < currentThinking.steps.length - 1 &&
				isThinking // Add this check to prevent continuing after completion
			) {
				currentThinking.currentStep++;
				currentThinking = { ...currentThinking };
				console.log('Thinking step:', currentThinking.currentStep);
			} else {
				console.log('Thinking interval cleared');
				clearInterval(thinkingInterval);
				// Don't auto-complete here - let the streaming logic handle it
			}
		}, 1500);
	}

	function completeThinking(): void {
		console.log('completeThinking called, current state:', {
			isThinking,
			currentThinking,
		});

		// Immediate state clearing - no delays
		isThinking = false;

		if (currentThinking) {
			currentThinking.isComplete = true;
			// Trigger one final reactive update to show completion state briefly
			currentThinking = { ...currentThinking };
		}

		debugState();

		// Clear thinking state immediately (removed setTimeout)
		// This creates a smooth transition to the streaming response
		setTimeout(() => {
			currentThinking = null;
			console.log('Thinking state cleared immediately');
		}, 50); // Very brief 50ms to show completion state, then clear
	}

	function debugState() {
		console.log('Current component state:', {
			isLoading,
			isThinking,
			currentThinking,
			messagesCount: messages.length,
			lastMessage: messages[messages.length - 1],
		});
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

	async function copyMessage(messageId: string, text: string): Promise<void> {
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
			<h3 class="font-semibold text-foreground">Clara, Essay Assistant</h3>
			<div class="flex items-center space-x-2">
				<div class="h-2 w-2 rounded-full bg-green-500"></div>
				<span class="text-sm text-muted-foreground">
					{isLoading ? 'Thinking...' : 'Online'}
				</span>
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
								<Sparkles class="h-10 w-10 text-primary" />
							</Avatar.Fallback>
						</Avatar.Root>
					</div>
				</div>
				<div class="space-y-2 text-foreground">
					<h4 class="text-xl font-semibold">Hi! I'm Clara 👋</h4>
					<p class="text-sm leading-relaxed text-muted-foreground">
						I can see your essay and help you improve it! Select one of the
						suggestions below or ask me anything about your essay. Type away!
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
					<p class="mt-3 text-xs text-muted-foreground">
						Fill out <a
							href="/background"
							class="font-medium underline hover:text-foreground"
							>the background form</a
						> so I can help you brainstorm ideas and provide personalized feedback!
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
				<div class="flex max-w-[80%] items-start">
					<div class="flex w-full flex-col space-y-2">
						{#if message.sender === 'ai'}
							<div
								class="ml-1.5 mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary"
							>
								<Avatar.Root>
									<Avatar.Image
										src="https://res.cloudinary.com/dqdasxxho/image/upload/v1752903474/Clara-headshot_aeowlr.png"
										alt="Clara"
									/>
									<Avatar.Fallback>
										<Sparkles class="h-4 w-4 text-primary" />
									</Avatar.Fallback>
								</Avatar.Root>
							</div>
						{/if}
						<!-- Main message -->
						<div class="relative">
							<div
								class="relative {message.sender === 'user'
									? 'ml-auto bg-primary text-primary-foreground'
									: 'bg-muted text-foreground'} ml-1 mt-2 rounded-lg px-3 py-2"
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
								><Sparkles class="h-4 w-4 text-primary" /></Avatar.Fallback
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
							disabled={isLoading}
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
				placeholder="Ask me anything about your essay..."
				rows="1"
				disabled={isLoading}
				class="flex-1 resize-none overflow-hidden rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
				style="transform-origin: bottom;"
			></textarea>
			<button
				on:click={sendMessage}
				disabled={!inputValue.trim() || isLoading}
				class="flex-shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{#if isLoading}
					<div
						class="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"
					></div>
				{:else}
					Send
				{/if}
			</button>
		</div>

		<!-- Context indicator -->
		{#if documentTitle}
			<div class="mt-2 text-xs text-muted-foreground">
				→ I can see your essay "{documentTitle}" ({wordCount}/{wordCountLimit} words)
			</div>
		{/if}
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

	/* Loading spinner animation */
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.animate-spin {
		animation: spin 1s linear infinite;
	}
</style>
