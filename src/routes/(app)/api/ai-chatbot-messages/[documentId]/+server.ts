// src/routes/api/ai-chatbot-messages/[documentId]/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = async ({ params, locals }) => {
	try {
		// Get session using the same pattern as your +page.server.ts
		const { session } = await locals.safeGetSession();
		if (!session?.user?.id) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { documentId } = params;

		if (!documentId) {
			return json({ error: 'Document ID is required' }, { status: 400 });
		}

		// Verify document ownership first (same pattern as your server actions)
		const { data: document, error: docError } = await locals.supabase
			.from('documents')
			.select('user_id, chatbot_messages')
			.eq('id', documentId)
			.single();

		if (docError || !document) {
			console.error('Document not found:', docError);
			return json({ error: 'Document not found' }, { status: 404 });
		}

		if (document.user_id !== session.user.id) {
			return json({ error: 'Access denied' }, { status: 403 });
		}

		return json({
			success: true,
			messages: document.chatbot_messages || [],
		});
	} catch (error) {
		console.error('Load Chat Messages API Error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
