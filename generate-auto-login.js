// Script to generate autoLoginConfig.js during Vercel build
// This reads from environment variables and creates the config file

const fs = require('fs');
const path = require('path');

const email = process.env.VITE_AUTO_LOGIN_EMAIL || '';
const password = process.env.VITE_AUTO_LOGIN_PASSWORD || '';

const configContent = `// Auto-login configuration for no-login branch
// Generated during build from environment variables

export const AUTO_LOGIN_CONFIG = {
  email: '${email}',
  password: '${password}'
};
`;

const filePath = path.join(__dirname, 'src', 'autoLoginConfig.js');
fs.writeFileSync(filePath, configContent, 'utf8');

console.log('✅ Generated autoLoginConfig.js');
