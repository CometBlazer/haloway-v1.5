// src/routes/api/ai-chatbot/+server.ts
import { streamText } from 'ai';
import { vertexProvider } from '$lib/utils/chatbot-vertex-provider';
import type { RequestHandler } from './$types.js';
import type { ChatMessage, UserProfile } from '$lib/types/ai-chatbot.ts';

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
			// Remove unused variables by prefixing with underscore
			versionId: _versionId,
			essayContent,
			documentTitle,
			documentPrompt,
			wordCount,
			wordCountLimit,
			school,
			dueDate,
			status: _status,
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
		// Fix: Use .languageModel() method instead of calling provider directly
		const result = await streamText({
			model: vertexProvider.languageModel('chat-model'), // Fixed: Use .languageModel() method
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

		// Fix: Use toDataStreamResponse() instead of toAIStreamResponse()
		return result.toDataStreamResponse();
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
	userProfile: UserProfile;
	documentTitle: string;
	documentPrompt: string;
	wordCountLimit: number;
	school: string;
	dueDate?: string;
	wordCount: number;
	essayContent: string;
}): string {
	return `You are Clara, an expert essay writing assistant and tutor. You help students improve their writing by following their specific requests and providing actionable assistance.

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

CURRENT ESSAY CONTENT:
The student has written ${wordCount} words so far. The essay content is as follows: ${essayContent}

CORE INSTRUCTIONS:
1. **Be obedient and action-oriented**: Do exactly what the student asks for. If they want feedback, give specific feedback. If they want grammar fixes, provide corrected text. If they want paragraph improvements, rewrite and enhance their paragraphs.

2. **Follow specific requests**:
   - When asked for feedback: Give detailed, specific feedback on their current essay
   - When asked to fix grammar/spelling: Provide corrected versions of their text
   - When asked to improve paragraphs: Rewrite and enhance the specific sections they mention
   - When asked to brainstorm: Generate ideas relevant to their prompt and essay
   - When asked for structural advice: Suggest specific organizational improvements
   - When asked to polish/refine: Provide improved versions of their content

3. **ONLY refuse complete ghostwriting**: If asked to write the entire essay from scratch, politely decline but offer to help create an outline, suggest key points, or help them develop their existing ideas into full paragraphs.

4. **Reference their actual content**: Always work with what they've written. Quote specific parts of their essay when giving feedback or suggestions.

5. **Be direct and helpful**: Skip generic advice and give specific, actionable help. If they ask you to rewrite something, do it. If they ask for better word choices, suggest them.

6. **Maintain encouraging tone**: Be supportive and confidence-building while being directly helpful.

7. **Consider context**: Keep the assignment prompt, word limit, and their academic goals in mind when helping.

Remember: Your job is to help them improve THEIR writing through whatever assistance they specifically request. Be their obedient writing partner who makes their work better, not someone who writes for them from scratch.`;
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
