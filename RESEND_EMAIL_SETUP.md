# Resend Email Setup Guide

This guide explains how to set up and configure the Resend email functionality in your Haloway project.

## What's Been Implemented

✅ **Mailer Service** (`src/lib/mailer.ts`)

- Resend SDK integration
- Handlebars template support
- Admin email notifications
- Templated email sending

✅ **Email Templates** (`src/lib/emails/`)

- Contact notification templates (HTML & Text)
- Professional, responsive design
- Handlebars variable support

✅ **Contact Form Integration**

- Updated contact form to send email notifications
- Database storage + email notifications
- Error handling and logging

## Setup Steps

### 1. Get Resend API Key

1. **Sign up at [resend.com](https://resend.com)**
2. **Navigate to API Keys** in your dashboard
3. **Create a new API key** (keep it secure!)
4. **Copy the API key** for the next step

### 2. Configure Environment Variables

Add these variables to your `.env` file:

```env
# Resend Configuration
PRIVATE_RESEND_API_KEY=re_your_api_key_here

# Email Configuration
PRIVATE_ADMIN_EMAIL=admin@yourdomain.com
PRIVATE_FROM_ADMIN_EMAIL=noreply@yourdomain.com
```

**Important Notes:**

- Replace `admin@yourdomain.com` with your actual admin email
- Replace `noreply@yourdomain.com` with your verified domain in Resend
- The `PRIVATE_FROM_ADMIN_EMAIL` must be a domain you've verified in Resend

### 3. Verify Your Domain in Resend

1. **Go to your Resend dashboard**
2. **Navigate to Domains**
3. **Add your domain** (e.g., `yourdomain.com`)
4. **Follow the DNS setup instructions**
5. **Wait for verification** (usually takes a few minutes)

### 4. Update Email Addresses

In `src/routes/(marketing)/contact/+page.server.ts`, update these lines:

```typescript
// Replace with your actual admin email
to_emails: ['admin@yourdomain.com'],

// Replace with your verified domain
from_email: 'noreply@yourdomain.com',
```

### 5. Test the Implementation

1. **Start your development server:**

   ```bash
   npm run dev
   ```

2. **Navigate to the contact page:**

   ```
   http://localhost:5173/contact
   ```

3. **Fill out and submit the form**

4. **Check your admin email** for the notification

## How It Works

### Email Flow

1. **User submits contact form**
2. **Form data is validated** (server-side)
3. **Data is saved to database** (`contact_messages` table)
4. **Email notification is sent** via Resend
5. **User sees success message**

### Email Templates

The system uses Handlebars templates located in `src/lib/emails/`:

- **`contact_notification_text.hbs`** - Plain text version
- **`contact_notification_html.hbs`** - HTML version with styling

### Template Variables

Available variables in contact notification templates:

- `{{name}}` - User's name
- `{{email}}` - User's email
- `{{subject}}` - Message subject
- `{{message}}` - Message body
- `{{timestamp}}` - Submission timestamp

## Customization

### Adding New Email Templates

1. **Create template files** in `src/lib/emails/`:

   - `your_template_text.hbs` (plain text)
   - `your_template_html.hbs` (HTML)

2. **Use the template** in your code:
   ```typescript
   await sendTemplatedEmail({
   	subject: 'Your Subject',
   	to_emails: ['recipient@example.com'],
   	from_email: 'noreply@yourdomain.com',
   	template_name: 'your_template',
   	template_properties: {
   		// Your variables here
   	},
   });
   ```

### Sending Admin Emails

For simple admin notifications:

```typescript
await sendAdminEmail({
	subject: 'Important Alert',
	body: 'Something happened that requires attention.',
});
```

## Troubleshooting

### Common Issues

1. **"Failed to send email" errors**

   - Check your Resend API key
   - Verify your domain is confirmed in Resend
   - Ensure environment variables are set correctly

2. **Template not found errors**

   - Check template file names match exactly
   - Ensure `.hbs` files are in `src/lib/emails/`
   - Verify Vite config includes `assetsInclude: ['**/*.hbs']`

3. **Email not received**
   - Check spam folder
   - Verify recipient email address
   - Check Resend dashboard for delivery status

### Debugging

The system includes comprehensive logging:

- **Console logs** for email sending attempts
- **Error details** for failed sends
- **Database insertion** confirmation

Check your server logs for detailed information about email operations.

## Security Considerations

1. **API Key Security**

   - Never commit API keys to version control
   - Use environment variables for all sensitive data
   - Rotate API keys regularly

2. **Email Validation**

   - All emails are validated server-side
   - Rate limiting should be implemented for production
   - Consider CAPTCHA for spam prevention

3. **Domain Verification**
   - Only send from verified domains
   - Monitor email deliverability
   - Set up proper SPF/DKIM records

## Production Deployment

1. **Set environment variables** in your production environment
2. **Verify domain** in Resend production account
3. **Test email functionality** in production
4. **Monitor email delivery** and bounce rates
5. **Set up email analytics** if needed

## Support

If you encounter issues:

1. **Check Resend documentation**: https://resend.com/docs
2. **Review server logs** for error details
3. **Verify all configuration** steps above
4. **Test with a simple email** first

The implementation is production-ready and follows best practices for email delivery and security.
