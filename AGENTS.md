# Repository Guidance

This file applies to the entire `deck.gl` repository. More specific `AGENTS.md` files in
subdirectories may add local guidance.

## Setup Commands

- Install dependencies from the repo root: `yarn`
- Build packages: `yarn build`
- Run lint: `yarn lint`
- Run all tests: `yarn test`
- Run headless tests: `yarn test-headless`
- Run render tests: `yarn test-render`
- Run browser tests: `yarn test-browser`
- Run website checks: `yarn test-website`
- Use the exact script names from `package.json`; do not substitute spaced forms such as
  `yarn test headless`.

## Before Committing

- Run the most relevant tests for the changed packages, integrations, examples, or docs.
- Run `yarn lint` for JavaScript and TypeScript changes. If lint failures are unrelated existing
  issues, call that out explicitly instead of hiding it.
- If dependencies or package metadata changed, run `yarn` in the repo root and include any
  `yarn.lock` updates.
- Do not reformat files you are not otherwise changing. Keep formatting-only churn separate from
  logic changes when practical.

## Ready For Merge

When asked to "get ready for merge", do a full merge-readiness pass:

- Add or update TSDoc for every new or changed public class, function, method, property, and type.
- Update docs when behavior, public API, examples, or migration guidance changed.
- Keep upgrade guides focused on breaking changes and deprecations; put new-feature notes in the
  appropriate docs or release notes.
- Run `yarn` in the repo root so workspace metadata and `yarn.lock` are up to date.
- Run `yarn build`.
- Run `yarn lint`.
- Run the relevant tests, typically one or more of `yarn test`, `yarn test-headless`,
  `yarn test-render`, `yarn test-browser`, and `yarn test-website`.
- Prepare a copyable Markdown PR description based on the branch diff compared to `master`. Start
  with the PR goals, then list the actual changes and validation.

## Code Style

- Prefer TypeScript and ES module syntax.
- Match the surrounding file style. In source files, use single quotes and semicolons.
- Never abbreviate variable names. Use camelCase for variables, functions, and fields; PascalCase
  for types and classes; and CAPITAL_CASE for constants.
- Prefer verb-noun names for functions and methods.
- File names should be kebab-case unless an existing local convention differs.

## Dependencies

- Be conservative with new external dependencies. Add one only when it provides meaningful
  capability, not just a small utility.
- Prefer vis.gl ecosystem packages when they fit the layering. Lower-level math or utility modules
  should not depend on deck.gl.
- Prefer math.gl modules for math helpers.
- Avoid lodash-style dependencies for simple operations.

## Investigation

- Do not fix problems by adding caches. Investigate why the problem occurs and address the root
  cause.
