const fs = require('fs');
const path = 'c:/AdmissionX/app/components/TopUniversities.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `{ads.length > 0 && (\r\n              <div className="hidden lg:flex items-center gap-4 flex-1 min-w-[300px] mb-2">\r\n                <div className="h-px bg-slate-200 flex-1" />\r\n                <div className="flex flex-col items-end gap-2">\r\n                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Sponsored Partner</span>\r\n                  <MovingAdsCard\r\n                    ads={ads}\r\n                    className="w-[280px] xl:w-[320px] h-[90px] flex-shrink-0 rounded-[12px] overflow-hidden shadow-sm border border-slate-100"\r\n                  />\r\n                </div>\r\n              </div>\r\n            )}`;

const targetLF = `{ads.length > 0 && (\n              <div className="hidden lg:flex items-center gap-4 flex-1 min-w-[300px] mb-2">\n                <div className="h-px bg-slate-200 flex-1" />\n                <div className="flex flex-col items-end gap-2">\n                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Sponsored Partner</span>\n                  <MovingAdsCard\n                    ads={ads}\n                    className="w-[280px] xl:w-[320px] h-[90px] flex-shrink-0 rounded-[12px] overflow-hidden shadow-sm border border-slate-100"\n                  />\n                </div>\n              </div>\n            )}`;

const replacement = `{ads.length > 0 && (
              <div className="hidden lg:flex items-center gap-6 flex-1 min-w-[400px] mb-2">
                <div className="h-px bg-slate-200 flex-1" />
                <div className="flex gap-4 items-end">
                   {/* Card 1 */}
                   <div className="flex flex-col items-end gap-2 text-right">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Partner Store</span>
                     <MovingAdsCard
                        ads={ads.slice(0, Math.ceil(ads.length / 2))}
                        className="w-[240px] xl:w-[280px] h-[90px] flex-shrink-0 rounded-[12px] overflow-hidden shadow-sm border border-slate-100"
                      />
                   </div>
                   {/* Card 2 (only if more than 1 ad) */}
                   {ads.length > 1 && (
                     <div className="flex flex-col items-end gap-2 text-right">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Featured</span>
                       <MovingAdsCard
                          ads={ads.slice(Math.ceil(ads.length / 2))}
                          className="w-[240px] xl:w-[280px] h-[90px] flex-shrink-0 rounded-[12px] overflow-hidden shadow-sm border border-slate-100"
                        />
                     </div>
                   )}
                </div>
              </div>
            )}`;

if (content.includes(target) || content.includes(targetLF)) {
    content = content.replace(target, replacement);
    content = content.replace(targetLF, replacement);
    fs.writeFileSync(path, content);
    console.log('Successfully updated TopUniversities.tsx');
} else {
    console.log('Target content not found in TopUniversities.tsx');
    // Debug snippet
    const idx = content.indexOf('ads.length > 0 && (');
    if (idx !== -1) {
        console.log('Context:', JSON.stringify(content.slice(idx, idx + 200)));
    }
}
