const fs = require('fs');
const path = 'c:/AdmissionX/app/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = '););';
const replacement = ');';

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(path, content);
    console.log('Successfully fixed syntax error in app/page.tsx');
} else {
    console.log('Target string not found');
}
