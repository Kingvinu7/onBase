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
    openGraph: {
      title: minikitConfig.miniapp.ogTitle,
      description: minikitConfig.miniapp.ogDescription,
      images: [minikitConfig.miniapp.imageUrl],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: minikitConfig.miniapp.ogTitle,
      description: minikitConfig.miniapp.ogDescription,
      images: [minikitConfig.miniapp.imageUrl],
    },
    other: {
      // Farcaster Frame metadata
      "fc:frame": "vNext",
      "fc:frame:image": minikitConfig.miniapp.heroImageUrl,
      "fc:frame:image:aspect_ratio": "1.91:1",
      "fc:frame:button:1": `🚀 Launch ${minikitConfig.miniapp.name}`,
      "fc:frame:button:1:action": "link",
      "fc:frame:button:1:target": minikitConfig.miniapp.homeUrl,
      
      // Farcaster Miniapp metadata
      "fc:miniapp": minikitConfig.miniapp.version,
      "fc:miniapp:name": minikitConfig.miniapp.name,
      "fc:miniapp:subtitle": minikitConfig.miniapp.subtitle,
      "fc:miniapp:description": minikitConfig.miniapp.description,
      "fc:miniapp:icon": minikitConfig.miniapp.iconUrl,
      "fc:miniapp:splash": minikitConfig.miniapp.splashImageUrl,
      "fc:miniapp:splash:background": minikitConfig.miniapp.splashBackgroundColor,
      "fc:miniapp:url": minikitConfig.miniapp.homeUrl,
      "fc:miniapp:image": minikitConfig.miniapp.heroImageUrl,
      "fc:miniapp:category": minikitConfig.miniapp.primaryCategory,
      "fc:miniapp:tags": minikitConfig.miniapp.tags.join(","),
      "fc:miniapp:button": `🔍 Discover Your Base Story`,
      "fc:miniapp:button:action": "launch_miniapp",
      
      // Additional Farcaster metadata
      "farcaster:miniapp:url": minikitConfig.miniapp.homeUrl,
      "farcaster:miniapp:name": minikitConfig.miniapp.name,
      "farcaster:miniapp:icon": minikitConfig.miniapp.iconUrl,
      
      // Additional required metadata for embed validation
      "robots": "index, follow",
      "referrer": "origin-when-cross-origin",
      "format-detection": "telephone=no",
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
