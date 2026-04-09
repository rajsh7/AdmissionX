const fs = require('fs');
const path = 'c:/AdmissionX/app/components/TopUniversities.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Update interface
content = content.replace(
    'ads: AdItem[];',
    'ads: AdItem[];\n  partnerAds?: AdItem[];\n  featuredAds?: AdItem[];'
);

// 2. Update component signature
content = content.replace(
    'ads,\n}: {',
    'ads,\n  partnerAds = [],\n  featuredAds = [],\n}: {\n  partnerAds?: AdItem[];\n  featuredAds?: AdItem[];'
);

// 3. Update usage of Partner Store ad
const partnerSearch = '<MovingAdsCard\n                        ads={ads.slice(0, Math.ceil(ads.length / 2))}\n                        className="w-[280px] xl:w-[340px] h-[120px] flex-shrink-0 rounded-[12px] overflow-hidden shadow-sm border border-slate-100"\n                      />';
const partnerReplace = '<MovingAdsCard\n                        ads={partnerAds.length > 0 ? partnerAds : ads.slice(0, Math.ceil(ads.length / 2))}\n                        className="w-[280px] xl:w-[340px] h-[120px] flex-shrink-0 rounded-[12px] overflow-hidden shadow-sm border border-slate-100"\n                      />';

if (content.includes(partnerSearch)) {
    content = content.replace(partnerSearch, partnerReplace);
}

// 4. Update usage of Featured ad
const featuredSearch = '<MovingAdsCard\n                          ads={ads.slice(Math.ceil(ads.length / 2))}\n                          className="w-[280px] xl:w-[340px] h-[120px] flex-shrink-0 rounded-[12px] overflow-hidden shadow-sm border border-slate-100"\n                        />';
const featuredReplace = '<MovingAdsCard\n                          ads={featuredAds.length > 0 ? featuredAds : ads.slice(Math.ceil(ads.length / 2))}\n                          className="w-[280px] xl:w-[340px] h-[120px] flex-shrink-0 rounded-[12px] overflow-hidden shadow-sm border border-slate-100"\n                        />';

if (content.includes(featuredSearch)) {
    content = content.replace(featuredSearch, featuredReplace);
}

fs.writeFileSync(path, content);
console.log('Successfully updated TopUniversities.tsx with dedicated ad props');
