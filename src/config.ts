import type { Provider } from '@supabase/supabase-js';

export const WebsiteName: string = 'Haloway';
export const WebsiteBaseUrl: string = 'https://haloway.pages.dev';
export const WebsiteSlogan: string =
	'the ULTIMATE college essay writing platform';
export const WebsiteDescription: string =
	'Haloway is a college essay writing platform that helps students draft, organize, and finalize their essays with ease. With beautiful UI and draft-management features, Haloway aims to replace Google Docs as the go-to tool for college essay writing.';
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
