# Quick Start Guide - Revathi Enterprises

## 🚀 Getting Started in 5 Minutes

This guide will help you run the complete Revathi Enterprises application locally.

---

## Prerequisites

Ensure you have installed:
- **Node.js**: v18 or higher
- **MongoDB**: v5 or higher (running locally or remote)
- **npm**: v8 or higher

---

## 📦 Installation Steps

### 1. Backend Setup

```bash
# Navigate to backend directory
cd revathi-enterprises

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file with your settings
nano .env
```

**Required Environment Variables:**
```env
# Database
DATABASE_URL=mongodb://localhost:27017/revathi-enterprises

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this

# Email (Gmail SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-16-char-app-password
MAIL_FROM=your-email@gmail.com
```

**Gmail SMTP Setup** (See `GMAIL_SMTP_SETUP.md` for detailed instructions):
1. Enable 2-Step Verification in Google Account
2. Generate App Password
3. Use 16-character password (no spaces) in MAIL_PASS

```bash
# Build the application
npm run build

# Start the backend server
npm run start:dev
```

Backend will be running at: **http://localhost:3000**

---

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd ../revathi-enterprises-ui

# Install dependencies
npm install

# Start the development server
npm run dev
```

Frontend will be running at: **http://localhost:8000**

---

## 🎯 Default Login Credentials

For testing purposes, there's a hardcoded admin user:

```
Email: reddivaridamu25091999@gmail.com
Password: 121212
```

**⚠️ Change this in production!**

---

## ✅ Verify Installation

### Backend Health Check
```bash
curl http://localhost:3000
```

Should return: Application info

### Frontend Access
Open browser: http://localhost:8000

You should see the login page.

---

## 📱 Testing PWA Features

### Desktop
1. Open http://localhost:8000 in Chrome
2. Look for install icon (⊕) in address bar
3. Click to install
4. App opens in standalone window

### Mobile
1. Open http://localhost:8000 in mobile browser
2. Use "Add to Home Screen" option
3. App icon appears on home screen
4. Opens full-screen like native app

### Offline Mode
1. Visit some pages while online
2. Open DevTools → Network tab
3. Select "Offline" throttling
4. Navigate - cached pages still work!

---

## 🗂️ Project Structure

```
projects/
├── revathi-enterprises/        # Backend (NestJS)
│   ├── src/
│   │   ├── dashboard/         # Dashboard APIs
│   │   ├── customers/         # Customer management APIs
│   │   ├── sales/             # Sales + Receipt APIs
│   │   ├── products/          # Products APIs
│   │   ├── variants/          # Variants APIs
│   │   ├── users/             # User management APIs
│   │   ├── auth/              # Authentication APIs
│   │   ├── mail/              # Email service
│   │   └── common/            # Shared utilities
│   └── dist/                  # Compiled output
│
└── revathi-enterprises-ui/    # Frontend (React)
    ├── src/
    │   ├── pages/             # All pages
    │   ├── components/        # Reusable components
    │   ├── services/          # API services
    │   ├── context/           # React context
    │   └── common/            # Constants & utilities
    └── dist/                  # Build output
```

---

## 🔧 Common Commands

### Backend
```bash
# Development mode with hot reload
npm run start:dev

# Production build
npm run build

# Production mode
npm run start:prod

# Run linter
npm run lint

# Format code
npm run format
```

### Frontend
```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Type check
npm run tsc

# Lint
npm run lint
```

---

## 🌐 API Endpoints

### Base URL
```
http://localhost:3000
```

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/profile` - Get current user

### Dashboard
- `GET /dashboard/stats` - Dashboard statistics

### Customers
- `GET /customers` - List customers
- `GET /customers/:phone` - Customer details
- `GET /customers/:phone/sales` - Customer sales history

### Sales
- `GET /sales` - List sales
- `POST /sales` - Create sale
- `GET /sales/:id` - Sale details
- `GET /sales/:id/receipt` - Download receipt PDF
- `POST /sales/:id/receipt/email` - Email receipt
- `POST /sales/export` - Export sales to Excel

### Products
- `GET /products` - List products
- `POST /products` - Create product
- `GET /products/:id` - Product details
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### Variants
- `GET /variants` - List variants
- `POST /variants` - Create variant
- `GET /variants/:id` - Variant details
- `PUT /variants/:id` - Update variant
- `DELETE /variants/:id` - Delete variant

### Users
- `GET /users` - List users
- `POST /users` - Create user
- `GET /users/:id` - User details
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

---

## 🎨 Features Overview

### 1. Dashboard
- Today's sales metrics
- Weekly/monthly comparisons
- Inventory status
- Top products
- Recent transactions
- Branch performance

### 2. Customer Management
- Customer list with search
- Purchase history
- Lifetime value calculation
- Customer details

### 3. Sales Management
- Create new sales
- View sales history
- Filter by date/branch
- Export to Excel
- Generate PDF receipts
- Email receipts

### 4. Inventory Management
- Product catalog
- Variant tracking
- Stock status badges
- Low stock alerts
- Category/brand filtering

### 5. User Management
- User CRUD operations
- Role-based access
- Profile management

### 6. PWA Features
- Offline support
- Install on device
- Push updates
- Fast loading

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if MongoDB is running
mongosh

# Check if port 3000 is available
lsof -i :3000

# Check environment variables
cat .env
```

### Frontend won't start
```bash
# Check if port 8000 is available
lsof -i :8000

# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### Database connection failed
- Verify MongoDB is running: `mongosh`
- Check DATABASE_URL in .env
- Ensure no firewall blocking connection

### Email not sending
- See `GMAIL_SMTP_SETUP.md` and `TROUBLESHOOTING.md`
- Verify 2-Step Verification enabled
- Check App Password is correct (no spaces)
- Test with `node test-gmail-smtp.js`

### PWA not working
- Use HTTPS in production (localhost OK for dev)
- Check service worker in DevTools → Application
- Clear cache and reload
- Verify manifest.json is accessible

---

## 📚 Documentation

- **Gmail Setup**: `GMAIL_SMTP_SETUP.md`
- **Sales Export**: `SALES_EXPORT_FEATURE.md`
- **Logging**: `LOGGER_IMPLEMENTATION.md`
- **PWA**: `PWA_SETUP.md`
- **Troubleshooting**: `TROUBLESHOOTING.md`
- **Complete Summary**: `FINAL_IMPLEMENTATION_SUMMARY.md`

---

## 🔐 Security Notes

### Development
- Change default admin credentials
- Use strong JWT_SECRET
- Keep .env file out of version control

### Production
- Use HTTPS (required for PWA)
- Set secure JWT_SECRET (random, long)
- Use strong database passwords
- Enable CORS only for trusted origins
- Implement rate limiting
- Regular security updates

---

## 🚀 Production Deployment

### Backend
```bash
# Build
npm run build

# Set NODE_ENV
export NODE_ENV=production

# Start
npm run start:prod
```

### Frontend
```bash
# Build
npm run build

# Serve with nginx/apache
# Or use: npm run preview
```

### Environment Variables (Production)
```env
NODE_ENV=production
DATABASE_URL=mongodb://prod-server/db
JWT_SECRET=very-long-random-string
MAIL_HOST=smtp.gmail.com
MAIL_USER=business@company.com
MAIL_PASS=app-password
MAIL_FROM=noreply@company.com
```

---

## 💡 Tips & Best Practices

1. **Regular Backups**: Backup MongoDB daily
2. **Monitor Logs**: Check logs for errors
3. **Update Dependencies**: Keep packages updated
4. **Test Before Deploy**: Always test in staging
5. **Use Environment Variables**: Never hardcode secrets
6. **Enable Logging**: Use LoggerService for debugging
7. **Monitor Performance**: Track slow queries
8. **User Feedback**: Listen to user reports
9. **Documentation**: Keep docs updated
10. **Code Reviews**: Review changes before merging

---

## 📞 Support

For issues and questions:
1. Check documentation files first
2. Review `TROUBLESHOOTING.md`
3. Check browser console for errors
4. Check backend logs
5. Verify environment variables

---

## ✨ What's New in v2.0

- ✅ Dashboard with business metrics
- ✅ Customer management system
- ✅ PDF receipt generation
- ✅ Email receipts to customers
- ✅ Progressive Web App (PWA)
- ✅ Full mobile responsiveness
- ✅ Offline support
- ✅ Professional code quality
- ✅ Comprehensive logging
- ✅ Enhanced error handling

---

**Status**: ✅ Production Ready
**Version**: 2.0.0
**Last Updated**: November 2025

---

## 🎉 You're All Set!

Your Revathi Enterprises application is now running. Happy managing! 🚀

