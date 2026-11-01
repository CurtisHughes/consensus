import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import client from '@/clients/firebase';

const database = getFirestore(client);

if (import.meta.env.VITE_USE_EMULATORS === 'true') {
  connectFirestoreEmulator(database, 'localhost', 8080);
}

export default database;
