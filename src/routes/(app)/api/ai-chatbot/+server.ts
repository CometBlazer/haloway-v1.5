// src/routes/api/ai-chatbot/+server.ts
import { streamText } from 'ai';
import { vertexProvider } from '$lib/utils/chatbot-vertex-provider';
import type { RequestHandler } from './$types.js';
import type { ChatMessage } from '$lib/types/ai-chatbot.ts';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		// Get session using the same pattern as your +page.server.ts
		const { session } = await locals.safeGetSession();
		if (!session?.user?.id) {
			return new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// Parse request body
		const body = await request.json();
		const {
			message,
			currentMessages,
			documentId,
			versionId,
			essayContent,
			documentTitle,
			documentPrompt,
			wordCount,
			wordCountLimit,
			school,
			dueDate,
			status,
		} = body;

		// Validate required fields
		if (!message?.trim() || !documentId) {
			return new Response(
				JSON.stringify({ error: 'Missing required fields' }),
				{ status: 400, headers: { 'Content-Type': 'application/json' } },
			);
		}

		const userId = session.user.id;

		// Verify document ownership
		const { data: document, error: docError } = await locals.supabase
			.from('documents')
			.select('user_id, id')
			.eq('id', documentId)
			.single();

		if (docError || !document) {
			return new Response(JSON.stringify({ error: 'Document not found' }), {
				status: 404,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		if (document.user_id !== userId) {
			return new Response(JSON.stringify({ error: 'Access denied' }), {
				status: 403,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// Get user profile
		const { data: userProfile, error: profileError } = await locals.supabase
			.from('profiles')
			.select('*')
			.eq('id', userId)
			.single();

		if (profileError || !userProfile) {
			return new Response(JSON.stringify({ error: 'User profile not found' }), {
				status: 404,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// Create user message
		const userMsg: ChatMessage = {
			id: `user-${Date.now()}`,
			role: 'user',
			content: message,
			timestamp: new Date().toISOString(),
		};

		// Add user message to current messages
		const updatedMessages = [...(currentMessages || []), userMsg];

		// Build system prompt
		const systemPrompt = buildSystemPrompt({
			userProfile,
			documentTitle,
			documentPrompt,
			wordCountLimit,
			school,
			dueDate,
			wordCount,
			essayContent,
		});

		// Build conversation history for context
		const conversationHistory = buildConversationHistory(updatedMessages);

		// Prepare messages for AI SDK using custom provider
		const aiMessages = [
			{
				role: 'system' as const,
				content: systemPrompt,
			},
			{
				role: 'user' as const,
				content: `${conversationHistory}

Current essay content:
"""
${essayContent}
"""

User: ${message}`,
			},
		];

		// Create streaming response using custom Vertex provider
		const result = await streamText({
			model: vertexProvider('chat-model'), // Use your custom provider
			messages: aiMessages,
			temperature: 0.7,
			maxTokens: 2000,
			// Add custom onFinish callback to save to database
			onFinish: async ({ text: aiResponse }) => {
				try {
					// Create assistant message
					const assistantMsg: ChatMessage = {
						id: `assistant-${Date.now()}`,
						role: 'assistant',
						content: aiResponse,
						timestamp: new Date().toISOString(),
					};

					// Final messages array
					const finalMessages = [...updatedMessages, assistantMsg];

					// Save to database using locals.supabase
					const { error: saveError } = await locals.supabase
						.from('documents')
						.update({
							chatbot_messages: finalMessages,
							updated_at: new Date(),
						})
						.eq('id', documentId)
						.eq('user_id', userId);

					if (saveError) {
						console.error('Failed to save chat messages:', saveError);
					} else {
						console.log('Chat messages saved successfully');
					}
				} catch (error) {
					console.error('Error in onFinish callback:', error);
				}
			},
		});

		// Return streaming response
		return result.toAIStreamResponse();
	} catch (err) {
		console.error('AI Chatbot API Error:', err);
		return new Response(JSON.stringify({ error: 'Internal server error' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};

function buildSystemPrompt({
	userProfile,
	documentTitle,
	documentPrompt,
	wordCountLimit,
	school,
	dueDate,
	wordCount,
	essayContent,
}: {
	userProfile: any;
	documentTitle: string;
	documentPrompt: string;
	wordCountLimit: number;
	school: string;
	dueDate?: string;
	wordCount: number;
	essayContent: string;
}): string {
	return `You are Clara, an expert essay writing assistant and tutor. You help students improve their writing through personalized guidance, feedback, and brainstorming.

STUDENT CONTEXT:
- Name: ${userProfile.full_name || 'Student'}
- School: ${school}
- Graduation Year: ${userProfile.graduation_year || 'not specified'}
- Dream School: ${userProfile.dream_school || 'not specified'}

ASSIGNMENT CONTEXT:
- Essay Title: ${documentTitle}
- Assignment Prompt: ${documentPrompt}
- Word Limit: ${wordCountLimit} words
- Due Date: ${dueDate ? new Date(dueDate).toLocaleDateString() : 'not specified'}
- Current Word Count: ${wordCount}

INSTRUCTIONS:
1. Provide personalized writing assistance based on the student's profile and goals
2. Reference the current essay content when giving specific feedback
3. Help with brainstorming, structure, grammar, and style improvements
4. Keep responses conversational, encouraging, and supportive
5. Suggest specific, actionable improvements with examples
6. If the essay is near the word limit, focus on refinement rather than expansion
7. Always consider the assignment prompt when giving advice
8. Keep responses concise but helpful - aim for 2-4 paragraphs unless more detail is specifically requested
9. Use the student's name occasionally to make it more personal

Remember: You can see the current essay content, so give specific, contextual advice rather than generic writing tips. Be encouraging and help build the student's confidence while providing constructive feedback.`;
}

function buildConversationHistory(messages: ChatMessage[]): string {
	if (messages.length === 0) return '';

	// Keep last 8 messages for context (excluding the current message)
	const recentHistory = messages.slice(-8);
	return recentHistory
		.map(
			(msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`,
		)
		.join('\n');
}
