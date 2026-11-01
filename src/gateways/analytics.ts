import { getAnalytics, isSupported, logEvent as logFirebaseEvent } from 'firebase/analytics';
import client from '@/clients/firebase';

const analytics = isSupported()
  .then((supported) => (supported ? getAnalytics(client) : null))
  .catch(() => null);

export function logEvent(name: string, params?: Record<string, unknown>): void {
  void analytics.then((instance) => {
    if (instance) logFirebaseEvent(instance, name, params);
  });
}
