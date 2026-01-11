const fs = require('fs');
const results = JSON.parse(fs.readFileSync('lint-results.json', 'utf8'));

const errorCounts = {};
const fileErrors = {};

results.forEach(result => {
  result.messages.forEach(msg => {
    if (msg.severity === 2) { // 2 is error
      errorCounts[msg.ruleId] = (errorCounts[msg.ruleId] || 0) + 1;
      if (!fileErrors[msg.ruleId]) fileErrors[msg.ruleId] = [];
      if (!fileErrors[msg.ruleId].includes(result.filePath)) {
          fileErrors[msg.ruleId].push(result.filePath);
      }
    }
  });
});

console.log('Error Counts:');
Object.entries(errorCounts).sort((a, b) => b[1] - a[1]).forEach(([rule, count]) => {
  console.log(`${rule}: ${count}`);
});

console.log('\nTop Files per Error (Sample):');
Object.keys(fileErrors).slice(0, 3).forEach(rule => {
    console.log(`\n${rule}:`);
    fileErrors[rule].slice(0, 5).forEach(f => console.log(`  ${f}`));
});
