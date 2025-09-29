import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "onBase - Base Analytics",
  description: "Discover your onchain journey on Base! Explore transaction patterns, activity streaks, and unlock your unique blockchain personality.",
  openGraph: {
    title: "onBase - Your Journey",
    description: "Explore your Base blockchain journey! Discover transaction patterns and unlock your unique onchain personality.",
    images: ["https://onbase-six.vercel.app/onBase-hero.png"],
    url: "https://onbase-six.vercel.app",
    type: "website",
    siteName: "onBase",
  },
  twitter: {
    card: "summary_large_image",
    title: "onBase - Your Journey",
    description: "Explore your Base blockchain journey! Discover transaction patterns and unlock your unique onchain personality.",
    images: ["https://onbase-six.vercel.app/onBase-hero.png"],
    creator: "@onbase_app",
    site: "@onbase_app",
  },
  other: {
    // Farcaster Frame metadata
    "fc:frame": "vNext",
    "fc:frame:version": "vNext",
    "fc:frame:image": "https://onbase-six.vercel.app/onBase-hero.png",
    "fc:frame:image:aspect_ratio": "1.91:1",
    "fc:frame:image:width": "1200",
    "fc:frame:image:height": "630",
    "fc:frame:image:alt": "onBase - Your Journey",
    "fc:frame:button:1": "🚀 Launch onBase",
    "fc:frame:button:1:action": "link",
    "fc:frame:button:1:target": "https://onbase-six.vercel.app",
    "fc:frame:button:2": "📊 View Analytics",
    "fc:frame:button:2:action": "link",
    "fc:frame:button:2:target": "https://onbase-six.vercel.app",
    "fc:frame:post_url": "https://onbase-six.vercel.app",
    "fc:frame:state": "initial",
    "fc:frame:input:text": "Enter Base address to analyze",
    "fc:frame:input:placeholder": "0x...",
    
    // Farcaster Miniapp metadata
    "fc:miniapp": JSON.stringify({
      version: "1",
      imageUrl: "https://onbase-six.vercel.app/onBase-hero.png",
      button: {
        title: "Open App",
        action: {
          type: "launch_frame",
          name: "onBase",
          url: "https://onbase-six.vercel.app",
          splashImageUrl: "https://onbase-six.vercel.app/onBase-splash.png",
          splashBackgroundColor: "#0a0a0a"
        }
      }
    }),
    
    // Additional Farcaster metadata
    "farcaster:miniapp:url": "https://onbase-six.vercel.app",
    "farcaster:miniapp:name": "onBase",
    "farcaster:miniapp:icon": "https://onbase-six.vercel.app/onBase-icon.png",
    
    // Additional metadata
    "robots": "index, follow",
    "referrer": "origin-when-cross-origin",
    "format-detection": "telephone=no",
    "application-name": "onBase",
    "theme-color": "#3b82f6",
    
    // Schema.org structured data
    "application/ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "onBase",
      "description": "Discover your onchain journey on Base! Explore transaction patterns, activity streaks, and unlock your unique blockchain personality.",
      "url": "https://onbase-six.vercel.app",
      "image": "https://onbase-six.vercel.app/onBase-hero.png",
      "icon": "https://onbase-six.vercel.app/onBase-icon.png",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "author": {
        "@type": "Organization",
        "name": "onBase",
        "url": "https://onbase-six.vercel.app"
      }
    }),
  },
};

export default function EmbedPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1>onBase - Base Analytics</h1>
      <p>Discover your onchain journey on Base! Explore transaction patterns, activity streaks, and unlock your unique blockchain personality.</p>
      <p>This page is optimized for embed validation testing.</p>
      <p><a href="https://onbase-six.vercel.app">Visit the main app</a></p>
    </div>
  );
}