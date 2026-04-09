/**
 * Run: node scripts/fix-unicode-comments.js
 * Replaces Unicode box-drawing chars (─ ━ ═ ╔ etc.) in comments
 * with plain ASCII dashes to fix Turbopack Rust panic.
 */
const fs = require('fs');
const path = require('path');

const EXTS = ['.tsx', '.ts'];
const ROOT = path.join(__dirname, '../app');

// Unicode ranges to replace with '-'
// Box drawing: U+2500–U+257F
// Block elements: U+2580–U+259F  
// CJK box chars used in comments: U+9673 (陳), U+FF74 (ｴ) etc.
function stripUnicode(content) {
  return content
    .replace(/[\u2500-\u257F]/g, '-')  // Box drawing characters (─ ━ ═ etc.)
    .replace(/[\u2580-\u259F]/g, '-')  // Block elements
    .replace(/\u9673/g, '-')           // 陳
    .replace(/\uFF74/g, '-')           // ｴ (half-width katakana used as separator)
    .replace(/\uFF4D/g, '-');          // ｍ
}

let fileCount = 0;
let changedCount = 0;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      walk(fullPath);
    } else if (EXTS.includes(path.extname(entry.name))) {
      fileCount++;
      const original = fs.readFileSync(fullPath, 'utf8');
      const fixed = stripUnicode(original);
      if (fixed !== original) {
        fs.writeFileSync(fullPath, fixed, 'utf8');
        changedCount++;
        console.log('Fixed:', fullPath.replace(ROOT, ''));
      }
    }
  }
}

walk(ROOT);
console.log(`\nDone. Scanned ${fileCount} files, fixed ${changedCount} files.`);
