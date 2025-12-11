/**
 * Test Gmail SMTP Configuration
 * 
 * This script helps verify your Gmail SMTP setup before running the main application.
 * 
 * Usage:
 *   node test-gmail-smtp.js
 */

const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

// Load environment variables
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
  console.log('✅ .env file found\n');
} else {
  console.error('❌ .env file not found!');
  console.log('📝 Create one by copying .env.example:');
  console.log('   cp .env.example .env\n');
  process.exit(1);
}

// Get credentials
const gmailUser = process.env.GMAIL_USER;
const gmailPassword = process.env.GMAIL_APP_PASSWORD;

console.log('='.repeat(60));
console.log('Gmail SMTP Configuration Test');
console.log('='.repeat(60));
console.log();

// Check if credentials are set
console.log('📧 Checking environment variables...');
console.log(`   GMAIL_USER: ${gmailUser ? '✅ Set' : '❌ Not set'}`);
console.log(`   GMAIL_APP_PASSWORD: ${gmailPassword ? '✅ Set' : '❌ Not set'}`);
console.log();

if (!gmailUser || !gmailPassword) {
  console.error('❌ Missing Gmail credentials in .env file!\n');
  console.log('📖 Follow these steps:');
  console.log('1. Edit the .env file');
  console.log('2. Set GMAIL_USER=your-email@gmail.com');
  console.log('3. Set GMAIL_APP_PASSWORD=your-app-password');
  console.log('4. Save and run this test again\n');
  console.log('📚 See GMAIL_SMTP_SETUP.md for detailed instructions');
  process.exit(1);
}

// Check for placeholder values
const placeholders = [
  'your-email@gmail.com',
  'your-app-password',
  'your-16-character-app-password'
];

if (placeholders.includes(gmailUser) || placeholders.includes(gmailPassword)) {
  console.warn('⚠️  WARNING: Using placeholder values!\n');
  console.log('You need to replace the placeholder values with real credentials:');
  console.log('1. Go to: https://myaccount.google.com/apppasswords');
  console.log('2. Generate a new App Password');
  console.log('3. Update .env with your real email and app password\n');
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(gmailUser)) {
  console.error(`❌ Invalid email format: ${gmailUser}\n`);
  console.log('Please use a valid email address like: john.doe@gmail.com');
  process.exit(1);
}

// Check password length and format
console.log('🔐 Validating credentials...');
console.log(`   Email: ${gmailUser}`);
console.log(`   Password length: ${gmailPassword.length} characters`);

if (gmailPassword.length !== 16) {
  console.warn(`   ⚠️  Warning: App passwords are typically 16 characters`);
  console.warn(`   Current length: ${gmailPassword.length}`);
}

if (gmailPassword.includes(' ')) {
  console.error('\n❌ ERROR: App password contains spaces!');
  console.log('Remove all spaces from the app password in your .env file.');
  console.log('Change from: abcd efgh ijkl mnop');
  console.log('         to: abcdefghijklmnop\n');
  process.exit(1);
}

console.log();

// Test SMTP connection
console.log('🔄 Testing SMTP connection...');
console.log('   This may take a few seconds...\n');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailUser,
    pass: gmailPassword,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Connection FAILED!\n');
    console.error('Error:', error.message);
    console.log();
    console.log('='.repeat(60));
    console.log('Troubleshooting Steps:');
    console.log('='.repeat(60));
    console.log();
    console.log('1️⃣  Enable 2-Step Verification');
    console.log('   → https://myaccount.google.com/security');
    console.log();
    console.log('2️⃣  Generate App Password');
    console.log('   → https://myaccount.google.com/apppasswords');
    console.log('   → Select "Mail" and "Other (Custom name)"');
    console.log('   → Name it "Revathi Enterprises"');
    console.log('   → Copy the 16-character password (remove spaces!)');
    console.log();
    console.log('3️⃣  Update .env file');
    console.log('   GMAIL_USER=your-actual-email@gmail.com');
    console.log('   GMAIL_APP_PASSWORD=abcdefghijklmnop  # no spaces!');
    console.log();
    console.log('4️⃣  Run this test again');
    console.log('   node test-gmail-smtp.js');
    console.log();
    console.log('📖 See TROUBLESHOOTING.md for more help');
    console.log();
    process.exit(1);
  } else {
    console.log('✅ Connection SUCCESSFUL!');
    console.log();
    console.log('='.repeat(60));
    console.log('Gmail SMTP is properly configured!');
    console.log('='.repeat(60));
    console.log();
    console.log(`📧 Sender email: ${gmailUser}`);
    console.log('🎉 You can now send emails from your application!');
    console.log();
    console.log('Next steps:');
    console.log('1. Start your application: npm run start:dev');
    console.log('2. Go to the Sales page');
    console.log('3. Click the "Export" button');
    console.log('4. Enter a recipient email');
    console.log('5. Check your inbox!');
    console.log();
    process.exit(0);
  }
});

