const fs = require('fs');
const results = JSON.parse(fs.readFileSync('lint-results-final-2.json', 'utf8'));

const errorCounts = {};
const fileErrors = {};

results.forEach(result => {
  result.messages.forEach(msg => {
    // Count everything to see warnings too
    const key = `${msg.ruleId} (${msg.severity === 2 ? 'Error' : 'Warning'})`;
    errorCounts[key] = (errorCounts[key] || 0) + 1;
    
    if (msg.ruleId === 'react/no-unescaped-entities') {
      if (!fileErrors[msg.ruleId]) fileErrors[msg.ruleId] = [];
      fileErrors[msg.ruleId].push(result.filePath);
    }
  });
});

console.log('Counts:');
Object.entries(errorCounts).sort((a, b) => b[1] - a[1]).forEach(([rule, count]) => {
  console.log(`${rule}: ${count}`);
});

console.log('\nFiles with react/no-unescaped-entities:');
if (fileErrors['react/no-unescaped-entities']) {
    fileErrors['react/no-unescaped-entities'].forEach(f => console.log(f));
}
