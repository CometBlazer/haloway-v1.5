import { error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import type {
	Activity,
	ParticipationLevels,
	TimingOfParticipation,
} from '$lib/types/activity';
import type { Json } from '../../../DatabaseDefinitions';

export const load: PageServerLoad = async ({
	locals: { supabase, safeGetSession },
}) => {
	const { session } = await safeGetSession();

	if (!session) {
		// Return empty for non-authenticated users
		return {
			activities: [],
			isAuthenticated: false,
		};
	}

	const { data: activities, error: activitiesError } = await supabase
		.from('activities')
		.select('*')
		.eq('user_id', session.user.id)
		.order('sort_order', { ascending: true });

	if (activitiesError) {
		console.error('Error loading activities:', activitiesError);
		throw error(500, 'Failed to load activities');
	}

	// Transform database format to client format
	const clientActivities: Activity[] = (activities || []).map((activity) => ({
		id: activity.id,
		activityType: activity.activity_type || '',
		organizationName: activity.organization_name || '',
		positionDescription: activity.position_description || '',
		activityDescription: activity.activity_description || '',
		participationLevels:
			(activity.participation_levels as ParticipationLevels) || {},
		timingOfParticipation:
			(activity.timing_of_participation as TimingOfParticipation) || {},
		hoursPerWeek: activity.hours_per_week || 0,
		weeksPerYear: activity.weeks_per_year || 0,
		collegeParticipation: activity.college_participation || false,
	}));

	return {
		activities: clientActivities,
		isAuthenticated: true,
	};
};

export const actions: Actions = {
	saveActivities: async ({ request, locals: { supabase, safeGetSession } }) => {
		const { session } = await safeGetSession();

		if (!session) {
			throw error(401, 'Must be logged in to save activities');
		}

		const formData = await request.formData();
		const activitiesJson = formData.get('activities') as string;

		if (!activitiesJson) {
			throw error(400, 'No activities data provided');
		}

		let activities: Activity[];
		try {
			activities = JSON.parse(activitiesJson);
		} catch {
			throw error(400, 'Invalid activities data format');
		}

		// Start a transaction by deleting all existing activities for this user
		// then inserting the new ones with proper sort_order
		const { error: deleteError } = await supabase
			.from('activities')
			.delete()
			.eq('user_id', session.user.id);

		if (deleteError) {
			console.error('Error deleting existing activities:', deleteError);
			throw error(500, 'Failed to save activities');
		}

		// Insert new activities with sort_order based on array index
		if (activities.length > 0) {
			const activitiesWithMetadata = activities.map((activity, index) => ({
				id: activity.id, // Keep the client-generated ID
				user_id: session.user.id,
				activity_type: activity.activityType || '',
				organization_name: activity.organizationName || '',
				position_description: activity.positionDescription || '',
				activity_description: activity.activityDescription || '',
				participation_levels: activity.participationLevels as unknown as Json, // Cast to unknown first, then Json
				timing_of_participation:
					activity.timingOfParticipation as unknown as Json, // Cast to unknown first, then Json
				hours_per_week: activity.hoursPerWeek || 0,
				weeks_per_year: activity.weeksPerYear || 0,
				college_participation: activity.collegeParticipation || false,
				sort_order: index,
			}));

			const { error: insertError } = await supabase
				.from('activities')
				.insert(activitiesWithMetadata);

			if (insertError) {
				console.error('Error inserting activities:', insertError);
				throw error(500, 'Failed to save activities');
			}
		}

		return { success: true };
	},
};
