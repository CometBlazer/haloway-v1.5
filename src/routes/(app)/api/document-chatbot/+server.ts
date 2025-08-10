// src/routes/api/document-chatbot/+server.ts
import { streamText } from 'ai';
import { vertexProvider } from '$lib/utils/chatbot-vertex-provider';
import type { RequestHandler } from './$types.js';
import type { ChatMessage, UserProfile } from '$lib/types/ai-chatbot.ts';
import type { Activity, Background } from '../../../../DatabaseDefinitions.js';

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
			currentFeedback,
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

		// Get user activities (ordered by sort_order)
		const { data: userActivities, error: activitiesError } =
			await locals.supabase
				.from('activities')
				.select('*')
				.eq('user_id', userId)
				.order('sort_order', { ascending: true });

		if (activitiesError) {
			console.error('Error fetching user activities:', activitiesError);
		}

		// Get user background
		const { data: userBackground, error: backgroundError } =
			await locals.supabase
				.from('backgrounds')
				.select('*')
				.eq('user_id', userId)
				.single();

		if (backgroundError && backgroundError.code !== 'PGRST116') {
			// PGRST116 is "not found"
			console.error('Error fetching user background:', backgroundError);
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
			currentFeedback,
			userActivities: userActivities || [],
			userBackground: userBackground || undefined,
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

		// Create streaming response using the properly typed Vertex provider
		const result = await streamText({
			model: vertexProvider('gemini-2.5-pro'), // Now TypeScript knows this returns LanguageModelV1
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
	currentFeedback,
	userActivities,
	userBackground,
}: {
	userProfile: UserProfile;
	documentTitle: string;
	documentPrompt: string;
	wordCountLimit: number;
	school: string;
	dueDate?: string;
	wordCount: number;
	essayContent: string;
	currentFeedback?: string;
	userActivities?: Activity[];
	userBackground?: Background;
}): string {
	const feedbackSection =
		currentFeedback && currentFeedback.trim()
			? `\n\nRECENT AI FEEDBACK:\nThe student has received the following feedback on their current essay:\n${currentFeedback}\n\nYou can reference this feedback when helping the student. If they ask about implementing suggestions from the feedback, help them do so.`
			: '';

	// Build activities section
	const activitiesSection =
		userActivities && userActivities.length > 0
			? `\n\nSTUDENT EXTRACURRICULAR ACTIVITIES:\n${userActivities
					.map(
						(activity, index) =>
							`${index + 1}. ${activity.activity_type}${activity.organization_name ? ` - ${activity.organization_name}` : ''}
   Position: ${activity.position_description || 'Not specified'}
   Description: ${activity.activity_description || 'Not specified'}
   Time Commitment: ${activity.hours_per_week}hrs/week, ${activity.weeks_per_year} weeks/year
   Grade Levels: ${Array.isArray(activity.participation_levels) ? activity.participation_levels.join(', ') : 'Not specified'}${activity.college_participation ? ' (continuing in college)' : ''}`,
					)
					.join('\n\n')}`
			: '';

	// Build background section
	const backgroundSection = userBackground
		? `\n\nSTUDENT BACKGROUND:\n- Region: ${userBackground.region_of_living || 'Not specified'}
- First Generation College Student: ${userBackground.first_generation ? 'Yes' : 'No'}
- Low Income Background: ${userBackground.low_income ? 'Yes' : 'No'}
- Intended Major: ${userBackground.intended_major || 'Not specified'}
- GPA: ${userBackground.gpa || 'Not specified'}
- Test Scores: ${userBackground.test_type ? `${userBackground.test_type} - ${userBackground.sat || userBackground.act || 'Not specified'}` : 'Not specified'}
- Class Rank: ${userBackground.class_rank || 'Not specified'}
- AP/IB/College Classes: ${userBackground.ap_ib_college_classes || 'Not specified'}
${userBackground.other_hooks ? `- Other Notable Background: ${userBackground.other_hooks}` : ''}
${userBackground.challenges ? `- Challenges/Obstacles: ${userBackground.challenges}` : ''}
${userBackground.identity_background ? `- Identity/Background: ${userBackground.identity_background}` : ''}
${userBackground.values_beliefs ? `- Values/Beliefs: ${userBackground.values_beliefs}` : ''}
${userBackground.personal_qualities ? `- Personal Qualities: ${userBackground.personal_qualities}` : ''}`
		: '';

	return `You are Clara, an expert essay writing assistant and tutor. You help students improve their writing by following their specific requests and providing actionable assistance. You are developed by Haloway. 

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
The student has written ${wordCount} words so far. The essay content is as follows: ${essayContent}${feedbackSection}${activitiesSection}${backgroundSection}

CORE INSTRUCTIONS:
1. **Be obedient, SUCCINCT, and action-oriented**: Do exactly what the student asks for. If they want feedback, give specific feedback. If they want grammar fixes, provide corrected text. If they want paragraph improvements, rewrite and enhance their paragraphs.

2. **Follow specific requests**:
   - When asked for feedback: Give detailed, specific feedback on their current essay
   - When asked to fix grammar/spelling: Provide corrected versions of their text
   - When asked to improve paragraphs: Rewrite and enhance the specific sections they mention
   - When asked to brainstorm: Generate ideas relevant to their prompt and essay
   - When asked for structural advice: Suggest specific organizational improvements
   - When asked to polish/refine: Provide improved versions of their content

3. **ONLY refuse complete ghostwriting**: If asked to write the entire essay from scratch, politely decline but offer to help create an outline, suggest key points, or help them develop their existing ideas into full paragraphs.

4. **Reference their actual content AND background**: Always work with what they've written. Quote specific parts of their essay when giving feedback or suggestions. If they copy pasted a specific paragraph or sentence inside the chat, work with that instead. Use their extracurricular activities and background information to provide personalized suggestions and help them showcase their unique experiences.

5. **Be direct and helpful**: Skip generic advice and give specific, actionable help. If they ask you to rewrite something, do it. If they ask for better word choices, suggest them.

6. **Maintain encouraging tone**: Be supportive and confidence-building while being directly helpful.

7. **Consider context**: Keep the assignment prompt, word limit, and their academic goals in mind when helping.

RESPONSE FORMAT RULES:
- NEVER use markdown formatting (no **bold**, *italics*, or ## headers)
- Use plain text only
- For lists, use simple dashes like "- point one" or "- point two"
- Be CONCISE for quick edits and rewrites - just provide the improved version without long explanations
- For brainstorming, feedback, and open-ended questions, provide fuller responses
- Match your response length to the task:
  * Quick fixes (grammar, conciseness, word choice): Just give the corrected version
  * Rewrites and improvements: Provide the improved text with minimal explanation
  * Feedback and brainstorming: Give thorough, detailed responses

EXAMPLES OF GOOD RESPONSES:
For "make this more concise": Just provide the shorter version without explaining what you changed.
For "fix the grammar": Just provide the corrected text.
For "give me feedback": Provide detailed, specific feedback about their writing.
For "help me brainstorm": Give multiple ideas and suggestions.

Remember: Your job is to help them improve THEIR writing through whatever assistance they specifically request. Be their obedient writing partner who makes their work better, not someone who writes for them from scratch. Match your verbosity to their need - be brief for quick tasks, thorough for complex ones.`;
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
