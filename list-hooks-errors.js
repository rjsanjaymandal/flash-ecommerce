const fs = require('fs');
const results = JSON.parse(fs.readFileSync('lint-results-phase1-v5.json', 'utf8'));

const files = new Set();
results.forEach(result => {
  result.messages.forEach(msg => {
    // Check for both exhaustive-deps and purity
    if (msg.ruleId === 'react-hooks/exhaustive-deps' || msg.ruleId === 'react-hooks/purity') {
      files.add(result.filePath);
    }
  });
});

console.log('--- React Hook Errors ---');
files.forEach(f => console.log(f));
