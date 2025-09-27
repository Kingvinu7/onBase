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
    subtitle: "Base Analytics Platform",
    description: "Discover comprehensive insights about Base blockchain addresses including transaction history, activity patterns, and onchain behavior analysis.",
    screenshotUrls: [],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "utility",
    tags: ["analytics", "blockchain", "base", "defi"],
    heroImageUrl: `${ROOT_URL}/hero.png`,
    tagline: "Discover your onchain story",
    ogTitle: "onBase - Base Analytics Platform",
    ogDescription: "Discover comprehensive insights about Base blockchain addresses including transaction history, activity patterns, and onchain behavior analysis.",
    ogImageUrl: `${ROOT_URL}/hero.png`,
  },
} as const;
