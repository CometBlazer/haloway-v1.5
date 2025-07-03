<!-- src/lib/components/Editor/AIFeedback.svelte -->
<script lang="ts">
	import { createEventDispatcher, onDestroy } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	// import { enhance } from '$app/forms';
	import {
		Sparkles,
		RefreshCw,
		Clock,
		AlertCircle,
		CheckCircle,
		Info,
		Lock,
	} from 'lucide-svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { toastStore } from '$lib/stores/toast';
	import type { Editor } from '@tiptap/core';
	// import type { ActionResult } from '@sveltejs/kit';

	export let essayText: string = '';
	export let wordCountLimit: number = 250;
	export let currentWordCount: number = 0;
	// export let versionId: string | null = null;
	export let existingFeedback: string | null = null;
	export let disabled: boolean = false;
	export let documentPrompt: string = '';
	export let editor: Editor | null = null;

	const dispatch = createEventDispatcher<{
		feedbackReceived: { feedback: string; wordCount: number };
		contentLocked: { locked: boolean };
		saveRequired: Record<string, never>;
	}>();

	// Make feedback reactive to existingFeedback changes
	$: feedback = existingFeedback || '';

	let loading = false;
	let lastFeedbackTime: Date | null = null;
	let contentLocked = false;
	let capturedContent = '';
	let capturedWordCount = 0;
	let editorContentSnapshot = '';

	// Track editor state to prevent unwanted reloads
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let editorLockState = false;
	let currentEditorInstance: Editor | null = null;

	// Calculate states
	$: hasContent = essayText.trim().length > 0;
	$: hasFeedback = feedback && feedback.trim().length > 0;
	$: canGetFeedback = hasContent && !loading && !disabled && !contentLocked;

	// Handle editor instance changes more carefully
	function handleEditorChange(newEditor: Editor | null) {
		if (newEditor && newEditor !== currentEditorInstance) {
			currentEditorInstance = newEditor;
			// Apply current lock state to new editor instance
			if (contentLocked && newEditor.isEditable) {
				newEditor.setEditable(false);
			}
		}
	}

	// Watch editor prop changes without causing reactivity issues
	$: handleEditorChange(editor);

	// Manual editor lock/unlock functions to avoid reactive loops
	function lockEditor() {
		if (currentEditorInstance && currentEditorInstance.isEditable) {
			// Capture current content before locking
			editorContentSnapshot = currentEditorInstance.getHTML();
			currentEditorInstance.setEditable(false);
			editorLockState = true;
			console.log('Editor locked, content preserved');
		}
	}

	function unlockEditor() {
		if (currentEditorInstance && !currentEditorInstance.isEditable) {
			currentEditorInstance.setEditable(true);
			// Restore content if it was lost
			if (editorContentSnapshot && currentEditorInstance.isEmpty) {
				currentEditorInstance.commands.setContent(editorContentSnapshot);
				console.log('Editor content restored after unlock');
			}
			editorLockState = false;
			console.log('Editor unlocked');
		}
	}

	// Define types for sanitization
	type SanitizedContent = {
		type: 'text' | 'html';
		content: string;
	};

	// Simplified HTML sanitization function
	function sanitizeAndParseHtml(html: string): SanitizedContent {
		if (!html || html.trim().length === 0) {
			return { type: 'text', content: '' };
		}

		// Since this content comes from our own API, we can be less aggressive
		// Just remove the most dangerous elements and return as HTML
		const allowedTags = [
			'h1',
			'h2',
			'h3',
			'h4',
			'h5',
			'h6',
			'ul',
			'li',
			'p',
			'strong',
			'em',
			'br',
		];

		try {
			// Simple regex-based sanitization for our controlled content
			let sanitizedHtml = html;

			// Remove markdown code fences (```html, ```, etc.)
			sanitizedHtml = sanitizedHtml.replace(/^```[\w]*\n?/gm, '');
			sanitizedHtml = sanitizedHtml.replace(/\n?```$/gm, '');
			sanitizedHtml = sanitizedHtml.replace(/```$/gm, '');

			// Convert markdown formatting to HTML
			// Bold: **text** or __text__ -> <strong>text</strong>
			sanitizedHtml = sanitizedHtml.replace(
				/\*\*(.*?)\*\*/g,
				'<strong>$1</strong>',
			);
			sanitizedHtml = sanitizedHtml.replace(
				/__(.*?)__/g,
				'<strong>$1</strong>',
			);

			// Italic: *text* or _text_ -> <em>text</em> (but avoid conflicts with bold)
			sanitizedHtml = sanitizedHtml.replace(
				/(?<!\*)\*(?!\*)([^*]+?)\*(?!\*)/g,
				'<em>$1</em>',
			);
			sanitizedHtml = sanitizedHtml.replace(
				/(?<!_)_(?!_)([^_]+?)_(?!_)/g,
				'<em>$1</em>',
			);

			// Remove any script tags (just in case)
			sanitizedHtml = sanitizedHtml.replace(
				/<script[^>]*>.*?<\/script>/gis,
				'',
			);

			// Remove any on* event handlers
			sanitizedHtml = sanitizedHtml.replace(/\s+on\w+="[^"]*"/gi, '');
			sanitizedHtml = sanitizedHtml.replace(/\s+on\w+='[^']*'/gi, '');

			// Remove javascript: urls
			sanitizedHtml = sanitizedHtml.replace(/javascript:[^"']*/gi, '');

			// Convert \n to actual line breaks for better parsing
			sanitizedHtml = sanitizedHtml.replace(/\\n/g, '\n');

			// Basic check - if it contains our expected tags OR converted markdown, treat as HTML
			const containsExpectedTags = allowedTags.some(
				(tag) =>
					sanitizedHtml.includes(`<${tag}>`) ||
					sanitizedHtml.includes(`<${tag} `),
			);

			const containsConvertedMarkdown =
				sanitizedHtml.includes('<strong>') || sanitizedHtml.includes('<em>');

			if (containsExpectedTags || containsConvertedMarkdown) {
				console.log('Sanitized HTML:', sanitizedHtml); // Debug log
				return {
					type: 'html',
					content: sanitizedHtml,
				};
			} else {
				// If no HTML tags found, treat as plain text
				return { type: 'text', content: sanitizedHtml };
			}
		} catch (error) {
			console.warn('HTML sanitization failed, returning as text:', error);
			return { type: 'text', content: html };
		}
	}

	// Process feedback for safe rendering - also reactive
	$: processedFeedback = sanitizeAndParseHtml(feedback);

	// Reactive last updated time - updates when feedback changes
	$: if (feedback && feedback !== '' && !loading) {
		// Only update time if feedback actually changed and we're not currently loading
		const currentTime = new Date();
		if (
			!lastFeedbackTime ||
			Math.abs(currentTime.getTime() - lastFeedbackTime.getTime()) > 5000
		) {
			lastFeedbackTime = currentTime;
		}
	}

	// Enhanced content capture with validation
	function captureCurrentContent(): {
		content: string;
		wordCount: number;
		isValid: boolean;
	} {
		// Get content directly from editor if available, fallback to essayText
		let currentContent = '';
		if (currentEditorInstance && !currentEditorInstance.isEmpty) {
			currentContent = currentEditorInstance.getText().trim();
		} else {
			currentContent = essayText.trim();
		}

		const currentWords = currentWordCount;
		const isValid = currentContent.length > 0 && currentWords > 0;

		if (!isValid) {
			console.warn('Content validation failed:', {
				contentLength: currentContent.length,
				wordCount: currentWords,
				editorEmpty: currentEditorInstance?.isEmpty,
			});
		}

		// Log content capture for debugging
		console.log('Captured content:', {
			content: currentContent,
			wordCount: currentWords,
			isValid,
		});

		return { content: currentContent, wordCount: currentWords, isValid };
	}

	// Force save before feedback
	async function saveBeforeFeedback(): Promise<boolean> {
		try {
			dispatch('saveRequired', {});
			// await new Promise((resolve) => setTimeout(resolve, 1000));
			return true;
		} catch (error) {
			console.error('Failed to save before feedback:', error);
			toastStore.show('Failed to save content. Please try again.', 'error');
			return false;
		}
	}

	// Enhanced feedback function with content locking
	async function getFeedback() {
		if (!canGetFeedback) {
			console.warn('Cannot get feedback - preconditions not met');
			return;
		}

		// Step 1: Capture and validate content
		const { content, wordCount, isValid } = captureCurrentContent();

		if (!isValid) {
			toastStore.show(
				'Please write some content before requesting feedback.',
				'error',
			);
			return;
		}

		// Step 2: Check for required fields
		const trimmedPrompt = documentPrompt.trim();

		// Step 3: Lock content and preserve state
		contentLocked = true;
		capturedContent = content;
		capturedWordCount = wordCount;

		// Lock the editor manually to prevent content loss
		lockEditor();

		// Dispatch lock state
		dispatch('contentLocked', { locked: true });

		// Step 4: Save to database
		const saveSuccess = await saveBeforeFeedback();
		if (!saveSuccess) {
			contentLocked = false;
			unlockEditor();
			dispatch('contentLocked', { locked: false });
			return;
		}

		// Step 5: Generate feedback
		loading = true;

		try {
			const res = await fetch('/api/feedback', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					essayText: capturedContent,
					limit: wordCountLimit,
					currentWordCount: capturedWordCount,
					documentPrompt: trimmedPrompt,
				}),
			});

			if (!res.ok) {
				const errorText = await res.text().catch(() => 'Unknown error');
				throw new Error(`HTTP ${res.status}: ${errorText}`);
			}

			const responseData = await res.json();

			if (!responseData.feedback) {
				throw new Error('No feedback received from server');
			}

			// Update lastFeedbackTime when we receive new feedback
			lastFeedbackTime = new Date();

			// Dispatch feedback to parent - parent will handle saving to database
			dispatch('feedbackReceived', {
				feedback: responseData.feedback,
				wordCount: capturedWordCount,
			});

			toastStore.show('✨ Your essay has been reviewed!', 'success');
		} catch (error) {
			console.error('Feedback error:', error);

			let errorMessage =
				'Sorry, I encountered an error while analyzing your essay. Please try again in a moment.';

			if (error instanceof Error) {
				if (error.message.includes('404')) {
					errorMessage =
						'Feedback service is temporarily unavailable. Please try again later.';
				} else if (error.message.includes('400')) {
					errorMessage =
						'Invalid request. Please ensure your essay has content and try again.';
				} else if (error.message.includes('500')) {
					errorMessage =
						'Server error occurred. Please try again in a few minutes.';
				}
			}

			// Dispatch error feedback so it gets updated reactively
			dispatch('feedbackReceived', {
				feedback: errorMessage,
				wordCount: capturedWordCount,
			});

			toastStore.show('Failed to get feedback. Please try again.', 'error');
		} finally {
			loading = false;
			contentLocked = false;
			unlockEditor();
			dispatch('contentLocked', { locked: false });
		}
	}

	function formatLastUpdated(date: Date): string {
		const now = new Date();
		const diffMinutes = Math.floor(
			(now.getTime() - date.getTime()) / (1000 * 60),
		);

		if (diffMinutes < 1) return 'Just now';
		if (diffMinutes < 60) return `${diffMinutes}m ago`;

		const diffHours = Math.floor(diffMinutes / 60);
		if (diffHours < 24) return `${diffHours}h ago`;

		const diffDays = Math.floor(diffHours / 24);
		return `${diffDays}d ago`;
	}

	// Cleanup on destroy
	onDestroy(() => {
		if (contentLocked) {
			unlockEditor();
		}
	});
</script>

<div class="ai-feedback-container">
	<!-- Header -->
	<div class="feedback-header">
		<div class="header-content">
			<div class="title-section">
				<Sparkles class="title-icon" size={24} />
				<h2 class="title">AI Feedback</h2>
				{#if lastFeedbackTime}
					<div class="last-updated" transition:fade={{ duration: 200 }}>
						<Clock size={14} />
						<span>Updated {formatLastUpdated(lastFeedbackTime)}</span>
					</div>
				{/if}
			</div>

			<Button
				on:click={getFeedback}
				disabled={!canGetFeedback}
				variant="default"
				size="sm"
				class="feedback-button"
			>
				{#if loading}
					<span class="mr-2">Analyzing...</span>
					<RefreshCw class="animate-spin" size={16} />
				{:else}
					<span class="mr-2">Get Feedback</span>
					<Sparkles size={16} />
				{/if}
			</Button>
		</div>

		<!-- Content Lock Warning -->
		{#if contentLocked}
			<div class="content-lock-warning" transition:slide={{ duration: 200 }}>
				<div class="warning-content">
					<Lock size={16} />
					<span>Page is locked while generating feedback. Please wait...</span>
				</div>
			</div>
		{/if}

		<!-- Word count info -->
		<div class="word-count-info">
			<div class="word-count-item">
				<span class="label">Current:</span>
				<span
					class="count"
					class:over-limit={currentWordCount > wordCountLimit}
				>
					{currentWordCount}
				</span>
			</div>
			<div class="word-count-divider">|</div>
			<div class="word-count-item">
				<span class="label">Target:</span>
				<span class="count">{wordCountLimit}</span>
			</div>
			<div class="word-count-status">
				{#if currentWordCount === 0}
					<div class="chip variant-soft"></div>
					<AlertCircle size={14} />
					<span class="chip-content">No content yet</span>
				{:else if currentWordCount > wordCountLimit}
					<div class="chip variant-destructive"></div>
					<AlertCircle size={14} />
					<span class="chip-content">Over limit</span>
				{:else if currentWordCount >= wordCountLimit * 0.8}
					<div class="chip variant-success"></div>
					<CheckCircle size={14} />
					<span class="chip-content">Good length</span>
				{:else}
					<div class="chip variant-info"></div>
					<AlertCircle size={14} />
					<span class="chip-content">Room to expand</span>
				{/if}
			</div>
		</div>
	</div>

	<!-- Feedback Content -->
	<div class="feedback-content">
		{#if loading}
			<div class="loading-state" transition:fade={{ duration: 200 }}>
				<div class="loading-animation">
					<Sparkles class="primary-color animate-pulse" size={32} />
				</div>
				<div class="loading-text">
					<h3>Reading your essay...</h3>
					<p>Analyzing structure, style, and content</p>
				</div>
			</div>
		{:else if !hasContent}
			<div class="empty-state" transition:fade={{ duration: 200 }}>
				<Sparkles class="primary-color" size={48} />
				<h3>To get started with AI feedback:</h3>
				<p class="text-left">
					1. Copy and paste your existing essay into the editor or start writing
					your draft above. <br />
					2. Once you have some content, click "Get Feedback" to receive detailed
					analysis of your writing structure, style, and clarity.
				</p>
			</div>
		{:else if !hasFeedback}
			<div class="get-started-state" transition:fade={{ duration: 200 }}>
				<Sparkles class="primary-color" size={48} />
				<h3>Get AI feedback</h3>
				<p class="text-center">
					Click "Get Feedback" above to receive detailed analysis with
					personalized suggestions for improvement.
				</p>
			</div>
		{:else}
			<div class="feedback-display" transition:slide={{ duration: 300 }}>
				<div class="feedback-content-area">
					{#if processedFeedback.type === 'html'}
						<!-- Safe HTML rendering using @html with robust sanitization -->
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html processedFeedback.content}
					{:else}
						<!-- Fallback to text rendering -->
						<p class="feedback-text">{processedFeedback.content}</p>
					{/if}
				</div>
			</div>
		{/if}
	</div>

	<!-- AI Disclaimer -->
	<div class="ai-disclaimer">
		<div class="disclaimer-header">
			<Info size={16} class="disclaimer-icon" />
			<span class="disclaimer-title">Important Disclaimer</span>
		</div>
		<p class="disclaimer-text">
			<strong
				>This AI feedback is a supplementary tool and should not replace human
				guidance.</strong
			>
			We strongly recommend seeking feedback from experienced guidance counselors,
			English teachers, or professionals familiar with college admissions essays.
			If such resources aren't available, this AI analysis can serve as a helpful
			starting point.
		</p>
		<p class="disclaimer-text disclaimer-text-small">
			AI-generated feedback may contain inaccuracies, biases, or miss nuanced
			aspects of your writing. Always use your judgment and consider multiple
			perspectives when revising your essay. Remember not to pass AI generated
			content as your own, and that admission officers value authentic, personal
			narratives.
		</p>
	</div>
</div>

<style>
	.ai-feedback-container {
		background: hsl(var(--color-base-000));
		border: 1px solid hsl(var(--color-base-300));
		border-radius: 1rem;
		overflow: hidden;
		box-shadow: 0 1px 3px hsl(var(--color-neutral) / 0.1);
	}

	.feedback-header {
		background: linear-gradient(
			135deg,
			hsl(var(--color-primary)) 0%,
			hsl(var(--color-accent) / 0.8) 100%
		);
		color: hsl(var(--color-primary-content));
		padding: 1.5rem;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1rem;
	}

	.title-section {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex: 1;
	}

	.title {
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0;
		color: hsl(var(--color-primary-content));
	}

	.last-updated {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.75rem;
		color: hsl(var(--color-primary-content) / 0.8);
		margin-left: 0.5rem;
	}

	.content-lock-warning {
		background: hsl(var(--color-warning) / 0.1);
		border: 1px solid hsl(var(--color-warning) / 0.3);
		border-radius: 0.5rem;
		padding: 0.75rem;
		margin-bottom: 1rem;
	}

	.warning-content {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: hsl(var(--color-primary-content));
		font-size: 0.875rem;
		font-weight: 500;
	}

	.word-count-info {
		display: flex;
		align-items: center;
		gap: 1rem;
		font-size: 0.875rem;
		color: hsl(var(--color-primary-content) / 0.9);
	}

	.word-count-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.label {
		color: hsl(var(--color-primary-content) / 0.8);
	}

	.count {
		font-weight: 600;
		font-size: 1rem;
		color: hsl(var(--color-primary-content));
	}

	.count.over-limit {
		color: hsl(var(--color-warning));
	}

	.word-count-divider {
		color: hsl(var(--color-primary-content) / 0.6);
	}

	.word-count-status {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.feedback-content {
		min-height: 400px;
		max-height: 600px;
		overflow-y: auto;
		background: hsl(var(--color-base-000));
	}

	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem 2rem;
		text-align: center;
	}

	.loading-animation {
		margin-bottom: 1.5rem;
	}

	.loading-text h3 {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: hsl(var(--color-base-content));
	}

	.loading-text p {
		color: hsl(var(--color-base-content) / 0.7);
		margin: 0;
	}

	.empty-state,
	.get-started-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem 2rem;
	}

	.empty-state h3,
	.get-started-state h3 {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 1rem 0 0.5rem 0;
		color: hsl(var(--color-base-content));
	}

	.empty-state p,
	.get-started-state p {
		color: hsl(var(--color-base-content) / 0.7);
		margin: 0;
		max-width: 400px;
		line-height: 1.6;
	}

	.feedback-display {
		padding: 2rem;
		background: hsl(var(--color-base-000));
	}

	.feedback-content-area {
		color: hsl(var(--color-base-content));
		line-height: 1.6;
	}

	.feedback-text {
		color: hsl(var(--color-base-content));
		line-height: 1.6;
		margin: 1rem 0;
	}

	/* Feedback HTML Styling using CSS variables */
	.feedback-content-area :global(h4) {
		font-size: 1.125rem;
		font-weight: 600;
		color: hsl(var(--color-primary));
		margin: 2rem 0 1rem 0;
		padding-bottom: 0.5rem;
		border-bottom: 2px solid hsl(var(--color-primary) / 0.1);
	}

	.feedback-content-area :global(h4:first-child) {
		margin-top: 0;
	}

	.feedback-content-area :global(ul) {
		list-style-type: disc;
		padding-left: 1.5rem;
		margin: 1rem 0;
	}

	.feedback-content-area :global(li) {
		color: hsl(var(--color-base-content));
		line-height: 1.6;
		margin-bottom: 0.75rem;
	}

	.feedback-content-area :global(li strong) {
		font-weight: 600;
		color: hsl(var(--color-base-content));
	}

	.feedback-content-area :global(p) {
		color: hsl(var(--color-base-content));
		line-height: 1.6;
		margin: 1rem 0;
	}

	.feedback-content-area :global(p:first-child) {
		margin-top: 0;
	}

	.feedback-content-area :global(p:last-child) {
		margin-bottom: 0;
	}

	/* Error styling */
	.feedback-content-area :global(.text-red-600) {
		color: hsl(var(--color-error)) !important;
	}

	/* AI Disclaimer Section */
	.ai-disclaimer {
		background: hsl(var(--color-base-200));
		border-top: 1px solid hsl(var(--color-base-300));
		padding: 1.5rem;
	}

	.disclaimer-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}

	.disclaimer-title {
		font-weight: 600;
		font-size: 0.875rem;
		color: hsl(var(--color-base-content));
	}

	.disclaimer-text {
		font-size: 0.875rem;
		line-height: 1.5;
		color: hsl(var(--color-base-content) / 0.8);
		margin: 0 0 0.75rem 0;
	}

	.disclaimer-text:last-child {
		margin-bottom: 0;
	}

	.disclaimer-text-small {
		font-size: 0.8rem;
		color: hsl(var(--color-base-content) / 0.7);
	}

	.disclaimer-text strong {
		color: hsl(var(--color-base-content));
		font-weight: 600;
	}

	/* Mobile Responsive */
	@media (max-width: 768px) {
		.feedback-header {
			padding: 1rem;
		}

		.header-content {
			flex-direction: column;
			gap: 1rem;
			align-items: stretch;
		}

		.title {
			font-size: 1.25rem;
		}

		.word-count-info {
			justify-content: space-between;
			font-size: 0.8rem;
		}

		.feedback-display {
			padding: 1.5rem;
		}

		.feedback-content {
			min-height: 300px;
			max-height: 500px;
		}

		.ai-disclaimer {
			padding: 1rem;
		}

		.disclaimer-text {
			font-size: 0.8rem;
		}

		.disclaimer-text-small {
			font-size: 0.75rem;
		}
	}

	@media (max-width: 480px) {
		.title-section {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}

		.last-updated {
			margin-left: 0;
		}

		.word-count-info {
			flex-wrap: wrap;
			gap: 0.5rem;
		}

		.word-count-status {
			width: 100%;
			justify-content: center;
			margin-top: 0.5rem;
			padding-top: 0.5rem;
			border-top: 1px solid hsl(var(--color-primary-content) / 0.2);
		}
	}

	/* Dark mode will automatically work with CSS variables */
</style>
