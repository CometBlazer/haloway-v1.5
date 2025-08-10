// src/lib/types/document-chatbot.ts
export interface ChatMessage {
	id: string;
	role: 'user' | 'assistant';
	content: string;
	timestamp: string;
}

export interface Message {
	id: string;
	text: string;
	sender: 'user' | 'ai';
	timestamp: string;
	isStreaming?: boolean;
}

export interface ChatContext {
	// Document context
	documentId: string;
	versionId: string;
	documentTitle: string;
	documentPrompt: string;
	essayContent: string;
	wordCount: number;
	wordCountLimit: number;

	// User context
	userId: string;
	userProfile: UserProfile;
	school: string;
	dueDate?: string;
	status: string;

	// Current chat messages (for context)
	messages: ChatMessage[];
}

export interface UserProfile {
	id: string;
	full_name: string | null;
	graduation_year: number | null;
	dream_school: string | null;
}
