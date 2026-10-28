# Publishing deck.gl

Maintainers publish the npm packages by pushing a version tag. Locally, `yarn publish-prod` (or `yarn publish-beta`) bumps the version, commits, tags and pushes. The [release workflow](../.github/workflows/release.yml) then sees the `v*` tag, creates the GitHub release from `CHANGELOG.md`, and publishes every package to npm with provenance.

## Before publishing

- Check out the release branch (`X.Y-release` for patches, `master` for prereleases) and make sure it's even with `origin`.
- Use the Node version in `.nvmrc`, then run `yarn` and `yarn build`.
- Remove local tags that aren't on GitHub: `git fetch origin --prune --prune-tags`. Stray tags (old prereleases, tags fetched from other repositories) would otherwise be pushed along with the release tag by older versions of `ocular-publish`. If more than 3 tags are pushed at once, GitHub doesn't trigger the release workflow.
- Add the `#### deck.gl [vX.Y.Z] - <date>` section to `CHANGELOG.md` and `git add` it, but don't commit it. The publish script includes it in the version commit and stops if the entry is missing.

## Publish

```bash
yarn publish-prod   # patch release from X.Y-release
yarn publish-beta   # prerelease from master
```

## Verify

- The release workflow ran for the tag and succeeded: `gh run list --workflow release.yml --limit 1`.
- Every package is on npm: `npm view deck.gl dist-tags`, and `npm view @deck.gl/<module>@X.Y.Z version` for each module. A new version can take a few minutes to show up.
- The GitHub release exists: `gh release view vX.Y.Z`.
- A push to a `X.Y-release` branch whose minor version matches `deck.gl@latest` also deploys the website.

## Recovering a partial release

Never run `yarn publish-prod` again to recover. It would bump to the next version. Work from the existing tag instead.

**The release workflow didn't start.** This happens when more than 3 tags were pushed at once. Start it for the tag:

```bash
gh workflow run release.yml --ref vX.Y.Z
```

If the workflow file at that tag predates `workflow_dispatch`, delete the tag on GitHub and push it again on its own: `git push origin :refs/tags/vX.Y.Z && git push origin vX.Y.Z`.

**Some packages failed to publish.** Use **Re-run failed jobs** on the workflow run. `lerna publish from-package` skips versions already on npm, so only the missing packages are published.

- With `@vis.gl/dev-tools` versions that don't include [visgl/dev-tools#71](https://github.com/visgl/dev-tools/pull/71), the re-run fails immediately because the GitHub release already exists. Delete the release first and keep the tag (`gh release delete vX.Y.Z --yes`). The re-run recreates it from `CHANGELOG.md`.
- A known intermittent failure is `TLOG_CREATE_ENTRY_ERROR ... (409) an equivalent entry already exists in the transparency log`, from npm's provenance signing ([npm/cli#10078](https://github.com/npm/cli/issues/10078)). The affected package isn't published, and a new attempt succeeds.
- If a re-run fails only with `You cannot publish over the previously published versions`, those packages were already published but weren't visible on the registry yet. Check with `npm view`.

Clean up any stray tags that were pushed with `git push origin :refs/tags/<tag>`, after the release is complete.
