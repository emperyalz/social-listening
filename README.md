# Social Listening Platform

Real Estate Competitor Intelligence Dashboard - Track and analyze competitor social media performance across Instagram, TikTok, and YouTube.

## Features

- 📊 **Dashboard** - Overview of all tracked competitors with key metrics
- 👥 **Competitor Management** - Add/remove competitor accounts by platform and market
- 📈 **Insights** - Content patterns, best posting times, top hashtags
- 📝 **Posts** - Browse and analyze competitor content
- 🌍 **Markets** - Geographic segmentation (Panama City, CDMX, Bogota, etc.)
- ⚡ **Automated Scraping** - Daily data collection via Vercel Cron

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Convex (real-time database + serverless functions)
- **Scraping**: Apify actors for Instagram, TikTok, YouTube
- **Hosting**: Vercel
- **Cron Jobs**: Vercel Cron for daily automated scraping

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd social-listening
npm install
```

### 2. Environment Variables

Create a `.env.local` file with:

```env
# Convex
CONVEX_DEPLOYMENT=dev:usable-bird-579
NEXT_PUBLIC_CONVEX_URL=https://usable-bird-579.convex.cloud

# Apify
APIFY_API_TOKEN=your_apify_token_here

# YouTube Data API
YOUTUBE_API_KEY=your_youtube_api_key_here

# Cron Secret (generate a random string)
CRON_SECRET=your_random_secret_here
```

### 3. Initialize Convex

```bash
npx convex dev
```

This will:
- Connect to your Convex project
- Deploy the schema and functions
- Start the development sync

### 4. Seed Initial Markets

Once Convex is running, go to the Markets page in the app and click "Seed Default Markets" to add:
- Panama City, Panama
- CDMX, Mexico
- Bogota, Colombia
- Medellin, Colombia
- Los Angeles, USA
- New York City, USA
- Miami, USA

### 5. Add Competitor Accounts

Go to the Competitors page and add accounts to track:

1. Select Platform (Instagram, TikTok, or YouTube)
2. Enter username
3. Select market
4. Optionally add company name
5. Select account type (brokerage, individual broker, developer, other)

### 6. Run Your First Scrape

Go to the Jobs page and click "Run [Platform] Scrape" for each platform to collect initial data.

## Deployment to Vercel

### 1. Create GitHub Repository

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/social-listening.git
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Add environment variables:
   - `CONVEX_DEPLOYMENT`
   - `NEXT_PUBLIC_CONVEX_URL`
   - `APIFY_API_TOKEN`
   - `YOUTUBE_API_KEY`
   - `CRON_SECRET`
5. Deploy!

### 3. Configure Convex for Production

```bash
npx convex deploy
```

This deploys your Convex functions to production.

### 4. Set Environment Variables in Convex

Go to your Convex dashboard and add:
- `APIFY_API_TOKEN`
- `YOUTUBE_API_KEY`
- `CRON_SECRET`

## Project Structure

```
social-listening/
├── convex/
│   ├── schema.ts          # Database schema
│   ├── accounts.ts        # Account management
│   ├── markets.ts         # Market management
│   ├── posts.ts           # Post queries
│   ├── scraping.ts        # Apify integration
│   ├── ingestion.ts       # Data processing
│   ├── insights.ts        # Analytics queries
│   └── http.ts            # HTTP endpoints
├── src/
│   ├── app/
│   │   ├── dashboard/     # Main dashboard
│   │   ├── competitors/   # Competitor management
│   │   ├── insights/      # Analytics page
│   │   ├── posts/         # Post browser
│   │   ├── markets/       # Market management
│   │   ├── jobs/          # Scraping jobs
│   │   ├── settings/      # Configuration
│   │   └── api/cron/      # Cron endpoint
│   ├── components/
│   │   ├── ui/            # Base UI components
│   │   ├── charts/        # Data visualization
│   │   └── layout/        # Layout components
│   └── lib/
│       └── utils.ts       # Utility functions
├── .env.local             # Environment variables
├── vercel.json            # Vercel config with cron
└── package.json
```

## Apify Actors Used

| Platform | Actor | Purpose |
|----------|-------|---------|
| Instagram | `apify/instagram-scraper` | Profile + posts |
| Instagram | `apify/instagram-comment-scraper` | Comments |
| TikTok | `clockworks/tiktok-scraper` | Profile + videos |
| YouTube | `streamers/youtube-scraper` | Channel + videos |

## Database Schema

- **markets** - Geographic markets
- **accounts** - Competitor accounts to track
- **accountSnapshots** - Daily follower/following counts
- **posts** - Individual posts/videos
- **postSnapshots** - Daily engagement metrics
- **comments** - Post comments
- **engagers** - Users who liked/commented
- **contentAnalysis** - AI-generated content analysis
- **scrapingJobs** - Job tracking
- **insights** - Aggregated analytics

## Daily Cron Job

The cron job runs daily at 6:00 AM UTC and:
1. Checks all accounts for pending scrapes
2. Triggers Apify actors for each platform
3. Processes and stores results
4. Updates engagement snapshots

## License

MIT
