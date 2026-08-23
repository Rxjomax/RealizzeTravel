#!/bin/bash
cat << 'INNER_EOF' > /tmp/seed_patch.js
const fs = require('fs');
const file = 'src/context/AppContext.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldSeedCode = \`        const clientsSnap = await getDocs(collection(db, 'users'));
        if (clientsSnap.empty || clientsSnap.docs.length < 4) {
          for (const c of INITIAL_CLIENTS) {
            await setDoc(doc(db, 'users', c.id), c, { merge: true });
          }
        }\`;

const newSeedCode = \`        const clientsSnap = await getDocs(collection(db, 'users'));
        let adminExists = false;
        if (clientsSnap.empty) {
          for (const c of INITIAL_CLIENTS) {
            await setDoc(doc(db, 'users', c.id), c, { merge: true });
          }
          adminExists = true;
        } else {
          clientsSnap.forEach(doc => {
            if (doc.data().email === 'admin@agencia.com') adminExists = true;
          });
        }
        
        if (!adminExists) {
          await setDoc(doc(db, 'users', 'admin_1'), {
            id: 'admin_1',
            name: 'Admin Agência',
            email: 'admin@agencia.com',
            role: 'ADMIN',
            password: 'admin'
          }, { merge: true });
        }\`;

code = code.replace(oldSeedCode, newSeedCode);
fs.writeFileSync(file, code);
INNER_EOF
node /tmp/seed_patch.js
