import type { Database } from '../../DatabaseDefinitions';

export const hasFullProfile = (
	profile: Database['public']['Tables']['profiles']['Row'] | null,
): boolean => {
	if (!profile) {
		return false;
	}
	if (!profile.full_name) {
		return false;
	}
	if (!profile.graduation_year) {
		return false;
	}
	if (!profile.referral_source) {
		return false;
	}

	return true;
};
