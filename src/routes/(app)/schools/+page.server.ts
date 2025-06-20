// src/routes/(app)/schools/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Redirect to dashboard when accessing /schools
	throw redirect(302, '/dashboard');
};
