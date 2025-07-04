// src/lib/stores/activities.ts
// Simplified store - most logic moved to server-side and component-level
import { writable } from 'svelte/store';
import type { Activity } from '$lib/types/activity';

// Simple client-side store for temporary state management
// Most functionality now handled by KanbanBoard component and server actions
export const activities = writable<Activity[]>([]);
