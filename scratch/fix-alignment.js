const fs = require('fs');
const path = 'c:/AdmissionX/app/components/TopUniversities.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = 'lg:items-end justify-between gap-8">';
const replacement = 'lg:items-start justify-between gap-8">';

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(path, content);
    console.log('Successfully updated TopUniversities.tsx alignment');
} else {
    console.log('Target string not found');
}
