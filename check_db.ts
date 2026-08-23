import { initializeApp } from 'firebase/app';
import { getFirestore, getDoc, doc } from 'firebase/firestore';
import config from './firebase-applet-config.json' assert { type: "json" };

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function check() {
  try {
    const adminDoc = await getDoc(doc(db, 'users', 'admin_1'));
    if (adminDoc.exists()) {
      console.log("Admin exists:", adminDoc.data());
    } else {
      console.log("Admin does not exist in DB!");
    }
  } catch (e) {
    console.error("Error reading DB:", e);
  }
}
check().then(() => process.exit(0));
