# Gmail SMTP Setup Guide

This guide will help you configure Gmail SMTP for sending sales export emails in the Revathi Enterprises application.

## Why Gmail SMTP?

Gmail SMTP is a free, reliable email service that supports sending emails with attachments. It's perfect for small to medium-sized businesses and provides:

- **Free tier**: Send up to 500 emails per day
- **Reliable delivery**: High deliverability rates
- **Easy setup**: Simple configuration with app passwords
- **Secure**: Supports TLS/SSL encryption
- **Attachment support**: Can send files up to 25MB

## Prerequisites

1. A Gmail account (personal or Google Workspace)
2. 2-Step Verification enabled on your Google account

## Step-by-Step Setup

### 1. Enable 2-Step Verification

1. Go to [Google Account Security Settings](https://myaccount.google.com/security)
2. Scroll down to "Signing in to Google"
3. Click on "2-Step Verification"
4. Follow the prompts to enable 2-Step Verification if not already enabled

### 2. Generate App Password

1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
   - Or navigate to: Google Account → Security → 2-Step Verification → App passwords
2. Select "Mail" from the "Select app" dropdown
3. Select "Other (Custom name)" from the "Select device" dropdown
4. Enter "Revathi Enterprises" or any descriptive name
5. Click "Generate"
6. Google will display a 16-character password (e.g., `abcd efgh ijkl mnop`)
7. **Copy this password immediately** - you won't be able to see it again

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file and update the following variables:

   ```env
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=abcdefghijklmnop
   ```

   **Important Notes:**
   - Remove all spaces from the app password (use `abcdefghijklmnop` not `abcd efgh ijkl mnop`)
   - Use your full Gmail address (e.g., `john.doe@gmail.com`)
   - For Google Workspace accounts, use your work email (e.g., `john@company.com`)

### 4. Test the Configuration

1. Restart the backend server:

   ```bash
   npm run start:dev
   ```

2. Check the console logs. You should see:

   ```
   Email service is ready to send messages
   ```

3. Test by exporting sales data from the Sales page in the frontend

## Troubleshooting

### Error: "Invalid login credentials"

**Solution:**

- Double-check that you've copied the app password correctly (no spaces)
- Ensure 2-Step Verification is enabled
- Try generating a new app password

### Error: "Username and Password not accepted"

**Solution:**

- Make sure you're using an App Password, not your regular Gmail password
- Verify that "Less secure app access" is not needed (App Passwords work with secure apps)

### Error: "Daily sending quota exceeded"

**Solution:**

- Gmail has a limit of 500 emails per day for regular accounts
- Consider upgrading to Google Workspace for higher limits (2,000 emails/day)
- Or use a dedicated email service like SendGrid, Mailgun, or Amazon SES

### Email not received

**Solution:**

- Check spam/junk folder
- Verify the recipient email address is correct
- Check server logs for any error messages
- Test with a different email address

## Email Sending Limits

### Gmail (Free)

- **Limit**: 500 emails per day
- **Attachment size**: Up to 25MB
- **Best for**: Small teams, testing, low volume

### Google Workspace

- **Limit**: 2,000 emails per day
- **Attachment size**: Up to 25MB
- **Best for**: Medium-sized businesses

## Alternative Free Email Services

If you need more than Gmail's free tier, consider:

1. **SendGrid**
   - Free tier: 100 emails/day
   - Easy API integration
   - Better for transactional emails

2. **Mailgun**
   - Free tier: 5,000 emails/month
   - Good deliverability
   - API-based

3. **Elastic Email**
   - Free tier: 100 emails/day
   - SMTP and API support

4. **Brevo (formerly Sendinblue)**
   - Free tier: 300 emails/day
   - Marketing features included

## Security Best Practices

1. **Never commit `.env` file to version control**
   - The `.env` file is already in `.gitignore`
   - Always use `.env.example` as a template

2. **Rotate app passwords regularly**
   - Generate new app passwords every few months
   - Revoke old passwords from [Google App Passwords](https://myaccount.google.com/apppasswords)

3. **Use environment-specific configurations**
   - Different email accounts for development, staging, and production
   - Monitor email sending for suspicious activity

4. **Implement rate limiting**
   - The current implementation doesn't have rate limiting
   - Consider adding rate limiting for export requests

## Production Recommendations

For production environments:

1. **Use Google Workspace** if staying with Gmail
2. **Consider dedicated email services** like SendGrid or Amazon SES for better:
   - Deliverability tracking
   - Bounce handling
   - Email analytics
   - Higher sending limits

3. **Implement email queuing** for high-volume scenarios
4. **Add monitoring and alerting** for failed email sends
5. **Set up email templates** in a dedicated email service

## Support

If you encounter issues not covered in this guide:

1. Check [Gmail SMTP documentation](https://support.google.com/mail/answer/7126229)
2. Review [Google App Passwords help](https://support.google.com/accounts/answer/185833)
3. Contact your system administrator

## Current Implementation

The email service (`src/mail/mail.service.ts`) uses:

- **Service**: Gmail SMTP (`smtp.gmail.com`)
- **Port**: 587 (TLS) - automatically configured by nodemailer
- **Authentication**: OAuth2 via App Password
- **Features**:
  - HTML email templates
  - Attachment support
  - Professional formatting
  - Error handling and logging

## Sample Export Email

When a user exports sales data, they receive an email with:

- Professional HTML formatting
- Export details (record count, filters, date)
- Excel file as attachment
- Summary information

The email is sent from your configured Gmail account to the recipient specified in the export modal.
