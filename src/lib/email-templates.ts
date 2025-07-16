// Pre-compiled email templates for Cloudflare Pages compatibility
// These replace the Handlebars dynamic compilation and match your existing .hbs files

export interface ContactNotificationProps {
	name: string;
	email: string;
	subject: string;
	message: string;
	timestamp: string;
}

export interface WelcomeEmailProps {
	companyName: string;
	WebsiteBaseUrl: string;
}

export function contactNotificationText(
	props: ContactNotificationProps,
): string {
	return `New Contact Form Submission

Name: ${props.name}
Email: ${props.email}
Subject: ${props.subject}
Message: ${props.message}

Submitted at: ${props.timestamp}

---
This message was sent from the contact form on Haloway.`;
}

export function contactNotificationHtml(
	props: ContactNotificationProps,
): string {
	return `<html lang='en'>

	<head>
		<meta charset='UTF-8' />
		<meta name='viewport' content='width=device-width, initial-scale=1.0' />
		<title>New Contact Form Submission</title>
		<style>
			body {
				font-family:
					-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica,
					Arial, sans-serif;
				line-height: 1.6;
				color: #333;
				max-width: 600px;
				margin: 0 auto;
				padding: 20px;
				background-color: #f9fafb;
			}

			.container {
				background-color: #ffffff;
				border-radius: 8px;
				padding: 30px;
				box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
			}

			.header {
				border-bottom: 2px solid #3b82f6;
				padding-bottom: 20px;
				margin-bottom: 30px;
			}

			.header h1 {
				color: #1f2937;
				margin: 0;
				font-size: 24px;
				font-weight: 600;
			}

			.field {
				margin-bottom: 20px;
			}

			.field-label {
				font-weight: 600;
				color: #374151;
				margin-bottom: 5px;
				display: block;
			}

			.field-value {
				background-color: #f3f4f6;
				padding: 12px;
				border-radius: 6px;
				border-left: 4px solid #3b82f6;
				word-wrap: break-word;
			}

			.message-field {
				background-color: #fef3c7;
				border-left-color: #f59e0b;
			}

			.timestamp {
				color: #6b7280;
				font-size: 14px;
				margin-top: 30px;
				padding-top: 20px;
				border-top: 1px solid #e5e7eb;
			}

			.footer {
				margin-top: 30px;
				padding-top: 20px;
				border-top: 1px solid #e5e7eb;
				color: #6b7280;
				font-size: 12px;
				text-align: center;
			}
		</style>
	</head>

	<body>
		<div class='container'>
			<div class='header'>
				<h1>📧 New Contact Form Submission</h1>
			</div>

			<div class='field'>
				<span class='field-label'>Name:</span>
				<div class='field-value'>${props.name}</div>
			</div>

			<div class='field'>
				<span class='field-label'>Email:</span>
				<div class='field-value'>${props.email}</div>
			</div>

			<div class='field'>
				<span class='field-label'>Subject:</span>
				<div class='field-value'>${props.subject}</div>
			</div>

			<div class='field'>
				<span class='field-label'>Message:</span>
				<div class='field-value message-field'>${props.message}</div>
			</div>

			<div class='timestamp'>
				<strong>Submitted at:</strong>
				${props.timestamp}
			</div>

			<div class='footer'>
				This message was sent from the contact form on Haloway.
			</div>
		</div>
	</body>

</html>`;
}

export function welcomeEmailText(props: WelcomeEmailProps): string {
	return `Welcome to Haloway! 🎓

Hi there! 👋

We're thrilled to have you join Haloway! You've just taken the first step toward crafting compelling college essays that
will help you stand out to admissions committees.

Here's how to get started:

1. Create your first essay
Start with your Common App personal statement or any supplement essay

2. Paste your essay prompt
Copy the prompt from Common App or your college's application portal

3. Start writing
That's it!

💡 Pro tip: Don't worry about making your first draft perfect. Focus on getting your ideas down, and we'll help you
refine them into a compelling narrative that admissions officers will love.

Start writing your first essay: ${props.WebsiteBaseUrl}/schools/uncategorized/write

We're here to support you every step of the way. If you have any questions, just reply to this email—we'd love to hear
from you!

Best of luck with your essays! 🚀
The Haloway Team

---
Haloway • Your College Essay Companion

To unsubscribe, visit: ${props.WebsiteBaseUrl}/settings/change_email_subscription`;
}

export function welcomeEmailHtml(props: WelcomeEmailProps): string {
	return `<html lang='en'>

	<head>
		<meta name='viewport' content='width=device-width, initial-scale=1.0' />
		<meta http-equiv='Content-Type' content='text/html; charset=UTF-8' />
		<title>Welcome to Haloway!</title>
		<style media='all' type='text/css'>
			@media all {
				.btn-primary table td:hover {
					background-color: #2563eb !important;
				}

				.btn-primary a:hover {
					background-color: #2563eb !important;
					border-color: #2563eb !important;
				}

				.btn-secondary table td:hover {
					background-color: #374151 !important;
				}

				.btn-secondary a:hover {
					background-color: #374151 !important;
					border-color: #374151 !important;
				}
			}

			@media only screen and (max-width: 640px) {
				.main p,
				.main td,
				.main span {
					font-size: 16px !important;
				}

				.wrapper {
					padding: 16px !important;
				}

				.content {
					padding: 0 !important;
				}

				.container {
					padding: 0 !important;
					padding-top: 8px !important;
					width: 100% !important;
				}

				.main {
					border-left-width: 0 !important;
					border-radius: 0 !important;
					border-right-width: 0 !important;
				}

				.btn table {
					max-width: 100% !important;
					width: 100% !important;
				}

				.btn a {
					font-size: 16px !important;
					max-width: 100% !important;
					width: 100% !important;
				}

				.hero-title {
					font-size: 28px !important;
				}

				.step-number {
					font-size: 24px !important;
				}
			}

			@media all {
				.ExternalClass {
					width: 100%;
				}

				.ExternalClass,
				.ExternalClass p,
				.ExternalClass span,
				.ExternalClass font,
				.ExternalClass td,
				.ExternalClass div {
					line-height: 100%;
				}

				.apple-link a {
					color: inherit !important;
					font-family: inherit !important;
					font-size: inherit !important;
					font-weight: inherit !important;
					line-height: inherit !important;
					text-decoration: none !important;
				}

				#MessageViewBody a {
					color: inherit;
					text-decoration: none;
					font-size: inherit;
					font-family: inherit;
					font-weight: inherit;
					line-height: inherit;
				}
			}
		</style>
	</head>

	<body
		style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; font-size: 16px; line-height: 1.6; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; background-color: #f8fafc; margin: 0; padding: 0;"
	>
		<table
			role='presentation'
			border='0'
			cellpadding='0'
			cellspacing='0'
			class='body'
			style='border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f8fafc; width: 100%;'
			width='100%'
			bgcolor='#f8fafc'
		>
			<tr>
				<td
					style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; vertical-align: top;"
					valign='top'
				>&nbsp;</td>
				<td
					class='container'
					style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; vertical-align: top; max-width: 600px; padding: 0; padding-top: 24px; width: 600px; margin: 0 auto;"
					width='600'
					valign='top'
				>
					<div
						class='content'
						style='box-sizing: border-box; display: block; margin: 0 auto; max-width: 600px; padding: 0;'
					>

						<!-- PREHEADER -->
						<span
							class='preheader'
							style='color: transparent; display: none; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden; width: 0;'
						>
							Welcome to Haloway! Your journey to college essay success starts
							here. Let's get you started with your first draft.
						</span>

						<!-- MAIN CONTAINER -->
						<table
							role='presentation'
							border='0'
							cellpadding='0'
							cellspacing='0'
							class='main'
							style='border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; width: 100%; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);'
							width='100%'
						>

							<!-- HEADER SECTION -->
							<tr>
								<td
									class='wrapper'
									style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; vertical-align: top; box-sizing: border-box; padding: 32px 32px 24px 32px; text-align: center; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 12px 12px 0 0;"
									valign='top'
								>
									<h1
										class='hero-title'
										style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 32px; font-weight: 700; margin: 0; margin-bottom: 8px; color: #ffffff; letter-spacing: -0.025em;"
									>
										Welcome to Haloway! 🎓
									</h1>
									<p
										style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 18px; font-weight: normal; margin: 0; color: #e0e7ff; opacity: 0.9;"
									>
										Your college essay journey starts here
									</p>
								</td>
							</tr>

							<!-- MAIN CONTENT -->
							<tr>
								<td
									class='wrapper'
									style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; vertical-align: top; box-sizing: border-box; padding: 32px;"
									valign='top'
								>

									<p
										style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 18px; font-weight: normal; margin: 0; margin-bottom: 24px; color: #374151; line-height: 1.6;"
									>
										Hi there! 👋
									</p>

									<p
										style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 24px; color: #374151; line-height: 1.6;"
									>
										We're thrilled to have you join
										${props.companyName}! You've just taken the first step toward
										crafting compelling college essays that will help you stand
										out to admissions committees.
									</p>

									<!-- GETTING STARTED SECTION -->
									<div
										style='background-color: #f8fafc; border-radius: 8px; padding: 24px; margin-bottom: 24px; border: 1px solid #e5e7eb;'
									>
										<h2
											style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 20px; font-weight: 600; margin: 0; margin-bottom: 16px; color: #1f2937;"
										>
											Here's how to get started:
										</h2>

										<!-- STEP 1 -->
										<div
											style='display: flex; align-items: flex-start; margin-bottom: 16px;'
										>
											<div
												class='step-number'
												style='background-color: #3b82f6; color: #ffffff; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; margin-right: 12px; flex-shrink: 0; margin-top: 2px;'
											>
												1</div>
											<div>
												<p
													style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 500; margin: 0; margin-bottom: 4px; color: #1f2937;"
												>
													Create your first essay</p>
												<p
													style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: normal; margin: 0; color: #6b7280;"
												>
													Start with your Common App personal statement or any
													supplement essay</p>
											</div>
										</div>

										<!-- STEP 2 -->
										<div
											style='display: flex; align-items: flex-start; margin-bottom: 16px;'
										>
											<div
												class='step-number'
												style='background-color: #3b82f6; color: #ffffff; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; margin-right: 12px; flex-shrink: 0; margin-top: 2px;'
											>
												2</div>
											<div>
												<p
													style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 500; margin: 0; margin-bottom: 4px; color: #1f2937;"
												>
													Paste your essay prompt</p>
												<p
													style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: normal; margin: 0; color: #6b7280;"
												>
													Copy the prompt from Common App or your college's
													application portal</p>
											</div>
										</div>

										<!-- STEP 3 -->
										<div
											style='display: flex; align-items: flex-start; margin-bottom: 0;'
										>
											<div
												class='step-number'
												style='background-color: #3b82f6; color: #ffffff; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; margin-right: 12px; flex-shrink: 0; margin-top: 2px;'
											>
												3</div>
											<div>
												<p
													style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 500; margin: 0; margin-bottom: 4px; color: #1f2937;"
												>
													Start writing</p>
												<p
													style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: normal; margin: 0; color: #6b7280;"
												>
													That's it!
												</p>
											</div>
										</div>
									</div>

									<!-- CTA BUTTON -->
									<table
										role='presentation'
										border='0'
										cellpadding='0'
										cellspacing='0'
										class='btn btn-primary'
										style='border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; box-sizing: border-box; width: 100%; margin-bottom: 24px;'
										width='100%'
									>
										<tbody>
											<tr>
												<td
													align='center'
													style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; vertical-align: top;"
													valign='top'
												>
													<table
														role='presentation'
														border='0'
														cellpadding='0'
														cellspacing='0'
														style='border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: auto;'
													>
														<tbody>
															<tr>
																<td
																	style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; vertical-align: top; border-radius: 8px; text-align: center; background-color: #3b82f6;"
																	valign='top'
																	align='center'
																>
																	<a
																		href='${props.WebsiteBaseUrl}/schools/uncategorized/write'
																		target='_blank'
																		style='border: solid 2px #3b82f6; border-radius: 8px; box-sizing: border-box; cursor: pointer; display: inline-block; font-size: 16px; font-weight: 600; margin: 0; padding: 14px 28px; text-decoration: none; text-transform: none; background-color: #3b82f6; border-color: #3b82f6; color: #ffffff; letter-spacing: -0.025em;'
																	>
																		Start Writing Your First Essay
																	</a>
																</td>
															</tr>
														</tbody>
													</table>
												</td>
											</tr>
										</tbody>
									</table>

									<!-- TIPS SECTION -->
									<div
										style='border-left: 4px solid #fbbf24; background-color: #fffbeb; padding: 16px 20px; margin-bottom: 24px; border-radius: 0 6px 6px 0;'
									>
										<p
											style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 600; margin: 0; margin-bottom: 8px; color: #92400e;"
										>
											💡 Pro tip:
										</p>
										<p
											style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: normal; margin: 0; color: #92400e; line-height: 1.5;"
										>
											Don't worry about making your first draft perfect. Focus
											on getting your ideas down, and we'll help you refine them
											into a compelling narrative that admissions officers will
											love.
										</p>
									</div>

									<p
										style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 16px; color: #374151; line-height: 1.6;"
									>
										We're here to support you every step of the way. If you have
										any questions, just reply to this email—we'd love to hear
										from you!
									</p>

									<p
										style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: normal; margin: 0; color: #374151; line-height: 1.6;"
									>
										Best of luck with your essays! 🚀<br />
										<strong>The ${props.companyName} Team</strong>
									</p>

								</td>
							</tr>
						</table>

						<!-- FOOTER -->
						<div
							class='footer'
							style='clear: both; padding-top: 24px; text-align: center; width: 100%;'
						>
							<table
								role='presentation'
								border='0'
								cellpadding='0'
								cellspacing='0'
								style='border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;'
								width='100%'
							>
								<tr>
									<td
										class='content-block'
										style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; vertical-align: top; color: #9ca3af; font-size: 14px; text-align: center; padding-bottom: 8px;"
										valign='top'
										align='center'
									>
										<span
											class='apple-link'
											style='color: #9ca3af; font-size: 14px; text-align: center;'
										>
											${props.companyName}
											• Your College Essay Companion
										</span>
									</td>
								</tr>
								<tr>
									<td
										class='content-block'
										style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; vertical-align: top; color: #9ca3af; font-size: 14px; text-align: center;"
										valign='top'
										align='center'
									>
										<a
											href='${props.WebsiteBaseUrl}/settings'
											style='color: #3b82f6; font-size: 14px; text-align: center; text-decoration: underline;'
										>
											Unsubscribe
										</a>
									</td>
								</tr>
							</table>
						</div>

					</div>
				</td>
				<td
					style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; vertical-align: top;"
					valign='top'
				>&nbsp;</td>
			</tr>
		</table>
	</body>

</html>`;
}
