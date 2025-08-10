// src/routes/api/consultant-messages-get/+server.ts
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
		// eslint-disable-next-line prefer-const
		let { data: chat, error: chatError } = await locals.supabase
			.from('consultant_chat')
			.select('user_id, message_history')
			.eq('user_id', session.user.id)
			.single();

		// If chat doesn't exist, create one
		if (chatError || !chat) {
			console.log(
				'Chat not found, creating new chat for user:',
				session.user.id,
			);

			const { data: newChat, error: createError } = await locals.supabase
				.from('consultant_chat')
				.insert({
					id: crypto.randomUUID(),
					user_id: session.user.id,
					title: 'Consultant Chat',
					visibility: 'private',
					message_history: [],
				})
				.select('user_id, message_history')
				.single();

			if (createError || !newChat) {
				console.error('Failed to create chat:', createError);
				return json({ error: 'Failed to create chat' }, { status: 500 });
			}

			chat = newChat;
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
