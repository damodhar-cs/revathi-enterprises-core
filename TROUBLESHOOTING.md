# Troubleshooting Gmail SMTP Authentication

## Error: "Invalid login: Username and Password not accepted"

This error means Gmail is rejecting your credentials. Follow these steps to fix it:

## ✅ Solution Steps

### Step 1: Check Your .env File

Make sure you have a `.env` file in the project root:

```bash
cd /Users/damodhar.reddy/Personal/projects/revathi-enterprises
ls -la .env
```

If the file doesn't exist:

```bash
cp .env.example .env
```

### Step 2: Verify 2-Step Verification is Enabled

1. Go to: https://myaccount.google.com/security
2. Look for "2-Step Verification" under "Signing in to Google"
3. **It must be ON** (blue toggle)
4. If it's OFF, click it and follow the setup process

**Important**: You CANNOT use App Passwords without 2-Step Verification!

### Step 3: Generate Gmail App Password

1. **Go to**: https://myaccount.google.com/apppasswords
   - Or: Google Account → Security → 2-Step Verification → App passwords

2. **If you see "App passwords" option**:
   - Click on it
   - Select "Mail" from the first dropdown
   - Select "Other (Custom name)" from the second dropdown
   - Type "Revathi Enterprises"
   - Click "Generate"
   - Copy the **16-character password** (example: `abcd efgh ijkl mnop`)

3. **If you DON'T see "App passwords" option**:
   - Make sure 2-Step Verification is enabled (see Step 2)
   - Wait a few minutes and try again
   - Try accessing directly: https://myaccount.google.com/apppasswords

### Step 4: Update .env File

Open `.env` file and update these lines:

```env
GMAIL_USER=your-actual-email@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
```

**Critical Points**:

- ✅ Use your **actual Gmail address** (e.g., `john.doe@gmail.com`)
- ✅ **Remove ALL spaces** from the app password
  - ❌ Wrong: `abcd efgh ijkl mnop`
  - ✅ Right: `abcdefghijklmnop`
- ✅ Don't use your regular Gmail password - use the App Password!
- ✅ No quotes around the values
- ✅ No extra spaces before or after

### Step 5: Restart the Server

After updating `.env`:

```bash
# Stop the server (Ctrl+C in the terminal)
# Then start it again:
npm run start:dev
```

### Step 6: Verify Success

Look for this message in the console:

```
✅ Email service is ready to send messages
📧 Configured sender: your-email@gmail.com
```

If you see warnings or errors, read them carefully and follow the instructions.

## 🔍 Common Mistakes

### Mistake 1: Using Regular Password

❌ **Wrong**: Using your Gmail login password
✅ **Right**: Using a 16-character App Password

### Mistake 2: Spaces in App Password

❌ **Wrong**: `GMAIL_APP_PASSWORD=abcd efgh ijkl mnop`
✅ **Right**: `GMAIL_APP_PASSWORD=abcdefghijklmnop`

### Mistake 3: 2-Step Verification Not Enabled

❌ **Wrong**: Trying to generate App Password without 2-Step Verification
✅ **Right**: Enable 2-Step Verification first

### Mistake 4: Quotes Around Values

❌ **Wrong**: `GMAIL_USER="your-email@gmail.com"`
✅ **Right**: `GMAIL_USER=your-email@gmail.com`

### Mistake 5: Placeholder Values Still Present

❌ **Wrong**: `GMAIL_USER=your-email@gmail.com` (literally)
✅ **Right**: `GMAIL_USER=john.doe@gmail.com` (your actual email)

## 🧪 Test Your Configuration

### Quick Test Script

Create a test file to verify your credentials:

```bash
cat > test-email.js << 'EOF'
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

console.log('Testing Gmail SMTP configuration...');
console.log('Email:', process.env.GMAIL_USER);
console.log('Password length:', process.env.GMAIL_APP_PASSWORD?.length || 0);

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  } else {
    console.log('✅ Connection successful!');
    console.log('You can now send emails.');
    process.exit(0);
  }
});
EOF

node test-email.js
```

## 🔐 Security Checklist

- [ ] `.env` file is in `.gitignore` (already configured)
- [ ] Never commit `.env` to version control
- [ ] Don't share your App Password with anyone
- [ ] Use different App Passwords for different applications
- [ ] Revoke old App Passwords you're not using

## 🌐 Alternative: Google Workspace

If you're using **Google Workspace** (business email):

1. Your email might be `user@yourcompany.com` instead of `@gmail.com`
2. The setup process is the same
3. You still need 2-Step Verification
4. You still generate an App Password
5. Use your workspace email in `GMAIL_USER`

## 📧 Still Not Working?

### Check These:

1. **Is your Gmail account suspended or restricted?**
   - Try logging into Gmail normally

2. **Are you using the correct email?**

   ```bash
   # Check what's in your .env (without showing the password)
   grep GMAIL_USER .env
   ```

3. **Is the app password correct?**
   - App passwords are exactly 16 characters
   - No spaces, no special characters except letters and numbers
   - Case doesn't matter (Gmail accepts both upper and lower)

4. **Server logs showing the right email?**
   - Check the server startup logs
   - Should show: `📧 Configured sender: your-email@gmail.com`

5. **Firewall or network issues?**
   - Make sure port 587 (SMTP) is not blocked
   - Try from a different network

### Generate a New App Password

If nothing works, generate a fresh App Password:

1. Go to: https://myaccount.google.com/apppasswords
2. **Delete** the old "Revathi Enterprises" app password
3. **Create** a new one
4. **Update** `.env` with the new password
5. **Restart** the server

## 📞 Need More Help?

### Useful Links:

- **Google Account Security**: https://myaccount.google.com/security
- **App Passwords**: https://myaccount.google.com/apppasswords
- **2-Step Verification Help**: https://support.google.com/accounts/answer/185839
- **App Passwords Help**: https://support.google.com/accounts/answer/185833

### Check Project Documentation:

- `GMAIL_SMTP_SETUP.md` - Complete setup guide
- `QUICK_START_EXPORT.md` - Quick reference
- `SALES_EXPORT_FEATURE.md` - Feature documentation

## ✅ Verification Checklist

Before asking for help, verify:

- [ ] 2-Step Verification is enabled on Google account
- [ ] App Password generated (16 characters)
- [ ] `.env` file exists in project root
- [ ] `GMAIL_USER` has your actual email (not placeholder)
- [ ] `GMAIL_APP_PASSWORD` has the app password (no spaces)
- [ ] No quotes around the values in `.env`
- [ ] Server restarted after updating `.env`
- [ ] No error messages about missing environment variables

## 🎯 Expected Success Output

When everything is configured correctly, you should see:

```
[Nest] 12345  - 15/11/2025, 3:45:07 pm   LOG [MailService] ✅ Email service is ready to send messages
[Nest] 12345  - 15/11/2025, 3:45:07 pm   LOG [MailService] 📧 Configured sender: your-email@gmail.com
```

Then when you export sales data, you should see:

```
[Nest] 12345  - 15/11/2025, 3:46:12 pm   LOG [MailService] Email sent successfully: <message-id@gmail.com>
```

---

**Still stuck?** Double-check each step carefully. The most common issue is spaces in the app password or using the wrong password type.
