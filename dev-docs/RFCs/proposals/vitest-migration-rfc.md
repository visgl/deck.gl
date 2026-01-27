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
- `test/node.ts` - Minimal smoke test (only `imports-spec` + `core-layers.spec`)
- `test/browser.ts` - **Comprehensive** - runs ALL tests (`./modules` + `./render` + `./interaction`)

**Important architectural note:** The previous design intentionally ran all tests in the browser (source of truth for a WebGL library), with Node serving only as a smoke test.

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

### Multi-Environment Architecture

We adopt a **hybrid approach** using vitest workspaces:
- **Browser runs ALL tests** (source of truth for correctness)
- **Node runs pure unit tests** (fast feedback during development)

This preserves the previous design philosophy where browser tests are comprehensive, while adding fast local iteration via Node.

**File naming convention:**
| Pattern | Description |
|---------|-------------|
| `*.spec.ts` | Default - runs in both environments |
| `*.browser.spec.ts` | Browser-only (WebGL, real DOM, etc.) |

**Vitest workspace configuration:**
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'node',
          environment: 'node',
          include: ['test/modules/**/*.spec.ts'],
          exclude: ['test/modules/**/*.browser.spec.ts'],
          setupFiles: ['./test/setup/vitest-node-setup.ts']
        }
      },
      {
        test: {
          name: 'browser',
          include: ['test/modules/**/*.spec.ts'],  // ALL tests
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{browser: 'chromium'}]
          }
        }
      },
      {
        test: {
          name: 'headless',
          include: ['test/modules/**/*.spec.ts'],  // ALL tests
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{browser: 'chromium'}]
          }
        }
      }
    ]
  }
});
```

**CLI commands:**
```json
{
  "test": "vitest run",
  "test-node": "vitest run --project node",
  "test-browser": "vitest run --project browser",
  "test-headless": "vitest run --project headless"
}
```

### Why Playwright Instead of Puppeteer?

Vitest browser mode only supports **Playwright** or WebdriverIO as providers - Puppeteer is not an option. This is actually beneficial:
- Playwright has better parallel execution
- Native TypeScript support
- More robust browser automation APIs
- Better cross-browser testing support

The existing Puppeteer usage (via `@probe.gl/test-utils` BrowserTestDriver) will be replaced with Playwright's native APIs.

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

**1.1 Install dependencies:**
```bash
yarn add -D @vitest/browser @vitest/browser-playwright playwright
```

**Node 18 Compatibility:** Confirmed - Vitest 2.1.9 requires `^18.0.0 || >=20.0.0`, Playwright requires `>=18`.

**1.2 Update `vitest.config.ts`** with workspace projects (see Multi-Environment Architecture above)

**1.3 Create setup files:**
- `test/setup/vitest-node-setup.ts` - JSDOM polyfills (from current `test/node.ts`)
- `test/setup/vitest-browser-setup.ts` - Minimal (browser provides DOM)

**1.4 Add npm scripts** for each environment

### Phase 2: Update @deck.gl/test-utils
- Replace `makeSpy` with `vi.spyOn`
- Add vitest as peer dependency

### Phase 3: Migrate Test Files (~185 files)
- Convert tape imports to vitest
- Transform assertions
- Remove `t.end()` calls
- Update callback patterns (`onError: t.notOk` → `onError: (err) => expect(err).toBeFalsy()`)

### Phase 4: Discovery - Run Node Tests and Identify Browser Dependencies

The hybrid approach serves as a **discovery mechanism**:

1. Run `yarn test-node` and observe failures
2. Failures reveal browser-only dependencies:
   - WebGL/GPU operations (`@luma.gl/*`)
   - Real DOM APIs not in JSDOM
   - Browser-specific APIs (fetch quirks, Web Workers)
   - Dependencies that check `typeof window`
   - Canvas 2D context beyond JSDOM's mock

**Decision point after discovery:**
- **Few failures (~10-20%)** → Keep hybrid, rename failures to `.browser.spec.ts`
- **Many failures (~50%+)** → Fall back to browser-only approach

### Phase 5: Migrate Snapshot & Interaction Tests

**Current state:**
- **35 test files** in `test/render/` with **150 golden images**
- **3 test files** in `test/interaction/`
- Both use tape + probe.gl's `BrowserTestDriver` (Puppeteer)
- `SnapshotTestRunner` uses `window.browserTestDriver_captureAndDiffScreen`
- `InteractionTestRunner` uses `window.browserTestDriver_emulateInput`

**5.1 Convert to vitest syntax:**
- Replace `import test from 'tape'` with `import {test, expect} from 'vitest'`
- Update assertion syntax

**5.2 Update SnapshotTestRunner for Playwright:**
- Replace `browserTestDriver_captureAndDiffScreen` with Playwright's `page.screenshot()`
- Use `@vitest/browser`'s page context
- Keep golden image comparison logic

**5.3 Update InteractionTestRunner for Playwright:**
- Replace `browserTestDriver_emulateInput` with Playwright APIs:
  - `page.mouse.move()`, `page.mouse.click()`, `page.keyboard.press()`

**5.4 Add to browser project:**
```typescript
{
  name: 'browser',
  include: [
    'test/modules/**/*.spec.ts',
    'test/render/**/*.spec.ts',      // Add render tests
    'test/interaction/**/*.spec.ts'  // Add interaction tests
  ]
}
```

**Files to modify:**
- `modules/test-utils/src/snapshot-test-runner.ts`
- `modules/test-utils/src/interaction-test-runner.ts`
- `test/render/index.js` → `test/render/index.spec.ts`
- `test/interaction/index.js` → `test/interaction/index.spec.ts`

### Phase 6: Cleanup
- Remove `tap-spec`, `tape-catch` dependencies
- Remove test entry points from `.ocularrc.js`
- Delete `test/node.ts`, `test/browser.ts`, `.nycrc`

## Scope

- ~185 test files in `test/modules/`
- ~2800 assertions to convert
- 1 test utility module (`@deck.gl/test-utils`)
- 35 render test files with 150 golden images
- 3 interaction test files

## Verification

1. `yarn test-node` - runs unit tests in Node (fast feedback)
2. `yarn test-browser` - runs ALL tests in Chromium (unit + render + interaction)
3. `yarn test-headless` - runs ALL tests headlessly (CI)
4. **Render tests**: Golden image comparison passes for all 150 images
5. **Interaction tests**: Controller/picking tests pass

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Browser tests may behave differently | Vitest browser mode uses Playwright, similar to current Puppeteer-based setup |
| Coverage format changes | Vitest v8 provider outputs lcov format, same as current setup |
| Breaking changes for external consumers of test-utils | Add vitest as peer dependency, document migration |
| Many tests fail in Node environment | Discovery phase allows fallback to browser-only approach (Option A) |
| Puppeteer → Playwright migration breaks snapshot comparison | Vitest requires Playwright; will need to regenerate golden images if pixel differences occur |
| CI takes longer (running tests twice) | Node tests are fast; browser failures are the blocking check |

## Alternatives Considered

### Keep ocular-test, only replace tape assertions
- **Rejected**: Would require custom integration between ocular-test's BrowserTestDriver and vitest assertions
- Vitest is designed to be both runner and assertion library

### Migrate to Jest
- **Rejected**: Jest has slower startup, less Vite integration
- Vitest is faster and shares the same Vite foundation as ocular-test

## Open Questions

1. Should we convert test file structure to use `describe`/`it` blocks, or keep flat `test()` calls?
2. ~~Should browser tests run in CI by default, or remain opt-in?~~ **Resolved:** Browser tests are the source of truth and should run in CI by default.
3. Timeline for deprecating tape support in `@deck.gl/test-utils`?
4. After Phase 4 discovery: What percentage of tests fail in Node? This determines whether to keep hybrid approach or fall back to browser-only.

## References

- [Vitest Documentation](https://vitest.dev/)
- [Vitest Browser Mode](https://vitest.dev/guide/browser/)
- [ocular-test source](https://github.com/visgl/dev-tools/blob/master/modules/dev-tools/src/test.ts)
