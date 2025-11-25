# Local Environment Setup (REQUIRED for Development)

## The Problem
You're seeing `placeholder.supabase.co` errors because environment variables are only set in Vercel (for production), but **not in your local development environment**.

## Quick Fix

1. **Create `.env.local` file in the project root** (same directory as `package.json`)

2. **Copy your Supabase credentials from Vercel:**
   - Go to your Vercel project: https://vercel.com/tradeiqs-projects/tradeiq/settings/environment-variables
   - Copy the values for:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Create `.env.local` with these values:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://wiwlzelkgu...your-full-url-here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci0iJIUzI1Ni...your-full-key-here
   ```

4. **Restart your dev server:**
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

## Alternative: Get Credentials from Supabase

If you don't want to copy from Vercel, get them directly:

1. Go to https://app.supabase.com
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Verify It's Working

After restarting, check the browser console. You should see:
- ✅ `Supabase configured: https://your-project.supabase.co`
- ❌ No more `placeholder.supabase.co` errors
- ✅ User data should fetch successfully

## Important Notes

- `.env.local` is in `.gitignore` - it won't be committed to git
- Never share your `.env.local` file
- The values in Vercel are for production deployments only
- Local development needs its own `.env.local` file

