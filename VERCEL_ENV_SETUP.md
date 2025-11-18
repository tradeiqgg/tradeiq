# Adding Environment Variables to Vercel

## Quick Steps

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your TradeIQ project**
3. **Navigate to**: Settings → Environment Variables
4. **Add these required variables**:

### Required Variables (Minimum)

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Optional Variables (Add if you're using them)

```
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
FINNHUB_API_KEY=your-finnhub-api-key
GROQ_API_KEY=your-groq-api-key
DEEPSEEK_API_KEY=your-deepseek-api-key
TOGETHER_API_KEY=your-together-api-key
OPENROUTER_API_KEY=your-openrouter-api-key
```

## After Adding Variables

1. **Redeploy your project**:
   - Go to Deployments tab
   - Click the three dots (⋯) on the latest deployment
   - Click "Redeploy"

   OR

   - Push a new commit to trigger a new deployment

## Getting Your Supabase Credentials

1. Go to https://app.supabase.com
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Important Notes

- Variables starting with `NEXT_PUBLIC_` are exposed to the browser
- Make sure to add variables to **all environments** (Production, Preview, Development) if needed
- After adding variables, you **must redeploy** for them to take effect
- Never commit `.env.local` to git (it should be in `.gitignore`)

