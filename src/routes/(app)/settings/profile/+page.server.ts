import { fetchCurrentUsersSubscription } from '$lib/stripe/client-helpers';
import { fail, redirect } from '@sveltejs/kit';
import { message, setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';
import {
	deleteAccountFormSchema,
	emailFormSchema,
	infoFormSchema,
} from './schema';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();

	// let's not check for session here as it prevents us to show alert after sign out post-account deletion
	// everything is handled in the action
	// if (!session || !user) {
	// 	throw redirect(303, '/login');
	// }

	// get profile info
	let info;
	if (user) {
		const { data, error } = await locals.supabase
			.from('profiles')
			.select(
				'full_name, graduation_year, dream_school, referral_source, unsubscribed',
			)
			.eq('id', user.id)
			.single();
		if (error) {
			console.error('Error getting profile info:', error.message);
			throw fail(500, { error: 'Could not get profile info.' });
		}

		info = data;
	}

	const { data: passwordSet } = await locals.supabase.rpc('user_password_set');

	return {
		emailForm: await superValidate(user, zod(emailFormSchema)),
		infoForm: await superValidate(
			{
				full_name: info?.full_name || '',
				graduation_year: info?.graduation_year || new Date().getFullYear(),
				dream_school: info?.dream_school || '',
				referral_source:
					(info?.referral_source as
						| 'friend'
						| 'social_media'
						| 'search'
						| 'school'
						| 'ad'
						| 'other') || undefined,
				subscribed_to_emails: !info?.unsubscribed, // Convert unsubscribed to subscribed_to_emails
			},
			zod(infoFormSchema),
		),
		deleteAccountForm:
			passwordSet && (await superValidate(zod(deleteAccountFormSchema))),
	};
};

export const actions = {
	updateEmail: async (event) => {
		const { safeGetSession, supabase } = event.locals;
		const { session } = await safeGetSession();
		if (!session) {
			redirect(303, '/login');
		}

		const form = await superValidate(event, zod(emailFormSchema));
		if (!form.valid) {
			return fail(400, {
				emailForm: form,
			});
		}

		const { email } = form.data;

		// Supabase does not change the email until the user verifies both
		// if 'Secure email change' is enabled in the Supabase dashboard
		const { error } = await supabase.auth.updateUser({ email });

		if (error) {
			console.error(error);
			return setError(form, '', 'Could not sign up. Please try again.');
		}

		return message(form, {
			success:
				'An email has been sent to both your old and new email addresses. Please follow instructions in both.',
		});
	},
	updateProfile: async (event) => {
		const { safeGetSession, supabase } = event.locals;
		const { session, user } = await safeGetSession();
		if (!session || !user?.id) {
			return redirect(303, '/login');
		}

		const form = await superValidate(event, zod(infoFormSchema));
		if (!form.valid) {
			return fail(400, {
				infoForm: form,
			});
		}

		const {
			full_name,
			graduation_year,
			dream_school,
			referral_source,
			subscribed_to_emails,
		} = form.data;

		const { error } = await supabase.from('profiles').upsert({
			id: user.id,
			full_name,
			graduation_year,
			dream_school: dream_school || null,
			referral_source,
			unsubscribed: !subscribed_to_emails, // Convert subscribed_to_emails back to unsubscribed
			updated_at: new Date(),
		});

		if (error) {
			console.error('Error updating profile:', error.message);
			return setError(form, '', 'Could not update info. Please try again.');
		}

		return message(form, {
			success: 'Info updated.',
		});
	},
	deleteAccount: async (event) => {
		const { safeGetSession, supabase, supabaseServiceRole, stripe } =
			event.locals;
		const { session, user } = await safeGetSession();
		if (!session || !user?.id) {
			return redirect(303, '/login');
		}

		const form = await superValidate(event, zod(deleteAccountFormSchema));
		if (!form.valid) {
			return fail(400, {
				deleteAccountForm: form,
			});
		}

		const { confirmation } = form.data;

		// Check current password is correct before deleting account
		const { error: pwError } = await supabase.auth.signInWithPassword({
			email: user?.email || '',
			password: confirmation,
		});

		if (pwError) {
			await supabase.auth.signOut();
			// The user was logged out because of bad password. Redirect to error page explaining.
			return redirect(303, '/security-error');
		}

		const { data: customer, error } = await supabaseServiceRole
			.from('stripe_customers')
			.select('stripe_customer_id')
			.eq('user_id', user.id)
			.single();

		if (error || !customer?.stripe_customer_id) {
			console.error('Error fetching stripe customer:', error);
			return fail(500, {
				errorMessage: 'Unknown error. If this persists please contact us.',
			});
		}

		try {
			const currentSubscriptions = await fetchCurrentUsersSubscription(
				stripe,
				customer.stripe_customer_id,
			);

			const cancelPromises = currentSubscriptions.map((sub) =>
				stripe.subscriptions.cancel(sub.id),
			);

			await Promise.all(cancelPromises);
		} catch (error) {
			console.error('Error fetching subscriptions:', error);
			return fail(500, {
				errorMessage: 'Unknown error. If this persists please contact us.',
			});
		}

		const { error: delError } = await supabaseServiceRole.auth.admin.deleteUser(
			user.id,
			true,
		);

		if (delError) {
			console.error('Error deleting account:', delError.message);
			return fail(500, {
				errorMessage: 'Unknown error. If this persists please contact us.',
			});
		}

		await supabase.auth.signOut();

		redirect(303, '/register?alertDialog=account-deletion');
	},
};
