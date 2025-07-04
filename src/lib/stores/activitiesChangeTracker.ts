// src/lib/stores/activitiesChangeTracker.ts
import { writable, derived } from 'svelte/store';
// import { browser } from '$app/environment';
import type { Activity } from '$lib/types/activity';

export type ChangeStatus = 'saved' | 'unsaved' | 'saving' | 'error';

interface ChangeState {
	status: ChangeStatus;
	lastSavedTime: Date | null;
	hasUnsavedChanges: boolean;
	isAuthenticated: boolean;
}

function createActivitiesChangeTracker() {
	// Internal state
	const state = writable<ChangeState>({
		status: 'saved',
		lastSavedTime: null,
		hasUnsavedChanges: false,
		isAuthenticated: false,
	});

	let savedSnapshot: string = '';
	let currentActivities: Activity[] = [];

	// Public store for components to subscribe to
	const changeState = derived(state, ($state) => $state);

	// Initialize with server data and mark as saved
	function initialize(activities: Activity[], isAuthenticated: boolean) {
		currentActivities = [...activities];
		savedSnapshot = JSON.stringify(activities);

		state.update((s) => ({
			...s,
			status: 'saved',
			lastSavedTime: new Date(),
			hasUnsavedChanges: false,
			isAuthenticated,
		}));
	}

	// Update current activities and check for changes
	function updateActivities(activities: Activity[]) {
		currentActivities = [...activities];
		const currentSnapshot = JSON.stringify(activities);
		const hasChanges = currentSnapshot !== savedSnapshot;

		state.update((s) => ({
			...s,
			hasUnsavedChanges: hasChanges,
			status: hasChanges && s.isAuthenticated ? 'unsaved' : s.status,
		}));
	}

	// Mark as saving
	function setSaving() {
		state.update((s) => ({ ...s, status: 'saving' }));
	}

	// Mark as saved (called after successful save)
	function setSaved() {
		savedSnapshot = JSON.stringify(currentActivities);
		state.update((s) => ({
			...s,
			status: 'saved',
			lastSavedTime: new Date(),
			hasUnsavedChanges: false,
		}));
	}

	// Mark as error
	function setError() {
		state.update((s) => ({ ...s, status: 'error' }));
	}

	// Get current activities
	function getCurrentActivities() {
		return [...currentActivities];
	}

	// Check if user should be warned before leaving
	function shouldWarnBeforeLeaving() {
		const currentState = getCurrentState();
		return currentState.hasUnsavedChanges && currentState.isAuthenticated;
	}

	// Helper to get current state synchronously
	function getCurrentState(): ChangeState {
		let currentState: ChangeState = {
			status: 'saved',
			lastSavedTime: null,
			hasUnsavedChanges: false,
			isAuthenticated: false,
		};

		state.subscribe((s) => (currentState = s))();
		return currentState;
	}

	return {
		// Public store
		subscribe: changeState.subscribe,

		// Methods
		initialize,
		updateActivities,
		setSaving,
		setSaved,
		setError,
		getCurrentActivities,
		shouldWarnBeforeLeaving,

		// Getters
		get hasUnsavedChanges() {
			return getCurrentState().hasUnsavedChanges;
		},

		get isAuthenticated() {
			return getCurrentState().isAuthenticated;
		},
	};
}

export const activitiesChangeTracker = createActivitiesChangeTracker();

// Helper function to get status display
export function getChangeStatusDisplay(state: ChangeState) {
	if (!state.isAuthenticated) {
		return {
			text: 'Sign in to save',
			class: 'text-muted-foreground',
			showSaveButton: false,
		};
	}

	switch (state.status) {
		case 'saved':
			return {
				text: state.lastSavedTime
					? `Saved ${formatTime(state.lastSavedTime)}`
					: 'All changes saved',
				class: 'text-green-600',
				showSaveButton: false,
			};
		case 'unsaved':
			return {
				text: 'You have unsaved changes',
				class: 'text-orange-600',
				showSaveButton: true,
			};
		case 'saving':
			return {
				text: 'Saving...',
				class: 'text-blue-600',
				showSaveButton: false,
			};
		case 'error':
			return {
				text: 'Save failed',
				class: 'text-red-600',
				showSaveButton: true,
			};
		default:
			return {
				text: '',
				class: '',
				showSaveButton: false,
			};
	}
}

function formatTime(time: Date): string {
	const now = new Date();
	const diff = Math.floor((now.getTime() - time.getTime()) / 1000);

	if (diff < 60) return 'just now';
	if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
	if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
	return time.toLocaleDateString();
}
