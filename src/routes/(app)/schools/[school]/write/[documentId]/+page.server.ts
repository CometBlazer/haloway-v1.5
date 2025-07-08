import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
// import { supabase } from '$lib/supabase';
import {
	getSchoolDisplayNameStrict,
	getSchoolUrlSafeNameStrict,
} from '$lib/utils/validation';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { session } = await locals.safeGetSession();

	if (!session?.user?.id) {
		throw error(401, 'Unauthorized');
	}

	const { school, documentId } = params;

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

	// Get the document and verify ownership and school
	const { data: document, error: documentError } = await locals.supabase
		.from('documents')
		.select('id, user_id, current_version_id, school')
		.eq('id', documentId)
		.single();

	if (documentError || !document) {
		throw error(404, 'Document not found');
	}

	// Verify ownership
	if (document.user_id !== session.user.id) {
		throw error(403, 'Access denied');
	}

	// Verify the document belongs to the specified school (case-insensitive)
	if (document.school?.toLowerCase() !== schoolDisplayName.toLowerCase()) {
		throw error(404, 'Document not found in this school');
	}

	// If there's no current version, redirect to create one
	if (!document.current_version_id) {
		// Create a new version for this document
		const { data: version, error: versionError } = await locals.supabase
			.from('document_versions')
			.insert({
				document_id: documentId,
				version_name: 'Version 1',
				content: '',
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
			.eq('id', documentId);

		if (updateError) {
			console.error('Failed to update document:', updateError);
		}

		// Get the URL-safe name for redirect
		const schoolUrlSafeName =
			await getSchoolUrlSafeNameStrict(schoolDisplayName);

		// Redirect to the new version
		throw redirect(
			303,
			`/schools/${schoolUrlSafeName}/write/${documentId}/${version.id}`,
		);
	}

	// Get the URL-safe name for redirect
	const schoolUrlSafeName = await getSchoolUrlSafeNameStrict(schoolDisplayName);

	// Redirect to the current version
	throw redirect(
		303,
		`/schools/${schoolUrlSafeName}/write/${documentId}/${document.current_version_id}`,
	);
};
