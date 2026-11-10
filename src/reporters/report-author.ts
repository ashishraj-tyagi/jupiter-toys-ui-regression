import fs from 'node:fs';
import path from 'node:path';
import type { FullConfig, Reporter } from '@playwright/test/reporter';

// The HTML report prints the git author. Show the repository owner instead.
const reportAuthor = 'ashishraj-tyagi';

type GitPerson = {
  name: string;
  email: string;
};

type GitCommit = {
  author?: GitPerson;
  committer?: GitPerson;
};

// Drop an empty email so the label is the owner name on its own.
const authorMarkup = 'i=` <${t.author.email}>`,a=`${t.author.name}${i}`';
const authorMarkupWithoutEmptyEmail = 'i=t.author.email?` <${t.author.email}>`:``,a=`${t.author.name}${i}`';

class ReportAuthorReporter implements Reporter {
  onBegin(config: FullConfig): void {
    const commit = config.metadata.gitCommit as GitCommit | undefined;
    replacePerson(commit?.author);
    replacePerson(commit?.committer);
  }

  onEnd(): void {
    const reportPath = path.join(process.cwd(), 'playwright-report', 'index.html');
    if (!fs.existsSync(reportPath)) {
      return;
    }

    const html = fs.readFileSync(reportPath, 'utf8');
    if (!html.includes(authorMarkup)) {
      throw new Error('The HTML report no longer renders the commit author in the expected place.');
    }

    fs.writeFileSync(reportPath, html.replace(authorMarkup, authorMarkupWithoutEmptyEmail));
  }
}

function replacePerson(person: GitPerson | undefined): void {
  if (!person) {
    return;
  }

  person.name = reportAuthor;
  person.email = '';
}

export default ReportAuthorReporter;
