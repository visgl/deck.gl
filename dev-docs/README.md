# Development Guidelines

This directory contains development guidelines for deck.gl.

Some of these documents may also be referenced by other repositories in the stack of open source components of [vis.gl](http://vis.gl):
* react-map-gl
* luma.gl
* loaders.gl
* viewport-mercator-project
* mjolnir.js
* math.gl
* probe.gl

For instructions to set up the dev environment, see [developing deck.gl](../docs/contributing.md).

## Development Process

### Feature Proposal

Any new deck.gl feature must start with a GitHub issue. The issue will be used to track the discussion, planning (milestone), implementation (PRs) and release of the feature.

Non-trivial new features should typically be proposed with an RFC (Request for Comments) to make sure we have a complete story before making big modifications to the code base. It also allows the bigger team (as well as the community) to stay engaged, comment and contribute insights. See [RFC Guidelines](./rfc-guidelines.md).

A small, non-disruptive feature may be implemented without an RFC. The tracking issue should instead describe the background and the proposed change.

All proposals will be reviewed and approved by the team before implementation. User-facing API changes should be audited following the [API Guidelines](./deckgl-api-guidelines.md). 
Breaking changes are scheduled for appropriate releases according to the [Deprecation Guidelines](./deprecation-guidelines.md).


### Coding and Review

Follow [Code Guidelines](./code-guidelines.md) when making changes to the source code.

New code must be covered by tests. We have created a suite of tools that enable unit tests for JavaScript and GLSL shaders, and integration tests for WebGL rendering and user interaction. See [Test Guidelines](./test-guidelines.md).

Additional testing could be done with the [layer browser application](/examples/layer-browser), including the combination of prop values, transitions, etc. Changes to the WebGL rendering pipeline must be tested for additional browsers, see [supported platforms](./platform-support.md).

Documentation should be updated to reflect the changes made to user-facing behavior and APIs. This includes the [API documentation](/docs/api-reference) for the modified component, [tutorials](/docs/get-started), [advanced articles](/docs/developer-guide), and the [What's New](/docs/whats-new.md) and [Upgrade Guide](/docs/upgrade-guide.md) pages.

All code changes should open PRs on GitHub and be approved by at least one other team member. If the master branch and the current release branch have diverged, a separate PR may be needed to patch the release branch.


### Release

Our frameworks follow the [Semantic Versioning](https://semver.org/) guidelines.

* Patch release: bug-fixes that unblock the usage of the current minor release.
* Minor release: backward-compatible feature additions, dependency changes, and bug fixes that result in behavioral/visual changes.
* Major release: breaking API changes.

See [branching and releasing model](./directory-structure.md) for how we track the code changes cross releases.

Follow the [publish checklist](./publish-checklist.md) when publishing a new release to npm.

