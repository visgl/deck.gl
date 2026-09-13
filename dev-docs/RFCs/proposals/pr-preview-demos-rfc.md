# RFC: PR Preview Demos

* **Author**: Chris Gervang
* **Date**: Feb, 2026
* **Status**: Draft

## Summary

This RFC proposes adding PR-specific demo and preview functionality to deck.gl, making it easier for reviewers to test changes without needing to clone branches and run examples locally.

## Motivation

Currently, when a PR author wants to provide a testable demo for reviewers, they have several suboptimal options:

1. **Ask reviewers to run locally** - Requires technical setup and time investment from reviewers (who may not always be technical)
2. **Create one-off example modifications** - Works but these changes shouldn't be merged, creating manual cleanup burden
3. **Share external links** - Requires manual deployment effort from the author

This creates friction for both authors and reviewers. As @felixpalmer noted:

> "There is value in providing an easy way for reviewers to test, but it also needs to not introduce friction for the author of the PR."

## Proposals

This RFC presents several approaches that could be implemented independently or in combination.

### Option A: Website PR Preview Deployments

A GitHub Action that deploys a preview of the deck.gl website when triggered.

Label-triggered deployment of the full deck.gl website for a PR branch. See [PR #10019](https://github.com/visgl/deck.gl/pull/10019) for implementation details.

**Mechanism:**
- Triggers on `pull_request_target` events (labeled, unlabeled, synchronize, reopened, closed)
- Deploys a preview when the "preview" label is added/present
- Removes the preview when the PR is closed or the "preview" label is removed
- Uses same build setup as existing `website.yml` (yarn bootstrap + website build with API keys)
- Uses gh-pages branch under `pr-preview/pr-{number}/`

**Pros:**
- Reviewers get a clickable link directly in the PR
- Uses existing build infrastructure
- Label-based triggering gives authors control over when previews are created
- Full website with all examples available

**Cons:**
- Full website build may be slow/expensive
- Requires API keys in GitHub secrets

### Option B: Dedicated Code Review Example Template

A template example (e.g., `examples/code-review/`) that when modified as part of a PR:
- Automatically builds and deploys with a link added to the PR
- Has changes dropped/ignored when the PR is merged

**Mechanism:**
- GitHub Action detects changes to `examples/code-review/`
- Builds and deploys just that example with deck.gl from the PR branch
- Adds comment to PR with preview link
- Merge protection rule or git hook to prevent these changes from landing

**Pros:**
- Authors can create custom demos specific to their PR
- Lightweight - only builds the review example, not entire website
- Explicit sandbox for testing

**Cons:**
- Requires mechanism to drop changes on merge (potentially complex)
- Authors need to modify files that won't be merged

### Option C: External Sandbox Integration

Use CodePen/CodeSandbox that consumes a deck.gl bundle built from the PR.

**Mechanism:**
- GitHub Action builds and publishes a deck.gl UMD bundle to a CDN (e.g., Cloudflare)
- PR comment includes link to a sandbox template that loads this bundle
- Authors can fork and customize the sandbox

**Pros:**
- Flexible - reviewers can experiment with the code
- No changes to repo needed
- Could work for external contributors testing deck.gl changes

**Cons:**
- More complex setup for authors
- May not work well for testing specific examples

### Option D: Automatic Browser Deployments

Automatically deploy the relevant "Browser" example when related modules are updated.

**Layer Browser:** When layer modules are updated (`modules/layers/`, `modules/geo-layers/`, etc.), deploy the Layer Browser.

**Basemap Browser:** When basemap modules are updated (`modules/mapbox/`, `modules/google-maps/`), deploy the Basemap Browser.

**Mechanism:**
- GitHub Action detects changes to relevant modules
- Builds and deploys the corresponding browser example
- Adds comment to PR with preview link

**Pros:**
- Zero friction for authors - happens automatically
- Clean module-to-browser mapping
- Browsers cover most visual testing needs

**Cons:**
- Only useful for changes to modules with browser coverage
- May deploy unnecessarily for non-visual changes

## Implementation Considerations

### Hosting Options

| Option | Pros | Cons |
|--------|------|------|
| GitHub Pages | Free, integrated | Single branch limitation, cleanup complexity |
| Cloudflare Pages | Fast, generous free tier | Additional service to manage |
| Vercel | Easy setup, preview URLs built-in | May have limits for open source |
| Netlify | Similar to Vercel | May have limits for open source |

### Cleanup Strategy

For any deployment approach, we need to handle cleanup:
- Remove previews when PRs are closed/merged
- Set TTL on deployments
- Limit number of concurrent previews

### Security Considerations

- `pull_request_target` allows access to secrets but runs in context of base branch
- Need to be careful about what code from PRs gets executed
- Consider using environment protection rules

## Open Questions

1. Which approach(es) would provide the most value to start with?
2. Should previews be automatic or opt-in (label-triggered)?
3. What's the preferred hosting solution?
4. How do we handle API keys needed for basemap providers?
5. Should we support custom example modifications that get dropped on merge, or is this too complex?

## References

- [PR #10019: Website PR previews](https://github.com/visgl/deck.gl/pull/10019) - Website implementation attempt
- [PR #9937 discussion](https://github.com/visgl/deck.gl/pull/9937#discussion_r2695167886) - Origin of this idea
