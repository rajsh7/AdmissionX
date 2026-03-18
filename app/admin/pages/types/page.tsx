const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default function PageTypesPage() {
  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-slate-600 text-[22px]" style={ICO_FILL}>category</span>
            Page Types
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Categorization of different page templates and structures.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
           <span className="material-symbols-rounded text-slate-300 text-[32px]" style={ICO}>construction</span>
        </div>
        <h2 className="text-lg font-bold text-slate-800">Under Construction</h2>
        <p className="text-sm text-slate-500 max-w-sm mt-1">
          The "Page Types" management module is currently being finalized. This section will allow defining different templates and layouts for your web pages.
        </p>
      </div>
    </div>
  );
}
