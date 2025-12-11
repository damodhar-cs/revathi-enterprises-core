# Create Admin User Guide

## Problem

You're unable to login because no user exists in the database yet. The backend authenticates against MongoDB, so we need to create an initial admin user.

---

## Quick Solution

### Step 1: Ensure MongoDB is Running

```bash
# Check if MongoDB is running
mongosh

# If not running, start it:
# macOS:
brew services start mongodb-community

# Linux:
sudo systemctl start mongod

# Windows:
net start MongoDB
```

### Step 2: Run the Admin Creation Script

```bash
# Navigate to backend directory
cd revathi-enterprises

# Run the script
node scripts/create-admin.js
```

**Expected Output:**
```
🔌 Connecting to MongoDB...
✅ Connected to MongoDB
✅ Admin user created successfully!

📋 Login Credentials:
📧 Email: reddivaridamu25091999@gmail.com
🔐 Password: 121212

✅ You can now login with these credentials
🔌 Disconnected from MongoDB
```

### Step 3: Login

1. Open http://localhost:8000
2. Use the credentials:
   - Email: `reddivaridamu25091999@gmail.com`
   - Password: `121212`
3. Click "Sign In"

---

## Alternative: Create User Manually via MongoDB

If the script doesn't work, you can create the user manually:

```bash
# Open MongoDB shell
mongosh

# Use your database
use revathi-enterprises

# Create hashed password (bcrypt hash of "121212")
# You need to run this in Node.js or use the script
```

Actually, it's easier to just use the script provided above.

---

## Alternative: Register a New User via Frontend

If you prefer, you can also register a new user:

1. Go to http://localhost:8000
2. Click "Sign Up" or "Register"
3. Fill in the registration form:
   - First Name: Your Name
   - Email: your-email@example.com
   - Password: your-password
4. Submit the form
5. You'll be automatically logged in

---

## Troubleshooting

### Error: "ECONNREFUSED"

**Cause:** MongoDB is not running

**Solution:**
```bash
# Start MongoDB
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux
net start MongoDB                      # Windows
```

### Error: "Cannot find module 'bcryptjs'"

**Cause:** Dependencies not installed

**Solution:**
```bash
cd revathi-enterprises
npm install
```

### Error: "User already exists"

**Good news!** The user already exists. Just try logging in:
- Email: `reddivaridamu25091999@gmail.com`
- Password: `121212`

### Login Still Fails

1. **Check Backend is Running:**
   ```bash
   cd revathi-enterprises
   npm run start:dev
   ```
   Should see: `Application is running on: http://localhost:3000`

2. **Check Frontend is Running:**
   ```bash
   cd revathi-enterprises-ui
   npm run dev
   ```
   Should see: `Local: http://localhost:8000`

3. **Check Browser Console:**
   Open DevTools (F12) → Console tab
   Look for error messages

4. **Check Backend Logs:**
   Look at the terminal where backend is running
   Check for error messages when you try to login

5. **Verify Database Connection:**
   In backend `.env` file, check:
   ```env
   DATABASE_URL=mongodb://localhost:27017/revathi-enterprises
   ```

---

## Understanding the Authentication Flow

1. **Frontend** (http://localhost:8000):
   - User enters email & password
   - Sends POST request to `/auth/login`

2. **Backend** (http://localhost:3000):
   - Receives login request
   - Queries MongoDB for user with that email
   - Compares password hash
   - If valid, generates JWT token
   - Sends token + user data back

3. **Frontend**:
   - Stores token in localStorage
   - Sets user in state
   - Redirects to dashboard

**Important:** The hardcoded credentials in `authService.ts` are just a fallback. The real authentication happens via the backend.

---

## Production Notes

For production deployment:

1. **Remove Hardcoded Credentials:**
   - Edit `revathi-enterprises-ui/src/services/authService.ts`
   - Remove the hardcoded login block

2. **Change Default Password:**
   - Login with default credentials
   - Go to Profile → Change Password
   - Or update directly in database

3. **Use Strong Passwords:**
   - Minimum 8 characters
   - Include numbers, letters, special chars

4. **Use Environment Variables:**
   - Never commit passwords to git
   - Use `.env` files (gitignored)

---

## Quick Test

To verify everything works:

```bash
# Terminal 1: Start Backend
cd revathi-enterprises
npm run start:dev

# Terminal 2: Start Frontend  
cd revathi-enterprises-ui
npm run dev

# Terminal 3: Create Admin User
cd revathi-enterprises
node scripts/create-admin.js

# Then open browser:
# http://localhost:8000
# Login with: reddivaridamu25091999@gmail.com / 121212
```

---

## Need More Help?

If you're still having issues:

1. Check MongoDB is running: `mongosh`
2. Check backend logs for errors
3. Check browser console for errors
4. Verify `.env` file has correct DATABASE_URL
5. Try registering a new user via the registration page

---

**Status**: Ready to create admin user
**Script Location**: `scripts/create-admin.js`
**Database**: MongoDB (must be running)

