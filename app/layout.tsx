import type { Metadata } from "next";
import { Inter, Source_Code_Pro } from "next/font/google";
import { RootProvider } from "./rootProvider";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "onBase - Base Analytics",
    description: "Discover your onchain journey on Base! Explore transaction patterns, activity streaks, and unlock your unique blockchain personality.",
    manifest: '/manifest.json',
    viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
    themeColor: '#3b82f6',
    colorScheme: 'light dark',
    keywords: 'base blockchain, analytics, onchain, ethereum, defi, wallet analysis',
    authors: [{ name: 'onBase Team' }],
    creator: 'onBase',
    publisher: 'onBase',
    openGraph: {
      title: "onBase - Your Journey",
      description: "Explore your Base blockchain journey! Discover transaction patterns and unlock your unique onchain personality.",
      images: ["https://onbase-six.vercel.app/onBase-hero.png"],
      type: 'website',
      url: "https://onbase-six.vercel.app",
      siteName: "onBase",
    },
    twitter: {
      card: 'summary_large_image',
      title: "onBase - Your Journey",
      description: "Explore your Base blockchain journey! Discover transaction patterns and unlock your unique onchain personality.",
      images: ["https://onbase-six.vercel.app/onBase-hero.png"],
      creator: '@onbase_app',
      site: '@onbase_app',
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
      "fc:frame:button:1:post_url": "https://onbase-six.vercel.app",
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
          title: "Analyze Now",
          action: {
            type: "launch_miniapp",
            url: "https://onbase-six.vercel.app",
            name: "onBase",
            splashImageUrl: "https://onbase-six.vercel.app/onBase-splash.png",
            splashBackgroundColor: "#0a0a0a"
          }
        }
      }),
      
      // Additional Farcaster metadata
      "farcaster:miniapp:url": "https://onbase-six.vercel.app",
      "farcaster:miniapp:name": "onBase",
      "farcaster:miniapp:icon": "https://onbase-six.vercel.app/onBase-icon.png",
      
      // Additional required metadata for embed validation
      "robots": "index, follow",
      "referrer": "origin-when-cross-origin",
      "format-detection": "telephone=no",
      
      // Frame validation metadata
      "fc:frame:debug": "false",
      "fc:frame:cache": "false",
      "fc:frame:refresh": "false",
      "fc:frame:refresh:period": "0",
      "fc:frame:refresh:url": "https://onbase-six.vercel.app",
      "fc:frame:refresh:method": "GET",
      
      // Additional Farcaster metadata
      "fc:frame:accepts:cast_action": "true",
      "fc:frame:accepts:tx": "true",
      "fc:frame:accepts:tx:version": "v1",
      "fc:frame:accepts:tx:network": "base",
      "fc:frame:accepts:tx:action": "mint",
      "fc:frame:accepts:tx:target": "https://onbase-six.vercel.app",
      "fc:frame:accepts:tx:post_url": "https://onbase-six.vercel.app",
      "fc:frame:accepts:tx:post_url:method": "POST",
      
      // LinkedIn metadata
      "linkedin:owner": "onbase-app",
      "linkedin:title": "onBase - Your Journey",
      "linkedin:description": "Explore your Base blockchain journey! Discover transaction patterns and unlock your unique onchain personality.",
      "linkedin:image": "https://onbase-six.vercel.app/onBase-hero.png",
      
      // Discord metadata
      "discord:title": "onBase - Your Journey",
      "discord:description": "Explore your Base blockchain journey! Discover transaction patterns and unlock your unique onchain personality.",
      "discord:image": "https://onbase-six.vercel.app/onBase-hero.png",
      "discord:color": "#3b82f6",
      
      // Telegram metadata
      "telegram:title": "onBase - Your Journey",
      "telegram:description": "Explore your Base blockchain journey! Discover transaction patterns and unlock your unique onchain personality.",
      "telegram:image": "https://onbase-six.vercel.app/onBase-hero.png",
      
      // WhatsApp metadata
      "whatsapp:title": "onBase - Your Journey",
      "whatsapp:description": "Explore your Base blockchain journey! Discover transaction patterns and unlock your unique onchain personality.",
      "whatsapp:image": "https://onbase-six.vercel.app/onBase-hero.png",
      
      // Reddit metadata
      "reddit:title": "onBase - Your Journey",
      "reddit:description": "Explore your Base blockchain journey! Discover transaction patterns and unlock your unique onchain personality.",
      "reddit:image": "https://onbase-six.vercel.app/onBase-hero.png",
      
      // Slack metadata
      "slack:title": "onBase - Your Journey",
      "slack:description": "Explore your Base blockchain journey! Discover transaction patterns and unlock your unique onchain personality.",
      "slack:image": "https://onbase-six.vercel.app/onBase-hero.png",
      
      // Microsoft Teams metadata
      "microsoft:title": "onBase - Your Journey",
      "microsoft:description": "Explore your Base blockchain journey! Discover transaction patterns and unlock your unique onchain personality.",
      "microsoft:image": "https://onbase-six.vercel.app/onBase-hero.png",
      
      // Additional SEO and sharing metadata
      "application-name": "onBase",
      "apple-mobile-web-app-title": "onBase",
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "default",
      "mobile-web-app-capable": "yes",
      "msapplication-TileColor": "#3b82f6",
      "msapplication-TileImage": "https://onbase-six.vercel.app/onBase-icon.png",
      "theme-color": "#3b82f6",
      
      // Additional Open Graph metadata
      "og:locale": "en_US",
      "og:site_name": "onBase",
      "og:updated_time": new Date().toISOString(),
      "og:image:width": "1200",
      "og:image:height": "630",
      "og:image:type": "image/png",
      "og:image:alt": "onBase - Your Journey",
      
      // Additional Twitter metadata
      "twitter:image:alt": "onBase - Your Journey",
      "twitter:domain": "onbase-six.vercel.app",
      "twitter:url": "https://onbase-six.vercel.app",
      
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
}

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-source-code-pro",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RootProvider>
      <html lang="en">
        <body className={`${inter.variable} ${sourceCodePro.variable}`}>
          {children}
        </body>
      </html>
    </RootProvider>
  );
}
