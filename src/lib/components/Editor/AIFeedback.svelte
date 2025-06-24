<!-- src/lib/components/Editor/AIFeedback.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import {
		Sparkles,
		RefreshCw,
		Clock,
		AlertCircle,
		CheckCircle,
	} from 'lucide-svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { toastStore } from '$lib/stores/toast';

	export let essayText: string = '';
	export let wordCountLimit: number = 250;
	export let currentWordCount: number = 0;
	export let versionId: string | null = null;
	export let existingFeedback: string | null = null;
	export let disabled: boolean = false;

	const dispatch = createEventDispatcher<{
		feedbackReceived: { feedback: string; wordCount: number };
	}>();

	let feedback = existingFeedback || '';
	let loading = false;
	let lastFeedbackTime: Date | null = null;
	// let feedbackWordCount = 0;

	// Update feedback when existingFeedback prop changes
	$: if (existingFeedback !== feedback) {
		feedback = existingFeedback || '';
	}

	// Sanitized feedback for display
	$: sanitizedFeedback = sanitizeHtml(feedback);

	// Calculate if feedback is needed
	$: needsFeedback = !feedback || essayText.trim().length === 0;
	$: canGetFeedback = essayText.trim().length > 0 && !loading && !disabled;

	// function countWords(text: string): number {
	//   return text.trim().split(/\s+/).filter(word => word.length > 0).length;
	// }

	// Safely render HTML - this is safe because it's from our own API
	function sanitizeHtml(html: string): string {
		// Basic HTML sanitization - only allow safe tags
		const allowedTags = ['h4', 'ul', 'li', 'p', 'strong', 'em'];
		const div = document.createElement('div');
		div.innerHTML = html;

		// Remove any script tags or dangerous attributes
		const elements = div.querySelectorAll('*');
		elements.forEach((el) => {
			if (!allowedTags.includes(el.tagName.toLowerCase())) {
				el.remove();
			} else {
				// Remove all attributes except class
				const attrs = [...el.attributes];
				attrs.forEach((attr) => {
					if (attr.name !== 'class') {
						el.removeAttribute(attr.name);
					}
				});
			}
		});

		return div.innerHTML;
	}

	async function getFeedback() {
		if (!canGetFeedback) return;

		loading = true;
		feedback = '';

		try {
			const res = await fetch('/api/feedback', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					essayText: essayText.trim(),
					limit: wordCountLimit,
					currentWordCount: currentWordCount,
					versionId: versionId,
				}),
			});

			if (!res.ok) {
				throw new Error(`HTTP ${res.status}: ${res.statusText}`);
			}

			const { feedback: fb, wordCount } = await res.json();
			feedback = fb;
			lastFeedbackTime = new Date();

			// Dispatch event to parent
			dispatch('feedbackReceived', { feedback: fb, wordCount });

			toastStore.show('✨ Stella has reviewed your essay!', 'success');
		} catch (error) {
			console.error('Feedback error:', error);
			feedback =
				'<p class="text-red-600">Sorry, I encountered an error while analyzing your essay. Please try again in a moment.</p>';
			toastStore.show('Failed to get feedback. Please try again.', 'error');
		} finally {
			loading = false;
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
</script>

<div class="stella-feedback-container">
	<!-- Header -->
	<div class="feedback-header">
		<div class="header-content">
			<div class="title-section">
				<Sparkles class="title-icon" size={24} />
				<h2 class="title">Stella's AI Feedback</h2>
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
				variant={needsFeedback ? 'default' : 'outline'}
				size="sm"
				class="feedback-button"
			>
				{#if loading}
					<RefreshCw class="animate-spin" size={16} />
					<span>Analyzing...</span>
				{:else if needsFeedback}
					<Sparkles size={16} />
					<span>Get Feedback</span>
				{:else}
					<RefreshCw size={16} />
					<span>Refresh Feedback</span>
				{/if}
			</Button>
		</div>

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
					<AlertCircle size={16} class="text-gray-400" />
					<span class="status-text text-gray-400">No content yet</span>
				{:else if currentWordCount > wordCountLimit}
					<AlertCircle size={16} class="text-orange-500" />
					<span class="status-text text-orange-500">Over limit</span>
				{:else if currentWordCount >= wordCountLimit * 0.8}
					<CheckCircle size={16} class="text-green-500" />
					<span class="status-text text-green-500">Good length</span>
				{:else}
					<AlertCircle size={16} class="text-blue-500" />
					<span class="status-text text-blue-500">Room to expand</span>
				{/if}
			</div>
		</div>
	</div>

	<!-- Feedback Content -->
	<div class="feedback-content">
		{#if loading}
			<div class="loading-state" transition:fade={{ duration: 200 }}>
				<div class="loading-animation">
					<Sparkles class="animate-pulse" size={32} />
				</div>
				<div class="loading-text">
					<h3>Stella is reading your essay...</h3>
					<p>Analyzing structure, style, and content</p>
					<div class="feedback-display" transition:slide={{ duration: 300 }}>
						<div class="feedback-html">
							<!-- Using innerHTML for controlled HTML from our API -->
							<!-- eslint-disable-next-line svelte/valid-compile -->
							{sanitizedFeedback}
						</div>
					</div>
				</div>
			</div>
		{:else if essayText.trim().length === 0}
			<div class="empty-state" transition:fade={{ duration: 200 }}>
				<Sparkles class="empty-icon" size={48} />
				<h3>Ready to help!</h3>
				<p>
					Write some content in your essay and I'll provide personalized
					feedback on clarity, style, and structure.
				</p>
			</div>
		{:else}
			<div class="get-started-state" transition:fade={{ duration: 200 }}>
				<Sparkles class="get-started-icon" size={48} />
				<h3>Get expert feedback</h3>
				<p>
					Click "Get Feedback" to receive Stella's detailed analysis of your
					essay.
				</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.stella-feedback-container {
		background: white;
		border: 1px solid hsl(var(--border));
		border-radius: 1rem;
		overflow: hidden;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.feedback-header {
		background: linear-gradient(
			135deg,
			hsl(var(--primary)) 0%,
			hsl(var(--primary) / 0.8) 100%
		);
		color: white;
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
	}

	.last-updated {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.8);
		margin-left: 0.5rem;
	}

	.word-count-info {
		display: flex;
		align-items: center;
		gap: 1rem;
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.9);
	}

	.word-count-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.label {
		color: rgba(255, 255, 255, 0.8);
	}

	.count {
		font-weight: 600;
		font-size: 1rem;
	}

	.count.over-limit {
		color: #fbbf24;
	}

	.word-count-divider {
		color: rgba(255, 255, 255, 0.6);
	}

	.word-count-status {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.status-text {
		font-size: 0.75rem;
		font-weight: 500;
	}

	.feedback-content {
		min-height: 400px;
		max-height: 600px;
		overflow-y: auto;
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
		color: hsl(var(--primary));
	}

	.loading-text h3 {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: hsl(var(--foreground));
	}

	.loading-text p {
		color: hsl(var(--muted-foreground));
		margin: 0;
	}

	.empty-state,
	.get-started-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem 2rem;
		text-align: center;
	}
	.empty-state h3,
	.get-started-state h3 {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: hsl(var(--foreground));
	}

	.empty-state p,
	.get-started-state p {
		color: hsl(var(--muted-foreground));
		margin: 0;
		max-width: 400px;
	}

	.feedback-display {
		padding: 2rem;
	}

	/* Feedback HTML Styling */
	.feedback-html :global(h4) {
		font-size: 1.125rem;
		font-weight: 600;
		color: hsl(var(--primary));
		margin: 2rem 0 1rem 0;
		padding-bottom: 0.5rem;
		border-bottom: 2px solid hsl(var(--primary) / 0.1);
	}

	.feedback-html :global(h4:first-child) {
		margin-top: 0;
	}

	.feedback-html :global(ul) {
		list-style-type: disc;
		padding-left: 1.5rem;
		margin: 1rem 0;
		gap: 0.75rem; /* Replace space-y with gap */
	}

	.feedback-html :global(li) {
		color: hsl(var(--foreground));
		line-height: 1.6;
		margin-bottom: 0.75rem;
	}

	.feedback-html :global(li strong) {
		font-weight: 600;
		color: hsl(var(--foreground));
	}

	.feedback-html :global(p) {
		color: hsl(var(--foreground));
		line-height: 1.6;
		margin: 1rem 0;
	}

	.feedback-html :global(p:first-child) {
		margin-top: 0;
	}

	.feedback-html :global(p:last-child) {
		margin-bottom: 0;
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
			border-top: 1px solid rgba(255, 255, 255, 0.2);
		}
	}

	/* Dark mode support */
	@media (prefers-color-scheme: dark) {
		.stella-feedback-container {
			background: hsl(var(--card));
			border-color: hsl(var(--border));
		}
	}
</style>
