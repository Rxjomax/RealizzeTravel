#!/bin/bash
cat << 'INNER_EOF' > /tmp/login_patch.js
const fs = require('fs');
const file = 'src/components/client/LoginScreen.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "      const clientMatch = clients.find(c => c.email.toLowerCase() === email.toLowerCase());\n      if (clientMatch) {\n        if (clientMatch.role === 'ADMIN') {",
  `      const clientMatch = clients.find(c => c.email.toLowerCase() === email.toLowerCase());
      if (clientMatch) {
        const storedPassword = clientMatch.password || '123456';
        if (password !== storedPassword) {
          setErrorMsg('Senha incorreta.');
          return;
        }

        if (clientMatch.role === 'ADMIN') {`
);

fs.writeFileSync(file, code);
INNER_EOF
node /tmp/login_patch.js
