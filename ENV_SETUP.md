# Environment Variables Setup Guide

## Quick Setup

1. **Copy the example file:**
   ```bash
   cp env.example .env.local
   ```

2. **Get your Supabase credentials:**
   - Go to https://app.supabase.com
   - Create a new project (or use existing)
   - Go to **Settings** → **API**
   - Copy the following:
     - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
     - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Edit `.env.local` and fill in your values:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **Run the database migration:**
   - In Supabase dashboard, go to **SQL Editor**
   - Copy the contents of `supabase/migrations/001_initial_schema.sql`
   - Paste and run it

5. **Restart your dev server:**
   ```bash
   npm run dev
   ```

## Required Variables

### `NEXT_PUBLIC_SUPABASE_URL`
- **Where to get it:** Supabase Dashboard → Settings → API → Project URL
- **Example:** `https://abcdefghijklmnop.supabase.co`
- **Required:** Yes

### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Where to get it:** Supabase Dashboard → Settings → API → anon/public key
- **Example:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Required:** Yes

## Optional Variables

### `NEXT_PUBLIC_SOLANA_RPC_URL`
- **Default:** `https://api.mainnet-beta.solana.com`
- **Recommended:** Use a free RPC from:
  - Alchemy: https://www.alchemy.com/solana
  - QuickNode: https://www.quicknode.com
  - Helius: https://helius.dev
- **Example:** `https://solana-mainnet.g.alchemy.com/v2/YOUR_KEY`

### AI API Keys (for future use)
These are optional and not needed for initial setup:
- `GROQ_API_KEY`
- `DEEPSEEK_API_KEY`
- `TOGETHER_API_KEY`
- `OPENROUTER_API_KEY`

## Troubleshooting

**Error: "Missing Supabase environment variables"**
- Make sure `.env.local` exists in the project root
- Check that variable names start with `NEXT_PUBLIC_`
- Restart your dev server after adding env vars

**Error: "Invalid API key"**
- Double-check you copied the full key (they're very long)
- Make sure you're using the `anon/public` key, not the `service_role` key
- Verify the URL doesn't have trailing slashes

**Database errors**
- Make sure you ran the migration SQL in Supabase SQL Editor
- Check that all tables were created successfully

