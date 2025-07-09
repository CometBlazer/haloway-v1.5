// src/routes/(marketing)/(auth)/register/+page.server.ts
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
			return fail(400, { form });
		}

		const { email, password } = form.data;

		const {
			error,
			data: { session },
		} = await supabase.auth.signUp({
			email,
			password,
		});

		// Only trust actual errors from Supabase
		if (error) {
			console.error('Signup error:', error);

			if (error.code === 'signup_disabled') {
				return { form, signupDisabled: true };
			}

			// Only handle actual "user already registered" errors
			if (error.message?.includes('User already registered')) {
				return setError(
					form,
					'',
					`An account with ${email} already exists. If you forgot your password, please use the "Forgot Password" link to reset it below.`,
				);
			}

			return setError(form, '', 'Could not sign up. Please try again.');
		}

		// If we have a session, redirect
		if (session) {
			const search = new URLSearchParams(event.url.search);
			search.set('next', event.url.searchParams.get('next') || '/dashboard');
			return redirect(303, '/auth/callback?' + search.toString());
		}

		// Success: user created, confirmation email sent
		return {
			form,
			success: true,
			email,
		};
	},
};
