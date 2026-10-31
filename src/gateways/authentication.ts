import { getAuth, onAuthStateChanged } from 'firebase/auth';
import client from '@/clients/firebase';

const auth = getAuth(client);

export const initialized: Promise<boolean> = new Promise((resolve) => {
  const unsubscribe = onAuthStateChanged(auth, () => {
    unsubscribe();
    resolve(true);
  });
});

export default auth;
