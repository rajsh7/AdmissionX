const fs = require('fs');
const path = 'c:/AdmissionX/app/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `{ ads_position: "home" },\r\n              { ads_position: " home" },`;
const replacement = `{ ads_position: "home" },
              { ads_position: " home" },
              { ads_position: "default" },
              { ads_position: " default" },`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(path, content);
    console.log('Successfully updated app/page.tsx');
} else {
    // Try with \n only
    const target2 = `{ ads_position: "home" },\n              { ads_position: " home" },`;
    if (content.includes(target2)) {
        content = content.replace(target2, replacement);
        fs.writeFileSync(path, content);
        console.log('Successfully updated app/page.tsx (LF)');
    } else {
        console.log('Target content not found in app/page.tsx');
        // Print slice for debug
        const idx = content.indexOf('ads_position: "home"');
        if (idx !== -1) {
            console.log('Found partial match at:', idx);
            console.log('Context:', JSON.stringify(content.slice(idx - 20, idx + 100)));
        }
    }
}
