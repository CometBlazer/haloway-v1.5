// 📁 src/lib/document/types.ts
import type { Status } from '$lib/components/Editor/StatusDropdown.svelte';

export interface DocumentUpdateData {
	title?: string;
	prompt?: string;
	wordCountLimit?: number;
	status?: Status;
	dueDate?: Date | null;
}

export interface DocumentCallbacks {
	onSuccess: (message: string) => void;
	onError: (message: string) => void;
}
