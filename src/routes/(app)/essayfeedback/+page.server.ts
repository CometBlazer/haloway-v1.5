// src/routes/(app)/essayfeedback/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
// import { supabase } from '$lib/supabase';

export const load: PageServerLoad = async () => {
	/*
	const { session } = await locals.safeGetSession();

	if (!session?.user?.id) {
		throw error(401, 'Unauthorized');
	}

	// Create a new uncategorized essay document
	const { data: document, error: documentError } = await locals.supabase
		.from('documents')
		.insert({
			title: 'New Essay with AI Feedback',
			user_id: session.user.id,
			school: 'Uncategorized',
		})
		.select()
		.single();

	if (documentError) {
		console.error('Failed to create document:', documentError);
		throw error(500, 'Failed to create document');
	}

	// Create initial version
	const { data: version, error: versionError } = await locals.supabase
		.from('document_versions')
		.insert({
			document_id: document.id,
			version_name: 'Version 1',
			content: {
				type: 'doc',
				content: [],
			},
			created_by: session.user.id,
		})
		.select()
		.single();

	if (versionError) {
		console.error('Failed to create version:', versionError);
		throw error(500, 'Failed to create document version');
	}

	// Update the document with the new current version
	const { error: updateError } = await locals.supabase
		.from('documents')
		.update({ current_version_id: version.id })
		.eq('id', document.id);

	if (updateError) {
		console.error('Failed to update document:', updateError);
	}

	// Redirect to the new version with #feedback fragment
	throw redirect(
		303,
		`/schools/uncategorized/write/${document.id}/${version.id}#feedback`,
	);

	*/
	// Redirect to the external URL
	throw redirect(303, 'https://dan.haloway.co');
};
