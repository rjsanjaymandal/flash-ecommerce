const fs = require('fs');
const results = JSON.parse(fs.readFileSync('lint-results-phase1-v5.json', 'utf8'));

const errorCounts = {};
const fileErrors = {};

results.forEach(result => {
  result.messages.forEach(msg => {
    const ruleId = msg.ruleId || 'unknown';
    const type = msg.severity === 2 ? 'Error' : 'Warning';
    const key = `${ruleId} (${type})`;
    
    errorCounts[key] = (errorCounts[key] || 0) + 1;

    if (!fileErrors[key]) {
      fileErrors[key] = [];
    }
    if (fileErrors[key].length < 3) {
      fileErrors[key].push(result.filePath);
    }
  });
});

console.log('Counts:');
Object.entries(errorCounts)
  .sort(([, a], [, b]) => b - a)
  .forEach(([key, count]) => console.log(`${key}: ${count}`));

console.log('\nSample Files:');
Object.entries(fileErrors).forEach(([key, files]) => {
  console.log(`\n${key}:`);
  files.forEach(f => console.log(f));
});
