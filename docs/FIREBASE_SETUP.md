# Firebase Authentication Setup Guide

This guide will help you set up Firebase Authentication for the Chess Activities application.

## Prerequisites
- A Google account
- Node.js and npm installed
- The project cloned and dependencies installed

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `chess-activities` (or your preferred name)
4. Disable Google Analytics (optional for this project)
5. Click "Create project"

## Step 2: Register Your Web App

1. In your Firebase project dashboard, click the **Web icon** (`</>`) to add a web app
2. Enter app nickname: `Chess Activities Web`
3. **Do NOT** check "Firebase Hosting" (we'll set this up separately)
4. Click "Register app"
5. Copy the Firebase configuration object (you'll need this in Step 4)

The config looks like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## Step 3: Enable Authentication Methods

1. In the Firebase Console, go to **Build** → **Authentication**
2. Click "Get started"
3. Click on the **Sign-in method** tab
4. Enable **Email/Password**:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

## Step 4: Configure Your Application

1. Open `src/environments/environment.ts`
2. Replace the placeholder values with your Firebase config:

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "YOUR_API_KEY",              // Replace with your apiKey
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",  // Replace
    projectId: "YOUR_PROJECT_ID",         // Replace
    storageBucket: "YOUR_PROJECT_ID.appspot.com",   // Replace
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",  // Replace
    appId: "YOUR_APP_ID"                  // Replace
  }
};
```

3. Open `src/environments/environment.prod.ts` and add the same configuration:

```typescript
export const environment = {
  production: true,
  firebase: {
    // Same configuration as above
  }
};
```

## Step 5: Set Up Firestore Database

1. In Firebase Console, go to **Build** → **Firestore Database**
2. Click "Create database"
3. Choose **Start in test mode** (for development)
4. Select your Cloud Firestore location (choose closest to your users)
5. Click "Enable"

### Security Rules for Production

Once you're ready to deploy, update Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      // Users can read their own profile
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Only authenticated users can create their profile
      allow create: if request.auth != null && request.auth.uid == userId;
      
      // Users can update their own profile (except role)
      allow update: if request.auth != null 
                    && request.auth.uid == userId
                    && !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role']);
      
      // Admins can update any user
      allow update: if request.auth != null 
                    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Quiz results collection
    match /results/{resultId} {
      // Users can read their own results
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      
      // Users can create their own results
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      
      // Admins can read all results
      allow read: if request.auth != null 
                  && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Step 6: Create Your First Admin User

**Important:** By default, all new users are created with role `'user'`. To create an admin:

1. Sign up through the app as a regular user
2. Go to Firebase Console → **Firestore Database**
3. Find the `users` collection
4. Click on your user document
5. Edit the `role` field from `'user'` to `'admin'`
6. Save changes
7. Refresh your app to see admin features

### Alternative: Create admin programmatically

You can also create a cloud function to promote users to admin:

```typescript
// In Firebase Console → Functions (requires Blaze plan)
export const makeAdmin = functions.https.onCall(async (data, context) => {
  // Check if caller is already admin
  const callerDoc = await admin.firestore()
    .collection('users')
    .doc(context.auth.uid)
    .get();
    
  if (callerDoc.data()?.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Must be admin');
  }
  
  // Make target user admin
  await admin.firestore()
    .collection('users')
    .doc(data.userId)
    .update({ role: 'admin' });
    
  return { success: true };
});
```

## Step 7: Test the Authentication

1. Start your development server:
   ```bash
   npm start
   ```

2. Navigate to http://localhost:4200

3. Test sign up:
   - Click "Sign Up"
   - Enter display name, email, and password
   - Submit form
   - You should be redirected to home page

4. Test sign out:
   - Click "Logout" in navigation
   - You should see "Login" and "Sign Up" buttons

5. Test sign in:
   - Click "Login"
   - Enter your credentials
   - You should be logged in and see your name in navigation

6. Test protected routes:
   - Try accessing `/quiz` without logging in → Should redirect to login
   - Try accessing `/admin` as regular user → Should redirect to home
   - Log in as admin → Should see Admin link in navigation

## Step 8: Deploy to Firebase Hosting (Optional)

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   firebase init
   ```
   - Select **Hosting**
   - Choose your Firebase project
   - Set public directory: `dist/ChessApp/browser`
   - Configure as single-page app: **Yes**
   - Set up automatic builds: **No**

4. Build your app:
   ```bash
   npm run build
   ```

5. Deploy:
   ```bash
   firebase deploy
   ```

Your app will be live at: `https://your-project-id.web.app`

## Troubleshooting

### "Firebase config not found" error
- Check that environment.ts has the correct Firebase config
- Ensure you've replaced ALL placeholder values

### "Permission denied" on Firestore
- Check your Firestore security rules
- Make sure you're authenticated before accessing protected data

### "User not found" after sign up
- Check Firestore console to see if user document was created
- Verify createUserProfile method is being called

### Can't access admin features
- Verify your user's role in Firestore is set to 'admin'
- Refresh the page after changing the role
- Check browser console for errors

## Features Implemented

✅ Email/Password authentication with Firebase  
✅ User sign up with display name  
✅ User login  
✅ User logout  
✅ User profiles stored in Firestore  
✅ Role-based access control (Admin/User)  
✅ Auth guards protecting routes  
✅ Navigation updates based on auth state  
✅ Quiz route protected (requires login)  
✅ Admin route protected (requires admin role)  

## Next Steps

- [ ] Add password reset functionality
- [ ] Add email verification
- [ ] Add Google Sign-in
- [ ] Add user profile page
- [ ] Store quiz results in Firestore
- [ ] Add leaderboard with Firestore
- [ ] Add user statistics dashboard

## Support

For more information, visit:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Angular Fire Documentation](https://github.com/angular/angularfire)
