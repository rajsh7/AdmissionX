const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const adminDir = path.join(process.cwd(), 'app', 'admin');
const files = walk(adminDir);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // Pattern 1: const total = countRows[0]?.total ?? 0;
    // We want to wrap the right side in Number(...)
    // Matching: const total[spaces]=[spaces]countRows[0][optional ?].total[optional junk]
    const regex = /const\s+total\s*=\s*([^;]+countRows\[0\][^;]+);/g;
    
    content = content.replace(regex, (match, p1) => {
        // Avoid double wrapping
        if (p1.trim().startsWith('Number(')) return match;
        changed = true;
        return `const total = Number(${p1.trim()});`;
    });

    if (changed) {
        console.log('Fixed:', file);
        fs.writeFileSync(file, content, 'utf8');
    }
});
