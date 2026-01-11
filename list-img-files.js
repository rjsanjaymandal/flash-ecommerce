const fs = require('fs');
const results = JSON.parse(fs.readFileSync('lint-results-phase1.json', 'utf8'));

const files = new Set();
results.forEach(result => {
  result.messages.forEach(msg => {
    if (msg.ruleId === '@next/next/no-img-element') {
      files.add(result.filePath);
    }
  });
});

files.forEach(f => console.log(f));
