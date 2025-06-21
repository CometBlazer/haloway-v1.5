<!-- src/lib/components/ui/toast/Toast.svelte -->
<script lang="ts">
	import { fly } from 'svelte/transition';
	import { CheckCircle, AlertCircle, Info, X } from 'lucide-svelte';
	import { toastStore, type ToastItem } from '$lib/stores/toast';

	export let toast: ToastItem;

	const icons = {
		success: CheckCircle,
		error: AlertCircle,
		info: Info,
	};

	const Icon = icons[toast.type];

	function handleClose() {
		toastStore.remove(toast.id);
	}
</script>

<div
	class="toast toast-{toast.type}"
	transition:fly={{ x: 300, duration: 300 }}
	role="alert"
	aria-live="polite"
>
	<div class="toast-content">
		<div class="toast-icon">
			<Icon size={20} />
		</div>
		<div class="toast-message">
			{toast.message}
		</div>
		<button class="toast-close" on:click={handleClose} aria-label="Close toast">
			<X size={16} />
		</button>
	</div>
</div>

<style>
	.toast {
		display: flex;
		align-items: center;
		min-width: 300px;
		max-width: 500px;
		padding: 1rem;
		margin-bottom: 0.5rem;
		border-radius: 0.75rem;
		box-shadow:
			0 10px 15px -3px rgba(0, 0, 0, 0.1),
			0 4px 6px -2px rgba(0, 0, 0, 0.05),
			0 0 0 1px rgba(0, 0, 0, 0.05);
		backdrop-filter: blur(12px);
		border: 1px solid;
		position: relative;
		overflow: hidden;
	}

	.toast-content {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
	}

	.toast-icon {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.toast-message {
		flex: 1;
		font-size: 0.875rem;
		line-height: 1.4;
		font-weight: 500;
	}

	.toast-close {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.75rem;
		border: none;
		background: transparent;
		cursor: pointer;
		border-radius: 0.375rem;
		transition: all 0.2s ease;
		opacity: 0.8;
	}

	.toast-close:hover {
		opacity: 1;
		background-color: rgba(0, 0, 0, 0.1);
		transform: scale(1.05);
	}

	.toast-close:focus {
		outline: 2px solid;
		outline-offset: 2px;
		opacity: 1;
	}

	/* Light Mode Colors */

	/* Success Toast - Green */
	.toast-success {
		background-color: hsl(143 85% 96%);
		border-color: hsl(145 92% 91%);
		color: hsl(140 100% 27%);
	}

	.toast-success .toast-icon {
		color: hsl(142 76% 36%);
	}

	.toast-success .toast-close {
		color: hsl(140 100% 27%);
	}

	.toast-success .toast-close:hover {
		background-color: hsl(143 85% 90%);
	}

	.toast-success .toast-close:focus {
		outline-color: hsl(142 76% 36%);
	}

	/* Error Toast - Red */
	.toast-error {
		background-color: hsl(0 93% 94%);
		border-color: hsl(0 93% 94%);
		color: hsl(0 74% 42%);
	}

	.toast-error .toast-icon {
		color: hsl(0 84% 60%);
	}

	.toast-error .toast-close {
		color: hsl(0 74% 42%);
	}

	.toast-error .toast-close:hover {
		background-color: hsl(0 93% 87%);
	}

	.toast-error .toast-close:focus {
		outline-color: hsl(0 84% 60%);
	}

	/* Info Toast - Blue */
	.toast-info {
		background-color: hsl(208 100% 97%);
		border-color: hsl(221 91% 91%);
		color: hsl(210 92% 45%);
	}

	.toast-info .toast-icon {
		color: hsl(199 89% 48%);
	}

	.toast-info .toast-close {
		color: hsl(210 92% 45%);
	}

	.toast-info .toast-close:hover {
		background-color: hsl(208 100% 92%);
	}

	.toast-info .toast-close:focus {
		outline-color: hsl(199 89% 48%);
	}

	/* Dark Mode Colors */
	@media (prefers-color-scheme: dark) {
		.toast {
			backdrop-filter: blur(16px);
			box-shadow:
				0 10px 15px -3px rgba(0, 0, 0, 0.3),
				0 4px 6px -2px rgba(0, 0, 0, 0.2),
				0 0 0 1px rgba(255, 255, 255, 0.05);
		}

		.toast-close:hover {
			background-color: rgba(255, 255, 255, 0.1);
		}

		/* Success Toast - Dark Mode */
		.toast-success {
			background-color: hsl(143 64% 9%);
			border-color: hsl(145 76% 17%);
			color: hsl(150 100% 66%);
		}

		.toast-success .toast-icon {
			color: hsl(142 76% 50%);
		}

		.toast-success .toast-close {
			color: hsl(150 100% 66%);
		}

		.toast-success .toast-close:hover {
			background-color: hsl(143 64% 15%);
		}

		/* Error Toast - Dark Mode */
		.toast-error {
			background-color: hsl(0 63% 11%);
			border-color: hsl(0 74% 20%);
			color: hsl(0 91% 71%);
		}

		.toast-error .toast-icon {
			color: hsl(0 84% 65%);
		}

		.toast-error .toast-close {
			color: hsl(0 91% 71%);
		}

		.toast-error .toast-close:hover {
			background-color: hsl(0 63% 17%);
		}

		/* Info Toast - Dark Mode */
		.toast-info {
			background-color: hsl(215 64% 11%);
			border-color: hsl(217 75% 19%);
			color: hsl(199 100% 70%);
		}

		.toast-info .toast-icon {
			color: hsl(199 89% 60%);
		}

		.toast-info .toast-close {
			color: hsl(199 100% 70%);
		}

		.toast-info .toast-close:hover {
			background-color: hsl(215 64% 17%);
		}
	}

	/* High contrast mode for accessibility */
	@media (prefers-contrast: high) {
		.toast {
			border-width: 2px;
		}

		.toast-success {
			background-color: hsl(143 85% 94%);
			color: hsl(140 100% 20%);
			border-color: hsl(142 76% 36%);
		}

		.toast-error {
			background-color: hsl(0 93% 92%);
			color: hsl(0 74% 35%);
			border-color: hsl(0 84% 60%);
		}

		.toast-info {
			background-color: hsl(208 100% 95%);
			color: hsl(210 92% 35%);
			border-color: hsl(199 89% 48%);
		}

		@media (prefers-color-scheme: dark) {
			.toast-success {
				background-color: hsl(143 64% 6%);
				color: hsl(150 100% 75%);
			}

			.toast-error {
				background-color: hsl(0 63% 8%);
				color: hsl(0 91% 80%);
			}

			.toast-info {
				background-color: hsl(215 64% 8%);
				color: hsl(199 100% 80%);
			}
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.toast {
			transition: none;
		}

		.toast-close {
			transition: none;
		}

		.toast-close:hover {
			transform: none;
		}
	}

	/* Mobile optimizations */
	@media (max-width: 480px) {
		.toast {
			min-width: 280px;
			max-width: calc(100vw - 2rem);
			margin: 0 1rem 0.5rem 1rem;
		}

		.toast-message {
			font-size: 0.8rem;
		}
	}
</style>
