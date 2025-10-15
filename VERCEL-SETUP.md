# URGENT: Vercel Environment Variables Setup

## The Problem
Your app is deployed but the Supabase connection is failing because environment variables are not set in Vercel.

## Fix This Now

1. **Go to your Vercel dashboard**: https://vercel.com/dashboard
2. **Click on your project**: "rebinm25rebinmm"
3. **Go to Settings** → **Environment Variables**
4. **Add these two variables**:

### Variable 1:
- **Name**: `VITE_SUPABASE_URL`
- **Value**: `https://tcskxlfhwqaylegiodwa.supabase.co`
- **Environment**: Production, Preview, Development (select all)

### Variable 2:
- **Name**: `VITE_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjc2t4bGZod3FheWxlZ2lvZHdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MjY0OTcsImV4cCI6MjA3NjEwMjQ5N30.yhLysjBHEZjpcLWI7Y6Hhr53tN1s5UUUI6vBuPFx5fA`
- **Environment**: Production, Preview, Development (select all)

5. **Redeploy your app**:
   - Go to **Deployments** tab
   - Click the three dots (...) on the latest deployment
   - Click **Redeploy**
   - OR just push a new commit to GitHub

## After Redeployment

Your app will work correctly! You'll be able to:
- Sign up for new accounts
- Sign in
- Add products
- Record sales
- All features will work

## Quick Access Links

- Vercel Dashboard: https://vercel.com/dashboard
- Your App: https://rebinm25rebinmm.vercel.app
- Supabase Dashboard: https://supabase.com/dashboard/project/tcskxlfhwqaylegiodwa
