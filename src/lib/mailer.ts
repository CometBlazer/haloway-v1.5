import { Resend } from 'resend';
import { env } from '$env/dynamic/private';

// Pre-compiled template functions
import {
	contactNotificationText,
	contactNotificationHtml,
	welcomeEmailText,
	welcomeEmailHtml,
	type ContactNotificationProps,
	type WelcomeEmailProps,
} from '$lib/email-templates';

// Send admin notification emails
export const sendAdminEmail = async ({
	subject,
	body,
}: {
	subject: string;
	body: string;
}) => {
	console.log('=== ADMIN EMAIL DEBUG START ===');
	console.log('Admin email env check:', {
		hasResendKey: !!env.PRIVATE_RESEND_API_KEY,
		hasAdminEmail: !!env.PRIVATE_ADMIN_EMAIL,
	});

	if (!env.PRIVATE_ADMIN_EMAIL) {
		console.error('No admin email configured!');
		return;
	}

	try {
		const resend = new Resend(env.PRIVATE_RESEND_API_KEY);
		const resp = await resend.emails.send({
			from: env.PRIVATE_FROM_ADMIN_EMAIL?.trim() || env.PRIVATE_ADMIN_EMAIL,
			to: [env.PRIVATE_ADMIN_EMAIL],
			subject: 'ADMIN_MAIL: ' + subject,
			text: body,
		});

		if (resp.error) {
			console.log('Failed to send admin email, error:', resp.error);
		} else {
			console.log('Admin email sent successfully:', resp);
		}
		console.log('=== ADMIN EMAIL DEBUG END ===');
	} catch (e) {
		console.log('Failed to send admin email, error:', e);
	}
};

// Send templated emails (supports both contact and welcome emails)
export const sendTemplatedEmail = async ({
	subject,
	to_emails,
	from_email,
	template_name,
	template_properties,
}: {
	subject: string;
	to_emails: string[];
	from_email: string;
	template_name: string;
	template_properties: ContactNotificationProps | WelcomeEmailProps; // Support both types
}) => {
	console.log('=== MAILER DEBUG START ===');
	console.log('Mailer env check:', {
		hasResendKey: !!env.PRIVATE_RESEND_API_KEY,
		resendKeyPrefix: env.PRIVATE_RESEND_API_KEY?.substring(0, 5),
	});
	console.log('Email params:', {
		subject,
		to_emails,
		from_email: from_email.trim(),
		template_name,
	});

	if (!env.PRIVATE_RESEND_API_KEY) {
		console.error('No Resend API key found!');
		return;
	}

	let plaintextBody: string | undefined = undefined;
	let htmlBody: string | undefined = undefined;

	// Use pre-compiled templates for different email types
	try {
		if (template_name === 'contact_notification') {
			console.log('Using pre-compiled contact notification templates');
			plaintextBody = contactNotificationText(
				template_properties as ContactNotificationProps,
			);
			htmlBody = contactNotificationHtml(
				template_properties as ContactNotificationProps,
			);
			console.log('Contact notification templates compiled successfully');
		} else if (template_name === 'welcome_email') {
			console.log('Using pre-compiled welcome email templates');
			plaintextBody = welcomeEmailText(
				template_properties as WelcomeEmailProps,
			);
			htmlBody = welcomeEmailHtml(template_properties as WelcomeEmailProps);
			console.log('Welcome email templates compiled successfully');
		} else {
			console.error(`Unknown template: ${template_name}`);
			return;
		}
	} catch (error) {
		console.error('Template compilation error:', error);
		return;
	}

	if (!plaintextBody && !htmlBody) {
		console.log('No email body generated from templates');
		return;
	}

	try {
		const email = {
			from: from_email.trim(), // Remove any whitespace/newlines
			to: to_emails,
			subject: subject,
			text: plaintextBody || 'No text content available',
			...(htmlBody && { html: htmlBody }),
		};

		console.log('About to send email with Resend API...');
		console.log('Email data:', {
			from: email.from,
			to: email.to,
			subject: email.subject,
			hasText: !!email.text,
			hasHtml: !!email.html,
		});

		const resend = new Resend(env.PRIVATE_RESEND_API_KEY);
		const resp = await resend.emails.send(email);

		if (resp.error) {
			console.error('Failed to send email, Resend error:', resp.error);
			throw new Error(`Resend API error: ${JSON.stringify(resp.error)}`);
		} else {
			console.log('Email sent successfully, Resend response:', resp);
		}

		console.log('=== MAILER DEBUG END ===');
		return resp;
	} catch (e) {
		console.error('Failed to send email, exception:', e);
		console.log('=== MAILER DEBUG END (ERROR) ===');
		throw e;
	}
};

// Convenience function for sending welcome emails
export const sendWelcomeEmail = async ({
	to_email,
	companyName = 'Haloway',
	websiteBaseUrl = 'https://haloway.co',
}: {
	to_email: string;
	companyName?: string;
	websiteBaseUrl?: string;
}) => {
	return sendTemplatedEmail({
		subject: `Welcome to ${companyName}! 🎓`,
		to_emails: [to_email],
		from_email: env.PRIVATE_FROM_ADMIN_EMAIL?.trim() || 'hello@haloway.co',
		template_name: 'welcome_email',
		template_properties: {
			companyName,
			WebsiteBaseUrl: websiteBaseUrl,
		},
	});
};
