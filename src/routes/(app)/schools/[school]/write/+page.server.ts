import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
// import { supabase } from '$lib/supabase';
import {
	getSchoolDisplayNameStrict,
	getSchoolUrlSafeNameStrict,
} from '$lib/utils/validation';

export const load: PageServerLoad = async ({ params }) => {
	const { school } = params;

	// Get the display name for the school from the URL-safe name
	let schoolDisplayName: string;
	try {
		if (!school || typeof school !== 'string' || school.trim().length === 0) {
			throw error(400, 'School parameter is required');
		}
		schoolDisplayName = await getSchoolDisplayNameStrict(school.trim());
	} catch (err) {
		console.error('Failed to resolve school display name:', err);
		throw error(400, 'Invalid school parameter');
	}

	return {
		school: schoolDisplayName,
	};
};

export const actions = {
	default: async ({ params, locals }) => {
		const { session } = await locals.safeGetSession();

		// This should never happen due to layout protection, but TypeScript safety
		if (!session?.user?.id) {
			throw error(401, 'Unauthorized');
		}

		const { school } = params;

		// Get the display name for the school from the URL-safe name
		let schoolDisplayName: string;
		try {
			if (!school || typeof school !== 'string' || school.trim().length === 0) {
				throw error(400, 'School parameter is required');
			}
			schoolDisplayName = await getSchoolDisplayNameStrict(school.trim());
		} catch (err) {
			console.error('Failed to resolve school display name:', err);
			throw error(400, 'Invalid school parameter');
		}

		// Create a new document with the specific school
		const { data: document, error: documentError } = await locals.supabase
			.from('documents')
			.insert({
				title: `[${schoolDisplayName} Essay]`,
				user_id: session.user.id,
				school: schoolDisplayName,
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
		const { error: updateError } = await locals.supabase
			.from('documents')
			.update({ current_version_id: version.id })
			.eq('id', document.id);

		if (updateError) {
			console.error(
				'Failed to update document with current version:',
				updateError,
			);
		}

		// Redirect to the new document (convert school name to URL-safe format)
		const schoolSlug = await getSchoolUrlSafeNameStrict(schoolDisplayName);
		throw redirect(
			303,
			`/schools/${schoolSlug}/write/${document.id}/${version.id}`,
		);
	},
} satisfies Actions;
