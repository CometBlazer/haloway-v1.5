import { z } from 'zod';

export const emailFormSchema = z.object({
	email: z
		.string({ required_error: 'Please fill in the email' })
		.email({ message: 'Invalid email' }),
});

export type EmailFormSchema = typeof emailFormSchema;

///

export const infoFormSchema = z.object({
	full_name: z
		.string()
		.trim()
		.min(1, 'Name is required')
		.max(50, 'Name must be 50 characters or less'),
	graduation_year: z
		.number({
			required_error: 'Please select your graduation year',
		})
		.min(1950, 'Graduation year must be 1950 or later')
		.max(2100, 'Graduation year must be 2100 or earlier'),
	dream_school: z
		.string()
		.trim()
		.max(100, 'Dream school must be 100 characters or less')
		.nullable()
		.optional()
		.default(''),
	referral_source: z.enum(
		['friend', 'social_media', 'search', 'school', 'ad', 'other'],
		{
			required_error: 'Please select how you heard about us',
		},
	),
	subscribed_to_emails: z.boolean().default(true),
});

export type InfoFormSchema = typeof infoFormSchema;

///

export const deleteAccountFormSchema = z.object({
	confirmation: z.string({
		required_error: 'Please fill in the confirmation',
	}),
});

export type DeleteAccountFormSchema = typeof deleteAccountFormSchema;
