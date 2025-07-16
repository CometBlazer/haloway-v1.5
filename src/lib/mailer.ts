import { Resend } from 'resend';
import { env } from '$env/dynamic/private';
import handlebars from 'handlebars';

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
			from: env.PRIVATE_FROM_ADMIN_EMAIL || env.PRIVATE_ADMIN_EMAIL,
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

// Send templated emails
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
	template_properties: Record<string, string>;
}) => {
	console.log('=== MAILER DEBUG START ===');
	console.log('Mailer env check:', {
		hasResendKey: !!env.PRIVATE_RESEND_API_KEY,
		resendKeyPrefix: env.PRIVATE_RESEND_API_KEY?.substring(0, 5),
	});
	console.log('Email params:', {
		subject,
		to_emails,
		from_email,
		template_name,
	});

	if (!env.PRIVATE_RESEND_API_KEY) {
		console.error('No Resend API key found!');
		return;
	}

	let plaintextBody: string | undefined = undefined;
	try {
		console.log(`Attempting to load text template: ${template_name}_text.hbs`);
		const textTemplate = await import(
			`./emails/${template_name}_text.hbs?raw`
		).then((mod) => mod.default);
		const template = handlebars.compile(textTemplate);
		plaintextBody = template(template_properties);
		console.log('Text template loaded successfully');
	} catch (error) {
		console.error('Failed to load text template:', error);
		plaintextBody = undefined;
	}

	let htmlBody: string | undefined = undefined;
	try {
		console.log(`Attempting to load HTML template: ${template_name}_html.hbs`);
		const htmlTemplate = await import(
			`./emails/${template_name}_html.hbs?raw`
		).then((mod) => mod.default);
		const template = handlebars.compile(htmlTemplate);
		htmlBody = template(template_properties);
		console.log('HTML template loaded successfully');
	} catch (error) {
		console.error('Failed to load HTML template:', error);
		htmlBody = undefined;
	}

	if (!plaintextBody && !htmlBody) {
		console.log(
			'No email body: requires plaintextBody or htmlBody. Template: ',
			template_name,
		);
		return;
	}

	try {
		const email = {
			from: from_email,
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
