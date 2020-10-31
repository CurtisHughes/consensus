import firebase from '@/clients/firebase';
import 'firebase/auth';

const auth = firebase.auth();

export const initialized: Promise<boolean> = new Promise((resolve) => {
  const unsubscribe = auth.onAuthStateChanged(() => {
    unsubscribe();
    resolve(true);
  });
});

export default auth;
