# Fix Email URLs Showing localhost:3000

## Problem
Emails are showing `localhost:3000` instead of your production domain.

## Solution

### For Production Server:

Set the `NEXT_PUBLIC_BASE_URL` environment variable to your actual domain:

```env
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

**Important**: Do NOT include trailing slash

### Steps:

1. **Update `.env` or `.env.local` file:**
```env
NEXT_PUBLIC_BASE_URL=https://admissionx.com
```

2. **For Vercel deployment:**
   - Go to Vercel Dashboard
   - Select your project
   - Go to Settings → Environment Variables
   - Add: `NEXT_PUBLIC_BASE_URL` = `https://yourdomain.com`
   - Redeploy

3. **For other hosting:**
   - Set environment variable in your hosting panel
   - Restart the application

4. **Restart your server:**
```bash
npm run build
npm start
```

## Verify

After setting the environment variable, emails will show:
- ✅ `https://yourdomain.com/dashboard/student`
- ✅ `https://yourdomain.com/api/auth/activate?token=...`

Instead of:
- ❌ `http://localhost:3000/dashboard/student`

## Current Code Location

The base URL is used in `lib/email.ts`:
```typescript
function getBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_BASE_URL ?? "https://admissionx.com").replace(/\/$/, "");
}
```

Default fallback is `https://admissionx.com` if variable is not set.
