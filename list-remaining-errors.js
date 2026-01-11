const fs = require('fs');
const results = JSON.parse(fs.readFileSync('lint-results-phase1-v5.json', 'utf8'));

const imgFiles = new Set();
const unescapedFiles = new Set();

results.forEach(result => {
  result.messages.forEach(msg => {
    if (msg.ruleId === '@next/next/no-img-element') {
      imgFiles.add(result.filePath);
    }
    if (msg.ruleId === 'react/no-unescaped-entities') {
      unescapedFiles.add(result.filePath);
    }
  });
});

console.log('--- Images ---');
imgFiles.forEach(f => console.log(f));
console.log('\n--- Unescaped ---');
unescapedFiles.forEach(f => console.log(f));
