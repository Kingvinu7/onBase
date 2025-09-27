const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
  "http://localhost:3000";

/**
 * MiniApp configuration object. Must follow the mini app manifest specification.
 *
 * @see {@link https://docs.base.org/mini-apps/features/manifest}
 */
export const minikitConfig = {
  accountAssociation: {
    header: "eyJmaWQiOjI1MDg2OSwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDQwZUY3Qzc1YjRlRDBkQjY3N0MzN2VjODkxODM0QjI1MDk1ODI1ZDYifQ",
    payload: "eyJkb21haW4iOiJvbmJhc2Utc2l4LnZlcmNlbC5hcHAifQ",
    signature: "MHgwZjU3ZmVjNzljM2VmMTU1NmY4ZGY0MjBmNjIyN2RiMWIzOTRhNzIzOTlkODUyMTdmYjVkYjA1OGU2YjA1OTU4MWM0ZGY1ZjgzZTYyMDNiNTVhYWQ4MTQ4YjY3NTdhY2JiMjRlOGUxMGJlZGM0MGY4NDJjZGIzNjg3NTIxZWQ0YTFi",
  },
  baseBuilder: {
    allowedAddresses: [],
  },
  miniapp: {
    version: "1",
    name: "onBase",
    subtitle: "Your Base Analytics Companion",
    description: "Explore your onchain journey on Base! Discover transaction patterns, activity streaks, and unlock your unique blockchain personality with comprehensive address analytics.",
    screenshotUrls: [],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "utility",
    tags: ["analytics", "base", "onchain", "wallet", "defi", "explorer"],
    heroImageUrl: `${ROOT_URL}/hero.png`,
    tagline: "Unlock your Base blockchain story",
    ogTitle: "onBase - Discover Your Onchain Journey",
    ogDescription: "Explore your Base blockchain journey! Discover transaction patterns, activity streaks, and unlock your unique onchain personality. Connect your wallet or search any address for comprehensive analytics.",
    ogImageUrl: `${ROOT_URL}/hero.png`,
  },
} as const;
