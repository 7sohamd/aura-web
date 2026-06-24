const webPush = require('web-push');
const fs = require('fs');

// clean up existing messy lines (if we had them)
let content = fs.readFileSync('.env.local', 'utf-8');
content = content.replace(/N E X T.*/g, '').replace(/V A P I D.*/g, '').replace(/\0/g, '');
fs.writeFileSync('.env.local', content);

const vapidKeys = webPush.generateVAPIDKeys();
fs.appendFileSync('.env.local', `\nNEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}\nVAPID_PRIVATE_KEY=${vapidKeys.privateKey}\n`);
