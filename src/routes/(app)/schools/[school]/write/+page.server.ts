import { error, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { supabase } from '$lib/supabase';
import { validateAndNormalizeSchool } from '$lib/utils/validation';

export const actions = {
	default: async ({ params, locals }) => {
		const { session } = await locals.safeGetSession();

		// This should never happen due to layout protection, but TypeScript safety
		if (!session?.user?.id) {
			throw error(401, 'Unauthorized');
		}

		const { school } = params;

		// Validate and normalize the school parameter
		let normalizedSchool: string;
		try {
			normalizedSchool = validateAndNormalizeSchool(school);
		} catch {
			throw error(400, 'Invalid school parameter');
		}

		// Create a new document with the specific school
		const { data: document, error: documentError } = await supabase
			.from('documents')
			.insert({
				title: `[${normalizedSchool.charAt(0).toUpperCase() + normalizedSchool.slice(1)} Essay]`,
				user_id: session.user.id,
				school: normalizedSchool,
			})
			.select()
			.single();

		if (documentError) {
			console.error('Failed to create document:', documentError);
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
			console.error('Failed to create initial version:', versionError);
			throw error(500, 'Failed to create initial version');
		}

		// Update document with current version ID
		const { error: updateError } = await supabase
			.from('documents')
			.update({ current_version_id: version.id })
			.eq('id', document.id);

		if (updateError) {
			console.error(
				'Failed to update document with current version:',
				updateError,
			);
		}

		// Redirect to the new document
		throw redirect(
			303,
			`/schools/${normalizedSchool}/write/${document.id}/${version.id}`,
		);
	},
} satisfies Actions;
