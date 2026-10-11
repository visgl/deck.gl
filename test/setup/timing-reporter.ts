// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// Temporary diagnostic reporter: prints per-file and per-test durations in run order
// so CI logs show where test time goes. Not intended to merge.

import {appendFileSync} from 'node:fs';
import type {Reporter, TestModule} from 'vitest/node';

type FileTiming = {
  order: number;
  project: string;
  file: string;
  duration: number;
  collect: number;
  tests: number;
};

type TestTiming = {
  order: number;
  project: string;
  file: string;
  name: string;
  duration: number;
};

const TOP_FILES = 25;
const TOP_TESTS = 40;

export default class TimingReporter implements Reporter {
  private files: FileTiming[] = [];
  private tests: TestTiming[] = [];
  private root = process.cwd();

  onTestModuleEnd(testModule: TestModule) {
    const diagnostic = testModule.diagnostic();
    const order = this.files.length;
    const project = testModule.project.name;
    const file = testModule.moduleId.replace(`${this.root}/`, '');
    let tests = 0;
    for (const testCase of testModule.children.allTests()) {
      const duration = testCase.diagnostic()?.duration ?? 0;
      tests += duration;
      this.tests.push({order, project, file, name: testCase.fullName, duration});
    }
    this.files.push({
      order,
      project,
      file,
      // `duration` only covers running the tests; add import and setup time
      duration:
        diagnostic.prepareDuration +
        diagnostic.environmentSetupDuration +
        diagnostic.setupDuration +
        diagnostic.collectDuration +
        diagnostic.duration,
      collect: diagnostic.collectDuration,
      tests
    });
  }

  onTestRunEnd() {
    const lines: string[] = [];
    const s = (ms: number) => (ms / 1000).toFixed(1);

    lines.push('## Test timing', '', '| project | files | total s | import s | tests s |');
    lines.push('| --- | --- | --- | --- | --- |');
    const projects = [...new Set(this.files.map(f => f.project))];
    for (const project of projects) {
      const files = this.files.filter(f => f.project === project);
      const sum = (key: 'duration' | 'collect' | 'tests') =>
        files.reduce((acc, f) => acc + f[key], 0);
      lines.push(
        `| ${project} | ${files.length} | ${s(sum('duration'))} | ${s(sum('collect'))} | ${s(sum('tests'))} |`
      );
    }

    lines.push('', `### Slowest ${TOP_FILES} files`, '');
    lines.push(
      '| # | project | total s | import s | tests s | file |',
      '| --- | --- | --- | --- | --- | --- |'
    );
    for (const f of [...this.files].sort((a, b) => b.duration - a.duration).slice(0, TOP_FILES)) {
      lines.push(
        `| ${f.order} | ${f.project} | ${s(f.duration)} | ${s(f.collect)} | ${s(f.tests)} | ${f.file} |`
      );
    }

    lines.push('', `### Slowest ${TOP_TESTS} tests`, '');
    lines.push('| # | project | s | test |', '| --- | --- | --- | --- |');
    for (const t of [...this.tests].sort((a, b) => b.duration - a.duration).slice(0, TOP_TESTS)) {
      lines.push(`| ${t.order} | ${t.project} | ${s(t.duration)} | ${t.file} > ${t.name} |`);
    }

    const summary = lines.join('\n');
    // eslint-disable-next-line no-console
    console.log(`\n${summary}\n`);
    // Full run order, one line per file, for comparing runs
    for (const f of this.files) {
      // eslint-disable-next-line no-console
      console.log(
        `TIMING ${f.order} ${f.project} total=${s(f.duration)} import=${s(f.collect)} tests=${s(f.tests)} ${f.file}`
      );
    }
    if (process.env.GITHUB_STEP_SUMMARY) {
      appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`);
    }
  }
}
