const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '..', '.env.local');
const content = fs.readFileSync(envPath, 'utf8');

console.log('=== Checking .env.local ===');
const lines = content.split('\n').filter(line => line.includes('NEXT_PUBLIC_SEPOLIA'));
lines.forEach(line => console.log(line));

console.log('\n=== Checking process.env in Next.js context ===');
console.log('NEXT_PUBLIC_SEPOLIA_TRADE_VERIFIER_ADDRESS:', process.env.NEXT_PUBLIC_SEPOLIA_TRADE_VERIFIER_ADDRESS);
console.log('NEXT_PUBLIC_SEPOLIA_RPC_URL:', process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL);
