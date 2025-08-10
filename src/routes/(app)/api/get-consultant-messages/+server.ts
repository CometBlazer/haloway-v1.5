import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = async ({ locals }) => {
	try {
		// Get session using the same pattern as your +page.server.ts
		const { session } = await locals.safeGetSession();
		if (!session?.user?.id) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Get the user's chat (assuming one chat per user for now)
		const { data: chat, error: chatError } = await locals.supabase
			.from('consultant_chat')
			.select('user_id, message_history')
			.eq('user_id', session.user.id)
			.single();

		if (chatError || !chat) {
			console.error('Chat not found:', chatError);
			return json({ error: 'Chat not found' }, { status: 404 });
		}

		// Parse the message_history if it's a string
		let messages = chat.message_history || [];
		if (typeof messages === 'string') {
			try {
				messages = JSON.parse(messages);
			} catch (error) {
				console.error('Failed to parse message_history:', error);
				messages = [];
			}
		}

		console.log('Loaded messages from consultant_chat:', messages); // Debug log

		return json({
			success: true,
			messages: messages,
		});
	} catch (error) {
		console.error('Load Chat Messages API Error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
