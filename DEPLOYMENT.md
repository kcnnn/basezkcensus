# Deployment Guide

## Quick Start - Deploy to Vercel

### Step 1: Deploy the Application

```bash
# Install Vercel CLI globally
npm i -g vercel

# Deploy (follow the prompts)
vercel
```

Or simply push to GitHub and import the project in the Vercel dashboard.

### Step 2: Create Vercel KV Database

1. Go to your project in the [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on the "Storage" tab
3. Click "Create Database"
4. Select "KV" (Key-Value Store)
5. Name it (e.g., `basezkcensus-kv`)
6. Click "Create"
7. Connect it to your project

### Step 3: Redeploy

After creating the KV database, the environment variables are automatically added to your project. Trigger a new deployment:

```bash
vercel --prod
```

Or push a new commit to trigger automatic deployment.

### Step 4: Verify

Visit your production URL and test:
1. The page loads correctly
2. Census results section shows (may be empty initially)
3. ZKPassport QR code generates
4. After verification, Base wallet section appears

## Environment Variables

Vercel KV automatically sets these when you create a database:

- `KV_URL`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

No manual configuration needed!

## Local Development with Vercel KV

To test with real KV storage locally:

```bash
# Link to your Vercel project
vercel link

# Pull environment variables
vercel env pull .env.local

# Run dev server
npm run dev
```

## Testing Without KV (Local Only)

If you want to test locally without setting up KV:

1. The app will show errors when trying to load census data
2. You can temporarily mock the KV functions in `lib/kv.ts`
3. Or use the Vercel CLI method above to get real KV credentials

## Vercel KV Pricing

- **Free Tier**: 256 MB storage, 100K commands/day
- **Pro**: Starts at $0.25 per 100K requests
- For a census app, free tier should be sufficient unless you have thousands of daily users

## Troubleshooting

### Build fails on Vercel
- Check the build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- TypeScript errors will fail the build

### KV connection errors
- Verify the KV database is created and connected
- Check environment variables in Vercel dashboard under Settings → Environment Variables
- Redeploy after adding KV database

### API routes return 500 errors
- Check Vercel function logs in the dashboard
- Ensure KV environment variables are set
- Verify the KV database is in the same region as your deployment

## Custom Domain

To add a custom domain:

1. Go to your project in Vercel dashboard
2. Click "Settings" → "Domains"
3. Add your domain
4. Update DNS records as instructed
5. SSL certificate is automatically provisioned

## Monitoring

View real-time logs and analytics:
- **Logs**: Vercel Dashboard → Your Project → Logs
- **Analytics**: Vercel Dashboard → Your Project → Analytics
- **KV Metrics**: Vercel Dashboard → Storage → Your KV Database

## Next Steps

After deployment:
1. Test the full flow with ZKPassport app
2. Monitor KV usage in Vercel dashboard
3. Set up custom domain (optional)
4. Add monitoring/analytics (Vercel Analytics is built-in)

