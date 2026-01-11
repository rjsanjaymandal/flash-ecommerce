const fs = require('fs');
const results = JSON.parse(fs.readFileSync('lint-results-2.json', 'utf8'));

results.forEach(result => {
  result.messages.forEach(msg => {
    if (msg.ruleId === 'react-hooks/set-state-in-effect') {
      console.log(result.filePath);
    }
  });
});
