import { connectAuthEmulator, getAuth, onAuthStateChanged } from 'firebase/auth';
import client from '@/clients/firebase';

const auth = getAuth(client);

if (import.meta.env.VITE_USE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
}

export const initialized: Promise<boolean> = new Promise((resolve) => {
  const unsubscribe = onAuthStateChanged(auth, () => {
    unsubscribe();
    resolve(true);
  });
});

export default auth;
