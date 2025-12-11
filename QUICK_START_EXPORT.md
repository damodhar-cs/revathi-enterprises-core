# 🚀 Sales Export - Quick Start Guide

## 5-Minute Setup

### Step 1: Get Gmail App Password (2 minutes)

1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" → "Other (Custom name)" → Enter "Revathi Enterprises"
3. Click "Generate"
4. Copy the 16-character password (example: `abcd efgh ijkl mnop`)

### Step 2: Configure Environment (1 minute)

```bash
cd /Users/damodhar.reddy/Personal/projects/revathi-enterprises
cp .env.example .env
```

Edit `.env` file:
```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop  # Remove spaces!
```

### Step 3: Restart Server (1 minute)

```bash
npm run start:dev
```

Look for: `"Email service is ready to send messages"` ✅

### Step 4: Test Export (1 minute)

1. Open http://localhost:5173/sales (or your frontend URL)
2. Click the green **"Export"** button
3. Enter your email address
4. Click **"Export & Send"**
5. Check your email inbox!

## 📧 What You'll Receive

- **Subject**: Sales Export Report - Revathi Enterprises
- **Attachment**: Excel file with all sales data
- **Contents**: 23 columns + summary statistics

## 🎯 Use Cases

### Daily Reports
```
1. No filters → Export all sales
2. Enter manager's email
3. Send!
```

### Branch Reports
```
1. Filter by branch
2. Click Export
3. Email to branch manager
```

### Monthly Reports
```
1. Set date range (1st to 31st)
2. Click Export
3. Email to accounting
```

## ⚡ Pro Tips

- **No filters** = Export all sales data
- **With filters** = Export only filtered data
- Check **spam folder** if email not received
- Excel file works with Microsoft Excel, Google Sheets, LibreOffice

## 🆘 Common Issues

### Error: "Invalid login credentials"
➡️ Check `.env` file - ensure no spaces in app password

### Email not received
➡️ Check spam folder
➡️ Wait 1-2 minutes
➡️ Try different email address

### Export button disabled
➡️ Ensure sales data exists
➡️ Refresh the page

## 📊 Limits

- **Gmail Free**: 500 emails/day
- **Attachment**: Up to 25MB
- **Cost**: FREE forever!

## 🔗 More Help

- **Detailed Gmail Setup**: See `GMAIL_SMTP_SETUP.md`
- **Feature Documentation**: See `SALES_EXPORT_FEATURE.md`
- **Full Summary**: See `IMPLEMENTATION_SUMMARY.md`

## ✅ Checklist

- [ ] Gmail App Password generated
- [ ] `.env` file configured
- [ ] Server restarted
- [ ] "Email service ready" message seen
- [ ] Test export successful
- [ ] Email received

---

**That's it! You're ready to export sales data! 🎉**

Need help? Check the documentation files above.

