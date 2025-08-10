// src/routes/(app)/background/+page.server.ts
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Get the current user session
	const { session } = await locals.safeGetSession();

	// This should never happen due to layout protection, but TypeScript safety
	if (!session?.user?.id) {
		throw error(401, 'Unauthorized');
	}

	// Try to load existing background data
	const { data: existingBackground, error: loadError } = await locals.supabase
		.from('backgrounds')
		.select('*')
		.eq('user_id', session.user.id)
		.single();

	// If no existing background found, that's okay - we'll return null
	// Only log actual errors, not "no rows found" errors
	if (loadError && loadError.code !== 'PGRST116') {
		console.error('Error loading background:', loadError);
	}

	return {
		existingBackground: existingBackground || null,
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const { session } = await locals.safeGetSession();

		if (!session?.user?.id) {
			throw error(401, 'Unauthorized');
		}

		const formData = await request.formData();

		// Extract and clean form data
		const backgroundData = {
			user_id: session.user.id,
			region_of_living:
				(formData.get('regionOfLiving') as string)?.trim() || null,
			first_generation: formData.get('firstGeneration') === 'on', // HTML checkboxes send 'on' when checked
			low_income: formData.get('lowIncome') === 'on',
			other_hooks: (formData.get('otherHooks') as string)?.trim() || null,
			intended_major: (formData.get('intendedMajor') as string)?.trim() || null,
			class_rank: (formData.get('classRank') as string)?.trim() || null,
			ap_ib_college_classes:
				(formData.get('apIbCollegeClasses') as string)?.trim() || null,
			gpa: (formData.get('gpa') as string)?.trim() || null,
			test_type: (formData.get('testType') as string)?.trim() || null,
			sat: (formData.get('sat') as string)?.trim() || null,
			act: (formData.get('act') as string)?.trim() || null,
			challenges: (formData.get('challenges') as string)?.trim() || null,
			identity_background:
				(formData.get('identityBackground') as string)?.trim() || null,
			values_beliefs: (formData.get('valuesBeliefs') as string)?.trim() || null,
			personal_qualities:
				(formData.get('personalQualities') as string)?.trim() || null,
		};

		try {
			// Check if background already exists for this user
			const { data: existingBackground, error: checkError } =
				await locals.supabase
					.from('backgrounds')
					.select('id')
					.eq('user_id', session.user.id)
					.maybeSingle(); // Use maybeSingle to avoid error when no rows found

			if (checkError) {
				console.error('Error checking existing background:', checkError);
				return fail(500, {
					error: 'Failed to check existing background information',
				});
			}

			let result;

			if (existingBackground) {
				// Update existing background
				result = await locals.supabase
					.from('backgrounds')
					.update(backgroundData)
					.eq('user_id', session.user.id)
					.select()
					.single();
			} else {
				// Insert new background
				result = await locals.supabase
					.from('backgrounds')
					.insert(backgroundData)
					.select()
					.single();
			}

			if (result.error) {
				console.error('Supabase operation error:', result.error);
				return fail(500, {
					error: 'Failed to save background information',
					details: result.error.message,
				});
			}

			return {
				success: true,
				background: result.data,
			};
		} catch (error) {
			console.error('Unexpected error saving background:', error);
			return fail(500, {
				error:
					'An unexpected error occurred while saving your background information',
			});
		}
	},
};
