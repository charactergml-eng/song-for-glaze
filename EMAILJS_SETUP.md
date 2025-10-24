# EmailJS Setup Guide

This guide will help you set up automated email sending for the rating form using EmailJS.

## Step 1: Create an EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click "Sign Up" and create a free account
3. Verify your email address

## Step 2: Add an Email Service

1. Once logged in, go to **Email Services** in the sidebar
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the instructions to connect your email account
   - For Gmail: You may need to create an App Password if you have 2FA enabled
   - For Outlook: Use your regular password
5. Click **Create Service**
6. **Save your Service ID** (you'll need this later)

## Step 3: Create an Email Template

1. Go to **Email Templates** in the sidebar
2. Click **Create New Template**
3. Use this template structure:

```
Subject: New Rating for Song for Glaze

Rating: {{rating}}

Comment: {{comment}}

---
Sent via Song for Glaze Rating Form
```

4. In the template settings:
   - **To Email**: Use `{{to_email}}` or enter your email directly
   - **From Name**: "Song for Glaze Ratings"
   - **Reply To**: You can use your email or leave blank

5. Click **Save**
6. **Save your Template ID** (you'll need this later)

## Step 4: Get Your Public Key

1. Click on your profile/account in the top right
2. Go to **General** (or **Account**)
3. Find your **Public Key** (it looks like: `xyzABC123-defGHI456`)
4. **Save this Public Key** (you'll need this later)

## Step 5: Configure Your App

1. Open the `.env.local` file in your project root
2. Replace the placeholder values with your actual EmailJS credentials:

```env
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_actual_public_key
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_actual_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_actual_template_id
NEXT_PUBLIC_EMAIL_TO=your-email@example.com
```

**Example:**
```env
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xyzABC123-defGHI456
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_abc1234
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_xyz5678
NEXT_PUBLIC_EMAIL_TO=myemail@gmail.com
```

## Step 6: Test Your Setup

1. Save the `.env.local` file
2. Restart your development server:
   ```bash
   npm run dev
   ```
3. Navigate to the rating page (`/rate`)
4. Fill out the form and submit
5. Check your email inbox for the rating submission

## Troubleshooting

### Email Not Sending

- **Check your Public Key**: Make sure it's correct in `.env.local`
- **Check Service ID and Template ID**: Verify they match your EmailJS dashboard
- **Check browser console**: Look for error messages
- **EmailJS Dashboard**: Go to Auto-reply > Activity to see if the email was sent

### "Failed to submit" Error

- **Network Issues**: Check your internet connection
- **Invalid Credentials**: Double-check all IDs in `.env.local`
- **EmailJS Limit**: Free tier has 200 emails/month limit
- **CORS Issues**: Make sure your domain is allowed in EmailJS settings

### Emails Going to Spam

- **Add to Contacts**: Add the sending email to your contacts
- **Check Spam Folder**: The first few emails might go to spam
- **Configure SPF/DKIM**: If using a custom domain (advanced)

## EmailJS Free Tier Limits

- **200 emails per month**
- **Basic email templates**
- **Community support**

If you need more, you can upgrade to a paid plan on the EmailJS website.

## Security Notes

- The `.env.local` file is already in `.gitignore` so your keys won't be committed to Git
- The Public Key is safe to use in client-side code (it's designed for that)
- Your email password is NOT exposed (EmailJS handles the connection securely)

## Alternative: Using Your Own SMTP

If you prefer not to use EmailJS, you can:
1. Set up a simple backend API route in Next.js
2. Use nodemailer with your email provider's SMTP settings
3. Keep the backend minimal (just one API route for sending emails)

This would require adding a `/app/api/send-email/route.ts` file.
