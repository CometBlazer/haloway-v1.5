import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { hasFullProfile } from '$lib/utils/profile';

export const load: LayoutServerLoad = async ({
	locals: { safeGetSession, supabaseServiceRole },
	url,
}) => {
	const { session, user } = await safeGetSession();
	if (!session) {
		redirect(303, '/login');
	}

	// Get user profile
	const { data: profile } = await supabaseServiceRole
		.from('profiles')
		.select('*')
		.eq('id', user!.id)
		.single();

	// Check if profile is complete
	const profileComplete = hasFullProfile(profile);

	// If profile is incomplete and user is not on dashboard, redirect to dashboard
	if (!profileComplete && url.pathname !== '/dashboard') {
		redirect(303, '/dashboard');
	}

	return {
		session,
		user,
		profile,
		profileComplete,
	};
};
