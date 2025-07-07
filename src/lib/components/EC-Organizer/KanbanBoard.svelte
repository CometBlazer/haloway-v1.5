<!-- src/lib/components/EC-Organizer/KanbanBoard.svelte -->
<script lang="ts">
	import {
		onMount,
		afterUpdate,
		onDestroy,
		tick,
		createEventDispatcher,
	} from 'svelte';
	import { beforeNavigate } from '$app/navigation';
	import { browser } from '$app/environment';
	import { Button } from '$lib/components/ui/button';
	import { Plus, Eye, Save, AlertCircle } from 'lucide-svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import ActivityCard from './ActivityCard.svelte';
	import type { Activity } from '$lib/types/activity';
	import Sortable from 'sortablejs';
	import {
		activitiesChangeTracker,
		getChangeStatusDisplay,
	} from '$lib/stores/activitiesChangeTracker';

	// Type definitions for jsPDF - using any for the output method to match actual jsPDF behavior
	interface JsPDFInstance {
		setFontSize(size: number): void;
		setTextColor(r: number, g: number, b: number): void;
		setFont(fontName?: string, fontStyle?: string): void;
		text(
			text: string | string[],
			x: number,
			y: number,
			options?: { align?: string },
		): void;
		splitTextToSize(text: string, maxWidth: number): string[];
		setFillColor(r: number, g: number, b: number): void;
		rect(
			x: number,
			y: number,
			width: number,
			height: number,
			style?: string,
		): void;
		addPage(): void;
		getNumberOfPages(): number;
		setPage(page: number): void;
		setDrawColor(r: number, g: number, b: number): void;
		line(x1: number, y1: number, x2: number, y2: number): void;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		output(type: string): any;
	}

	const dispatch = createEventDispatcher<{
		saveActivities: { activities: Activity[] };
	}>();

	export let initialActivities: Activity[] = [];
	export let isAuthenticated: boolean = false;

	let localActivities: Activity[] = [];
	let sortableContainer: HTMLElement;
	let sortableInstance: Sortable | null = null;
	let mounted = false;

	// Delete confirmation modal state
	let showDeleteModal = false;
	let activityToDelete: Activity | null = null;

	const STORAGE_KEY = 'college-extracurriculars';

	// Subscribe to change tracker
	$: changeState = $activitiesChangeTracker;
	$: statusDisplay = getChangeStatusDisplay(changeState);

	// Keyboard shortcut handler
	function handleKeydown(event: KeyboardEvent) {
		// Check for Ctrl+S (Windows/Linux) or Cmd+S (Mac)
		if ((event.ctrlKey || event.metaKey) && event.key === 's') {
			event.preventDefault(); // Prevent browser's default save dialog
			event.stopPropagation();

			// Only save if authenticated and there are unsaved changes
			if (isAuthenticated && changeState.hasUnsavedChanges) {
				handleSave();
			}
		}
	}

	// Public method to get current activities (for parent component)
	export function getCurrentActivities(): Activity[] {
		return activitiesChangeTracker.getCurrentActivities();
	}

	// Public method to load activities (for parent component)
	export function loadActivities(activities: Activity[]) {
		localActivities = activities;
		saveToStorage();
		activitiesChangeTracker.updateActivities(localActivities);
		if (mounted) {
			tick().then(() => {
				reinitializeSortable();
			});
		}
	}

	onMount(async () => {
		mounted = true;

		// Initialize change tracker
		activitiesChangeTracker.initialize(initialActivities, isAuthenticated);

		// Load from server data first, then fallback to sessionStorage
		if (initialActivities && initialActivities.length > 0) {
			localActivities = initialActivities;
			saveToStorage();
		} else {
			loadFromStorage();
		}

		// Update tracker with current activities
		activitiesChangeTracker.updateActivities(localActivities);

		await tick();
		initializeSortable();

		// Handle browser navigation
		if (browser) {
			window.addEventListener('beforeunload', handleBeforeUnload);
			window.addEventListener('keydown', handleKeydown);
		}
	});

	onDestroy(() => {
		if (sortableInstance) {
			sortableInstance.destroy();
			sortableInstance = null;
		}

		if (browser) {
			window.removeEventListener('beforeunload', handleBeforeUnload);
			window.removeEventListener('keydown', handleKeydown);
		}
	});

	// Navigation guard
	beforeNavigate(({ cancel }) => {
		if (activitiesChangeTracker.shouldWarnBeforeLeaving()) {
			if (
				!confirm('You have unsaved changes. Are you sure you want to leave?')
			) {
				cancel();
			}
		}
	});

	// Browser refresh/close guard
	function handleBeforeUnload(event: BeforeUnloadEvent) {
		if (activitiesChangeTracker.shouldWarnBeforeLeaving()) {
			event.preventDefault();
			event.returnValue =
				'You have unsaved changes. Are you sure you want to leave?';
			return event.returnValue;
		}
	}

	afterUpdate(async () => {
		if (mounted && sortableContainer && !sortableInstance) {
			await tick();
			initializeSortable();
		}
	});

	function loadFromStorage() {
		// Always load from sessionStorage for temporary work
		try {
			const stored = sessionStorage.getItem(STORAGE_KEY);
			if (stored) {
				localActivities = JSON.parse(stored);
			}
		} catch (error) {
			console.error('Failed to load from storage:', error);
		}
	}

	function saveToStorage() {
		try {
			sessionStorage.setItem(STORAGE_KEY, JSON.stringify(localActivities));
		} catch (error) {
			console.error('Failed to save to storage:', error);
		}
	}

	function updateActivitiesAndTrack() {
		// Update sessionStorage
		saveToStorage();
		// Update change tracker
		activitiesChangeTracker.updateActivities(localActivities);
	}

	function reinitializeSortable() {
		if (sortableInstance) {
			sortableInstance.destroy();
			sortableInstance = null;
		}
		initializeSortable();
	}

	function initializeSortable() {
		if (!sortableContainer || !mounted) return;

		// Destroy existing instance
		if (sortableInstance) {
			sortableInstance.destroy();
			sortableInstance = null;
		}

		// Make sure we have sortable items before initializing
		const items = sortableContainer.querySelectorAll('.sortable-item');
		if (items.length === 0) return;

		try {
			sortableInstance = Sortable.create(sortableContainer, {
				handle: '.sortable-handle',
				animation: 300,
				easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
				ghostClass: 'sortable-ghost',
				chosenClass: 'sortable-chosen',
				dragClass: 'sortable-drag',
				forceFallback: false,
				fallbackClass: 'sortable-fallback',
				fallbackOnBody: true,
				swapThreshold: 0.8,
				scroll: true,
				scrollSensitivity: 30,
				scrollSpeed: 10,
				bubbleScroll: true,
				removeCloneOnHide: false,
				revertOnSpill: false,
				dragoverBubble: false,
				dropBubble: false,
				preventOnFilter: false,
				onStart: () => {
					document.body.classList.add('is-dragging');
					if (sortableContainer) {
						sortableContainer.classList.add('dragging-active');
					}
					console.log('Drag started');
				},
				onEnd: (evt) => {
					document.body.classList.remove('is-dragging');

					setTimeout(() => {
						if (sortableContainer) {
							sortableContainer.classList.remove('dragging-active');
						}
					}, 50);

					console.log('Drag ended', evt);

					const { oldIndex, newIndex } = evt;

					if (
						oldIndex !== undefined &&
						newIndex !== undefined &&
						oldIndex !== newIndex
					) {
						console.log(`Moving item from ${oldIndex} to ${newIndex}`);

						// Reorder the activities array
						const newActivities = [...localActivities];
						const [movedItem] = newActivities.splice(oldIndex, 1);
						newActivities.splice(newIndex, 0, movedItem);

						localActivities = newActivities;
						updateActivitiesAndTrack();
					}
				},
				onMove: () => {
					return true;
				},
			});

			console.log('Sortable initialized successfully');
		} catch (error) {
			console.error('Failed to initialize Sortable:', error);
		}
	}

	function createNewActivity(): Activity {
		return {
			id: crypto.randomUUID(),
			activityType: '',
			organizationName: '',
			positionDescription: '',
			activityDescription: '',
			participationLevels: {},
			timingOfParticipation: {},
			hoursPerWeek: 0,
			weeksPerYear: 0,
			collegeParticipation: false,
		};
	}

	async function addNewActivity() {
		localActivities = [createNewActivity(), ...localActivities];
		updateActivitiesAndTrack();
		await tick();
		reinitializeSortable();
	}

	// Handle delete request - open confirmation modal (DON'T DELETE YET)
	function handleDeleteActivity(event: CustomEvent<{ id: string }>) {
		const activity = localActivities.find((a) => a.id === event.detail.id);
		if (activity) {
			activityToDelete = activity;
			showDeleteModal = true;
		}
	}

	// Actually delete the activity (called from modal)
	async function confirmDelete() {
		if (activityToDelete) {
			// Find the activity card component and trigger animation
			const activityElement = sortableContainer?.querySelector(
				`[data-id="${activityToDelete.id}"]`,
			);
			if (activityElement) {
				// Add the animation class directly
				activityElement.classList.add('animate-scale-out');

				// Wait for animation to complete before removing from array
				await new Promise((resolve) => setTimeout(resolve, 300));
			}

			localActivities = localActivities.filter(
				(a) => a.id !== activityToDelete!.id,
			);
			updateActivitiesAndTrack();
			await tick();

			if (localActivities.length > 0) {
				reinitializeSortable();
			}
		}

		// Reset modal state
		showDeleteModal = false;
		activityToDelete = null;
	}

	// Cancel deletion
	function cancelDelete() {
		showDeleteModal = false;
		activityToDelete = null;
	}

	function handleUpdateActivity(
		event: CustomEvent<{ id: string; activity: Partial<Activity> }>,
	) {
		localActivities = localActivities.map((a) =>
			a.id === event.detail.id ? { ...a, ...event.detail.activity } : a,
		);
		updateActivitiesAndTrack();
	}

	// Reactive statement to reinitialize sortable when activities change
	$: if (mounted && localActivities.length > 0 && sortableContainer) {
		tick().then(() => {
			if (!sortableInstance) {
				initializeSortable();
			}
		});
	}

	// Generate and download PDF preview
	async function generatePDFPreview() {
		if (!localActivities.length) {
			console.warn('No activities to preview');
			return;
		}

		try {
			// Dynamically import jsPDF to avoid SSR issues
			const { jsPDF } = await import('jspdf');
			const generator = new PDFPreviewGenerator(localActivities, {
				studentName: '', // You can add student name if available
				schoolYear: new Date().getFullYear().toString(),
			});

			const pdfBuffer = generator.generatePDF(
				new jsPDF() as unknown as JsPDFInstance,
			);
			const filename = `activities-preview-${new Date().toISOString().split('T')[0]}.pdf`;
			downloadPDF(pdfBuffer, filename);
		} catch (error) {
			console.error('Failed to generate PDF:', error);
			// You might want to show a toast notification here
		}
	}

	// Dispatch save event to parent
	function handleSave() {
		dispatch('saveActivities', { activities: localActivities });
	}

	// PDF Generation Classes (inline to avoid import issues)
	class PDFPreviewGenerator {
		private doc!: JsPDFInstance; // Use definite assignment assertion
		private pageWidth: number = 210; // A4 width in mm
		private pageHeight: number = 297; // A4 height in mm
		private margin: number = 20;
		private currentY: number = 0;

		constructor(
			private activities: Activity[],
			private options: { studentName?: string; schoolYear?: string } = {},
		) {}

		generatePDF(jsPDFInstance: JsPDFInstance): Uint8Array {
			this.doc = jsPDFInstance;
			this.currentY = this.margin;

			// Add header notice
			this.addHeaderNotice();

			// Add title
			this.addTitle();

			// Add activities
			this.addActivities();

			// Add footer disclaimer
			this.addFooterDisclaimer();

			return this.doc.output('arraybuffer');
		}

		private addHeaderNotice(): void {
			this.doc.setFontSize(10);
			this.doc.setTextColor(150, 0, 0); // Dark red

			const noticeText =
				'PREVIEW ONLY: For the most accurate view of how admissions officers see your activities, please use the Common App Activities List.';
			const lines = this.doc.splitTextToSize(
				noticeText,
				this.pageWidth - this.margin * 2,
			);

			// Add light red background
			this.doc.setFillColor(255, 240, 240);
			this.doc.rect(
				this.margin - 5,
				this.currentY - 5,
				this.pageWidth - this.margin * 2 + 10,
				lines.length * 4 + 10,
				'F',
			);

			this.doc.text(lines, this.margin, this.currentY + 5);
			this.currentY += lines.length * 4 + 15;
		}

		private addTitle(): void {
			this.doc.setTextColor(0, 0, 0);
			this.doc.setFontSize(16);
			this.doc.setFont(undefined, 'bold');

			this.doc.text('Activities List', this.pageWidth / 2, this.currentY, {
				align: 'center',
			});
			this.currentY += 15;

			if (this.options.studentName) {
				this.doc.setFontSize(12);
				this.doc.setFont(undefined, 'normal');
				this.doc.text(
					`Student: ${this.options.studentName}`,
					this.margin,
					this.currentY,
				);
				this.currentY += 8;
			}

			this.currentY += 10;
		}

		private addActivities(): void {
			this.activities.forEach((activity, index) => {
				// Check if we need a new page
				if (this.currentY > this.pageHeight - 60) {
					this.doc.addPage();
					this.currentY = this.margin;
				}

				this.addSingleActivity(activity, index + 1);
				this.currentY += 8; // Space between activities
			});
		}

		private addSingleActivity(activity: Activity, position: number): void {
			// Activity type and position
			this.doc.setFontSize(11);
			this.doc.setFont(undefined, 'bold');
			this.doc.setTextColor(0, 100, 200); // Blue color

			const activityHeader = `${position}. ${activity.activityType || 'Other Club/Activity'}`;
			this.doc.text(activityHeader, this.margin, this.currentY);
			this.currentY += 6;

			// Reset color to black
			this.doc.setTextColor(0, 0, 0);

			// Create two-column layout
			const leftColumnX = this.margin;
			const rightColumnX = this.pageWidth / 2 + 5;
			const columnWidth = this.pageWidth / 2 - this.margin - 5;

			// Left column
			let leftY = this.currentY;

			// Position/Leadership Role
			if (activity.positionDescription) {
				this.doc.setFont(undefined, 'bold');
				this.doc.setFontSize(10);
				this.doc.text('Position/Leadership Role:', leftColumnX, leftY);
				leftY += 4;

				this.doc.setFont(undefined, 'normal');
				const positionLines = this.doc.splitTextToSize(
					activity.positionDescription,
					columnWidth,
				);
				this.doc.text(positionLines, leftColumnX, leftY);
				leftY += positionLines.length * 4 + 3;
			}

			// Organization Name
			if (activity.organizationName) {
				this.doc.setFont(undefined, 'bold');
				this.doc.setFontSize(10);
				this.doc.text('Organization Name:', leftColumnX, leftY);
				leftY += 4;

				this.doc.setFont(undefined, 'normal');
				const orgLines = this.doc.splitTextToSize(
					activity.organizationName,
					columnWidth,
				);
				this.doc.text(orgLines, leftColumnX, leftY);
				leftY += orgLines.length * 4 + 3;
			}

			// Right column
			let rightY = this.currentY;

			// Time Commitment
			this.doc.setFont(undefined, 'bold');
			this.doc.setFontSize(10);
			this.doc.text('Time Commitment:', rightColumnX, rightY);
			rightY += 4;

			this.doc.setFont(undefined, 'normal');
			this.doc.text(
				`${activity.hoursPerWeek || 0} hrs/wk, ${activity.weeksPerYear || 0} wks/yr`,
				rightColumnX,
				rightY,
			);
			rightY += 7;

			// Participation Levels
			const participationLevels = this.getParticipationLevelsText(
				activity.participationLevels as Record<string, boolean>,
			);
			if (participationLevels) {
				this.doc.setFont(undefined, 'bold');
				this.doc.text('Grade Levels:', rightColumnX, rightY);
				rightY += 4;

				this.doc.setFont(undefined, 'normal');
				this.doc.text(participationLevels, rightColumnX, rightY);
				rightY += 7;
			}

			// Timing of Participation
			const timing = this.getTimingText(
				activity.timingOfParticipation as Record<string, boolean>,
			);
			if (timing) {
				this.doc.setFont(undefined, 'bold');
				this.doc.text('When:', rightColumnX, rightY);
				rightY += 4;

				this.doc.setFont(undefined, 'normal');
				const timingLines = this.doc.splitTextToSize(timing, columnWidth);
				this.doc.text(timingLines, rightColumnX, rightY);
				rightY += timingLines.length * 4 + 3;
			}

			// Activity Description (full width)
			this.currentY = Math.max(leftY, rightY) + 3;

			if (activity.activityDescription) {
				this.doc.setFont(undefined, 'bold');
				this.doc.setFontSize(10);
				this.doc.text(
					'Description of Activity/Achievement:',
					this.margin,
					this.currentY,
				);
				this.currentY += 4;

				this.doc.setFont(undefined, 'normal');
				const descLines = this.doc.splitTextToSize(
					activity.activityDescription,
					this.pageWidth - this.margin * 2,
				);
				this.doc.text(descLines, this.margin, this.currentY);
				this.currentY += descLines.length * 4 + 3;
			}

			// College Participation
			if (activity.collegeParticipation) {
				this.doc.setFont(undefined, 'italic');
				this.doc.setFontSize(9);
				this.doc.setTextColor(100, 100, 100);
				this.doc.text(
					'Plans to participate in similar activity in college',
					this.margin,
					this.currentY,
				);
				this.currentY += 5;
				this.doc.setTextColor(0, 0, 0);
			}

			// Add separator line
			this.doc.setDrawColor(200, 200, 200);
			this.doc.line(
				this.margin,
				this.currentY,
				this.pageWidth - this.margin,
				this.currentY,
			);
			this.currentY += 5;
		}

		private getParticipationLevelsText(
			levels?: Record<string, boolean>,
		): string {
			if (!levels) return '';

			const selectedLevels = Object.entries(levels)
				.filter(([_, selected]) => selected)
				.map(([grade, _]) => `Grade ${grade}`)
				.sort();

			return selectedLevels.join(', ');
		}

		private getTimingText(timing?: Record<string, boolean>): string {
			if (!timing) return '';

			const timingMap: Record<string, string> = {
				schoolYear: 'School Year',
				schoolBreak: 'School Breaks',
				allYear: 'All Year Round',
			};

			const selectedTiming = Object.entries(timing)
				.filter(([_, selected]) => selected)
				.map(([key, _]) => timingMap[key])
				.filter(Boolean);

			return selectedTiming.join(', ');
		}

		private addFooterDisclaimer(): void {
			// Go to last page if not already there
			const pageCount = this.doc.getNumberOfPages();
			if (pageCount > 1) {
				this.doc.setPage(pageCount);
			}

			// Position at bottom of page
			const disclaimerY = this.pageHeight - 30;

			this.doc.setFontSize(8);
			this.doc.setTextColor(100, 100, 100);
			this.doc.setFont(undefined, 'normal');

			const disclaimer =
				'DISCLAIMER: This preview is for organizational purposes only and is not affiliated with or endorsed by The Common Application, Inc. Common App is a registered trademark of The Common Application, Inc. To submit your activities, please use the official Common Application platform.';

			const promotionText =
				'This preview was made with Haloway. Try the free extracurriculars activities organizer at \nhttps://haloway.co/extracurricular-organizer';

			const disclaimerLines = this.doc.splitTextToSize(
				disclaimer,
				this.pageWidth - this.margin * 2,
			);

			const promoLines = this.doc.splitTextToSize(
				promotionText,
				this.pageWidth - this.margin * 2,
			);

			// Add light gray background
			this.doc.setFillColor(250, 250, 250);
			this.doc.rect(
				this.margin - 5,
				disclaimerY - 5,
				this.pageWidth - this.margin * 2 + 10,
				(disclaimerLines.length + promoLines.length) * 3 + 12,
				'F',
			);

			// Add disclaimer text
			this.doc.text(disclaimerLines, this.margin, disclaimerY);

			// Add promotion text with slightly bolder font
			this.doc.setFont(undefined, 'bold');
			this.doc.setTextColor(50, 50, 150); // Slightly blue color
			this.doc.text(
				promoLines,
				this.margin,
				disclaimerY + (disclaimerLines.length * 3 + 4),
			);
		}
	}

	// Function to download the PDF
	function downloadPDF(
		pdfBuffer: Uint8Array,
		filename: string = 'activities-preview.pdf',
	): void {
		const blob = new Blob([new Uint8Array(pdfBuffer)], {
			type: 'application/pdf',
		});
		const url = URL.createObjectURL(blob);

		const link = document.createElement('a');
		link.href = url;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}
</script>

<div class="my-6">
	<!-- Status Bar - Styled like the essay document autosave -->
	{#if isAuthenticated}
		<div class="mb-4 flex w-full items-center justify-between">
			<div class="flex items-center gap-4">
				<!-- Save State Display - Matching TopToolbar.svelte styling exactly -->
				<div class="flex items-center gap-2">
					<div
						class="status-indicator"
						class:status-saved={statusDisplay.class === 'saved'}
						class:status-saving={statusDisplay.class === 'saving'}
						class:status-unsaved={statusDisplay.class === 'unsaved'}
						class:status-error={statusDisplay.class === 'error'}
						class:animate-pulse={changeState.status === 'error'}
					>
						<!-- Status Icon -->
						<div class="status-icon">
							{#if statusDisplay.icon === 'saved'}
								<svg
									class="h-4 w-4"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
								>
									<path d="M20 6L9 17l-5-5" />
								</svg>
							{:else if statusDisplay.icon === 'saving'}
								<div class="loading-spinner"></div>
							{:else if statusDisplay.icon === 'unsaved'}
								<AlertCircle class="h-4 w-4 text-yellow-500" />
							{:else if statusDisplay.icon === 'error'}
								<svg
									class="h-4 w-4"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
								>
									<circle cx="12" cy="12" r="10" />
									<line x1="15" y1="9" x2="9" y2="15" />
									<line x1="9" y1="9" x2="15" y2="15" />
								</svg>
							{/if}
						</div>

						<!-- Status Text -->
						<span class="status-text text-xs sm:text-sm"
							>{statusDisplay.text}</span
						>
					</div>

					<!-- Manual Save Button - Matching TopToolbar.svelte styling exactly -->
					{#if statusDisplay.showSaveButton}
						<Button
							variant="outline"
							size="sm"
							on:click={handleSave}
							disabled={changeState.status === 'saving'}
						>
							<Save class="mr-2 h-4 w-4" />
							<span class="hidden sm:inline">
								{#if changeState.status === 'error'}
									Retry
								{:else}
									Save
								{/if}
							</span>
						</Button>
					{/if}
				</div>
			</div>

			<div class="mb-4 flex items-center gap-2">
				<Button on:click={addNewActivity} size="sm">
					<Plus class="mr-2 h-4 w-4" />
					Add Activity
				</Button>
				<Button
					on:click={generatePDFPreview}
					variant="outline"
					size="sm"
					disabled={localActivities.length === 0}
					title="Download PDF preview (Common App style)"
				>
					<Eye class="mr-2 h-4 w-4" />
					<span class="hidden sm:inline">Preview</span>
				</Button>
			</div>
		</div>
	{:else}
		<div class="mb-4 flex w-full justify-end gap-2">
			<Button on:click={addNewActivity} size="sm">
				<Plus class="mr-2 h-4 w-4" />
				Add Activity
			</Button>
			<Button
				on:click={generatePDFPreview}
				variant="outline"
				size="sm"
				disabled={localActivities.length === 0}
				title="Download PDF preview (Common App style)"
			>
				<Eye class="mr-2 h-4 w-4" />
				<span class="hidden sm:inline">Preview</span>
			</Button>
		</div>
	{/if}

	<div class="space-y-6 bg-background">
		<!-- Main Board -->
		<div class="w-full">
			<div class="rounded-xl bg-muted/30 p-3 md:p-6">
				<div class="mb-6 flex items-center justify-between">
					<h2 class="text-xl font-semibold">
						Activities ({localActivities.length})
					</h2>
					{#if !isAuthenticated}
						<div class="flex items-center text-sm text-muted-foreground">
							<AlertCircle class="mr-2 h-4 w-4" />
							Sign in to save your work
						</div>
					{/if}
				</div>

				{#if localActivities.length === 0}
					<div
						class="flex flex-col items-center justify-center space-y-4 py-16 text-center"
					>
						<div class="rounded-full bg-muted p-4">
							<Plus class="h-8 w-8 text-muted-foreground" />
						</div>
						<h3 class="text-lg font-semibold">No activities yet</h3>
						<p class="max-w-sm text-muted-foreground">
							Start organizing your extracurricular activities for your college
							applications.
						</p>
						<Button on:click={addNewActivity}>
							<Plus class="mr-2 h-4 w-4" />
							Add First Activity
						</Button>
					</div>
				{:else}
					<div bind:this={sortableContainer} class="sortable-container">
						{#each localActivities as activity, index (activity.id)}
							<ActivityCard
								{activity}
								position={index + 1}
								on:delete={handleDeleteActivity}
								on:update={handleUpdateActivity}
							/>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<!-- Delete Confirmation Modal -->
<Dialog.Root bind:open={showDeleteModal}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Delete Activity</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete this activity? This action cannot be
				undone.
			</Dialog.Description>
		</Dialog.Header>

		{#if activityToDelete}
			<div class="py-4">
				<div class="rounded-lg border bg-muted/30 p-3">
					<p class="text-sm font-medium">
						{activityToDelete.positionDescription ||
							'Untitled Position/Leadership Role'}
					</p>
					{#if activityToDelete.organizationName}
						<p class="text-sm font-medium">
							{activityToDelete.organizationName}
						</p>
					{/if}
					<p class="text-sm text-muted-foreground">
						{activityToDelete.activityDescription || 'Untitled Activity'}
					</p>
				</div>
			</div>
		{/if}

		<Dialog.Footer>
			<Button variant="outline" on:click={cancelDelete}>Cancel</Button>
			<Button variant="destructive" on:click={confirmDelete}>
				Delete Activity
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<style>
	/* Status Section - Matching TopToolbar.svelte exactly */
	.status-indicator {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.625rem;
		border-radius: 9999px;
		font-size: 0.875rem;
		font-weight: 500;
		transition: all 0.2s ease;
	}

	@media (min-width: 640px) {
		.status-indicator {
			padding: 0.5rem 0.75rem;
		}
	}

	.status-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.status-text {
		white-space: nowrap;
	}

	/* Status variants - Matching TopToolbar.svelte exactly */
	.status-saved {
		background: hsl(var(--color-success) / 0.1);
		color: hsl(var(--color-success));
		border: 1px solid hsl(var(--color-success) / 0.2);
	}

	.status-saving {
		background: hsl(var(--color-info) / 0.1);
		color: hsl(var(--color-info));
		border: 1px solid hsl(var(--color-info) / 0.2);
	}

	.status-unsaved {
		background: hsl(var(--color-warning) / 0.1);
		color: hsl(var(--color-warning));
		border: 1px solid hsl(var(--color-warning) / 0.2);
	}

	.status-error {
		background: hsl(var(--color-error) / 0.1);
		color: hsl(var(--color-error));
		border: 1px solid hsl(var(--color-error) / 0.2);
	}

	/* Loading spinner - Matching TopToolbar.svelte exactly */
	.loading-spinner {
		width: 16px;
		height: 16px;
		border: 2px solid transparent;
		border-top: 2px solid currentColor;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* Sortable.js styling - clean and minimal */
	:global(.sortable-ghost) {
		opacity: 0.4;
	}

	:global(.sortable-chosen) {
		cursor: grabbing !important;
		z-index: 1000;
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
	}

	:global(.sortable-drag) {
		opacity: 0.8 !important;
		transform: scale(1.05) !important;
		box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2) !important;
		z-index: 1001;
	}

	/* Prevent text selection during drag */
	:global(.is-dragging) {
		user-select: none;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
	}

	/* Default smooth transitions for all items when NOT dragging */
	.sortable-container:not(.dragging-active) :global(.sortable-item) {
		transition:
			transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
			margin 0.4s cubic-bezier(0.4, 0, 0.2, 1),
			box-shadow 0.3s ease;
	}

	/* Disable ALL transitions during active dragging to let Sortable.js handle it */

	/* Re-enable transitions after drag */
	.sortable-container :global(.sortable-item) {
		transform-origin: center center;
		will-change: transform;
	}

	/* Simple hover effect - just slight lift */
	.sortable-container:not(.dragging-active) :global(.sortable-item:hover) {
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
	}

	/* Handle styling */
	:global(.sortable-handle) {
		touch-action: none;
		cursor: grab;
		border-radius: 6px;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		padding: 8px;
		margin: -8px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	:global(.sortable-handle:hover) {
		background-color: hsl(var(--muted));
		transform: scale(1.1);
	}

	:global(.sortable-handle:active) {
		cursor: grabbing;
		transform: scale(0.95);
	}

	/* Container setup for smooth animations */
	.sortable-container {
		min-height: 100px;
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	/* Ensure proper spacing without margin conflicts */
	.sortable-container > :global(.sortable-item) {
		margin: 0 !important;
		position: relative;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
</style>
