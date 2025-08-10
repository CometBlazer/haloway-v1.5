// src/routes/(app)/api/clear-consultant-messages/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';

export const DELETE: RequestHandler = async ({ locals }) => {
	try {
		// Get session using the same pattern as your other APIs
		const { session } = await locals.safeGetSession();
		if (!session?.user?.id) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const userId = session.user.id;

		// Clear the message_history for the user's consultant chat
		const { error: updateError } = await locals.supabase
			.from('consultant_chat')
			.update({
				message_history: [],
				updated_at: new Date(),
			})
			.eq('user_id', userId);

		if (updateError) {
			console.error('Failed to clear consultant messages:', updateError);
			return json({ error: 'Failed to clear messages' }, { status: 500 });
		}

		console.log('Successfully cleared consultant messages for user:', userId);

		return json({
			success: true,
			message: 'Messages cleared successfully',
		});
	} catch (error) {
		console.error('Clear Consultant Messages API Error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
