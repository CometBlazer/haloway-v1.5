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
		padding: 0.75rem;
		margin-bottom: 0.5rem;
		border-radius: 0.5rem;
		box-shadow:
			0 10px 15px -3px rgba(0, 0, 0, 0.1),
			0 4px 6px -2px rgba(0, 0, 0, 0.05);
		backdrop-filter: blur(10px);
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
		line-height: 1.25rem;
		font-weight: 500;
	}

	.toast-close {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		border: none;
		background: transparent;
		cursor: pointer;
		border-radius: 0.25rem;
		transition: background-color 0.2s ease;
		opacity: 0.7;
	}

	.toast-close:hover {
		opacity: 1;
		background-color: rgba(0, 0, 0, 0.1);
	}

	.toast-close:focus {
		outline: 2px solid;
		outline-offset: 2px;
	}

	/* Success Toast */
	.toast-success {
		background-color: hsl(142 76% 36% / 0.1);
		border-color: hsl(142 76% 36% / 0.3);
		color: hsl(142 84% 24%);
	}

	.toast-success .toast-icon {
		color: hsl(142 76% 36%);
	}

	.toast-success .toast-close:focus {
		outline-color: hsl(142 76% 36%);
	}

	/* Error Toast */
	.toast-error {
		background-color: hsl(0 84% 60% / 0.1);
		border-color: hsl(0 84% 60% / 0.3);
		color: hsl(0 74% 42%);
	}

	.toast-error .toast-icon {
		color: hsl(0 84% 60%);
	}

	.toast-error .toast-close:focus {
		outline-color: hsl(0 84% 60%);
	}

	/* Info Toast */
	.toast-info {
		background-color: hsl(199 89% 48% / 0.1);
		border-color: hsl(199 89% 48% / 0.3);
		color: hsl(199 89% 30%);
	}

	.toast-info .toast-icon {
		color: hsl(199 89% 48%);
	}

	.toast-info .toast-close:focus {
		outline-color: hsl(199 89% 48%);
	}

	/* Dark mode support */
	@media (prefers-color-scheme: dark) {
		.toast {
			backdrop-filter: blur(20px);
		}

		.toast-success {
			background-color: hsl(142 76% 36% / 0.15);
			color: hsl(142 80% 85%);
		}

		.toast-error {
			background-color: hsl(0 84% 60% / 0.15);
			color: hsl(0 90% 85%);
		}

		.toast-info {
			background-color: hsl(199 89% 48% / 0.15);
			color: hsl(199 95% 85%);
		}
	}
	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.toast {
			transition: none;
		}
	}
</style>
