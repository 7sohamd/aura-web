import { NextResponse } from 'next/server';
import webPush from 'web-push';

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidPublicKey && vapidPrivateKey) {
  webPush.setVapidDetails(
    'mailto:test@example.com',
    vapidPublicKey,
    vapidPrivateKey
  );
}

export async function POST(req: Request) {
  try {
    const { subscription, payload } = await req.json();

    if (!subscription) {
      return NextResponse.json({ error: 'Missing subscription' }, { status: 400 });
    }
    
    if (!vapidPublicKey || !vapidPrivateKey) {
      console.warn('VAPID keys not configured, cannot send push notification.');
      return NextResponse.json({ error: 'VAPID keys missing' }, { status: 500 });
    }

    await webPush.sendNotification(
      subscription,
      JSON.stringify(payload)
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending push notification:', error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
