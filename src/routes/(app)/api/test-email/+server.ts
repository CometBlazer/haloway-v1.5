import { json, type RequestHandler } from '@sveltejs/kit';
import { sendWelcomeEmail } from '$lib/mailer';

export const POST: RequestHandler = async ({
	request,
}: {
	request: Request;
}) => {
	try {
		const { email } = await request.json();

		if (!email) {
			return json({ error: 'Email is required' }, { status: 400 });
		}

		console.log('🧪 Testing welcome email to:', email);

		const result = await sendWelcomeEmail({
			to_email: email,
			companyName: 'Haloway',
			websiteBaseUrl: 'https://haloway.co',
		});

		console.log('🧪 Email test result:', result);

		return json({
			success: true,
			message: 'Email sent successfully',
			result,
		});
	} catch (error) {
		console.error('🧪 Email test failed:', error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 },
		);
	}
};
