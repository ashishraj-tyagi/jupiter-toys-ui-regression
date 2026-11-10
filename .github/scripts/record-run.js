const fs = require('node:fs');

const summaryPath = 'test-results/summary.json';
let summary = null;

if (fs.existsSync(summaryPath)) {
  summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
}

const record = {
  runId: process.env.RUN_ID,
  runUrl: process.env.RUN_URL,
  sha: process.env.COMMIT_SHA,
  branch: process.env.BRANCH,
  workflowResult: process.env.TEST_RESULT,
  summary,
};

fs.mkdirSync('dashboard-input', { recursive: true });
fs.writeFileSync('dashboard-input/run.json', `${JSON.stringify(record, null, 2)}\n`);
