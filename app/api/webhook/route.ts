import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Webhook received:', body);

    // Handle different webhook events
    switch (body.type) {
      case 'miniapp_launch':
        console.log('Miniapp launched by user:', body.data?.fid);
        break;
      
      case 'miniapp_interaction':
        console.log('Miniapp interaction:', body.data);
        break;
      
      default:
        console.log('Unknown webhook type:', body.type);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 400 });
  }
}

export async function GET() {
  // Health check for webhook endpoint
  return NextResponse.json({ 
    status: 'ok', 
    service: 'onBase webhook',
    timestamp: new Date().toISOString()
  });
}