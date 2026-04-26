const BASE = 'https://api.github.com';

function headers(extra = {}) {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...extra,
  };
}

async function assertOk(res, label) {
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${label}: HTTP ${res.status} — ${body.slice(0, 200)}`);
  }
}

export async function fetchPRDiff({owner, repo, prNumber}) {
  const res = await fetch(`${BASE}/repos/${owner}/${repo}/pulls/${prNumber}`, {
    headers: headers({Accept: 'application/vnd.github.v3.diff'}),
  });
  await assertOk(res, 'fetchPRDiff');
  return res.text();
}

export async function updateComment({owner, repo, commentId, body}) {
  const res = await fetch(`${BASE}/repos/${owner}/${repo}/issues/comments/${commentId}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({body}),
  });
  await assertOk(res, 'updateComment');
}

export async function createComment({owner, repo, prNumber, body}) {
  const res = await fetch(`${BASE}/repos/${owner}/${repo}/issues/${prNumber}/comments`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({body}),
  });
  await assertOk(res, 'createComment');
  return res.json();
}
