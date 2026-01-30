# Project Orwell - Data Dictionary & Schema Reference

## Overview

This document provides a comprehensive reference for all data stored in the Convex database for the Social Listening Dashboard (Project Orwell). Use this guide to understand the data structure when building analytics in AntiGravity.

---

## Connection Details for AntiGravity

### Convex Database Access

**Convex Project URL:** `https://usable-bird-579.convex.cloud`

### Option 1: Direct HTTP API (Recommended for AntiGravity)

Convex exposes HTTP endpoints for querying data. You can use these directly:

```javascript
// Base URL for all queries
const CONVEX_URL = "https://usable-bird-579.convex.cloud";

// Example: Fetch all accounts
const response = await fetch(`${CONVEX_URL}/api/query`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    path: "accounts:list",
    args: { platform: "instagram" }
  })
});
```

### Option 2: Convex JavaScript Client

```bash
npm install convex
```

```javascript
import { ConvexHttpClient } from "convex/browser";

const client = new ConvexHttpClient("https://usable-bird-579.convex.cloud");

// Query accounts
const accounts = await client.query("accounts:list", { platform: "instagram" });

// Query posts with snapshots
const posts = await client.query("posts:list", { limit: 100 });
```

### Option 3: Export to CSV/JSON

You can export data using the Convex CLI:

```bash
# Export all data from a table
npx convex export --path accounts --format json > accounts.json
npx convex export --path posts --format json > posts.json
npx convex export --path postSnapshots --format json > post_snapshots.json
```

---

## Database Schema

### Core Entity Tables

#### `markets`
Geographic markets being tracked (e.g., Panama City, CDMX, Bogota).

| Field | Type | Description |
|-------|------|-------------|
| `_id` | `Id<"markets">` | Unique identifier |
| `name` | `string` | Market display name (e.g., "Panama City") |
| `country` | `string` | Country name |
| `state` | `string?` | State/Province (optional) |
| `city` | `string` | City name |
| `timezone` | `string` | IANA timezone (e.g., "America/Panama") |
| `isActive` | `boolean` | Whether market is actively tracked |

**Indexes:** `by_active`

---

#### `competitors`
Business entities being monitored (brokerages, developers, individual agents).

| Field | Type | Description |
|-------|------|-------------|
| `_id` | `Id<"competitors">` | Unique identifier |
| `name` | `string` | Competitor name |
| `type` | `enum` | One of: `brokerage`, `individual_broker`, `developer`, `property_manager`, `investor`, `other` |
| `marketId` | `Id<"markets">` | Reference to market |
| `website` | `string?` | Website URL |
| `email` | `string?` | Contact email |
| `phones` | `array?` | Array of phone objects: `{ label, number, isWhatsApp? }` |
| `address` | `string?` | Street address |
| `address2` | `string?` | Address line 2 |
| `city` | `string?` | City |
| `state` | `string?` | State |
| `country` | `string?` | Country |
| `socialHandles` | `object?` | Object with optional keys: `instagram`, `tiktok`, `youtube`, `facebook`, `linkedin`, `twitter` |
| `notes` | `string?` | Internal notes |
| `logoUrl` | `string?` | Logo URL |
| `displayAvatarAccountId` | `Id<"accounts">?` | Which linked account's avatar to display |
| `isActive` | `boolean` | Master switch |
| `createdAt` | `number` | Unix timestamp (ms) |
| `updatedAt` | `number?` | Unix timestamp (ms) |

**Indexes:** `by_market`, `by_type`, `by_active`

---

#### `accounts`
Individual social media accounts being tracked.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | `Id<"accounts">` | Unique identifier |
| `competitorId` | `Id<"competitors">?` | Parent competitor |
| `platform` | `enum` | One of: `instagram`, `tiktok`, `youtube` |
| `username` | `string` | Platform username/handle |
| `displayName` | `string?` | Display name on platform |
| `profileUrl` | `string` | Full profile URL |
| `avatarUrl` | `string?` | Current avatar URL |
| `bio` | `string?` | Profile bio/description |
| `marketId` | `Id<"markets">` | Market reference |
| `companyName` | `string?` | Company name (legacy) |
| `accountType` | `enum` | One of: `brokerage`, `individual_broker`, `developer`, `other` |
| `isActive` | `boolean` | Whether account is active |
| `isPaused` | `boolean?` | Explicitly paused from scraping |
| `isMainAccount` | `boolean?` | Is this a "Provivienda" main account (for portfolio metrics) |
| `createdAt` | `number` | Unix timestamp (ms) |
| `lastScrapedAt` | `number?` | Last successful scrape timestamp |

**Indexes:** `by_platform`, `by_market`, `by_competitor`, `by_platform_username`, `by_main_account`

---

### Content Tables

#### `posts`
Individual posts/videos/reels scraped from accounts.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | `Id<"posts">` | Unique identifier |
| `accountId` | `Id<"accounts">` | Parent account |
| `platform` | `enum` | `instagram`, `tiktok`, `youtube` |
| `platformPostId` | `string` | Native ID from platform (for deduplication) |
| `postUrl` | `string` | Direct URL to post |
| `postType` | `enum` | One of: `image`, `video`, `carousel`, `reel`, `story`, `short`, `live` |
| `caption` | `string?` | Post caption/description |
| `hashtags` | `string[]` | Array of hashtags (without #) |
| `mentions` | `string[]` | Array of @mentions |
| `thumbnailUrl` | `string?` | Thumbnail image URL |
| `mediaUrls` | `string[]` | Array of media URLs |
| `videoDuration` | `number?` | Video duration in seconds |
| `postedAt` | `number` | When post was published (Unix ms) |
| `createdAt` | `number` | When we first scraped it |
| `lastUpdatedAt` | `number` | Last time we updated this record |

**Indexes:** `by_account`, `by_platform_post_id`, `by_posted_at`

---

#### `postSnapshots`
Daily engagement metrics snapshots for each post.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | `Id<"postSnapshots">` | Unique identifier |
| `postId` | `Id<"posts">` | Parent post |
| `likesCount` | `number` | Number of likes |
| `commentsCount` | `number` | Number of comments |
| `sharesCount` | `number?` | Number of shares (TikTok) |
| `viewsCount` | `number?` | Number of views (video content) |
| `savesCount` | `number?` | Number of saves (Instagram) |
| `engagementRate` | `number?` | Calculated engagement rate |
| `snapshotDate` | `string` | Date in YYYY-MM-DD format |
| `createdAt` | `number` | Unix timestamp (ms) |

**Indexes:** `by_post`, `by_post_date`

**Note:** To get the latest metrics for a post, query with the most recent `snapshotDate`.

---

#### `comments`
Comments on posts.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | `Id<"comments">` | Unique identifier |
| `postId` | `Id<"posts">` | Parent post |
| `platformCommentId` | `string` | Native comment ID |
| `authorUsername` | `string` | Commenter's username |
| `authorDisplayName` | `string?` | Commenter's display name |
| `text` | `string` | Comment text |
| `likesCount` | `number` | Likes on the comment |
| `repliesCount` | `number?` | Number of replies |
| `isReply` | `boolean` | Is this a reply to another comment |
| `parentCommentId` | `Id<"comments">?` | Parent comment if reply |
| `postedAt` | `number` | When comment was posted |
| `createdAt` | `number` | When we scraped it |

**Indexes:** `by_post`, `by_platform_id`

---

### Account Metrics Tables

#### `accountSnapshots`
Daily follower/following counts per account.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | `Id<"accountSnapshots">` | Unique identifier |
| `accountId` | `Id<"accounts">` | Parent account |
| `followersCount` | `number` | Total followers |
| `followingCount` | `number` | Total following |
| `postsCount` | `number` | Total posts |
| `likesCount` | `number?` | Total likes (TikTok) |
| `subscribersCount` | `number?` | Subscribers (YouTube) |
| `viewsCount` | `number?` | Total views (YouTube) |
| `snapshotDate` | `string` | Date in YYYY-MM-DD format |
| `createdAt` | `number` | Unix timestamp (ms) |

**Indexes:** `by_account`, `by_account_date`

---

#### `insights`
Pre-aggregated analytics per account per period.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | `Id<"insights">` | Unique identifier |
| `accountId` | `Id<"accounts">` | Parent account |
| `period` | `enum` | `daily`, `weekly`, `monthly` |
| `periodDate` | `string` | YYYY-MM-DD, YYYY-WW, or YYYY-MM |
| `postsPublished` | `number` | Posts published in period |
| `totalLikes` | `number` | Sum of likes |
| `totalComments` | `number` | Sum of comments |
| `totalViews` | `number?` | Sum of views |
| `avgLikesPerPost` | `number` | Average likes per post |
| `avgCommentsPerPost` | `number` | Average comments per post |
| `avgEngagementRate` | `number` | Average engagement rate |
| `followerGrowth` | `number` | Net follower change |
| `followerGrowthRate` | `number` | Percentage growth |
| `bestPostId` | `Id<"posts">?` | Top performing post |
| `bestPostingHour` | `number?` | Best hour to post (0-23) |
| `bestPostingDay` | `string?` | Best day to post |
| `topHashtags` | `string[]` | Most used hashtags |
| `avgVideoDuration` | `number?` | Avg video length (seconds) |
| `createdAt` | `number` | Unix timestamp (ms) |

**Indexes:** `by_account_period`, `by_account_date`

---

### Analysis Tables

#### `engagers`
Users who engaged with posts (for audience analysis).

| Field | Type | Description |
|-------|------|-------------|
| `_id` | `Id<"engagers">` | Unique identifier |
| `postId` | `Id<"posts">` | Parent post |
| `username` | `string` | Engager's username |
| `platform` | `enum` | Platform |
| `engagementType` | `enum` | `like`, `comment`, `share` |
| `createdAt` | `number` | Unix timestamp (ms) |

**Indexes:** `by_post`, `by_username`

---

#### `contentAnalysis`
AI-generated analysis of post content (placeholder - not yet populated).

| Field | Type | Description |
|-------|------|-------------|
| `postId` | `Id<"posts">` | Parent post |
| `hasExteriorShot` | `boolean` | Shows property exterior |
| `hasInteriorShot` | `boolean` | Shows property interior |
| `hasPeoplePresent` | `boolean` | People visible |
| `peopleCount` | `number?` | Number of people |
| `propertyType` | `enum?` | `condo`, `house`, `apartment`, `penthouse`, `commercial`, `land`, `other` |
| `productionQuality` | `enum` | `professional`, `semi_professional`, `amateur` |
| `hasMusic` | `boolean` | Has background music |
| `hasVoiceover` | `boolean` | Has voiceover |
| `hasTextOverlay` | `boolean` | Has text overlays |
| `showsPrice` | `boolean` | Shows property price |
| `showsLocation` | `boolean` | Shows location info |
| `showsAmenities` | `boolean` | Shows amenities |
| `analysisConfidence` | `number` | AI confidence 0-1 |
| `rawAnalysis` | `string?` | Raw AI output |
| `analyzedAt` | `number` | When analyzed |

---

### Operations Tables

#### `scrapingJobs`
Tracks Apify scraping job execution.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | `Id<"scrapingJobs">` | Unique identifier |
| `platform` | `enum` | `instagram`, `tiktok`, `youtube` |
| `jobType` | `enum` | `profile`, `posts`, `comments`, `engagers` |
| `status` | `enum` | `pending`, `running`, `completed`, `failed` |
| `apifyRunId` | `string?` | Apify run ID |
| `accountId` | `Id<"accounts">?` | Specific account (if single-account job) |
| `marketId` | `Id<"markets">?` | Specific market |
| `startedAt` | `number` | Job start time |
| `completedAt` | `number?` | Job completion time |
| `itemsScraped` | `number?` | Number of items scraped |
| `error` | `string?` | Error message if failed |

**Indexes:** `by_status`, `by_platform`

---

#### `scheduleSettings`
Cron job configuration.

| Field | Type | Description |
|-------|------|-------------|
| `platform` | `enum` | `instagram`, `tiktok`, `youtube`, `all` |
| `isEnabled` | `boolean` | Whether auto-scraping is on |
| `frequency` | `enum` | `hourly`, `every_6_hours`, `every_12_hours`, `daily`, `weekly` |
| `preferredHour` | `number` | Hour to run (0-23 UTC) |
| `preferredDays` | `number[]?` | Days for weekly (0=Sun) |
| `lastRunAt` | `number?` | Last execution time |
| `nextScheduledAt` | `number?` | Next scheduled run |
| `updatedAt` | `number` | Last settings change |

---

### Platform Configuration Tables

#### `platforms`
Platform branding and display settings.

| Field | Type | Description |
|-------|------|-------------|
| `platformId` | `enum` | `instagram`, `tiktok`, `youtube`, `facebook`, `linkedin`, `twitter` |
| `displayName` | `string` | Display name |
| `primaryColor` | `string?` | Hex color (e.g., "#E1306C") |
| `secondaryColor` | `string?` | Secondary hex color |
| `isActive` | `boolean` | Show in UI |
| `displayOrder` | `number` | Sort order |
| `logoFor*` | `Id<"platformLogos">?` | Logo references for various contexts |

---

#### `platformLogos`
Uploaded logo files.

| Field | Type | Description |
|-------|------|-------------|
| `platformId` | `enum` | Platform |
| `name` | `string` | Logo name (e.g., "Horizontal", "Icon") |
| `storageId` | `Id<"_storage">` | Convex file storage reference |
| `mimeType` | `string` | File type |
| `fileSize` | `number?` | Size in bytes |

---

#### `avatars`
Account avatar history with versioning.

| Field | Type | Description |
|-------|------|-------------|
| `accountId` | `Id<"accounts">` | Parent account |
| `storageId` | `Id<"_storage">` | Convex storage reference |
| `originalUrl` | `string` | Original platform URL |
| `mimeType` | `string` | File type |
| `isCurrent` | `boolean` | Is current avatar |
| `firstSeenAt` | `number` | When first detected |
| `lastSeenAt` | `number` | Last time seen active |
| `archivedAt` | `number?` | When replaced |

---

## Common Query Patterns

### Get all posts with latest engagement for an account

```javascript
// 1. Get posts for account
const posts = await client.query("posts:list", {
  accountId: "account_id_here",
  limit: 50
});

// Each post includes latestSnapshot with current metrics
posts.forEach(post => {
  console.log(post.caption, post.latestSnapshot?.likesCount);
});
```

### Get follower growth over time

```javascript
const snapshots = await client.query("accountSnapshots:list", {
  accountId: "account_id_here"
});

// snapshots are ordered by date
const growth = snapshots.map(s => ({
  date: s.snapshotDate,
  followers: s.followersCount
}));
```

### Compare competitors by engagement rate

```javascript
const competitors = await client.query("insights:getDashboardStats", {
  marketIds: ["market_id"],
  platforms: ["instagram", "tiktok"],
  days: 30
});
```

---

## Data Freshness

- **Scraping Frequency:** Daily at 6 AM UTC (configurable)
- **Snapshot Cadence:** One snapshot per account/post per day
- **Data Retention:** All historical data is retained

---

## Notes for AntiGravity Integration

1. **Timestamps:** All `createdAt`, `postedAt`, etc. are Unix timestamps in **milliseconds**
2. **IDs:** All `_id` fields are Convex document IDs (strings)
3. **Nullability:** Fields marked with `?` may be null/undefined
4. **Dates:** `snapshotDate` and `periodDate` are strings in ISO format (YYYY-MM-DD)
5. **Enums:** Use exact string values shown in schema

---

## Support

For questions about the data or API access, contact the Project Orwell team.
