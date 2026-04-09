const fs = require('fs');
const path = 'c:/AdmissionX/app/components/TopUniversities.tsx';
let content = fs.readFileSync(path, 'utf8');

// The marker for the start of the damage
const damageMarker = '{/* Categories Tabs */}';
const damageEndMarker = 'animate={{ opacity: 1, scale: 1 }}';

// Reconstruct the correct block
const correctBlock = `{/* Categories Tabs */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-4 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleTabClick(cat)}
              className={\`px-6 py-2.5 rounded-[10px] text-sm font-normal whitespace-nowrap transition-all active:scale-95 \${
                activeTab === cat
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-primary/50 hover:text-primary"
              }\`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Universities Section Heading */}
        <div className="mb-8 flex items-center gap-4">
          <h3 className="text-[25px] font-bold text-slate-900 uppercase tracking-wider whitespace-nowrap">
            Top rank universities !
          </h3>
          <div className="h-px bg-slate-100 flex-1" />
        </div>

        {/* Universities Grid */}
        <div
          className={\`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8 transition-opacity duration-300 \${isLoading ? "opacity-50 pointer-events-none" : "opacity-100"}\`}
        >
          <AnimatePresence mode="popLayout">
            {filteredUniversities.length > 0 ? (
              filteredUniversities.slice(0, 8).map((uni, i) => (
                <motion.div
                  key={uni.name}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}`;

// We need to replace from the marker up to the start of the next valid identifiable property
const startIdx = content.indexOf(damageMarker);
const endIdx = content.indexOf(damageEndMarker);

if (startIdx !== -1 && endIdx !== -1) {
    const newContent = content.slice(0, startIdx) + correctBlock + content.slice(endIdx + damageEndMarker.length);
    fs.writeFileSync(path, newContent);
    console.log('Successfully repaired TopUniversities.tsx');
} else {
    console.log('Could not find damage markers:', { startIdx, endIdx });
}
