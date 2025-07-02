// File: src/lib/stores/activities.ts
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { Activity } from '$lib/types/activity';

const STORAGE_KEY = 'extracurricular-activities';

function createActivityStore() {
	const { subscribe, set, update } = writable<Activity[]>([]);

	// Load from sessionStorage on initialization
	if (browser) {
		const stored = sessionStorage.getItem(STORAGE_KEY);
		if (stored) {
			try {
				set(JSON.parse(stored));
			} catch (e) {
				console.error('Failed to parse stored activities:', e);
			}
		}
	}

	return {
		subscribe,
		addActivity: (activity: Omit<Activity, 'id'>) =>
			update((activities: Activity[]) => {
				const newActivities = [
					...activities,
					{ ...activity, id: Date.now().toString() },
				];
				if (browser) {
					sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newActivities));
				}
				return newActivities;
			}),
		updateActivity: (id: string, updatedActivity: Partial<Activity>) =>
			update((activities: Activity[]) => {
				const newActivities = activities.map((activity) =>
					activity.id === id ? { ...activity, ...updatedActivity } : activity,
				);
				if (browser) {
					sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newActivities));
				}
				return newActivities;
			}),
		deleteActivity: (id: string) =>
			update((activities: Activity[]) => {
				const newActivities = activities.filter(
					(activity) => activity.id !== id,
				);
				if (browser) {
					sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newActivities));
				}
				return newActivities;
			}),
		reorderActivities: (newOrder: Activity[]) =>
			update(() => {
				if (browser) {
					sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newOrder));
				}
				return newOrder;
			}),
	};
}

export const activities = createActivityStore();
