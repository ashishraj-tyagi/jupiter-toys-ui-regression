const recentRunLimit = 12;

const statusLabel = {
  passed: 'passed',
  failed: 'failed',
  skipped: 'skipped',
  timedOut: 'timed out',
  timedout: 'timed out',
  interrupted: 'interrupted',
  success: 'passed',
  failure: 'failed',
};

function labelFor(status) {
  if (!status) return 'unknown';
  return statusLabel[status] || status;
}

function classFor(status) {
  if (!status) return 'missing';
  if (status === 'success') return 'passed';
  if (status === 'failure') return 'failed';
  return status;
}

function formatWhen(iso) {
  if (!iso) return '—';
  const formatted = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(new Date(iso));
  return `${formatted} UTC`;
}

function formatDuration(milliseconds) {
  if (milliseconds == null || Number.isNaN(Number(milliseconds))) return '—';
  const seconds = Number(milliseconds) / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)} s`;
  const minutes = Math.floor(seconds / 60);
  const rest = Math.round(seconds % 60);
  return `${minutes}m ${rest}s`;
}

function shortSha(sha) {
  return sha ? sha.slice(0, 7) : '—';
}

function count(summary, field) {
  return summary && summary[field] != null ? summary[field] : '—';
}

function resultOf(run) {
  return (run.summary && run.summary.status) || run.workflowResult || '';
}

function whenOf(run) {
  return (run.summary && run.summary.startedAt) || run.recordedAt || '';
}

function testName(title) {
  const parts = String(title).split(' > ').filter(Boolean);
  return {
    name: parts[parts.length - 1] || title,
    file: parts.length > 1 ? parts[parts.length - 2] : '',
  };
}

function cell(text, className) {
  const item = document.createElement(className === 'th' ? 'th' : 'td');
  if (className && className !== 'th') item.className = className;
  item.textContent = text;
  return item;
}

function badge(status) {
  const mark = document.createElement('span');
  mark.className = `badge ${classFor(status)}`;
  mark.textContent = labelFor(status);
  return mark;
}

function link(href, text) {
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.textContent = text;
  return anchor;
}

function empty(target, message) {
  const note = document.createElement('p');
  note.className = 'empty';
  note.textContent = message;
  target.replaceChildren(note);
}

function renderStats(runs) {
  const latest = runs[0];
  const passed = runs.filter((run) => classFor(resultOf(run)) === 'passed').length;
  const cards = [
    ['Runs', String(runs.length)],
    ['Latest result', latest ? labelFor(resultOf(latest)) : '—'],
    ['Passed runs', String(passed)],
  ];
  const root = document.getElementById('stats');
  root.replaceChildren();
  for (const [name, value] of cards) {
    const card = document.createElement('div');
    card.className = 'stat';
    const title = document.createElement('span');
    title.textContent = name;
    const strong = document.createElement('strong');
    strong.textContent = value;
    card.append(title, strong);
    root.append(card);
  }
}

function renderRuns(runs) {
  const target = document.getElementById('runs');
  if (runs.length === 0) {
    empty(target, 'No runs have been published yet.');
    return;
  }

  const table = document.createElement('table');
  const head = document.createElement('tr');
  for (const heading of ['When', 'Branch', 'Commit', 'Result', 'Passed', 'Failed', 'Skipped', 'Duration', 'Run']) {
    const item = cell(heading, 'th');
    if (['Passed', 'Failed', 'Skipped', 'Duration'].includes(heading)) item.className = 'number';
    head.append(item);
  }
  table.append(head);

  for (const run of runs) {
    const row = document.createElement('tr');
    row.append(cell(formatWhen(whenOf(run))));
    row.append(cell(run.branch || '—'));

    const commit = document.createElement('td');
    if (run.repository && run.sha) {
      commit.append(link(`https://github.com/${run.repository}/commit/${run.sha}`, shortSha(run.sha)));
    } else {
      commit.textContent = shortSha(run.sha);
    }
    row.append(commit);

    const result = document.createElement('td');
    result.append(badge(resultOf(run)));
    row.append(result);

    row.append(cell(String(count(run.summary, 'passed')), 'number'));
    row.append(cell(String(count(run.summary, 'failed')), 'number'));
    row.append(cell(String(count(run.summary, 'skipped')), 'number'));
    row.append(cell(formatDuration(run.summary && run.summary.duration), 'number'));

    const action = document.createElement('td');
    if (run.runUrl) action.append(link(run.runUrl, 'Open run'));
    else action.textContent = '—';
    row.append(action);
    table.append(row);
  }

  target.replaceChildren(table);
}

function renderTests(runs) {
  const target = document.getElementById('tests');
  const columns = runs.slice(0, recentRunLimit);
  const titles = [];
  for (const run of columns) {
    for (const test of (run.summary && run.summary.tests) || []) {
      if (!titles.includes(test.title)) titles.push(test.title);
    }
  }

  if (titles.length === 0) {
    empty(target, 'No test results have been published yet.');
    return;
  }

  const table = document.createElement('table');
  const head = document.createElement('tr');
  head.append(cell('Test', 'th'));
  for (const run of columns) {
    const item = cell(shortSha(run.sha), 'th');
    item.title = formatWhen(whenOf(run));
    head.append(item);
  }
  table.append(head);

  for (const title of titles) {
    const row = document.createElement('tr');
    const name = document.createElement('td');
    name.className = 'name';
    const heading = document.createElement('span');
    const parts = testName(title);
    heading.textContent = parts.name;
    name.append(heading);
    if (parts.file) {
      const file = document.createElement('span');
      file.className = 'file';
      file.textContent = parts.file;
      name.append(file);
    }
    row.append(name);

    for (const run of columns) {
      const found = ((run.summary && run.summary.tests) || []).find((test) => test.title === title);
      const item = document.createElement('td');
      const mark = document.createElement('span');
      mark.className = `cell ${found ? classFor(found.status) : 'missing'}`;
      mark.textContent = found ? labelFor(found.status) : '—';
      item.append(mark);
      row.append(item);
    }
    table.append(row);
  }

  target.replaceChildren(table);
}

async function main() {
  try {
    const response = await fetch('./runs.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`runs.json returned ${response.status}`);
    const payload = await response.json();
    const runs = Array.isArray(payload.runs) ? payload.runs : [];
    renderStats(runs);
    renderRuns(runs);
    renderTests(runs);
  } catch (error) {
    empty(document.getElementById('runs'), 'The run history could not be loaded.');
    document.getElementById('stats').replaceChildren();
    document.getElementById('tests').replaceChildren();
    console.error(error);
  }
}

main();
