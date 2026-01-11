const fs = require('fs');

try {
  const data = fs.readFileSync('lint_report.json', 'utf8');
  // Handle case where npm logs extra text before JSON
  const jsonStart = data.indexOf('[');
  const jsonEnd = data.lastIndexOf(']') + 1;
  const json = JSON.parse(data.slice(jsonStart, jsonEnd));

  const stats = {
    totalErrors: 0,
    totalWarnings: 0,
    byRule: {},
    byFile: []
  };

  json.forEach(file => {
    if (file.messages.length > 0) {
      stats.totalErrors += file.errorCount;
      stats.totalWarnings += file.warningCount;
      
      const fileSummary = { name: file.filePath.split('\\').pop(), errors: file.errorCount };
      stats.byFile.push(fileSummary);

      file.messages.forEach(msg => {
        stats.byRule[msg.ruleId] = (stats.byRule[msg.ruleId] || 0) + 1;
      });
    }
  });

  stats.byFile.sort((a, b) => b.errors - a.errors);
  const topFiles = stats.byFile.slice(0, 5);
  const topRules = Object.entries(stats.byRule).sort((a, b) => b[1] - a[1]).slice(0, 5);

  console.log('--- ESLint Summary ---');
  console.log(`Total Issues: ${stats.totalErrors + stats.totalWarnings}`);
  console.log('\nTop 5 Offending Files:');
  topFiles.forEach(f => console.log(`- ${f.name} (${f.errors} errors)`));
  console.log('\nTop 5 Violated Rules:');
  topRules.forEach(r => console.log(`- ${r[0]}: ${r[1]}`));

} catch (e) {
  console.error('Failed to parse report:', e.message);
}
