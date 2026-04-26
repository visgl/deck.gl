import {updateComment, createComment} from './github.mjs';

export async function reportResults({
  owner, repo, prNumber,
  startCommentId, runUrl,
  analysis, examples, validationResults,
  skipped, fatalError,
}) {
  const body = buildBody({analysis, examples, validationResults, skipped, fatalError, runUrl});

  // Prefer updating the existing "running..." comment so the PR thread stays clean.
  const id = parseInt(startCommentId);
  if (id) {
    await updateComment({owner, repo, commentId: id, body});
  } else {
    await createComment({owner, repo, prNumber, body});
  }
}

function buildBody({analysis, examples, validationResults, skipped, fatalError, runUrl}) {
  const lines = ['## 🤖 PR Validation Agent', ''];

  if (fatalError) {
    lines.push(`❌ **Agent error**: \`${fatalError}\``);
    if (runUrl) lines.push('', `[View workflow logs](${runUrl})`);
    return lines.join('\n');
  }

  if (skipped) {
    const reason = analysis?.skipReason || 'No visual/API changes detected.';
    lines.push(`⏭️ **Skipped** — ${reason}`);
    return lines.join('\n');
  }

  const passed = validationResults.filter(r => r.passed).length;
  const total = validationResults.length;
  const allPassed = passed === total;

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

  lines.push(`**Headless validation**: ${allPassed ? '✅' : '⚠️'} ${passed}/${total} examples passed`);
  lines.push('');
  lines.push('---');
  lines.push('');

  for (let i = 0; i < examples.length; i++) {
    const ex = examples[i];
    const res = validationResults[i];
    const icon = res.passed ? '✅' : '❌';
    const badge = {
      'new-feature': '🆕',
      'regression-check': '🔁',
      'api-change': '🔧',
    }[ex.focusArea] ?? '';

    lines.push(`### ${icon} ${badge} ${ex.name}`);
    lines.push(ex.description);
    lines.push('');

    if (!res.passed) {
      if (!res.hasCanvas) {
        lines.push('> ⚠️ No `<canvas>` found — DeckGL may not have initialized.');
      }
      if (res.errors.length > 0) {
        lines.push('**Console errors:**');
        res.errors.slice(0, 5).forEach(e => lines.push(`- \`${e.slice(0, 300)}\``));
      }
      lines.push('');
    }

    // Collapsible HTML so the comment isn't overwhelming, but code is always accessible.
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
    lines.push(`📦 **Download all examples** as a zip from the [workflow artifacts](${runUrl}) (30-day retention).`);
    lines.push('Unzip and open any \`.html\` file directly in your browser — no build step needed.');
  }

  lines.push('');
  lines.push('> ⚠️ Examples load deck.gl from the `^9.0.0` CDN tag. They validate API shape and ');
  lines.push('> catch regressions in stable features, but do not execute PR branch code directly.');
  lines.push('> Open a downloaded example after the PR is merged to verify against the new build.');

  return lines.join('\n');
}
