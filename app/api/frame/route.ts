import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get('address');

  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://onbase-six.vercel.app';

  // If address is provided, show analytics preview
  if (address) {
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${baseUrl}/hero.png" />
          <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
          <meta property="fc:frame:button:1" content="🔍 Analyze ${address.slice(0, 6)}...${address.slice(-4)}" />
          <meta property="fc:frame:button:1:action" content="link" />
          <meta property="fc:frame:button:1:target" content="${baseUrl}?address=${address}" />
          <meta property="fc:frame:button:2" content="🚀 Launch onBase" />
          <meta property="fc:frame:button:2:action" content="link" />
          <meta property="fc:frame:button:2:target" content="${baseUrl}" />
          <title>onBase - ${address}</title>
        </head>
        <body>
          <h1>onBase Analytics for ${address}</h1>
          <p>Discover comprehensive Base blockchain analytics!</p>
        </body>
      </html>`,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  }

  // Default frame
  return new NextResponse(
    `<!DOCTYPE html>
    <html>
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${baseUrl}/hero.png" />
        <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
        <meta property="fc:frame:button:1" content="🔍 Discover Your Base Story" />
        <meta property="fc:frame:button:1:action" content="link" />
        <meta property="fc:frame:button:1:target" content="${baseUrl}" />
        <meta property="fc:frame:button:2" content="📊 View Demo" />
        <meta property="fc:frame:button:2:action" content="link" />
        <meta property="fc:frame:button:2:target" content="${baseUrl}?demo=true" />
        <title>onBase - Discover Your Base Journey</title>
      </head>
      <body>
        <h1>onBase - Base Analytics Platform</h1>
        <p>Explore your onchain journey on Base! Discover transaction patterns, activity streaks, and unlock your unique blockchain personality.</p>
      </body>
    </html>`,
    {
      headers: {
        'Content-Type': 'text/html',
      },
    }
  );
}

export async function POST(request: NextRequest) {
  // Handle Farcaster Frame interactions
  try {
    const body = await request.json();
    console.log('Frame interaction:', body);

    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://onbase-six.vercel.app';

    // Return frame response
    return NextResponse.json({
      type: 'frame',
      frameUrl: `${baseUrl}/api/frame`,
    });
  } catch (error) {
    console.error('Frame interaction error:', error);
    return NextResponse.json({ error: 'Invalid frame interaction' }, { status: 400 });
  }
}