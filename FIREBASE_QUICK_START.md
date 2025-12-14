# Firebase Authentication - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Create Firebase Project (2 min)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Name it **"Revathi Enterprises"**
4. Disable Google Analytics (optional)
5. Click **"Create project"**

### Step 2: Get Service Account Credentials (1 min)

1. In Firebase Console: **⚙️ Settings** → **Project settings**
2. Go to **"Service accounts"** tab
3. Click **"Generate new private key"**
4. Click **"Generate key"** → JSON file downloads
5. Open the JSON file

### Step 3: Configure Environment Variables (1 min)

Copy these three values from your JSON file to `.env`:

```bash
# From downloaded JSON file
FIREBASE_PROJECT_ID=your-project-id-here
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Key-Here\n-----END PRIVATE KEY-----\n"
```

**Important**: Keep the quotes around `FIREBASE_PRIVATE_KEY` and include `\n` characters!

### Step 4: Enable Email/Password Authentication (1 min)

1. In Firebase Console: **Authentication** → **Sign-in method**
2. Click **"Email/Password"**
3. Toggle **"Enable"**
4. Click **"Save"**

### Step 5: Start Backend ✅

```bash
cd revathi-enterprises
npm run start:dev
```

**Success indicator:**
```
✅ Firebase Admin SDK initialized successfully
```

---

## 🧪 Test It Works

### Create a Test User

**Option A: Firebase Console**
1. Go to **Authentication** → **Users**
2. Click **"Add user"**
3. Enter email: `test@example.com`
4. Enter password: `password123`

**Option B: Frontend Code** (recommended)
```javascript
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const auth = getAuth();
await createUserWithEmailAndPassword(auth, "test@example.com", "password123");
```

### Get Token & Test API

```javascript
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const auth = getAuth();
const userCredential = await signInWithEmailAndPassword(
  auth, 
  "test@example.com", 
  "password123"
);

const token = await userCredential.user.getIdToken();
console.log("Token:", token);
```

**Test with cURL:**
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "uid": "firebase-user-uid",
  "email": "test@example.com",
  "email_verified": false
}
```

---

## 📡 Available Endpoints

### Reset Password
```bash
curl -X POST http://localhost:3000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### Change Password (Requires Token)
```bash
curl -X POST http://localhost:3000/auth/change-password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"newPassword": "newPassword123"}'
```

### Get Profile (Requires Token)
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎯 Frontend Integration Example

### Initialize Firebase (Frontend)

```javascript
// firebase-config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  // ... other config
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

### Login & Get Token

```javascript
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase-config";

async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    
    // Store token (localStorage, state management, etc.)
    localStorage.setItem('firebaseToken', token);
    
    return token;
  } catch (error) {
    console.error("Login failed:", error.message);
  }
}
```

### Make Authenticated API Calls

```javascript
async function fetchProtectedData() {
  const token = localStorage.getItem('firebaseToken');
  
  const response = await fetch('http://localhost:3000/products/search', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // search filters
    })
  });
  
  return await response.json();
}
```

### Auto-Refresh Expired Tokens

```javascript
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase-config";

onAuthStateChanged(auth, async (user) => {
  if (user) {
    // Get fresh token (automatically handles expiration)
    const token = await user.getIdToken();
    localStorage.setItem('firebaseToken', token);
  } else {
    // User logged out
    localStorage.removeItem('firebaseToken');
  }
});
```

---

## 🔒 Security Checklist

Before deploying to production:

- [ ] `.env` file is in `.gitignore`
- [ ] Service account JSON file is NOT committed to Git
- [ ] Firebase credentials are stored securely
- [ ] HTTPS is enabled in production
- [ ] CORS is properly configured
- [ ] Rate limiting is implemented
- [ ] Token expiration is handled in frontend
- [ ] Password reset links are sent via email (not exposed in API)

---

## 🚨 Common Issues & Fixes

### Issue: "Missing Firebase credentials"
```bash
# Check .env file exists
ls -la .env

# Verify all three variables are set
grep FIREBASE .env
```

### Issue: "401 Unauthorized"
- Token expired (get new token)
- Token from wrong Firebase project
- Missing `Bearer` prefix in Authorization header

### Issue: Build fails
```bash
# Reinstall dependencies
npm install

# Clean build
rm -rf dist
npm run build
```

---

## 📚 Next Steps

1. **Read Full Setup Guide**: See `FIREBASE_SETUP.md` for detailed information
2. **Check Implementation Summary**: See `FIREBASE_IMPLEMENTATION_SUMMARY.md`
3. **Customize Controllers**: Add your own protected endpoints
4. **Integrate Frontend**: Connect your React/Vue/Angular app

---

## 💡 Pro Tips

1. **Token Refresh**: Firebase tokens expire after 1 hour. Use `onAuthStateChanged` to auto-refresh.
2. **Error Handling**: Always handle 401 errors and redirect to login.
3. **Development**: Use Firebase Emulator Suite for local testing.
4. **Production**: Enable Firebase App Check for additional security.

---

**Need help?** Check the full documentation in `FIREBASE_SETUP.md` or open an issue! 🚀

