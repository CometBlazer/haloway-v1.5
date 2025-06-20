import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { supabase } from '$lib/supabase';
import { validateAndNormalizeSchoolSlug } from '$lib/utils/validation';

export const load: PageServerLoad = async ({ params, locals }) => {
	// Session is already validated by the layout, no need to check again
	const { session } = await locals.safeGetSession();

	// This should never happen due to layout protection, but TypeScript safety
	if (!session?.user?.id) {
		throw error(401, 'Unauthorized');
	}

	const { school } = params;
	// Validate and normalize the school slug parameter
	let normalizedSchool: string;
	try {
		normalizedSchool = validateAndNormalizeSchoolSlug(school);
	} catch {
		throw error(400, 'Invalid school parameter');
	}

	try {
		// Get all documents for the user with the specific school (case-insensitive)
		const { data: documents, error: documentsError } = await supabase
			.from('documents')
			.select('*')
			.eq('user_id', session.user.id)
			.ilike('school', normalizedSchool) // Case-insensitive matching
			.order('updated_at', { ascending: false });

		if (documentsError) {
			console.error('Failed to load documents:', documentsError);
			throw error(500, 'Failed to load documents');
		}

		// For each document, get its current version and total version count
		const documentsWithVersionInfo = await Promise.all(
			(documents || []).map(async (doc) => {
				// Get current version if current_version_id exists
				let currentVersion = null;
				if (doc.current_version_id) {
					const { data: versionData } = await supabase
						.from('document_versions')
						.select('*')
						.eq('id', doc.current_version_id)
						.single();
					currentVersion = versionData;
				}

				// Get total version count for this document
				const { count } = await supabase
					.from('document_versions')
					.select('*', { count: 'exact', head: true })
					.eq('document_id', doc.id);

				return {
					...doc,
					current_version: currentVersion,
					versions_count: count || 0,
				};
			}),
		);

		return {
			documents: documentsWithVersionInfo,
			school: normalizedSchool,
			session,
		};
	} catch (err) {
		console.error('School dashboard load error:', err);
		throw error(500, 'Failed to load school dashboard');
	}
};

export const actions = {
	deleteDocument: async ({ request, locals }) => {
		const { session } = await locals.safeGetSession();
		if (!session?.user?.id) {
			throw error(401, 'Unauthorized');
		}

		const formData = await request.formData();
		const documentId = formData.get('documentId') as string;

		if (!documentId) {
			throw error(400, 'Document ID is required');
		}

		// Verify document ownership
		const { data: document, error: docError } = await supabase
			.from('documents')
			.select('id, user_id')
			.eq('id', documentId)
			.single();

		if (docError || !document) {
			throw error(404, 'Document not found');
		}

		if (document.user_id !== session.user.id) {
			throw error(403, "You don't have permission to delete this document");
		}

		// Delete document (cascades to versions and tags due to foreign key constraints)
		const { error: deleteError } = await supabase
			.from('documents')
			.delete()
			.eq('id', documentId);

		if (deleteError) {
			throw error(500, `Failed to delete document: ${deleteError.message}`);
		}

		return { success: true };
	},
};
