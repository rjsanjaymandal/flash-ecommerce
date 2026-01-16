import webPush from 'web-push';

const publicKey = (process.env as any).NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = (process.env as any).VAPID_PRIVATE_KEY;

if (!publicKey || !privateKey) {
  console.warn('VAPID keys are missing from environment variables');
}

webPush.setVapidDetails(
  'mailto:info@flashhfashion.in', // Subject
  publicKey!,
  privateKey!
);

export default webPush;
