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
      images: [minikitConfig.miniapp.ogImageUrl],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: minikitConfig.miniapp.ogTitle,
      description: minikitConfig.miniapp.ogDescription,
      images: [minikitConfig.miniapp.ogImageUrl],
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
      "fc:miniapp": JSON.stringify({
        version: minikitConfig.miniapp.version,
        name: minikitConfig.miniapp.name,
        subtitle: minikitConfig.miniapp.subtitle,
        description: minikitConfig.miniapp.description,
        iconUrl: minikitConfig.miniapp.iconUrl,
        splashImageUrl: minikitConfig.miniapp.splashImageUrl,
        splashBackgroundColor: minikitConfig.miniapp.splashBackgroundColor,
        homeUrl: minikitConfig.miniapp.homeUrl,
        imageUrl: minikitConfig.miniapp.heroImageUrl,
        ogImageUrl: "/onBase-hero.png",
        primaryCategory: minikitConfig.miniapp.primaryCategory,
        tags: minikitConfig.miniapp.tags,
        button: {
          title: `🔍 Discover Your Base Story`,
          action: {
            name: `Launch ${minikitConfig.miniapp.name}`,
            type: "launch_miniapp",
          },
        },
      }),
      
      // Additional Farcaster metadata
      "farcaster:miniapp:url": minikitConfig.miniapp.homeUrl,
      "farcaster:miniapp:name": minikitConfig.miniapp.name,
      "farcaster:miniapp:icon": minikitConfig.miniapp.iconUrl,
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
