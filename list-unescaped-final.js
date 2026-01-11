const fs = require('fs');
const results = JSON.parse(fs.readFileSync('lint-results-final-2.json', 'utf8'));

const files = new Set();
results.forEach(result => {
  result.messages.forEach(msg => {
    if (msg.ruleId === 'react/no-unescaped-entities') {
      files.add(result.filePath);
    }
  });
});

files.forEach(f => console.log(f));
