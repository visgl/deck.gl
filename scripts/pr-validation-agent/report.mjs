import {updateComment, createComment} from './github.mjs';

const SCREENSHOT_BRANCH = 'pr-examples';

export async function reportResults({
  owner, repo, prNumber,
  startCommentId, runUrl,
  analysis, examples, validationResults,
  skipped, fatalError,
}) {
  const body = buildBody({owner, repo, prNumber, analysis, examples, validationResults, skipped, fatalError, runUrl});

  const id = parseInt(startCommentId);
  if (id) {
    await updateComment({owner, repo, commentId: id, body});
  } else {
    await createComment({owner, repo, prNumber, body});
  }
}

// Screenshots are published to the pr-examples branch by the workflow step
// that runs after this script. The URLs are deterministic, so we can embed
// them in the comment now — they become live once the push completes.
function screenshotUrl(owner, repo, prNumber, filename) {
  return `https://raw.githubusercontent.com/${owner}/${repo}/${SCREENSHOT_BRANCH}/pr-${prNumber}/screenshots/${filename}`;
}

function buildScreenshotMatrix(owner, repo, prNumber, screenshots) {
  if (!screenshots?.length) return '';

  const headers = screenshots.map(s => `| ${s.label} `).join('') + '|';
  const aligns  = screenshots.map(() => '|:---:').join('') + '|';
  const images  = screenshots.map(s => {
    const url = screenshotUrl(owner, repo, prNumber, s.filename);
    return `| <img src="${url}" width="260" alt="${s.label}"> `;
  }).join('') + '|';

  return [headers, aligns, images].join('\n');
}

function buildBody({owner, repo, prNumber, analysis, examples, validationResults, skipped, fatalError, runUrl}) {
  const lines = ['## 🤖 PR Validation Agent', ''];

  if (fatalError) {
    lines.push(`❌ **Agent error**: \`${fatalError}\``);
    if (runUrl) lines.push('', `[View workflow logs](${runUrl})`);
    return lines.join('\n');
  }

  if (skipped) {
    lines.push(`⏭️ **Skipped** — ${analysis?.skipReason || 'No visual/API changes detected.'}`);
    return lines.join('\n');
  }

  const passed = validationResults.filter(r => r.passed).length;
  const total = validationResults.length;

  lines.push(`**Change**: ${analysis.summary}`);
  lines.push(`**Layers/modules**: ${analysis.changedLayers.join(', ') || '—'}`);
  lines.push('');

  if (analysis.apiChanges.length > 0) {
    lines.push('**API changes detected**:');
    for (const c of analysis.apiChanges) {
      lines.push(`- \`[${c.type}]\` ${c.description} — _${c.layerOrModule}_`);
    }
    lines.push('');
  }

  lines.push(`**Headless validation**: ${passed === total ? '✅' : '⚠️'} ${passed}/${total} passed`);
  lines.push('');
  lines.push('---');
  lines.push('');

  for (let i = 0; i < examples.length; i++) {
    const ex = examples[i];
    const res = validationResults[i];
    const icon = res.passed ? '✅' : '❌';
    const badge = {'new-feature': '🆕', 'regression-check': '🔁', 'api-change': '🔧'}[ex.focusArea] ?? '';

    lines.push(`### ${icon} ${badge} ${ex.name}`);
    lines.push(ex.description);
    lines.push('');

    if (ex.codeSandboxUrl) {
      lines.push(`[▶️ Open in CodeSandbox](${ex.codeSandboxUrl}) &nbsp;·&nbsp; ✏️ Open in CodePen — button is inside the downloaded HTML`);
      lines.push('');
    }

    // Screenshot matrix — images are hosted on the pr-examples branch and
    // will be live shortly after this comment is posted.
    const matrix = buildScreenshotMatrix(owner, repo, prNumber, res.screenshots);
    if (matrix) {
      lines.push(matrix);
      lines.push('');
    }

    if (!res.passed) {
      if (!res.hasCanvas) lines.push('> ⚠️ No `<canvas>` found — DeckGL may not have initialized.');
      if (res.errors.length > 0) {
        lines.push('**Console errors:**');
        res.errors.slice(0, 5).forEach(e => lines.push(`- \`${e.slice(0, 300)}\``));
      }
      lines.push('');
    }

    lines.push('<details>');
    lines.push(`<summary>📄 <code>${ex.filename}</code> — view generated HTML</summary>`);
    lines.push('');
    lines.push('```html');
    lines.push(ex.html.trim());
    lines.push('```');
    lines.push('');
    lines.push('</details>');
    lines.push('');
  }

  lines.push('---');
  lines.push('');

  if (runUrl) {
    lines.push(`📦 **[Download examples zip](${runUrl})** from workflow artifacts (30-day retention).`);
    lines.push('Each downloaded `.html` file includes an **✏️ Open in CodePen** button.');
  }

  lines.push('');
  lines.push('> ⚠️ Examples load deck.gl from the `^9.0.0` CDN. They validate API shape and regressions');
  lines.push('> in stable features but do not execute PR branch code directly.');

  return lines.join('\n');
}
