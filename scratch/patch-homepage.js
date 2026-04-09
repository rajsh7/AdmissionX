const fs = require('fs');
const path = 'c:/AdmissionX/app/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const repairCode = fs.readFileSync('c:/AdmissionX/scratch/fix-homepage-data.js', 'utf8');

// Find the start and end of getHomePageData
const startIdx = content.indexOf('const getHomePageData = unstable_cache(');
const endMarker = '["homepage-data-v10"],';
const endIdx = content.indexOf('  { revalidate: 300 },', content.indexOf(endMarker)) + '  { revalidate: 300 },'.length + 2;

if (startIdx !== -1 && endIdx !== -1) {
    const newContent = content.slice(0, startIdx) + repairCode.trim() + content.slice(endIdx);
    fs.writeFileSync(path, newContent);
    console.log('Successfully repaired getHomePageData in app/page.tsx');
} else {
    console.log('Could not find getHomePageData markers', { startIdx, endIdx });
}
