# No-Login Branch Setup

This branch uses hardcoded credentials for auto-login - perfect for family use where you don't want your 7-year-old to deal with login screens.

## Setup Instructions

1. **Edit `src/autoLoginConfig.js`**:
   ```javascript
   export const AUTO_LOGIN_CONFIG = {
     email: 'your-actual-email@example.com',
     password: 'your-actual-password'
   };
   ```

2. **Important**: The `autoLoginConfig.js` file is in `.gitignore` and won't be pushed to GitHub. This keeps your credentials private.

3. **Deploy to Vercel**:
   - When you deploy this branch, you need to manually create `src/autoLoginConfig.js` on Vercel
   - OR use Vercel's build environment variables to create it during deployment

4. **For Vercel deployment**, add a build script that creates the file:
   - Set environment variables in Vercel: `VITE_AUTO_LOGIN_EMAIL` and `VITE_AUTO_LOGIN_PASSWORD`
   - The file will be generated during build

## How it works

- The app automatically logs in on startup using the credentials in `autoLoginConfig.js`
- No login screen shown to users
- Session persists in browser, so auto-login only happens once per device
- Perfect for kids and family members who shouldn't need to know credentials
