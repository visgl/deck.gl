# RFC: Migrate from Tape to Vitest

- **Author**: Chris Gervang
- **Date**: January 2026
- **Status**: Draft

## Overview

This RFC proposes migrating deck.gl's test infrastructure from **tape** (assertion framework) + **ocular-test** (test runner from @vis.gl/dev-tools) to **vitest** (which serves as both runner and assertion library).

The migration aims to:
- Modernize the test infrastructure with a widely-adopted, actively maintained framework
- Improve developer experience with better error messages, watch mode, and IDE integration
- Reduce complexity by consolidating runner and assertions into a single tool
- Maintain the same CLI commands for backwards compatibility

## Background

### Current Architecture

```
ocular-test (runner from @vis.gl/dev-tools)
├── Vite (dev server for browser tests)
├── BrowserTestDriver (@probe.gl/test-utils)
├── c8 (coverage)
└── tape (assertions via tape-promise/tape)
```

**Entry points:**
- `test/node.ts` - Node tests with JSDOM polyfills
- `test/browser.ts` - Browser tests with BrowserTestDriver hooks

**Current test commands:**
- `yarn test` - runs `ocular-test`
- `yarn test-fast` - runs `ocular-lint && ocular-test node`
- `yarn cover` - runs `ocular-test cover`

### Pain Points

1. **Fragmented tooling**: Test runner (ocular-test), assertions (tape), coverage (c8) are separate tools
2. **Tape is minimalist**: Limited error messages, no built-in mocking, requires wrappers like tape-promise
3. **Custom infrastructure**: BrowserTestDriver requires custom hooks (`window.browserTestDriver_finish`)
4. **Developer experience**: No watch mode, no IDE integration for running individual tests

## Proposal

Replace ocular-test and tape with vitest:

```
vitest (runner + assertions)
├── Vite (built-in - same foundation as ocular-test)
├── Playwright (browser mode - replaces BrowserTestDriver)
├── v8 coverage (built-in)
└── expect() assertions (replaces tape)
```

### Why Vitest?

1. **Built on Vite**: Same bundler that ocular-test uses, ensuring compatibility
2. **All-in-one**: Runner, assertions, mocking, coverage in a single package
3. **Modern DX**: Watch mode, parallel execution, better error messages
4. **Industry standard**: Widely adopted, well-documented, actively maintained
5. **TypeScript-first**: Native TypeScript support without additional configuration

### API Changes

**Test file changes:**

```typescript
// Before (tape)
import test from 'tape-promise/tape';

test('color#parseColor', t => {
  const result = parseColor([127, 128, 129]);
  t.deepEqual(result, [127, 128, 129, 255], 'expected result');
  t.end();
});

// After (vitest)
import {test, expect} from 'vitest';

test('color#parseColor', () => {
  const result = parseColor([127, 128, 129]);
  expect(result).toEqual([127, 128, 129, 255]);
});
```

**Assertion mapping:**

| tape | vitest |
|------|--------|
| `t.ok(value)` | `expect(value).toBeTruthy()` |
| `t.notOk(value)` | `expect(value).toBeFalsy()` |
| `t.equal(a, b)` / `t.is(a, b)` | `expect(a).toBe(b)` |
| `t.deepEqual(a, b)` | `expect(a).toEqual(b)` |
| `t.throws(fn)` | `expect(fn).toThrow()` |
| `t.end()` | (not needed) |

### CLI Compatibility

Commands remain the same:

```json
{
  "scripts": {
    "test": "vitest run",
    "test-fast": "ocular-lint && vitest run",
    "cover": "vitest run --coverage"
  }
}
```

`yarn test ci` continues to work - vitest auto-detects CI environments.

### @deck.gl/test-utils Updates

The `@deck.gl/test-utils` module uses `makeSpy` from `@probe.gl/test-utils`. This will be replaced with vitest's built-in `vi.spyOn`:

```typescript
// Before
import {makeSpy} from '@probe.gl/test-utils';
const spy = makeSpy(Object.getPrototypeOf(layer), 'updateState');

// After
import {vi} from 'vitest';
const spy = vi.spyOn(Object.getPrototypeOf(layer), 'updateState');
```

## Implementation Plan

### Phase 1: Infrastructure Setup
- Add vitest dependencies
- Create `vitest.config.ts` with module aliases matching `.ocularrc.js`
- Create `test/setup/vitest-setup.ts` with JSDOM polyfills

### Phase 2: Update @deck.gl/test-utils
- Replace `makeSpy` with `vi.spyOn`
- Add vitest as peer dependency

### Phase 3: Migrate Test Files (~185 files)
- Convert tape imports to vitest
- Transform assertions
- Remove `t.end()` calls
- Update callback patterns (`onError: t.notOk` → `onError: (err) => expect(err).toBeFalsy()`)

### Phase 4: Browser/Render/Interaction Tests
- Configure vitest browser mode with Playwright
- Convert render tests (SnapshotTestRunner)
- Convert interaction tests

### Phase 5: Cleanup
- Remove `tap-spec`, `tape-catch` dependencies
- Remove test entry points from `.ocularrc.js`
- Delete `test/node.ts`, `test/browser.ts`, `.nycrc`

## Scope

- ~185 test files in `test/modules/`
- ~2800 assertions to convert
- 1 test utility module (`@deck.gl/test-utils`)
- 2 special test suites (render/interaction)

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Browser tests may behave differently | Vitest browser mode uses Playwright, similar to current Puppeteer-based setup |
| Coverage format changes | Vitest v8 provider outputs lcov format, same as current setup |
| Breaking changes for external consumers of test-utils | Add vitest as peer dependency, document migration |

## Alternatives Considered

### Keep ocular-test, only replace tape assertions
- **Rejected**: Would require custom integration between ocular-test's BrowserTestDriver and vitest assertions
- Vitest is designed to be both runner and assertion library

### Migrate to Jest
- **Rejected**: Jest has slower startup, less Vite integration
- Vitest is faster and shares the same Vite foundation as ocular-test

## Open Questions

1. Should we convert test file structure to use `describe`/`it` blocks, or keep flat `test()` calls?
2. Should browser tests run in CI by default, or remain opt-in?
3. Timeline for deprecating tape support in `@deck.gl/test-utils`?

## References

- [Vitest Documentation](https://vitest.dev/)
- [Vitest Browser Mode](https://vitest.dev/guide/browser/)
- [ocular-test source](https://github.com/visgl/dev-tools/blob/master/modules/dev-tools/src/test.ts)
