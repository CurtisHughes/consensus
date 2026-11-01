import {
  getAnalytics,
  isSupported,
  logEvent as logFirebaseEvent,
  setUserId,
} from 'firebase/analytics';
import { onAuthStateChanged } from 'firebase/auth';
import client from '@/clients/firebase';
import auth from '@/gateways/authentication';

// Analytics only records scalar parameter values.
type EventParams = Record<string, string | number | boolean | undefined>;

const analytics = isSupported()
  .then((supported) => (supported ? getAnalytics(client) : null))
  .catch(() => null);

void analytics.then((instance) => {
  if (instance) onAuthStateChanged(auth, (user) => setUserId(instance, user?.uid ?? null));
});

export function logEvent(name: string, params?: EventParams): void {
  void analytics.then((instance) => {
    if (instance) logFirebaseEvent(instance, name, params);
  });
}

export function logError(name: string, err: unknown): void {
  const code = err instanceof Object && 'code' in err ? err.code : undefined;
  logEvent('error', { name, error: typeof code === 'string' ? code : String(err) });
}
