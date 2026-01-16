const fs = require('fs');
const path = require('path');

const problematicPackages = [
  '@supabase',
  '@vercel',
  'nuqs',
  'framer-motion',
  'lucide-react'
];

function walk(dir, callback) {
  fs.readdirSync(dir).forEach( f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
};

console.log('--- Stripping source mapping URLs from node_modules ---');

problematicPackages.forEach(pkg => {
  const pkgPath = path.join(process.cwd(), 'node_modules', pkg);
  if (fs.existsSync(pkgPath)) {
    console.log(`Processing ${pkg}...`);
    walk(pkgPath, (filePath) => {
      if (filePath.endsWith('.js') || filePath.endsWith('.mjs') || filePath.endsWith('.cjs')) {
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('//# sourceMappingURL=')) {
          // Remove the sourceMappingURL line
          const newContent = content.replace(/\/\/# sourceMappingURL=.+$/gm, '');
          if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            // console.log(`  Fixed: ${path.relative(pkgPath, filePath)}`);
          }
        }
      }
    });
  }
});

console.log('--- Done ---');
