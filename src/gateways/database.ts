import { getFirestore } from 'firebase/firestore';
import client from '@/clients/firebase';

export default getFirestore(client);
