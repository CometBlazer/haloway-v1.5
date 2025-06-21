<!-- src/lib/components/EssayCard.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import {
		FileText,
		Calendar,
		Edit3,
		Trash,
		Clock,
		GraduationCap,
	} from 'lucide-svelte';
	import type { Status } from '$lib/components/Editor/StatusDropdown.svelte';
	import dayjs from 'dayjs';

	// Types
	interface DocumentVersion {
		id: string;
	}

	export let document: {
		id: string;
		title: string | null;
		prompt: string | null;
		due_date: Date | null;
		created_at: string | Date;
		updated_at: string | Date | null;
		versions_count: number;
		status: Status | null;
		current_version: DocumentVersion | null;
		school: string;
	};

	const dispatch = createEventDispatcher<{
		click: {
			documentId: string;
			currentVersion: DocumentVersion | null;
			school: string;
		};
		delete: {
			documentId: string;
			documentTitle: string;
		};
	}>();

	function formatDate(dateInput: string | Date | null): string {
		if (!dateInput) return 'Unknown';

		const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
		const now = new Date();
		const diffInDays = Math.floor(
			(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
		);

		if (diffInDays === 0) return 'Today';
		if (diffInDays === 1) return 'Yesterday';
		if (diffInDays < 7) return `${diffInDays} days ago`;
		if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
		if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;

		return date.toLocaleDateString();
	}

	// Status configuration
	const statusConfig: Record<
		Status,
		{
			label: string;
			colorClass: string;
		}
	> = {
		'not-started': {
			label: 'Not Started',
			colorClass: 'status-not-started',
		},
		'in-progress': {
			label: 'In Progress',
			colorClass: 'status-warning',
		},
		finished: {
			label: 'Finished',
			colorClass: 'status-success',
		},
		polished: {
			label: 'Polished',
			colorClass: 'status-info',
		},
		submitted: {
			label: 'Submitted',
			colorClass: 'status-primary',
		},
		scrapped: {
			label: 'Scrapped',
			colorClass: 'status-error',
		},
	};

	function getDeadlineInfo(dueDate: Date | null): {
		text: string;
		colorClass: string;
	} {
		if (!dueDate) return { text: 'No deadline', colorClass: 'deadline-none' };

		const diff = dayjs(dueDate)
			.startOf('day')
			.diff(dayjs().startOf('day'), 'day');

		if (diff < 0) return { text: 'Past deadline', colorClass: 'deadline-past' };
		if (diff === 0) return { text: 'Due today', colorClass: 'deadline-urgent' };
		if (diff === 1)
			return { text: 'Due tomorrow', colorClass: 'deadline-urgent' };
		if (diff <= 3)
			return { text: `Due in ${diff} days`, colorClass: 'deadline-urgent' };
		if (diff <= 7)
			return { text: `Due in ${diff} days`, colorClass: 'deadline-soon' };
		return {
			text: `Due ${dayjs(dueDate).format('MMM D')}`,
			colorClass: 'deadline-normal',
		};
	}

	function handleCardClick() {
		dispatch('click', {
			documentId: document.id,
			currentVersion: document.current_version,
			school: document.school,
		});
	}

	function handleDeleteClick(event: Event) {
		event.stopPropagation();
		dispatch('delete', {
			documentId: document.id,
			documentTitle: document.title || 'Untitled Essay',
		});
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleCardClick();
		}
	}

	$: deadline = getDeadlineInfo(document.due_date);
</script>

<div class="essay-card">
	<div
		class="card-content"
		on:click={handleCardClick}
		on:keydown={handleKeydown}
		tabindex="0"
		role="button"
		aria-label="Open document"
	>
		<!-- Card Header -->
		<div class="card-header">
			<div class="header-main">
				<div class="document-icon">
					<FileText size={20} />
				</div>
				<div class="title-container h-12">
					<h3 class="document-title">
						{document.title && document.title.length > 50
							? document.title.substring(0, 50) + '...'
							: document.title || 'Untitled Essay'}
					</h3>
				</div>
			</div>
			<button
				class="delete-btn"
				on:click={handleDeleteClick}
				aria-label="Delete essay"
			>
				<Trash size={16} />
			</button>
		</div>

		<!-- School Info -->
		{#if document.school}
			<div class="school-info">
				<GraduationCap size={14} class="school-icon" />
				<span class="school-name">{document.school}</span>
			</div>
		{/if}

		<!-- Card Body -->
		<div class="card-body">
			<div class="prompt-container h-20">
				{#if document.prompt}
					<p class="document-prompt">
						{document.prompt.length > 120
							? document.prompt.substring(0, 120) + '...'
							: document.prompt}
					</p>
				{:else}
					<p class="prompt-placeholder">No prompt added yet</p>
				{/if}
			</div>

			{#if document.due_date}
				<div class="deadline-info">
					<Clock size={14} class="deadline-icon" />
					<span class="deadline-badge {deadline.colorClass}">
						{deadline.text}
					</span>
				</div>
			{/if}
		</div>

		<!-- Card Footer -->
		<div class="card-footer">
			<div class="meta-info">
				<div class="date-info">
					<div class="date-item">
						<Calendar size={12} class="date-icon" />
						<span>Created {formatDate(document.created_at)}</span>
					</div>
					{#if document.updated_at && document.updated_at !== document.created_at}
						<div class="date-item">
							<Edit3 size={12} class="date-icon" />
							<span>Updated {formatDate(document.updated_at)}</span>
						</div>
					{/if}
				</div>

				<div class="footer-badges">
					<span class="versions-count">
						{document.versions_count} checkpoint{document.versions_count !== 1
							? 's'
							: ''}
					</span>
					{#if document.status}
						<span
							class="status-badge {statusConfig[document.status]?.colorClass ||
								'status-not-started'}"
						>
							{statusConfig[document.status]?.label || document.status}
						</span>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	/* Essay Card */
	.essay-card {
		position: relative;
		border-radius: 0.75rem;
		overflow: hidden;
		transition: all 0.2s ease;
		background: hsl(var(--color-base-000));
		border: 1px solid hsl(var(--color-base-300));
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.essay-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
		border-color: hsl(var(--color-primary) / 0.3);
	}

	.card-content {
		display: flex;
		flex-direction: column;
		height: 100%;
		cursor: pointer;
		transition: all 0.2s ease;
		outline: none;
	}

	.card-content:focus {
		outline: 2px solid hsl(var(--color-primary));
		outline-offset: 2px;
	}

	/* Card Header */
	.card-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 1.25rem 1.25rem 0.75rem 1.25rem;
	}

	.header-main {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		flex: 1;
		min-width: 0;
	}

	.document-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		background: hsl(var(--color-primary) / 0.1);
		border-radius: 0.5rem;
		color: hsl(var(--color-primary));
		flex-shrink: 0;
	}

	.title-container {
		flex: 1;
		min-width: 0;
		display: flex;
		align-items: flex-start;
	}

	.document-title {
		font-size: 1rem;
		font-weight: 600;
		line-height: 1.4;
		color: hsl(var(--color-base-content));
		margin: 0;
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.delete-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		background: transparent;
		border: none;
		border-radius: 0.375rem;
		color: hsl(var(--color-error));
		cursor: pointer;
		opacity: 0;
		transition: all 0.2s ease;
		flex-shrink: 0;
	}

	.essay-card:hover .delete-btn {
		opacity: 1;
	}

	.delete-btn:hover {
		background: hsl(var(--color-error) / 0.1);
	}

	.delete-btn:focus {
		outline: 2px solid hsl(var(--color-error));
		outline-offset: 2px;
		opacity: 1;
	}

	/* School Info */
	.school-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0 1.25rem;
		margin-bottom: 0.75rem;
	}

	.school-icon {
		color: hsl(var(--color-primary));
		flex-shrink: 0;
	}

	.school-name {
		font-size: 0.875rem;
		font-weight: 500;
		color: hsl(var(--color-primary));
		background: hsl(var(--color-primary) / 0.1);
		padding: 0.25rem 0.5rem;
		border-radius: 0.375rem;
	}

	/* Card Body */
	.card-body {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 0 1.25rem;
	}

	.prompt-container {
		display: flex;
		align-items: flex-start;
		overflow: hidden;
	}

	.document-prompt {
		font-size: 0.875rem;
		line-height: 1.5;
		color: hsl(var(--color-neutral-content));
		margin: 0;
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
	}

	.prompt-placeholder {
		font-size: 0.875rem;
		font-style: italic;
		color: hsl(var(--color-base-400));
		margin: 0;
	}

	.deadline-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.deadline-icon {
		color: hsl(var(--color-neutral-content));
		flex-shrink: 0;
	}

	.deadline-badge {
		font-size: 0.75rem;
		font-weight: 500;
		padding: 0.25rem 0.5rem;
		border-radius: 0.375rem;
	}

	.deadline-none {
		background: hsl(var(--color-neutral));
		color: hsl(var(--color-neutral-content));
	}

	.deadline-past {
		background: hsl(var(--color-base-300));
		color: hsl(var(--color-base-content));
	}

	.deadline-urgent {
		background: hsl(var(--color-error) / 0.1);
		color: hsl(var(--color-error));
	}

	.deadline-soon {
		background: hsl(var(--color-warning) / 0.1);
		color: hsl(var(--color-warning));
	}

	.deadline-normal {
		background: hsl(var(--color-primary) / 0.1);
		color: hsl(var(--color-primary));
	}

	/* Card Footer */
	.card-footer {
		padding: 1.25rem;
		border-top: 1px solid hsl(var(--color-base-200));
		background: hsl(var(--color-base-100) / 0.5);
	}

	.meta-info {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.date-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.date-item {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.75rem;
		color: hsl(var(--color-neutral-content));
	}

	.date-icon {
		flex-shrink: 0;
	}

	.footer-badges {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.versions-count {
		font-size: 0.75rem;
		font-weight: 500;
		color: hsl(var(--color-neutral-content));
	}

	.status-badge {
		font-size: 0.75rem;
		font-weight: 500;
		padding: 0.25rem 0.5rem;
		border-radius: 0.375rem;
	}

	.status-not-started {
		background: hsl(var(--color-neutral));
		color: hsl(var(--color-neutral-content));
	}

	.status-warning {
		background: hsl(var(--color-warning) / 0.1);
		color: hsl(var(--color-warning));
	}

	.status-success {
		background: hsl(var(--color-success) / 0.1);
		color: hsl(var(--color-success));
	}

	.status-info {
		background: hsl(var(--color-info) / 0.1);
		color: hsl(var(--color-info));
	}

	.status-primary {
		background: hsl(var(--color-primary) / 0.1);
		color: hsl(var(--color-primary));
	}

	.status-error {
		background: hsl(var(--color-error) / 0.1);
		color: hsl(var(--color-error));
	}

	/* Mobile Responsiveness */
	@media (max-width: 640px) {
		.card-header {
			padding: 1rem 1rem 0.5rem 1rem;
		}

		.card-body {
			padding: 0 1rem;
		}

		.card-footer {
			padding: 1rem;
		}

		.document-title {
			font-size: 0.9375rem;
		}

		.footer-badges {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}
	}

	/* Touch handling */
	.card-content,
	.delete-btn {
		-webkit-tap-highlight-color: transparent;
		touch-action: manipulation;
	}

	/* High contrast mode support */
	@media (prefers-contrast: high) {
		.essay-card {
			border-width: 2px;
		}

		.card-footer {
			border-top-width: 2px;
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.essay-card,
		.card-content,
		.delete-btn {
			transition: none !important;
		}
	}
</style>
