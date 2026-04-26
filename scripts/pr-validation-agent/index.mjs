/**
 * PR Validation Agent — orchestrates the full pipeline:
 *   1. Fetch PR diff (GitHub API)
 *   2. Analyze changes (Claude Haiku — cheap)
 *   3. Generate examples (Claude Sonnet — focused)
 *   4. Validate examples (Playwright — free compute)
 *   5. Report results (PR comment + workflow artifacts)
 */
import {fetchPRDiff} from './github.mjs';
import {analyzeDiff} from './analyze.mjs';
import {generateExamples} from './generate.mjs';
import {validateExamples} from './validate.mjs';
import {reportResults} from './report.mjs';

const {
  PR_NUMBER,
  PR_TITLE,
  PR_HEAD_SHA,
  REPO_OWNER,
  REPO_NAME,
  START_COMMENT_ID,
  RUN_URL,
} = process.env;

async function main() {
  console.log(`\nPR Validation Agent`);
  console.log(`PR #${PR_NUMBER}: ${PR_TITLE}`);
  console.log(`Commit: ${PR_HEAD_SHA}\n`);

  try {
    // Step 1: Fetch the PR diff via GitHub API (read-only; we never check out PR code)
    console.log('[1/4] Fetching PR diff...');
    const diff = await fetchPRDiff({owner: REPO_OWNER, repo: REPO_NAME, prNumber: PR_NUMBER});
    console.log(`      ${diff.split('\n').length} lines`);

    // Step 2: Analyze with Haiku (fast, cheap — just extracting structure from a diff)
    console.log('[2/4] Analyzing changes (Haiku)...');
    const analysis = await analyzeDiff({diff, prTitle: PR_TITLE, prHeadSha: PR_HEAD_SHA});
    console.log(`      ${analysis.summary}`);
    console.log(`      Layers: ${analysis.changedLayers.join(', ') || 'none'}`);

    if (analysis.skip) {
      console.log(`      Skipping: ${analysis.skipReason}`);
      await reportResults({
        owner: REPO_OWNER, repo: REPO_NAME, prNumber: PR_NUMBER,
        startCommentId: START_COMMENT_ID, runUrl: RUN_URL,
        analysis, examples: [], validationResults: [], skipped: true,
      });
      return;
    }

    // Step 3: Generate examples with Sonnet (capable model for code generation)
    console.log(`[3/4] Generating ${analysis.exampleCount} example(s) (Sonnet)...`);
    const examples = await generateExamples({analysis});
    console.log(`      Generated: ${examples.map(e => e.filename).join(', ')}`);

    // Step 4: Validate with Playwright (headless Chromium, no cost)
    console.log('[4/4] Validating with Playwright...');
    const validationResults = await validateExamples({examples});
    const passed = validationResults.filter(r => r.passed).length;
    console.log(`      ${passed}/${validationResults.length} passed`);

    await reportResults({
      owner: REPO_OWNER, repo: REPO_NAME, prNumber: PR_NUMBER,
      startCommentId: START_COMMENT_ID, runUrl: RUN_URL,
      analysis, examples, validationResults, skipped: false,
    });

    console.log('\nDone.');
    if (passed < validationResults.length) process.exit(1);
  } catch (err) {
    console.error('\nAgent error:', err.message);
    // Always attempt to report back — a silent failure is worse than a noisy one
    await reportResults({
      owner: REPO_OWNER, repo: REPO_NAME, prNumber: PR_NUMBER,
      startCommentId: START_COMMENT_ID, runUrl: RUN_URL,
      analysis: null, examples: [], validationResults: [], skipped: false,
      fatalError: err.message,
    }).catch(() => {});
    process.exit(1);
  }
}

main();
