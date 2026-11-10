import fs from 'node:fs';
import path from 'node:path';
import type { FullResult, Reporter, TestCase, TestResult } from '@playwright/test/reporter';

type TestSummary = {
  title: string;
  file: string;
  project: string;
  status: TestResult['status'];
  duration: number;
};

type RunSummary = {
  status: FullResult['status'];
  startedAt: string;
  duration: number;
  passed: number;
  failed: number;
  skipped: number;
  timedOut: number;
  tests: TestSummary[];
};

class SummaryReporter implements Reporter {
  private readonly tests = new Map<string, TestSummary>();
  private startedAt = new Date();

  onBegin(): void {
    this.startedAt = new Date();
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    this.tests.set(test.id, {
      title: test.titlePath().filter(Boolean).join(' > '),
      file: path.relative(process.cwd(), test.location.file),
      project: test.parent.project()?.name ?? '',
      status: result.status,
      duration: result.duration,
    });
  }

  onEnd(result: FullResult): void {
    const tests = [...this.tests.values()];
    const summary: RunSummary = {
      status: result.status,
      startedAt: this.startedAt.toISOString(),
      duration: result.duration,
      passed: tests.filter((test) => test.status === 'passed').length,
      failed: tests.filter((test) => test.status === 'failed' || test.status === 'interrupted').length,
      skipped: tests.filter((test) => test.status === 'skipped').length,
      timedOut: tests.filter((test) => test.status === 'timedOut').length,
      tests,
    };

    const outputDir = path.join(process.cwd(), 'test-results');
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
  }
}

export default SummaryReporter;
