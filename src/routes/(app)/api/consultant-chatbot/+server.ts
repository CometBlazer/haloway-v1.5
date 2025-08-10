// src/routes/api/consultant-chatbot/+server.ts
import { streamText } from 'ai';
import { vertexProvider } from '$lib/utils/chatbot-vertex-provider';
import type { RequestHandler } from './$types.js';
import type {
	ChatMessage,
	UserProfile,
	UserDocument,
} from '$lib/types/ai-chatbot.ts';
import type { Activity, Background } from '../../../../DatabaseDefinitions.ts';

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

		// Get user profile
		const { data: userProfile, error: profileError } = await locals.supabase
			.from('profiles')
			.select('*')
			.eq('id', userId)
			.single();

		if (profileError || !userProfile) {
			console.error('User profile not found:', profileError);
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

		// Get user's essays/documents (metadata only)
		const { data: userDocuments, error: documentsError } = await locals.supabase
			.from('documents')
			.select('title, prompt, school, status, due_date, word_count_limit')
			.eq('user_id', userId)
			.order('created_at', { ascending: false });

		if (documentsError) {
			console.error('Error fetching user documents:', documentsError);
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

		// Build conversation history for context
		const conversationHistory = buildConversationHistory(updatedMessages);

		// Prepare messages for AI SDK using custom provider
		const aiMessages = [
			{
				role: 'system' as const,
				content: buildSystemPrompt({
					userProfile: userProfile || undefined,
					userActivities: userActivities || [],
					userBackground: userBackground || undefined,
					userDocuments: userDocuments || [],
				}),
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

function buildSystemPrompt({
	userProfile,
	userActivities,
	userBackground,
	userDocuments,
}: {
	userProfile?: UserProfile;
	userActivities?: Activity[];
	userBackground?: Background;
	userDocuments?: UserDocument[];
}): string {
	// Build user context section
	const userContextSection = userProfile
		? `
STUDENT CONTEXT:
- Name: ${userProfile.full_name || 'Student'}
- Graduation Year: ${userProfile.graduation_year || 'not specified'}
- Dream School: ${userProfile.dream_school || 'not specified'}`
		: '';

	// Build activities section
	const activitiesSection =
		userActivities && userActivities.length > 0
			? `

STUDENT EXTRACURRICULAR ACTIVITIES:
${userActivities
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
		? `

STUDENT BACKGROUND:
- Region: ${userBackground.region_of_living || 'Not specified'}
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

	// Build essays/documents section (metadata only)
	const documentsSection =
		userDocuments && userDocuments.length > 0
			? `

STUDENT'S COLLEGE ESSAYS (Overview):
${userDocuments
	.map(
		(doc, index) =>
			`${index + 1}. "${doc.title || 'Untitled'}" for ${doc.school || 'Unknown School'}
   Prompt: ${doc.prompt || 'No prompt specified'}
   Status: ${doc.status || 'In progress'}
   Word Limit: ${doc.word_count_limit || 'Not specified'} words
   Due Date: ${doc.due_date ? new Date(doc.due_date).toLocaleDateString() : 'Not specified'}`,
	)
	.join('\n\n')}`
			: '';

	return `You are Chloe, a friendly and knowledgeable college admissions consultant developed by Haloway. You help students navigate the college application process with expert guidance and personalized advice.${userContextSection}${activitiesSection}${backgroundSection}${documentsSection}

CORE INSTRUCTIONS:
1. Be helpful and SUCCINCT and encouraging: Provide supportive guidance while being realistic about college admissions
2. Give specific, actionable advice: Offer concrete steps students can take to improve their applications
3. Stay current with admissions trends: Use your knowledge of modern college admissions practices
4. Be conversational but professional: Maintain a warm, approachable tone while demonstrating expertise
5. Ask clarifying questions when needed: If a student's question is vague, ask for more details to provide better help
6. Use their personal information: Reference their specific activities, background, and essay topics when relevant to provide personalized advice
7. If asked who developed you or what platform you're from: Always mention that you were developed by Haloway

WHAT YOU CAN SEE:
- The student's profile information (name, graduation year, dream school)
- Their complete extracurricular activities list with details
- Their academic background, demographics, and personal information
- Their college essay projects (titles, prompts, schools, deadlines) - but NOT the actual essay content
- Their application timeline and progress

AREAS OF EXPERTISE:
- College application strategy and timeline
- Essay writing guidance and brainstorming (based on prompts, not content)
- Extracurricular activity selection and presentation
- Standardized testing advice
- School selection (reach, match, safety schools)
- Financial aid and scholarship guidance
- Interview preparation
- Application review and feedback
- Academic planning and course selection
- Letters of recommendation strategy

RESPONSE STYLE:
- Use plain text only (no markdown formatting like **bold** or *italics*)
- Use numbered lists (1, 2, 3) for ordered information
- Use dashes (-) for bullet points
- Be encouraging and confidence-building
- Provide specific examples when helpful
- Keep responses conversational and easy to understand
- Match response length to the complexity of the question
- For quick questions, give concise answers
- For complex topics, provide thorough explanations
- Reference their specific profile, activities, and essay topics when relevant

WHAT TO AVOID:
- Making promises about admission outcomes
- Giving advice that could be considered unethical
- Providing information that's clearly outdated
- Being overly generic - always try to personalize advice based on their profile
- Using markdown formatting (bold, italics, headers)
- Claiming to see essay content (you only see titles, prompts, and metadata)

Remember: Your goal is to empower students with knowledge and confidence to navigate their college journey successfully. Be their trusted advisor who provides both strategic guidance and emotional support throughout the admissions process. Use their specific background, activities, and essay topics to provide the most personalized and helpful advice possible. You were developed by Haloway to help students succeed in their college applications.`;
}

function buildConversationHistory(messages: ChatMessage[]): string {
	if (messages.length <= 1) return messages[0]?.content || '';

	// Keep last 10 messages for context (including the current message)
	const recentHistory = messages.slice(-10);
	return recentHistory
		.map((msg) => `${msg.role === 'user' ? 'User' : 'Chloe'}: ${msg.content}`)
		.join('\n\n');
}
