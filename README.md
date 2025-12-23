# Base ZK Census

A Next.js application that combines ZKPassport identity verification with Base blockchain wallet verification to create a privacy-preserving census.

## Features

- **ZKPassport Integration**: Verify users are 18+ and collect nationality using zero-knowledge proofs
- **Base Wallet Verification**: Verify Base blockchain address ownership via EIP-712 signatures
- **Census Dashboard**: Real-time statistics showing participant counts by country
- **Vercel KV Storage**: Persistent data storage using Redis-based key-value store

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: Vercel KV (Redis)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Vercel account (for deployment and KV database)

### Local Development

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Set up environment variables**:

   - Copy `.env.local.example` to `.env.local`
   - Get a free WalletConnect Project ID from [https://cloud.walletconnect.com](https://cloud.walletconnect.com)
   - Add it to `.env.local`:
     ```
     NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
     ```

3. **Set up Vercel KV** (for local development):

   - Install Vercel CLI: `npm i -g vercel`
   - Link your project: `vercel link`
   - Pull environment variables: `vercel env pull .env.local`
   - Or manually create `.env.local` with your KV credentials (see `.env.example`)

4. **Run the development server**:

   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI** (if not already installed):

   ```bash
   npm i -g vercel
   ```

2. **Deploy**:

   ```bash
   vercel
   ```

3. **Create a Vercel KV database**:

   - Go to your project in the [Vercel Dashboard](https://vercel.com/dashboard)
   - Navigate to the "Storage" tab
   - Click "Create Database" → "KV"
   - Name your database (e.g., "basezkcensus-kv")
   - Connect it to your project

4. **Redeploy** to apply the KV environment variables:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via GitHub Integration

1. **Push your code to GitHub**:

   ```bash
   git init
   git add .
   git commit -m "Initial commit - Next.js migration"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Connect to Vercel**:

   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js and configure build settings

3. **Create a Vercel KV database** (same as above)

4. **Automatic deployments**: Every push to `main` will trigger a new deployment

## Environment Variables

The following environment variables are automatically set by Vercel when you create a KV database:

- `KV_URL` - Vercel KV connection URL
- `KV_REST_API_URL` - REST API endpoint
- `KV_REST_API_TOKEN` - Authentication token
- `KV_REST_API_READ_ONLY_TOKEN` - Read-only token

## Project Structure

```
basezkcensus/
├── app/
│   ├── api/
│   │   ├── census/
│   │   │   └── route.ts          # GET /api/census - Fetch census stats
│   │   └── submit/
│   │       └── route.ts          # POST /api/submit - Submit census data
│   ├── components/
│   │   └── CensusApp.tsx         # Main app component
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── lib/
│   └── kv.ts                     # Vercel KV client and helpers
├── public/                       # Static assets
├── next.config.js                # Next.js configuration
├── package.json
└── tsconfig.json
```

## How It Works

### User Flow

1. **ZKPassport Verification**:

   - User scans QR code with ZKPassport mobile app
   - Proves they are 18+ years old (without revealing exact age)
   - Discloses their nationality
   - Zero-knowledge proof is verified

2. **Base Wallet Verification**:

   - User scans QR code with Base wallet or connects web wallet
   - Signs an EIP-712 typed message
   - Proves ownership of their Base address

3. **Data Storage**:

   - Address and nationality are stored in Vercel KV
   - Country counts are incremented
   - One entry per address (updates if user submits again)

4. **Census Dashboard**:
   - Real-time display of participant counts by country
   - Sorted by count (descending) then alphabetically
   - Total participant count

### Data Storage Schema

**Vercel KV Keys**:

- `census` (hash): Maps addresses to `{nationality, timestamp}`
- `country:{nationality}` (number): Count of participants per country

## API Endpoints

### POST /api/submit

Submit census data after verification.

**Request Body**:

```json
{
  "address": "0x1234...",
  "nationality": "United States"
}
```

**Response**:

```json
{
  "success": true
}
```

### GET /api/census

Get census statistics.

**Response**:

```json
{
  "countries": [
    { "country": "United States", "count": 42 },
    { "country": "Canada", "count": 23 }
  ],
  "total": 65
}
```

## Troubleshooting

### "Failed to load ZKPassport SDK"

- Check your internet connection
- The SDK loads from CDN (Skypack or unpkg)
- Try refreshing the page

### "No Web3 wallet detected"

- Install MetaMask or Coinbase Wallet browser extension
- Or use the QR code to sign with a mobile wallet

### KV Database Errors

- Ensure you've created a KV database in Vercel
- Verify environment variables are set correctly
- Check Vercel dashboard for KV connection status

## License

MIT
