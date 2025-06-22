<script>
	import '../app.css';
	import { page } from '$app/stores';
	import { WebsiteName } from '../config';
</script>

<svelte:head>
	<title>Error | {WebsiteName}</title>
	<meta name="description" content="Error - {WebsiteName}" />
</svelte:head>

<div class="error-page">
	<div class="error-content">
		<!-- Cozy illustration -->
		<div class="illustration-section">
			<div class="emoji-container">
				<div class="emoji-background"></div>
				<div class="emoji">🤗</div>
			</div>

			<h1 class="error-title">Oops, something went sideways</h1>

			<p class="error-description">
				Don't worry, it happens to the best of us! Let's get you back to where
				you need to be.
			</p>
		</div>

		<!-- Error message if available -->
		{#if $page?.error?.message}
			<div class="error-details">
				<div class="error-details-header">
					<svg
						class="warning-icon"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
						/>
					</svg>
					<span class="error-details-label">Error Details</span>
				</div>
				<p class="error-message">
					{$page.error.message}
				</p>
			</div>
		{/if}

		<!-- Action buttons -->
		<div class="action-buttons">
			<a href="/" class="primary-btn">
				<svg
					class="btn-icon"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
					/>
				</svg>
				Take me home
			</a>

			<button on:click={() => history.back()} class="secondary-btn">
				<svg
					class="btn-icon"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 19l-7-7m0 0l7-7m-7 7h18"
					/>
				</svg>
				Go back a step
			</button>
		</div>

		<!-- Gentle help section -->
		<div class="help-section">
			<p class="help-text">Still need a hand? 🙋‍♀️</p>
			<a href="/contact_us" class="help-link"> We're here to help </a>
		</div>
	</div>
</div>

<style>
	.error-page {
		display: flex;
		min-height: 100vh;
		align-items: center;
		justify-content: center;
		background: linear-gradient(
			to bottom right,
			hsl(var(--color-base-100)),
			hsl(var(--color-base-200))
		);
		padding: 1.5rem;
	}

	.error-content {
		position: relative;
		z-index: 10;
		width: 100%;
		max-width: 32rem;
		text-align: center;
		animation: gentleFadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* Illustration Section */
	.illustration-section {
		margin-bottom: 2rem;
	}

	.emoji-container {
		position: relative;
		margin: 0 auto 1.5rem auto;
		height: 8rem;
		width: 8rem;
	}

	.emoji-background {
		position: absolute;
		inset: 0;
		border-radius: 50%;
		background: linear-gradient(
			to bottom right,
			hsl(var(--color-warning) / 0.2),
			hsl(var(--color-warning) / 0.3)
		);
		box-shadow:
			0 10px 15px -3px rgba(0, 0, 0, 0.1),
			0 4px 6px -2px rgba(0, 0, 0, 0.05);
	}

	.emoji {
		position: relative;
		z-index: 10;
		display: flex;
		height: 100%;
		width: 100%;
		align-items: center;
		justify-content: center;
		font-size: 3.75rem;
		line-height: 1;
	}

	.error-title {
		color: hsl(var(--color-base-content));
		margin-bottom: 0.75rem;
		font-size: 1.875rem;
		font-weight: 700;
		line-height: 1.2;
		margin: 0 0 0.75rem 0;
	}

	.error-description {
		color: hsl(var(--color-base-content) / 0.7);
		margin-bottom: 1.5rem;
		font-size: 1.125rem;
		line-height: 1.6;
		margin: 0 0 1.5rem 0;
	}

	/* Error Details */
	.error-details {
		background: hsl(var(--color-warning) / 0.1);
		border: 1px solid hsl(var(--color-warning) / 0.2);
		margin-bottom: 1.5rem;
		border-radius: 1rem;
		padding: 1rem;
	}

	.error-details-header {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 0.5rem;
	}

	.warning-icon {
		color: hsl(var(--color-warning));
		margin-right: 0.5rem;
		height: 1.25rem;
		width: 1.25rem;
	}

	.error-details-label {
		color: hsl(var(--color-warning));
		font-size: 0.875rem;
		font-weight: 500;
	}

	.error-message {
		color: hsl(var(--color-base-content) / 0.8);
		font-size: 0.875rem;
		margin: 0;
	}

	/* Action Buttons */
	.action-buttons {
		margin-bottom: 2rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.primary-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		height: 3rem;
		width: 100%;
		background: linear-gradient(
			to right,
			hsl(var(--color-primary)),
			hsl(var(--color-accent))
		);
		color: hsl(var(--color-primary-content));
		border: none;
		border-radius: 0.75rem;
		font-weight: 500;
		text-decoration: none;
		cursor: pointer;
		transform: translateY(0);
		transition: all 0.2s ease;
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -1px rgba(0, 0, 0, 0.06);
	}

	.primary-btn:hover {
		transform: translateY(-2px);
		box-shadow:
			0 10px 15px -3px rgba(0, 0, 0, 0.1),
			0 4px 6px -2px rgba(0, 0, 0, 0.05);
	}

	.primary-btn:focus {
		outline: 2px solid hsl(var(--color-primary));
		outline-offset: 2px;
	}

	.secondary-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		height: 3rem;
		width: 100%;
		background: transparent;
		color: hsl(var(--color-primary));
		border: 1px solid hsl(var(--color-primary));
		border-radius: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		transform: translateY(0);
		transition: all 0.2s ease;
	}

	.secondary-btn:hover {
		background: hsl(var(--color-primary) / 0.05);
		transform: translateY(-2px);
	}

	.secondary-btn:focus {
		outline: 2px solid hsl(var(--color-primary));
		outline-offset: 2px;
	}

	.btn-icon {
		height: 1.25rem;
		width: 1.25rem;
	}

	/* Help Section */
	.help-section {
		text-align: center;
	}

	.help-text {
		color: hsl(var(--color-base-content) / 0.5);
		margin-bottom: 0.5rem;
		font-size: 0.875rem;
		margin: 0 0 0.5rem 0;
	}

	.help-link {
		color: hsl(var(--color-primary));
		font-size: 0.875rem;
		font-weight: 500;
		text-decoration: none;
		transition: color 0.2s ease;
	}

	.help-link:hover {
		color: hsl(var(--color-primary) / 0.8);
	}

	.help-link:focus {
		outline: 2px solid hsl(var(--color-primary));
		outline-offset: 2px;
		border-radius: 0.25rem;
	}

	/* Animations */
	@keyframes gentleFadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Mobile Responsiveness */
	@media (max-width: 640px) {
		.error-page {
			padding: 1rem;
		}

		.error-title {
			font-size: 1.5rem;
		}

		.error-description {
			font-size: 1rem;
		}

		.emoji-container {
			height: 6rem;
			width: 6rem;
		}

		.emoji {
			font-size: 3rem;
		}
	}

	/* Touch handling */
	.primary-btn,
	.secondary-btn,
	.help-link {
		-webkit-tap-highlight-color: transparent;
		touch-action: manipulation;
	}

	/* High contrast mode support */
	@media (prefers-contrast: high) {
		.error-details {
			border-width: 2px;
		}

		.primary-btn,
		.secondary-btn {
			border-width: 2px;
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.error-content {
			animation: none;
		}

		.primary-btn,
		.secondary-btn {
			transition: none !important;
		}

		.primary-btn:hover,
		.secondary-btn:hover {
			transform: none !important;
		}
	}

	/* Dark mode adjustments */
	@media (prefers-color-scheme: dark) {
		.emoji-background {
			background: linear-gradient(
				to bottom right,
				hsl(var(--color-warning) / 0.1),
				hsl(var(--color-warning) / 0.2)
			);
		}
	}
</style>
