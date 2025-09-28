import { NextResponse } from 'next/server';
import { minikitConfig } from '@/minikit.config';

export async function GET() {
  // Return miniapp manifest for Farcaster
  return NextResponse.json({
    version: minikitConfig.miniapp.version,
    name: minikitConfig.miniapp.name,
    subtitle: minikitConfig.miniapp.subtitle,
    description: minikitConfig.miniapp.description,
    iconUrl: minikitConfig.miniapp.iconUrl,
    splashImageUrl: minikitConfig.miniapp.splashImageUrl,
    splashBackgroundColor: minikitConfig.miniapp.splashBackgroundColor,
    homeUrl: minikitConfig.miniapp.homeUrl,
    primaryCategory: minikitConfig.miniapp.primaryCategory,
    tags: minikitConfig.miniapp.tags,
    heroImageUrl: minikitConfig.miniapp.heroImageUrl,
    screenshotUrls: minikitConfig.miniapp.screenshotUrls,
    tagline: minikitConfig.miniapp.tagline,
    accountAssociation: minikitConfig.accountAssociation,
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
}