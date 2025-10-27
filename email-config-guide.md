# Email Configuration Guide for CivicSignal

## Gmail SMTP Setup

The SSL certificate error you're experiencing is common with Gmail SMTP. Here are the solutions:

### Option 1: Use App Password (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. **Update your .env.local**:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-character-app-password
   SMTP_FROM=noreply@civicsignal.com
   ```

### Option 2: Alternative SMTP Services

#### SendGrid (Recommended for Production)
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

#### Mailgun
```
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
```

### Option 3: Development Only (Less Secure)

For development/testing only, you can use:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-password
```

And enable "Less secure app access" in Gmail settings (not recommended for production).

## Current Configuration Applied

I've updated the email transporter with:
- SSL certificate validation disabled for development
- Extended timeouts
- Better error logging
- Connection verification before sending

## Testing Email

You can test the email configuration by checking the console logs when registering a user. The logs will show:
- Email transporter verification status
- Detailed error messages if sending fails
- Success confirmation with message ID

## Troubleshooting

1. **Check environment variables** are properly set
2. **Verify Gmail app password** is correct (16 characters, no spaces)
3. **Check firewall/network** restrictions
4. **Try alternative SMTP service** for production use
