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
    header: "",
    payload: "",
    signature: "",
  },
  baseBuilder: {
    allowedAddresses: [],
  },
  miniapp: {
    version: "1",
    name: "Base Analytics",
    subtitle: "Blockchain Address Analytics",
    description: "Comprehensive analytics for Base blockchain addresses including transaction history, activity streaks, and insights.",
    screenshotUrls: [],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "utility",
    tags: ["analytics", "blockchain", "base", "defi"],
    heroImageUrl: `${ROOT_URL}/hero.png`,
    tagline: "Unlock insights from your Base address",
    ogTitle: "Base Analytics - Blockchain Address Analytics",
    ogDescription: "Comprehensive analytics for Base blockchain addresses including transaction history, activity streaks, and insights.",
    ogImageUrl: `${ROOT_URL}/hero.png`,
  },
} as const;
