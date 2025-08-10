import type { Provider } from '@supabase/supabase-js';

export const WebsiteName: string = 'Haloway';
export const WebsiteBaseUrl: string = 'https://haloway.co';
export const WebsiteSlogan: string = 'Your Personal Admissions Copilot';
export const WebsiteKeywords: string =
	'college admissions, college applications, AI admissions assistant, college application help, essay writing, college essay help, college application tips, college application guidance, college activities list, application planning, essay brainstorming, essay editing, essay feedback, college application organization';
export const WebsiteDescription: string =
	'Haloway is an AI-powered admissions assistant that helps students plan, write, and refine their college applications in one place.';
export const CreateProfileStep: boolean = true;

/* You'll need to configure your providers in
your Supabase project settings `/supabase/config.toml` */
export const oAuthProviders: Provider[] = [
	// 'google',
	// 'twitter',
	// 'apple', // Consts $99/year to use Apple OAuth
	// 'facebook',
	// 'github',
];

/**
 * List of Stripe Product IDs to display in the billing settings page.
 * If set to `null`, all active products will be displayed.
 */
export const stripeProductIds: null | string[] = null;
