import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { supabase } from '$lib/supabase';
import { validateAndNormalizeSchoolSlug } from '$lib/utils/validation';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { session } = await locals.safeGetSession();

	if (!session?.user?.id) {
		throw error(401, 'Unauthorized');
	}

	const { school, documentId } = params;

	// Validate and normalize the school slug parameter
	let normalizedSchool: string;
	try {
		normalizedSchool = validateAndNormalizeSchoolSlug(school);
	} catch {
		throw error(400, 'Invalid school parameter');
	}

	// Get the document and verify ownership and school
	const { data: document, error: documentError } = await supabase
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
	if (document.school?.toLowerCase() !== normalizedSchool.toLowerCase()) {
		throw error(404, 'Document not found in this school');
	}

	// If there's no current version, redirect to create one
	if (!document.current_version_id) {
		// Create a new version for this document
		const { data: version, error: versionError } = await supabase
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
		const { error: updateError } = await supabase
			.from('documents')
			.update({ current_version_id: version.id })
			.eq('id', documentId);

		if (updateError) {
			console.error('Failed to update document:', updateError);
		}

		// Redirect to the new version
		throw redirect(
			303,
			`/schools/${normalizedSchool}/write/${documentId}/${version.id}`,
		);
	}

	// Redirect to the current version
	throw redirect(
		303,
		`/schools/${normalizedSchool}/write/${documentId}/${document.current_version_id}`,
	);
};
