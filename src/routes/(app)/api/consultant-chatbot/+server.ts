// src/routes/api/consultant-chatbot/+server.ts
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
		const { message, currentMessages } = body;

		// Validate required fields
		if (!message?.trim()) {
			return new Response(JSON.stringify({ error: 'Message is required' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const userId = session.user.id;

		// Create user message
		const userMsg: ChatMessage = {
			id: `user-${Date.now()}`,
			role: 'user',
			content: message,
			timestamp: new Date().toISOString(),
		};

		// Add user message to current messages
		const updatedMessages = [...(currentMessages || []), userMsg];

		// Build conversation history for context
		const conversationHistory = buildConversationHistory(updatedMessages);

		// Prepare messages for AI SDK using custom provider
		const aiMessages = [
			{
				role: 'system' as const,
				content: buildSystemPrompt(),
			},
			{
				role: 'user' as const,
				content: conversationHistory || message,
			},
		];

		// Create streaming response using the properly typed Vertex provider
		const result = await streamText({
			model: vertexProvider('gemini-2.5-pro'),
			messages: aiMessages,
			temperature: 0.7,
			maxTokens: 8192,
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

					// Get or create user's consultant chat
					const { data: chat, error: chatError } = await locals.supabase
						.from('consultant_chat')
						.select('id')
						.eq('user_id', userId)
						.single();

					if (chatError || !chat) {
						// Create new chat if it doesn't exist
						// eslint-disable-next-line @typescript-eslint/no-unused-vars
						const { data: newChat, error: createError } = await locals.supabase
							.from('consultant_chat')
							.insert({
								id: crypto.randomUUID(),
								user_id: userId,
								title: 'Consultant Chat',
								visibility: 'private',
								message_history: finalMessages,
							})
							.select('id')
							.single();

						if (createError) {
							console.error('Failed to create chat:', createError);
						} else {
							console.log('Chat created and messages saved successfully');
						}
					} else {
						// Update existing chat
						const { error: updateError } = await locals.supabase
							.from('consultant_chat')
							.update({
								message_history: finalMessages,
								updated_at: new Date(),
							})
							.eq('id', chat.id)
							.eq('user_id', userId);

						if (updateError) {
							console.error('Failed to save chat messages:', updateError);
						} else {
							console.log('Chat messages saved successfully');
						}
					}
				} catch (error) {
					console.error('Error in onFinish callback:', error);
				}
			},
		});

		return result.toDataStreamResponse();
	} catch (err) {
		console.error('Consultant Chatbot API Error:', err);
		return new Response(JSON.stringify({ error: 'Internal server error' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};

function buildSystemPrompt(): string {
	return `You are Chloe, a friendly and knowledgeable college admissions consultant. You help students navigate the college application process with expert guidance and personalized advice.

CORE INSTRUCTIONS:
1. **Be helpful and encouraging**: Provide supportive guidance while being realistic about college admissions
2. **Give specific, actionable advice**: Offer concrete steps students can take to improve their applications
3. **Stay current with admissions trends**: Use your knowledge of modern college admissions practices
4. **Be conversational but professional**: Maintain a warm, approachable tone while demonstrating expertise
5. **Ask clarifying questions when needed**: If a student's question is vague, ask for more details to provide better help

AREAS OF EXPERTISE:
- College application strategy and timeline
- Essay writing guidance and brainstorming
- Extracurricular activity selection and presentation
- Standardized testing advice
- School selection (reach, match, safety schools)
- Financial aid and scholarship guidance
- Interview preparation
- Application review and feedback
- Academic planning and course selection
- Letters of recommendation strategy

RESPONSE STYLE:
- Use plain text (no markdown formatting)
- Be encouraging and confidence-building
- Provide specific examples when helpful
- Keep responses conversational and easy to understand
- Match response length to the complexity of the question
- For quick questions, give concise answers
- For complex topics, provide thorough explanations

WHAT TO AVOID:
- Making promises about admission outcomes
- Giving advice that could be considered unethical
- Providing information that's clearly outdated
- Being overly generic - try to personalize advice when possible

Remember: Your goal is to empower students with knowledge and confidence to navigate their college journey successfully. Be their trusted advisor who provides both strategic guidance and emotional support throughout the admissions process.`;
}

function buildConversationHistory(messages: ChatMessage[]): string {
	if (messages.length <= 1) return messages[0]?.content || '';

	// Keep last 10 messages for context (including the current message)
	const recentHistory = messages.slice(-10);
	return recentHistory
		.map((msg) => `${msg.role === 'user' ? 'User' : 'Chloe'}: ${msg.content}`)
		.join('\n\n');
}
