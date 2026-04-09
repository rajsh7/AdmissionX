const fs = require('fs');
const path = 'c:/AdmissionX/app/components/TopUniversities.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Update interface
const interfaceSearch = 'ads?: AdItem[];';
const interfaceReplace = 'ads?: AdItem[];\n  partnerAds?: AdItem[];\n  featuredAds?: AdItem[];';
content = content.replace(interfaceSearch, interfaceReplace);

// 2. Update function signature
const funcSearch = 'ads = [],\n}: TopUniversitiesProps) {';
const funcReplace = 'ads = [],\n  partnerAds = [],\n  featuredAds = [],\n}: TopUniversitiesProps) {';
content = content.replace(funcSearch, funcReplace);

fs.writeFileSync(path, content);
console.log('Successfully added partnerAds and featuredAds to TopUniversitiesProps and function signature');
