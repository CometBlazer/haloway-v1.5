import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { supabase } from '$lib/supabase';

export const load: PageServerLoad = async ({ locals }) => {
	// Get the current user session
	const { session } = await locals.safeGetSession();

	// This should never happen due to layout protection, but TypeScript safety
	if (!session?.user?.id) {
		throw error(401, 'Unauthorized');
	}

	// Try to load existing background data
	const { data: existingBackground } = await supabase
		.from('backgrounds')
		.select('*')
		.eq('user_id', session.user.id)
		.single();

	return {
		existingBackground: existingBackground || null,
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const { session } = await locals.safeGetSession();

		// This should never happen due to layout protection, but TypeScript safety
		if (!session?.user?.id) {
			throw error(401, 'Unauthorized');
		}

		const formData = await request.formData();

		// Extract form data
		const backgroundData = {
			user_id: session.user.id,
			region_of_living: (formData.get('regionOfLiving') as string) || null,
			first_generation: formData.get('firstGeneration') === 'true',
			low_income: formData.get('lowIncome') === 'true',
			other_hooks: (formData.get('otherHooks') as string) || null,
			intended_major: (formData.get('intendedMajor') as string) || null,
			class_rank: (formData.get('classRank') as string) || null,
			ap_ib_college_classes:
				(formData.get('apIbCollegeClasses') as string) || null,
			gpa: (formData.get('gpa') as string) || null,
			test_type: (formData.get('testType') as string) || null,
			sat: (formData.get('sat') as string) || null,
			act: (formData.get('act') as string) || null,
			challenges: (formData.get('challenges') as string) || null,
			identity_background:
				(formData.get('identityBackground') as string) || null,
			values_beliefs: (formData.get('valuesBeliefs') as string) || null,
			personal_qualities: (formData.get('personalQualities') as string) || null,
		};

		try {
			// Check if background already exists for this user
			const { data: existingBackground } = await supabase
				.from('backgrounds')
				.select('id')
				.eq('user_id', session.user.id)
				.single();

			let result;

			if (existingBackground) {
				// Update existing background
				result = await supabase
					.from('backgrounds')
					.update(backgroundData)
					.eq('user_id', session.user.id)
					.select()
					.single();
			} else {
				// Insert new background
				result = await supabase
					.from('backgrounds')
					.insert(backgroundData)
					.select()
					.single();
			}

			if (result.error) {
				console.error('Supabase error:', result.error);
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
			console.error('Error saving background:', error);
			return fail(500, {
				error:
					'An unexpected error occurred while saving your background information',
			});
		}
	},
};
