// src/routes/(admin)/account/(menu)/write/[documentId]/[versionId]/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { supabase } from '$lib/supabase';
import dayjs from 'dayjs';
import type {
	Database,
	ComponentTag,
	ComponentVersion,
} from './../../../../../../DatabaseDefinitions.ts';
import type { PostgrestError } from '@supabase/supabase-js';

type DocumentVersion = Database['public']['Tables']['document_versions']['Row'];
type DocumentWithTags = Database['public']['Tables']['documents']['Row'] & {
	tags: Array<{
		tag: Database['public']['Tables']['tags']['Row'];
	}>;
};

export const load: PageServerLoad = async ({ params, locals }) => {
	const { documentId, versionId } = params;
	const { session } = await locals.safeGetSession();

	// This should never happen due to layout protection, but TypeScript safety
	if (!session?.user?.id) {
		throw error(401, 'Unauthorized');
	}

	// Get document and its tags
	const { data: document, error: documentError } = (await supabase
		.from('documents')
		.select(
			`
      *,
      tags:document_tags(
        tag:tags(*)
      )
    `,
		)
		.eq('id', documentId)
		.single()) as {
		data: DocumentWithTags | null;
		error: PostgrestError | null;
	};

	if (documentError || !document) {
		throw error(404, 'Document not found');
	}

	if (document.user_id !== session.user.id) {
		throw error(403, 'Forbidden');
	}

	// Fix the due_date if it exists
	if (document.due_date) {
		if (typeof document.due_date === 'string') {
			// Parse as local date to avoid timezone issues
			const datePart = (document.due_date as string).split('T')[0];
			document.due_date = dayjs(datePart)
				.hour(12)
				.minute(0)
				.second(0)
				.millisecond(0)
				.toDate();
		} else if (document.due_date instanceof Date) {
			// If it's already a Date object but has timezone issues, recreate it
			const dateStr = document.due_date.toISOString().split('T')[0];
			document.due_date = dayjs(dateStr)
				.hour(12)
				.minute(0)
				.second(0)
				.millisecond(0)
				.toDate();
		}
	}

	// Get all versions of the document, sorted by updated_at desc (most recent first)
	const { data: versions, error: versionsError } = await supabase
		.from('document_versions')
		.select('*')
		.eq('document_id', documentId)
		.order('updated_at', { ascending: false });

	if (versionsError) {
		throw error(500, 'Failed to load versions');
	}

	// Get the requested version or most recent version
	const requestedVersion = versions.find(
		(v: DocumentVersion) => v.id === versionId,
	);
	const currentVersion = requestedVersion || versions[0];

	if (!currentVersion) {
		throw error(404, 'Version not found');
	}

	// Update document's current_version_id if it's different
	if (document.current_version_id !== currentVersion.id) {
		const { error: updateError } = await supabase
			.from('documents')
			.update({ current_version_id: currentVersion.id })
			.eq('id', documentId);

		if (updateError) {
			console.error('Failed to update current_version_id:', updateError);
		} else {
			console.log('Updated current_version_id to:', currentVersion.id);
		}
	}

	// Transform tags for component usage
	const transformedTags: ComponentTag[] = document.tags.map(
		(t: { tag: Database['public']['Tables']['tags']['Row'] }) => ({
			id: t.tag.id,
			name: t.tag.label, // Transform label to name
			color: t.tag.color || '#3b82f6', // Ensure color is never null
			type: t.tag.type,
			created_at: t.tag.created_at,
			updated_at: t.tag.updated_at,
			created_by: t.tag.created_by,
		}),
	);

	// Transform versions for component usage
	const transformedVersions: ComponentVersion[] = versions.map(
		(v: DocumentVersion) => ({
			id: v.id,
			version_name: v.version_name || 'Untitled Version', // Ensure non-null
			created_at: v.created_at
				? typeof v.created_at === 'string'
					? v.created_at
					: v.created_at.toISOString()
				: new Date().toISOString(), // Convert Date to string
			updated_at: v.updated_at
				? typeof v.updated_at === 'string'
					? v.updated_at
					: v.updated_at.toISOString()
				: new Date().toISOString(), // Convert Date to string
			created_by: v.created_by || session.user.id, // Ensure non-null
			document_id: v.document_id,
			content: v.content,
		}),
	);

	// Transform current version for component usage
	const transformedCurrentVersion: ComponentVersion = {
		id: currentVersion.id,
		version_name: currentVersion.version_name || 'Untitled Version',
		created_at: currentVersion.created_at
			? typeof currentVersion.created_at === 'string'
				? currentVersion.created_at
				: currentVersion.created_at.toISOString()
			: new Date().toISOString(),
		updated_at: currentVersion.updated_at
			? typeof currentVersion.updated_at === 'string'
				? currentVersion.updated_at
				: currentVersion.updated_at.toISOString()
			: new Date().toISOString(),
		created_by: currentVersion.created_by || session.user.id,
		document_id: currentVersion.document_id,
		content: currentVersion.content,
	};

	return {
		document: {
			...document,
			tags: transformedTags,
			word_count_limit: document.word_count_limit || 250, // Default to 250 if null
			due_date: document.due_date, // This will now be the corrected date
		},
		currentVersion: transformedCurrentVersion,
		versions: transformedVersions,
		session,
	};
};

export const actions: Actions = {
	updateDocument: async ({ request, locals, params }) => {
		const { session } = await locals.safeGetSession();
		if (!session?.user?.id) {
			throw error(401, 'Unauthorized');
		}

		const formData = await request.formData();
		const title = formData.get('title') as string;
		const prompt = formData.get('prompt') as string;
		const wordCountLimit = formData.get('wordCountLimit') as string;
		const status = formData.get('status') as string;
		const dueDate = formData.get('dueDate') as string;
		const documentId = params.documentId;

		const updateData: Partial<
			Pick<
				Database['public']['Tables']['documents']['Update'],
				'title' | 'prompt' | 'word_count_limit' | 'status' | 'due_date'
			>
		> = {};

		if (title !== null) updateData.title = title;
		if (prompt !== null) updateData.prompt = prompt;
		if (wordCountLimit !== null) {
			const limit = parseInt(wordCountLimit, 10);
			if (!isNaN(limit) && limit > 0 && limit <= 10000) {
				updateData.word_count_limit = limit;
			}
		}
		if (status !== null) updateData.status = status;
		if (dueDate !== null) {
			if (dueDate) {
				// Parse the date correctly to avoid timezone issues using dayjs
				const datePart = dueDate.split('T')[0];
				updateData.due_date = dayjs(datePart)
					.hour(12)
					.minute(0)
					.second(0)
					.millisecond(0)
					.toDate();
			} else {
				updateData.due_date = null;
			}
		}

		const { error: updateError } = await supabase
			.from('documents')
			.update(updateData)
			.eq('id', documentId)
			.eq('user_id', session.user.id);

		if (updateError) {
			throw error(500, 'Failed to update document');
		}

		return { success: true };
	},

	createVersion: async ({ request, locals, params }) => {
		const { session } = await locals.safeGetSession();
		if (!session?.user?.id) {
			throw error(401, 'Unauthorized');
		}

		const formData = await request.formData();
		const name = formData.get('name') as string;
		const documentId = params.documentId;

		// Get current version content to copy it to the new checkpoint
		const { data: currentDoc } = await supabase
			.from('documents')
			.select('current_version_id')
			.eq('id', documentId)
			.single();

		let contentToCopy = {
			type: 'doc',
			content: [],
		} as Database['public']['Tables']['document_versions']['Insert']['content']; // Default empty content

		if (currentDoc?.current_version_id) {
			const { data: currentVersion } = await supabase
				.from('document_versions')
				.select('content')
				.eq('id', currentDoc.current_version_id)
				.single();

			if (currentVersion?.content) {
				contentToCopy =
					currentVersion.content as Database['public']['Tables']['document_versions']['Insert']['content'];
			}
		}

		const versionData: Database['public']['Tables']['document_versions']['Insert'] =
			{
				document_id: documentId,
				version_name: name,
				content: contentToCopy, // Copy current content instead of empty
				created_by: session.user.id,
				updated_at: new Date(),
			};

		const { data: version, error: versionError } = await supabase
			.from('document_versions')
			.insert(versionData)
			.select()
			.single();

		if (versionError) {
			throw error(500, 'Failed to create version');
		}

		// Update document's current_version_id to the new version
		const { error: updateDocError } = await supabase
			.from('documents')
			.update({ current_version_id: version.id })
			.eq('id', documentId);

		if (updateDocError) {
			console.error(
				'Failed to update current_version_id after creation:',
				updateDocError,
			);
		}

		return { version };
	},

	updateVersion: async ({ request, locals, params }) => {
		try {
			const { session } = await locals.safeGetSession();
			if (!session?.user?.id) {
				throw error(401, 'Unauthorized');
			}

			const formData = await request.formData();
			const content = formData.get('content') as string;
			const versionId = params.versionId;

			console.log('=== updateVersion Debug Info ===');
			console.log('versionId:', versionId);
			console.log('documentId:', params.documentId);
			console.log('userId:', session.user.id);
			console.log('content length:', content?.length || 0);

			// Validate inputs
			if (!versionId) {
				console.error('Missing versionId');
				throw error(400, 'Version ID is required');
			}

			if (!content) {
				console.error('Missing content');
				throw error(400, 'Content is required');
			}

			// Parse content as JSON
			let contentJson;
			try {
				contentJson = JSON.parse(content);
			} catch (parseError) {
				console.error('Invalid JSON content:', parseError);
				throw error(400, 'Invalid content format');
			}

			// First, check if version exists and get document info
			console.log('Checking version existence...');
			const { data: versionData, error: versionError } = await supabase
				.from('document_versions')
				.select('id, document_id')
				.eq('id', versionId)
				.single();

			if (versionError || !versionData) {
				console.error('Version not found:', versionError);
				throw error(404, 'Version not found');
			}

			console.log('Version found:', versionData);

			// Check if user owns the document
			console.log('Checking document ownership...');
			if (!versionData.document_id) {
				throw error(400, 'Invalid document ID');
			}

			const { data: documentData, error: documentError } = await supabase
				.from('documents')
				.select('id, user_id')
				.eq('id', versionData.document_id)
				.single();

			if (documentError || !documentData) {
				console.error('Document not found:', documentError);
				throw error(404, 'Document not found');
			}

			if (documentData.user_id !== session.user.id) {
				console.error("User doesn't own document");
				throw error(403, "You don't have permission to edit this document");
			}

			console.log('Permission check passed');

			// Update the version with new updated_at timestamp
			console.log('Updating version content...');
			const { error: updateError } = await supabase
				.from('document_versions')
				.update({
					content: contentJson,
					updated_at: new Date(), // Always update the timestamp when content changes
				})
				.eq('id', versionId);

			if (updateError) {
				console.error('Update failed:', updateError);
				throw error(500, `Failed to update: ${updateError.message}`);
			}

			// Update document's current_version_id to ensure it's set
			const { error: updateDocError } = await supabase
				.from('documents')
				.update({ current_version_id: versionId })
				.eq('id', versionData.document_id);

			if (updateDocError) {
				console.error('Failed to update current_version_id:', updateDocError);
			} else {
				console.log('Updated current_version_id to:', versionId);
			}

			console.log('Update successful!');
			return {
				success: true,
				message: 'Content saved successfully',
			};
		} catch (err) {
			console.error('=== updateVersion Error ===');
			console.error('Error type:', typeof err);
			console.error('Error:', err);
			console.error(
				'Stack:',
				err instanceof Error ? err.stack : 'No stack trace available',
			);

			// If it's already a SvelteKit error, re-throw it
			if (err && typeof err === 'object' && 'status' in err) {
				throw err;
			}

			// Otherwise, create a generic server error
			throw error(
				500,
				`Server error: ${err instanceof Error ? err.message : 'Unknown error'}`,
			);
		}
	},

	renameVersion: async ({ request, locals, params }) => {
		try {
			const { session } = await locals.safeGetSession();
			if (!session?.user?.id) {
				throw error(401, 'Unauthorized');
			}

			const formData = await request.formData();
			const name = formData.get('name') as string;
			// Check for both possible parameter names
			const versionId =
				(formData.get('renameVersionId') as string) || params.versionId;

			console.log('Renaming version:', versionId, 'to:', name);

			if (!versionId) {
				throw error(400, 'Version ID is required');
			}

			// First, check if version exists and get document info
			const { data: versionData, error: versionError } = await supabase
				.from('document_versions')
				.select('id, document_id')
				.eq('id', versionId)
				.single();

			if (versionError || !versionData) {
				console.error('Version not found:', versionError);
				throw error(404, 'Version not found');
			}

			// Check if user owns the document
			if (!versionData.document_id) {
				throw error(400, 'Invalid document ID');
			}

			const { data: documentData, error: documentError } = await supabase
				.from('documents')
				.select('id, user_id')
				.eq('id', versionData.document_id)
				.single();

			if (documentError || !documentData) {
				console.error('Document not found:', documentError);
				throw error(404, 'Document not found');
			}

			if (documentData.user_id !== session.user.id) {
				console.error("User doesn't own document");
				throw error(403, "You don't have permission to edit this document");
			}

			// Update the version name
			const { error: updateError } = await supabase
				.from('document_versions')
				.update({ version_name: name })
				.eq('id', versionId);

			if (updateError) {
				console.error('Rename failed:', updateError);
				throw error(500, `Failed to rename: ${updateError.message}`);
			}

			console.log('Rename successful!');
			return { success: true };
		} catch (err) {
			console.error('renameVersion error:', err);

			if (err && typeof err === 'object' && 'status' in err) {
				throw err;
			}

			throw error(
				500,
				`Server error: ${err instanceof Error ? err.message : 'Unknown error'}`,
			);
		}
	},

	duplicateVersion: async ({ request, locals, params }) => {
		try {
			const { session } = await locals.safeGetSession();
			if (!session?.user?.id) {
				throw error(401, 'Unauthorized');
			}

			const formData = await request.formData();
			const sourceVersionId = formData.get('sourceVersionId') as string;
			const documentId = params.documentId;

			console.log(
				'Duplicating version:',
				sourceVersionId,
				'in document:',
				documentId,
			);

			// Get source version and verify ownership
			const { data: sourceVersion, error: sourceError } = await supabase
				.from('document_versions')
				.select('*')
				.eq('id', sourceVersionId)
				.single();

			if (sourceError || !sourceVersion) {
				console.error('Source version not found:', sourceError);
				throw error(404, 'Source version not found');
			}

			// Check if user owns the document
			const { data: documentData, error: documentError } = await supabase
				.from('documents')
				.select('id, user_id')
				.eq('id', documentId)
				.single();

			if (documentError || !documentData) {
				console.error('Document not found:', documentError);
				throw error(404, 'Document not found');
			}

			if (documentData.user_id !== session.user.id) {
				console.error("User doesn't own document");
				throw error(403, "You don't have permission to edit this document");
			}

			// Create new version with current timestamp
			const { data: newVersion, error: createError } = await supabase
				.from('document_versions')
				.insert({
					document_id: documentId,
					version_name: `${sourceVersion.version_name || 'Untitled'} (Copy)`,
					content: sourceVersion.content,
					created_by: session.user.id,
					updated_at: new Date(), // Set current time as updated_at
				})
				.select()
				.single();

			if (createError) {
				console.error('Create failed:', createError);
				throw error(500, `Failed to duplicate: ${createError.message}`);
			}

			// Update document's current_version_id to the new version
			const { error: updateDocError } = await supabase
				.from('documents')
				.update({ current_version_id: newVersion.id })
				.eq('id', documentId);

			if (updateDocError) {
				console.error(
					'Failed to update current_version_id after duplication:',
					updateDocError,
				);
			}

			console.log('Duplicate successful!');
			return { version: newVersion };
		} catch (err) {
			console.error('duplicateVersion error:', err);

			if (err && typeof err === 'object' && 'status' in err) {
				throw err;
			}

			throw error(
				500,
				`Server error: ${err instanceof Error ? err.message : 'Unknown error'}`,
			);
		}
	},

	deleteVersion: async ({ request, locals }) => {
		try {
			const { session } = await locals.safeGetSession();
			if (!session?.user?.id) {
				throw error(401, 'Unauthorized');
			}

			const formData = await request.formData();
			const versionId = formData.get('versionId') as string;

			console.log('Deleting version:', versionId);

			// First, check if version exists and get document info
			const { data: versionData, error: versionError } = await supabase
				.from('document_versions')
				.select('id, document_id')
				.eq('id', versionId)
				.single();

			if (versionError || !versionData) {
				console.error('Version not found:', versionError);
				throw error(404, 'Version not found');
			}

			// Check if user owns the document
			if (!versionData.document_id) {
				throw error(400, 'Invalid document ID');
			}

			const { data: documentData, error: documentError } = await supabase
				.from('documents')
				.select('id, user_id, current_version_id')
				.eq('id', versionData.document_id)
				.single();

			if (documentError || !documentData) {
				console.error('Document not found:', documentError);
				throw error(404, 'Document not found');
			}

			if (documentData.user_id !== session.user.id) {
				console.error("User doesn't own document");
				throw error(403, "You don't have permission to edit this document");
			}

			// If deleting the current version, update document to point to most recent remaining version
			if (documentData.current_version_id === versionId) {
				const { data: remainingVersions } = await supabase
					.from('document_versions')
					.select('id, updated_at')
					.eq('document_id', versionData.document_id)
					.neq('id', versionId)
					.order('updated_at', { ascending: false }) // Sort by updated_at instead of created_at
					.limit(1);

				if (remainingVersions && remainingVersions.length > 0) {
					const { error: updateDocError } = await supabase
						.from('documents')
						.update({ current_version_id: remainingVersions[0].id })
						.eq('id', versionData.document_id);

					if (updateDocError) {
						console.error(
							'Failed to update current_version_id after delete:',
							updateDocError,
						);
					}
				}
			}

			// Delete the version
			const { error: deleteError } = await supabase
				.from('document_versions')
				.delete()
				.eq('id', versionId);

			if (deleteError) {
				console.error('Delete failed:', deleteError);
				throw error(500, `Failed to delete: ${deleteError.message}`);
			}

			console.log('Delete successful!');
			return { success: true };
		} catch (err) {
			console.error('deleteVersion error:', err);

			if (err && typeof err === 'object' && 'status' in err) {
				throw err;
			}

			throw error(
				500,
				`Server error: ${err instanceof Error ? err.message : 'Unknown error'}`,
			);
		}
	},

	createTag: async ({ request, locals, params }) => {
		const { session } = await locals.safeGetSession();
		if (!session?.user?.id) {
			throw error(401, 'Unauthorized');
		}

		const formData = await request.formData();
		const name = formData.get('name') as string;
		const color = formData.get('color') as string;
		const documentId = params.documentId;

		// Verify document ownership
		const { data: document, error: docError } = await supabase
			.from('documents')
			.select('user_id')
			.eq('id', documentId)
			.single();

		if (docError || !document) {
			throw error(404, 'Document not found');
		}

		if (document.user_id !== session.user.id) {
			throw error(403, 'Forbidden');
		}

		// Create tag
		const { data: tag, error: tagError } = await supabase
			.from('tags')
			.insert({
				type: 'custom',
				label: name, // Store as 'label' in database
				color,
				created_by: session.user.id,
			})
			.select()
			.single();

		if (tagError) {
			throw error(500, 'Failed to create tag');
		}

		// Add tag to document
		const { error: linkError } = await supabase.from('document_tags').insert({
			document_id: documentId,
			tag_id: tag.id,
			created_at: null,
			updated_at: null,
		});

		if (linkError) {
			throw error(500, 'Failed to link tag to document');
		}

		return { tag };
	},

	deleteTag: async ({ request, locals, params }) => {
		const { session } = await locals.safeGetSession();
		if (!session?.user?.id) {
			throw error(401, 'Unauthorized');
		}

		const formData = await request.formData();
		const tagId = formData.get('tagId') as string;
		const documentId = params.documentId;

		// Verify document ownership
		const { data: document, error: docError } = await supabase
			.from('documents')
			.select('user_id')
			.eq('id', documentId)
			.single();

		if (docError || !document) {
			throw error(404, 'Document not found');
		}

		if (document.user_id !== session.user.id) {
			throw error(403, 'Forbidden');
		}

		// Remove tag from document
		const { error: unlinkError } = await supabase
			.from('document_tags')
			.delete()
			.eq('document_id', documentId)
			.eq('tag_id', tagId);

		if (unlinkError) {
			throw error(500, 'Failed to remove tag from document');
		}

		return { success: true };
	},

	setCurrentVersion: async ({ locals, params }) => {
		console.log('=== setCurrentVersion Debug Info ===');
		try {
			const { session } = await locals.safeGetSession();
			if (!session?.user?.id) {
				throw error(401, 'Unauthorized');
			}

			const versionId = params.versionId;
			const documentId = params.documentId;

			// First, check if version exists and get document info
			const { data: versionData, error: versionError } = await supabase
				.from('document_versions')
				.select('id, document_id')
				.eq('id', versionId)
				.single();

			if (versionError || !versionData) {
				console.error('Version not found:', versionError);
				throw error(404, 'Version not found');
			}

			// Check if user owns the document
			if (!versionData.document_id) {
				throw error(400, 'Invalid document ID');
			}

			const { data: documentData, error: documentError } = await supabase
				.from('documents')
				.select('id, user_id')
				.eq('id', versionData.document_id)
				.single();

			if (documentError || !documentData) {
				console.error('Document not found:', documentError);
				throw error(404, 'Document not found');
			}

			if (documentData.user_id !== session.user.id) {
				console.error("User doesn't own document");
				throw error(403, "You don't have permission to edit this document");
			}

			const updateData: Database['public']['Tables']['documents']['Update'] = {
				current_version_id: versionId,
			};

			// Update the document's current_version_id
			const { error: updateError } = await supabase
				.from('documents')
				.update(updateData)
				.eq('id', documentId);

			if (updateError) {
				console.error('Failed to update current version:', updateError);
				throw error(500, 'Failed to update current version');
			}

			console.log('setCurrentVersion successful for version:', versionId);
			return { success: true };
		} catch (err) {
			console.error('setCurrentVersion error:', err);
			if (err && typeof err === 'object' && 'status' in err) {
				throw err;
			}
			throw error(500, 'Failed to set current version');
		}
	},
};
