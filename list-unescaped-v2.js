const fs = require('fs');
const results = JSON.parse(fs.readFileSync('lint-results-phase1-v5.json', 'utf8'));

const files = new Set();
results.forEach(result => {
  result.messages.forEach(msg => {
    if (msg.ruleId === 'react/no-unescaped-entities') {
      files.add(result.filePath);
    }
  });
});

console.log('--- Unescaped Entities ---');
files.forEach(f => console.log(f));
