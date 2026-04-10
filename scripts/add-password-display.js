const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/admin/colleges/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add temp_password to new pipeline projection
content = content.replace(
  `        _source: { $literal: "new" },

      },

    },
  ];


  const normalizeOldPipeline`,
  `        _source: { $literal: "new" },
        temp_password: { $ifNull: ["$temp_password", null] },
      },
    },
  ];

  const normalizeOldPipeline`
);

// Add temp_password display after the approve form in the UI
// Find the approved status block and add password display
content = content.replace(
  `                    {college.status !== "approved" && (

                      <form action={approveCollegeAction}>`,
  `                    {college.status === "approved" && college.temp_password && (
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 border border-amber-200 rounded-lg">
                        <span className="material-symbols-outlined text-[12px] text-amber-600">key</span>
                        <span className="text-[10px] font-mono font-bold text-amber-700 select-all">{college.temp_password}</span>
                      </div>
                    )}

                    {college.status !== "approved" && (
                      <form action={approveCollegeAction}>`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done. temp_password display added.');
