export function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeToPush(): Promise<PushSubscription> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push messaging is not supported by your browser');
  }

  let registration = await navigator.serviceWorker.getRegistration();
  
  if (!registration) {
    try {
      console.log('No service worker registered, attempting manual registration...');
      registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
    } catch (err: any) {
      throw new Error(`Failed to manually register service worker: ${err.message}`);
    }
  }

  // Wait for it to be ready
  try {
    registration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Service worker timeout')), 5000))
    ]);
  } catch (err: any) {
    throw new Error(`Service worker not ready: ${err.message}`);
  }

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  if (!vapidPublicKey) {
    throw new Error('VAPID public key is missing from environment variables');
  }

  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });
    return subscription;
  } catch (error: any) {
    console.error('Failed to subscribe the user: ', error);
    throw new Error(`Push subscription failed: ${error.message}`);
  }
}
