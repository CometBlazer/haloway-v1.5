// src/routes/(app)/api/document-messages-get/[documentId]/+server.ts
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

		// Parse the chatbot_messages if it's a string
		let messages = document.chatbot_messages || [];
		if (typeof messages === 'string') {
			try {
				messages = JSON.parse(messages);
			} catch (error) {
				console.error('Failed to parse chatbot_messages:', error);
				messages = [];
			}
		}

		console.log('Loaded messages from DB:', messages); // Debug log

		return json({
			success: true,
			messages: messages,
		});
	} catch (error) {
		console.error('Load Chat Messages API Error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

// Add the DELETE handler
export const DELETE: RequestHandler = async ({ locals, params }) => {
	try {
		// Get session using the same pattern as your other APIs
		const { session } = await locals.safeGetSession();
		if (!session?.user?.id) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { documentId } = params;
		const userId = session.user.id;

		if (!documentId) {
			return json({ error: 'Document ID is required' }, { status: 400 });
		}

		// Verify document ownership first
		const { data: document, error: docError } = await locals.supabase
			.from('documents')
			.select('user_id')
			.eq('id', documentId)
			.single();

		if (docError || !document) {
			console.error('Document not found:', docError);
			return json({ error: 'Document not found' }, { status: 404 });
		}

		if (document.user_id !== userId) {
			return json({ error: 'Access denied' }, { status: 403 });
		}

		// Clear the chatbot_messages for this document
		const { error: updateError } = await locals.supabase
			.from('documents')
			.update({
				chatbot_messages: [],
				updated_at: new Date(),
			})
			.eq('id', documentId)
			.eq('user_id', userId); // Extra security check

		if (updateError) {
			console.error('Failed to clear document messages:', updateError);
			return json({ error: 'Failed to clear messages' }, { status: 500 });
		}

		console.log('Successfully cleared messages for document:', documentId);

		return json({
			success: true,
			message: 'Messages cleared successfully',
		});
	} catch (error) {
		console.error('Clear Document Messages API Error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
