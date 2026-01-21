/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as accounts from "../accounts.js";
import type * as audienceSentiment from "../audienceSentiment.js";
import type * as avatars from "../avatars.js";
import type * as brandVoice from "../brandVoice.js";
import type * as branding from "../branding.js";
import type * as commercialIntent from "../commercialIntent.js";
import type * as competitors from "../competitors.js";
import type * as contentReverseEngineering from "../contentReverseEngineering.js";
import type * as http from "../http.js";
import type * as ingestion from "../ingestion.js";
import type * as insights from "../insights.js";
import type * as markets from "../markets.js";
import type * as organizationProfile from "../organizationProfile.js";
import type * as platforms from "../platforms.js";
import type * as posts from "../posts.js";
import type * as resonanceAudit from "../resonanceAudit.js";
import type * as schedule from "../schedule.js";
import type * as scraping from "../scraping.js";
import type * as scrapingProcessor from "../scrapingProcessor.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  accounts: typeof accounts;
  audienceSentiment: typeof audienceSentiment;
  avatars: typeof avatars;
  brandVoice: typeof brandVoice;
  branding: typeof branding;
  commercialIntent: typeof commercialIntent;
  competitors: typeof competitors;
  contentReverseEngineering: typeof contentReverseEngineering;
  http: typeof http;
  ingestion: typeof ingestion;
  insights: typeof insights;
  markets: typeof markets;
  organizationProfile: typeof organizationProfile;
  platforms: typeof platforms;
  posts: typeof posts;
  resonanceAudit: typeof resonanceAudit;
  schedule: typeof schedule;
  scraping: typeof scraping;
  scrapingProcessor: typeof scrapingProcessor;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
