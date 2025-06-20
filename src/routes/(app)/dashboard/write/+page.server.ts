// src/routes/(admin)/dashboard/(menu)/write/+page.server.ts
import { error, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { supabase } from '$lib/supabase';
import { getDefaultSchool } from '$lib/utils/validation';

export const actions = {
	default: async ({ locals }) => {
		const { session } = await locals.safeGetSession();

		// This should never happen due to layout protection, but TypeScript safety
		if (!session?.user?.id) {
			throw error(401, 'Unauthorized');
		}

		// Create a new document
		const { data: document, error: documentError } = await supabase
			.from('documents')
			.insert({
				title: '[List your school here and name your essay]',
				user_id: session.user.id,
				school: getDefaultSchool(), // Add default school value
			})
			.select()
			.single();

		if (documentError) {
			throw error(500, 'Failed to create document');
		}

		// Create initial version
		const { data: version, error: versionError } = await supabase
			.from('document_versions')
			.insert({
				document_id: document.id,
				version_name: 'Version 1',
				content: '',
				created_by: session.user.id,
			})
			.select()
			.single();

		if (versionError) {
			throw error(500, 'Failed to create initial version');
		}

		// Redirect to the new document
		throw redirect(303, `/dashboard/write/${document.id}/${version.id}`);
	},
} satisfies Actions;
