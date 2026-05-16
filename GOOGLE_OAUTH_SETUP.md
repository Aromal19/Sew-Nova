# Google OAuth Setup Guide for SewNova

## Backend Setup

### 1. Install Dependencies
The Google Auth library has been installed in the backend:
```bash
cd backend/auth-service
npm install google-auth-library
```

### 2. Environment Variables
Add the following to your `.env` file in `backend/auth-service/`:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
```

### 3. Get Google Client ID

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" in the left sidebar
5. Click "Create Credentials" → "OAuth 2.0 Client IDs"
6. Choose "Web application"
7. Add your domain to "Authorized JavaScript origins":
   - `http://localhost:5173` (for development)
   - `https://yourdomain.com` (for production)
8. Add your backend URL to "Authorized redirect URIs":
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
9. Copy the Client ID and add it to your `.env` file

## Frontend Setup

### 1. Install Dependencies
The Google OAuth React library has been installed:
```bash
cd frontend
npm install @react-oauth/google
```

### 2. Update Configuration
Update the `frontend/src/config/googleOAuth.js` file with your actual Google Client ID:

```javascript
export const GOOGLE_CLIENT_ID = "your_actual_google_client_id_here";
```

## Features Added

### Backend
- ✅ Google OAuth endpoint: `POST /api/customers/google-signin`
- ✅ Automatic user creation for new Google users
- ✅ Existing user login for returning Google users
- ✅ JWT token generation for Google users
- ✅ Updated customer model to support Google users

### Frontend
- ✅ Google Sign-In button on customer signup page
- ✅ Google OAuth provider wrapper
- ✅ Error handling for Google Sign-In
- ✅ Automatic navigation after successful Google Sign-In

## How It Works

1. User clicks the "Sign in with Google" button
2. Google OAuth popup opens
3. User authenticates with Google
4. Frontend receives the Google ID token
5. Frontend sends the token to backend
6. Backend verifies the token with Google
7. Backend creates or finds the user
8. Backend returns JWT token and user data
9. Frontend stores the token and navigates to dashboard

## Security Features

- ✅ Google ID token verification
- ✅ JWT token generation
- ✅ Secure password generation for Google users
- ✅ Email uniqueness validation
- ✅ Automatic profile image import from Google

## Testing

1. Start the backend server: `cd backend/auth-service && npm run dev`
2. Start the frontend: `cd frontend && npm run dev`
3. Navigate to the customer signup page
4. Click "Sign in with Google"
5. Complete the Google authentication
6. Verify you're redirected to the customer dashboard

## Notes

- Google users don't need to provide a phone number during signup
- Google users get their profile picture automatically imported
- The system handles both new and returning Google users
- All Google users are marked with `isGoogleUser: true` in the database 