export const ssr = false;

import { fail, redirect, type Actions } from '@sveltejs/kit';

import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types.js';
import { formSchema } from './schema';

export const load: PageServerLoad = async ({ url }) => {
	const next = url.searchParams.get('next');
	const isCheckout = Boolean(
		typeof next === 'string' &&
			decodeURIComponent(next).match(/^\/checkout\/.+$/),
	);

	return {
		isCheckout,
		form: await superValidate(zod(formSchema)),
	};
};

export const actions: Actions = {
	default: async (event) => {
		const supabase = event.locals.supabase;
		const form = await superValidate(event, zod(formSchema));
		if (!form.valid) {
			return fail(400, {
				form,
			});
		}

		const { email, password } = form.data;

		const {
			error,
			data: { session, user },
		} = await supabase.auth.signUp({
			email,
			password,
		});

		console.log('Signup response:', { error, session, user });

		if (error) {
			console.error('Signup error:', error);
			console.error('Error code:', error.code);
			console.error('Error message:', error.message);

			// Check to see if sign-ups are disabled in Supabase
			if (
				error.code === 'signup_disabled' ||
				error.message?.includes('Signups not allowed')
			) {
				return {
					form,
					signupDisabled: true,
				};
			}

			// Check if user already exists - more comprehensive checking
			if (
				error.message?.includes('User already registered') ||
				error.message?.includes('already registered') ||
				error.message?.includes('already exists') ||
				error.message?.includes('already been registered') ||
				error.message?.includes('email already in use') ||
				error.message?.includes('already in use') ||
				error.message?.includes('email is already taken') ||
				error.message?.includes('email taken') ||
				error.message?.includes('duplicate') ||
				error.code === 'user_already_registered' ||
				error.code === 'email_already_registered' ||
				error.code === 'duplicate_email' ||
				error.code === 'email_taken'
			) {
				return setError(
					form,
					'',
					`An account with ${email} already exists. If you forgot your password, please use the "Forgot Password" link.`,
				);
			}

			return setError(form, '', 'Could not sign up. Please try again.');
		}

		// Check if user was created but email confirmation is required
		// This might happen when a user already exists but Supabase doesn't return an error
		if (user && !session) {
			// Check if this is a new user or an existing user
			// If the user already exists, Supabase might still return a user object
			// but we need to check if they're confirmed
			if (user.email_confirmed_at) {
				// User already exists and is confirmed
				return setError(
					form,
					'',
					`An account with ${email} already exists. If you forgot your password, please use the "Forgot Password" link.`,
				);
			}
		}

		// Additional check: if no session and no error, but we have a user,
		// it might mean the user already exists but email confirmation is pending
		// Let's check if this user already has a profile (indicating they've used the app before)
		if (user && !session) {
			const { data: existingProfile } = await event.locals.supabaseServiceRole
				.from('profiles')
				.select('id')
				.eq('id', user.id)
				.single();

			if (existingProfile) {
				// User already has a profile, which means they've used the app before
				return setError(
					form,
					'',
					`An account with ${email} already exists. If you forgot your password, please use the "Forgot Password" link.`,
				);
			}
		}

		if (session) {
			const search = new URLSearchParams(event.url.search);
			search.set('next', event.url.searchParams.get('next') || '/dashboard');

			return redirect(303, '/auth/callback?' + search.toString());
		}

		// Instead of redirecting, return success status and the email used to sign up
		return {
			form,
			success: true,
			email,
		};
	},
};
