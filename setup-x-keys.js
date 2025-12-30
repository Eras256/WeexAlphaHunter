import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env.local');

let content = "";
if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, 'utf-8');
}

const keys = [
    "X_API_KEY",
    "X_API_SECRET",
    "X_ACCESS_TOKEN",
    "X_ACCESS_TOKEN_SECRET",
    "X_BEARER_TOKEN"
];

let added = false;
let newContent = content;

if (!newContent.endsWith('\n')) newContent += '\n';

keys.forEach(key => {
    if (!newContent.includes(key + "=")) {
        newContent += `${key}=\n`;
        added = true;
    }
});

if (added) {
    fs.writeFileSync(envPath, newContent, 'utf-8');
    console.log("✅ Added X API Key templates to .env.local");
    console.log("👉 Please open .env.local and PASTE your keys now.");
} else {
    console.log("ℹ️ X API Key templates already exist in .env.local");
    console.log("👉 Please make sure you have filled them in and SAVED the file.");
}
