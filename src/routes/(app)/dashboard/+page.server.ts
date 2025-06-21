import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { supabase } from '$lib/supabase';

export const load: PageServerLoad = async ({ locals }) => {
	// Session is already validated by the layout, no need to check again
	const { session } = await locals.safeGetSession();

	// This should never happen due to layout protection, but TypeScript safety
	if (!session?.user?.id) {
		throw error(401, 'Unauthorized');
	}

	try {
		// First, get all documents for the user
		const { data: documents, error: documentsError } = await supabase
			.from('documents')
			.select('*')
			.eq('user_id', session.user.id)
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
			session,
		};
	} catch (err) {
		console.error('Dashboard load error:', err);
		throw error(500, 'Failed to load dashboard');
	}
};

export const actions = {
	signout: async ({ locals: { supabase, safeGetSession } }) => {
		const { session } = await safeGetSession();
		if (session) {
			await supabase.auth.signOut();
			return { type: 'redirect', location: '/' };
		}
	},
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

	updateProfile: async ({ request, locals }) => {
		const { session } = await locals.safeGetSession();
		if (!session?.user?.id) {
			return fail(401, { errorMessage: 'Unauthorized' });
		}

		const formData = await request.formData();
		const fullName = formData.get('fullName') as string;
		const grade = formData.get('grade') as string;
		const referralSource = formData.get('referralSource') as string;
		const dreamSchool = formData.get('dreamSchool') as string;

		// Validation
		const errorFields: string[] = [];

		if (!fullName?.trim()) {
			errorFields.push('fullName');
		}
		if (!grade?.trim()) {
			errorFields.push('grade');
		}
		if (!referralSource?.trim()) {
			errorFields.push('referralSource');
		}

		if (errorFields.length > 0) {
			return fail(400, {
				errorMessage: 'Please fill in all required fields',
				errorFields,
				fullName,
				grade,
				referralSource,
				dreamSchool,
			});
		}

		// Update profile
		const { error: updateError } = await locals.supabaseServiceRole
			.from('profiles')
			.update({
				full_name: fullName.trim(),
				grade: grade.trim(),
				referral_source: referralSource.trim(),
				dream_school: dreamSchool?.trim() || null,
				updated_at: new Date(),
			})
			.eq('id', session.user.id);

		if (updateError) {
			console.error('Failed to update profile:', updateError);
			return fail(500, {
				errorMessage: 'Failed to update profile. Please try again.',
				fullName,
				grade,
				referralSource,
				dreamSchool,
			});
		}

		return { success: true };
	},

	createDocument: async ({ request, locals }) => {
		const { session } = await locals.safeGetSession();
		if (!session?.user?.id) {
			throw error(401, 'Unauthorized');
		}

		const formData = await request.formData();
		const school = formData.get('school') as string;
		const title = formData.get('title') as string;
		const prompt = formData.get('prompt') as string;
		const dueDate = formData.get('dueDate') as string;
		const status = formData.get('status') as string;

		if (!school || typeof school !== 'string' || school.trim().length === 0) {
			return fail(400, { error: { message: 'School is required' } });
		}

		try {
			// Create document
			const { data: document, error: documentError } = await supabase
				.from('documents')
				.insert({
					title: title?.trim() || `[${school.trim()} Essay]`,
					user_id: session.user.id,
					school: school.trim(),
					prompt: prompt?.trim() || null,
					due_date: dueDate ? new Date(dueDate) : null,
					status: status || 'not-started',
				})
				.select()
				.single();

			if (documentError) {
				console.error('Failed to create document:', documentError);
				return fail(500, { error: { message: 'Failed to create document' } });
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
				console.error('Failed to create version:', versionError);
				return fail(500, {
					error: { message: 'Failed to create document version' },
				});
			}

			// Update document with current version
			const { error: updateError } = await supabase
				.from('documents')
				.update({ current_version_id: version.id })
				.eq('id', document.id);

			if (updateError) {
				console.error('Failed to update document:', updateError);
			}

			return {
				type: 'success',
				data: { documentId: document.id },
			};
		} catch (err) {
			console.error('Document creation error:', err);
			return fail(500, { error: { message: 'Failed to create document' } });
		}
	},
};
