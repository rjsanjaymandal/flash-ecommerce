const fs = require('fs');

try {
  const data = fs.readFileSync('lint-results-phase3-v1.json', 'utf8');
  const results = JSON.parse(data);

  let totalAny = 0;
  const filesWithAny = [];

  results.forEach(file => {
    const anyErrors = file.messages.filter(m => m.ruleId === '@typescript-eslint/no-explicit-any');
    if (anyErrors.length > 0) {
      totalAny += anyErrors.length;
      filesWithAny.push({
        filePath: file.filePath,
        count: anyErrors.length,
        lines: anyErrors.map(e => e.line)
      });
    }
  });

  // Sort by count descending
  filesWithAny.sort((a, b) => b.count - a.count);

  const report = [];
  report.push(`--- Analysis Report Phase 3 ---`);
  report.push(`Total 'no-explicit-any' errors: ${totalAny}`);
  report.push(`Files involved: ${filesWithAny.length}`);
  report.push(`\n--- Top Offenders ---`);
  filesWithAny.forEach(f => {
    report.push(`${f.filePath} (${f.count})`);
  });

  fs.writeFileSync('report-phase3.txt', report.join('\n'));
  console.log("Report written to report-phase3.txt");

} catch (err) {
  console.error('Error reading/parsing JSON:', err);
}
