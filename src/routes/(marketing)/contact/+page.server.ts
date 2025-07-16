import { fail, type Actions, type ServerLoad } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { formSchema } from './schema';
import { sendTemplatedEmail } from '$lib/mailer';
import {
	PRIVATE_ADMIN_EMAIL,
	PRIVATE_FROM_ADMIN_EMAIL,
} from '$env/static/private';

export const load: ServerLoad = async () => {
	return {
		form: await superValidate(zod(formSchema)),
	};
};

export const actions: Actions = {
	default: async (event) => {
		const supabaseServiceRole = event.locals.supabaseServiceRole;
		const form = await superValidate(event, zod(formSchema));
		if (!form.valid) {
			return fail(400, {
				form,
			});
		}

		const { name, email, subject, body } = form.data;

		console.log('=== CONTACT FORM DEBUG START ===');
		console.log('Environment check:', {
			hasResendKey: !!process.env.PRIVATE_RESEND_API_KEY,
			resendKeyPrefix: process.env.PRIVATE_RESEND_API_KEY?.substring(0, 5),
			adminEmail: PRIVATE_ADMIN_EMAIL,
			fromEmail: PRIVATE_FROM_ADMIN_EMAIL,
		});

		const insert = supabaseServiceRole.from('contact_messages').insert({
			name,
			email,
			subject,
			body,
			updated_at: new Date(),
		});

		const emailPromise = sendTemplatedEmail({
			subject: `New Contact Form Submission: ${subject}`,
			to_emails: [PRIVATE_ADMIN_EMAIL],
			from_email: PRIVATE_FROM_ADMIN_EMAIL,
			template_name: 'contact_notification',
			template_properties: {
				name,
				email,
				subject,
				message: body,
				timestamp: new Date().toLocaleString(),
			},
		});

		try {
			console.log('About to execute database insert and email send...');

			const [insertResult, emailResult] = await Promise.all([
				insert,
				emailPromise,
			]);

			console.log(
				'Database insert result:',
				insertResult.error ? 'FAILED' : 'SUCCESS',
			);
			console.log('Email send result:', emailResult);

			if (insertResult.error) {
				console.error('Database insert failed:', insertResult.error);
				return fail(500, {
					form,
				});
			}

			console.log('Email sent successfully:', emailResult);
			console.log('=== CONTACT FORM DEBUG END ===');

			return message(form, {
				success: 'Thank you for your message. We will get back to you soon.',
			});
		} catch (error) {
			console.error('DETAILED ERROR:', error);
			console.error('Error type:', typeof error);

			// Type-safe error handling
			if (error instanceof Error) {
				console.error('Error message:', error.message);
				console.error('Error stack:', error.stack);
			}

			// Try to save to database even if email fails
			try {
				const insertResult = await insert;
				if (insertResult.error) {
					console.error('Database fallback also failed:', insertResult.error);
				} else {
					console.log('Database insert succeeded despite email failure');
				}
			} catch (dbError) {
				console.error('Database fallback error:', dbError);
			}

			return fail(500, {
				form,
			});
		}
	},
};
