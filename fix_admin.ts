import { initializeApp } from 'firebase/app';
import { getFirestore, setDoc, doc } from 'firebase/firestore';
import config from './firebase-applet-config.json' assert { type: "json" };

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function check() {
  console.log("Updating admin...");
  await setDoc(doc(db, 'users', 'admin_1'), {
    id: 'admin_1',
    name: 'Admin Agência',
    email: 'admin@agencia.com',
    role: 'ADMIN',
    password: 'admin'
  }, { merge: true });
  console.log("Admin updated.");
}
check().then(() => process.exit(0));
