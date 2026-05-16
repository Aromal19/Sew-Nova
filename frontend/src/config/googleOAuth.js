// Google OAuth Configuration
export const GOOGLE_CLIENT_ID = "648036319844-qp2nk1cg25ukh0j9ritk0mtbslbbccqk.apps.googleusercontent.com";

export const googleOAuthConfig = {
  clientId: GOOGLE_CLIENT_ID,
  scope: "email profile",
  prompt: "select_account"
};

// Google Sign-In button configuration
export const googleButtonConfig = {
  type: "standard",
  theme: "outline",
  size: "large",
  text: "signin_with",
  shape: "rectangular",
  logo_alignment: "left"
  // Note: width should not be set to "100%" as it's invalid for Google Sign-In buttons
  // The button will automatically size based on the container
}; 