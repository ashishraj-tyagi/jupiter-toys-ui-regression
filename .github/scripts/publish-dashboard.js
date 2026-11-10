const fs = require('node:fs');
const path = require('node:path');

const existingPath = process.argv[2];
const outputDir = process.argv[3];

if (!existingPath || !outputDir) {
  throw new Error('Usage: node publish-dashboard.js <existing-runs.json> <output-directory>');
}

const incoming = JSON.parse(fs.readFileSync('dashboard-input/run.json', 'utf8'));
let existing = { runs: [] };

if (fs.existsSync(existingPath)) {
  const parsed = JSON.parse(fs.readFileSync(existingPath, 'utf8'));
  if (Array.isArray(parsed.runs)) existing = parsed;
}

const runs = existing.runs.filter((run) => run.runId !== incoming.runId);
runs.push(incoming);
runs.sort((left, right) => String(whenOf(right)).localeCompare(String(whenOf(left))));

fs.mkdirSync(outputDir, { recursive: true });
fs.copyFileSync(path.join('dashboard', 'index.html'), path.join(outputDir, 'index.html'));
fs.copyFileSync(path.join('dashboard', 'app.js'), path.join(outputDir, 'app.js'));
fs.writeFileSync(path.join(outputDir, '.nojekyll'), '');
fs.writeFileSync(path.join(outputDir, 'runs.json'), `${JSON.stringify({ runs }, null, 2)}\n`);

function whenOf(run) {
  return (run.summary && run.summary.startedAt) || run.recordedAt || '';
}
