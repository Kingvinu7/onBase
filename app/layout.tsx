import type { Metadata } from "next";
import { Inter, Source_Code_Pro } from "next/font/google";
import { SafeArea } from "@coinbase/onchainkit/minikit";
import { minikitConfig } from "@/minikit.config";
import { RootProvider } from "./rootProvider";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: minikitConfig.miniapp.name,
    description: minikitConfig.miniapp.description,
    manifest: '/manifest.json',
    viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
    themeColor: '#3b82f6',
    colorScheme: 'light dark',
    keywords: 'base blockchain, analytics, onchain, ethereum, defi, wallet analysis',
    authors: [{ name: 'onBase Team' }],
    creator: 'onBase',
    publisher: 'onBase',
    category: 'Technology',
    classification: 'Business',
    rating: 'General',
    distribution: 'global',
    language: 'en',
    geo: {
      region: 'US',
      placename: 'United States'
    },
    openGraph: {
      title: minikitConfig.miniapp.ogTitle,
      description: minikitConfig.miniapp.ogDescription,
      images: [minikitConfig.miniapp.imageUrl],
      type: 'website',
      url: minikitConfig.miniapp.homeUrl,
      siteName: minikitConfig.miniapp.name,
    },
    twitter: {
      card: 'summary_large_image',
      title: minikitConfig.miniapp.ogTitle,
      description: minikitConfig.miniapp.ogDescription,
      images: [minikitConfig.miniapp.imageUrl],
      creator: '@onbase_app',
      site: '@onbase_app',
    },
    other: {
      // Farcaster Frame metadata
      "fc:frame": "vNext",
      "fc:frame:image": `https://onbase-six.vercel.app${minikitConfig.miniapp.heroImageUrl}`,
      "fc:frame:image:aspect_ratio": "1.91:1",
      "fc:frame:button:1": `🚀 Launch ${minikitConfig.miniapp.name}`,
      "fc:frame:button:1:action": "link",
      "fc:frame:button:1:target": minikitConfig.miniapp.homeUrl,
      "fc:frame:post_url": minikitConfig.miniapp.homeUrl,
      
      // Farcaster Miniapp metadata
      "fc:miniapp": JSON.stringify({
        version: "1",
        imageUrl: `https://onbase-six.vercel.app${minikitConfig.miniapp.heroImageUrl}`,
        button: {
          title: "Open App",
          action: {
            type: "launch_frame",
            name: minikitConfig.miniapp.name,
            url: minikitConfig.miniapp.homeUrl,
            splashImageUrl: `https://onbase-six.vercel.app${minikitConfig.miniapp.splashImageUrl}`,
            splashBackgroundColor: minikitConfig.miniapp.splashBackgroundColor
          }
        }
      }),
      
      // Additional Farcaster metadata
      "farcaster:miniapp:url": minikitConfig.miniapp.homeUrl,
      "farcaster:miniapp:name": minikitConfig.miniapp.name,
      "farcaster:miniapp:icon": `https://onbase-six.vercel.app${minikitConfig.miniapp.iconUrl}`,
      
      // Additional required metadata for embed validation
      "robots": "index, follow",
      "referrer": "origin-when-cross-origin",
      "format-detection": "telephone=no",
      
      // Additional Farcaster metadata
      "fc:frame:version": "vNext",
      "fc:frame:state": "initial",
      
      // LinkedIn metadata
      "linkedin:owner": "onbase-app",
      "linkedin:title": minikitConfig.miniapp.ogTitle,
      "linkedin:description": minikitConfig.miniapp.ogDescription,
      "linkedin:image": minikitConfig.miniapp.imageUrl,
      
      // Discord metadata
      "discord:title": minikitConfig.miniapp.ogTitle,
      "discord:description": minikitConfig.miniapp.ogDescription,
      "discord:image": minikitConfig.miniapp.imageUrl,
      "discord:color": "#3b82f6",
      
      // Telegram metadata
      "telegram:title": minikitConfig.miniapp.ogTitle,
      "telegram:description": minikitConfig.miniapp.ogDescription,
      "telegram:image": minikitConfig.miniapp.imageUrl,
      
      // WhatsApp metadata
      "whatsapp:title": minikitConfig.miniapp.ogTitle,
      "whatsapp:description": minikitConfig.miniapp.ogDescription,
      "whatsapp:image": minikitConfig.miniapp.imageUrl,
      
      // Reddit metadata
      "reddit:title": minikitConfig.miniapp.ogTitle,
      "reddit:description": minikitConfig.miniapp.ogDescription,
      "reddit:image": minikitConfig.miniapp.imageUrl,
      
      // Slack metadata
      "slack:title": minikitConfig.miniapp.ogTitle,
      "slack:description": minikitConfig.miniapp.ogDescription,
      "slack:image": minikitConfig.miniapp.imageUrl,
      
      // Microsoft Teams metadata
      "microsoft:title": minikitConfig.miniapp.ogTitle,
      "microsoft:description": minikitConfig.miniapp.ogDescription,
      "microsoft:image": minikitConfig.miniapp.imageUrl,
      
      // Additional SEO and sharing metadata
      "application-name": minikitConfig.miniapp.name,
      "apple-mobile-web-app-title": minikitConfig.miniapp.name,
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "default",
      "mobile-web-app-capable": "yes",
      "msapplication-TileColor": "#3b82f6",
      "msapplication-TileImage": minikitConfig.miniapp.iconUrl,
      "theme-color": "#3b82f6",
      
      // Additional Open Graph metadata
      "og:locale": "en_US",
      "og:site_name": minikitConfig.miniapp.name,
      "og:updated_time": new Date().toISOString(),
      "og:image:width": "1200",
      "og:image:height": "630",
      "og:image:type": "image/png",
      "og:image:alt": minikitConfig.miniapp.ogTitle,
      
      // Additional Twitter metadata
      "twitter:image:alt": minikitConfig.miniapp.ogTitle,
      "twitter:domain": "onbase-six.vercel.app",
      "twitter:url": minikitConfig.miniapp.homeUrl,
      
      // Schema.org structured data
      "application/ld+json": JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": minikitConfig.miniapp.name,
        "description": minikitConfig.miniapp.description,
        "url": minikitConfig.miniapp.homeUrl,
        "image": minikitConfig.miniapp.imageUrl,
        "icon": minikitConfig.miniapp.iconUrl,
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
          "url": minikitConfig.miniapp.homeUrl
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
          <SafeArea>{children}</SafeArea>
        </body>
      </html>
    </RootProvider>
  );
}
