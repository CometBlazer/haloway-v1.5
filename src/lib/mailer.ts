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
	if (!env.PRIVATE_ADMIN_EMAIL) {
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
		}
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
	if (!env.PRIVATE_RESEND_API_KEY) {
		return;
	}

	let plaintextBody: string | undefined = undefined;
	try {
		const textTemplate = await import(
			`./emails/${template_name}_text.hbs?raw`
		).then((mod) => mod.default);
		const template = handlebars.compile(textTemplate);
		plaintextBody = template(template_properties);
	} catch {
		plaintextBody = undefined;
	}

	let htmlBody: string | undefined = undefined;
	try {
		const htmlTemplate = await import(
			`./emails/${template_name}_html.hbs?raw`
		).then((mod) => mod.default);
		const template = handlebars.compile(htmlTemplate);
		htmlBody = template(template_properties);
	} catch {
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
		const resend = new Resend(env.PRIVATE_RESEND_API_KEY);
		const resp = await resend.emails.send(email);

		if (resp.error) {
			console.log('Failed to send email, error:', resp.error);
		}
	} catch (e) {
		console.log('Failed to send email, error:', e);
	}
};
