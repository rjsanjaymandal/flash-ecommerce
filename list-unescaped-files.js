const fs = require('fs');
const results = JSON.parse(fs.readFileSync('lint-results-2.json', 'utf8'));

results.forEach(result => {
  result.messages.forEach(msg => {
    if (msg.ruleId === 'react/no-unescaped-entities') {
      console.log(result.filePath);
    }
  });
});
