const fs = require('fs');
const path = 'c:/AdmissionX/app/components/TopUniversities.tsx';
let content = fs.readFileSync(path, 'utf8');

// Use regex to catch the whole function signature
const funcRegex = /export default function TopUniversities\(\{[\s\S]*?\}\: TopUniversitiesProps\)/;
const funcReplace = `export default function TopUniversities({
  universities: initialUniversities,
  initialStreamColleges = [],
  ads = [],
  partnerAds = [],
  featuredAds = [],
}: TopUniversitiesProps)`;

if (funcRegex.test(content)) {
    content = content.replace(funcRegex, funcReplace);
    fs.writeFileSync(path, content);
    console.log('Successfully fixed TopUniversities function signature');
} else {
    console.log('Could not find TopUniversities function signature with regex');
}
