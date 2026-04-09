const fs = require('fs');
const path = 'c:/AdmissionX/app/components/TopUniversities.tsx';
let content = fs.readFileSync(path, 'utf8');

// Increase width and height
content = content.replace(/w-\[240px\] xl:w-\[280px\] h-\[90px\]/g, 'w-[280px] xl:w-[340px] h-[120px]');

fs.writeFileSync(path, content);
console.log('Successfully increased ad card sizes in TopUniversities.tsx');
