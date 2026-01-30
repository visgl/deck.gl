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
| `*.node.spec.ts` | Node-only smoke tests (fast, no WebGL) |
| `*.spec.ts` | Browser tests (WebGL, real DOM, etc.) |

**Vitest workspace configuration:**
```typescript
// vitest.workspace.ts
export default defineWorkspace([
  // Node project - simple smoke tests (*.node.spec.ts only)
  {
    test: {
      name: 'node',
      environment: 'node',
      include: ['test/modules/**/*.node.spec.ts'],
      setupFiles: ['./test/setup/vitest-node-setup.ts']
    }
  },
  // Headless project - unit tests in headless browser (CI)
  {
    test: {
      name: 'headless',
      include: ['test/modules/**/*.spec.ts'],
      exclude: ['test/modules/**/*.node.spec.ts'],
      browser: {
        enabled: true,
        name: 'chromium',
        provider: 'playwright',
        headless: true
      }
    }
  },
  // Browser project - full suite in headed browser (local dev)
  {
    test: {
      name: 'browser',
      include: ['test/modules/**/*.spec.ts'],
      exclude: ['test/modules/**/*.node.spec.ts'],
      browser: {
        enabled: true,
        name: 'chromium',
        provider: 'playwright',
        headless: false
      }
    }
  }
]);
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

### CLI Commands

#### Command Mapping (Old → New)

| Old Command | New Command | Notes |
|-------------|-------------|-------|
| `yarn test` | `yarn test` | Now runs node + headless + render |
| `yarn test-fast` | `yarn test-fast` | Same: lint + node smoke test |
| `yarn cover` | `yarn test-headless --coverage` | Redundant script removed |
| `yarn test ci` | `yarn test-ci` | Explicit CI command |
| (none) | `yarn test-headless` | New: browser unit tests only |
| (none) | `yarn test-render` | New: render/interaction tests only |
| (none) | `yarn test-browser` | New: headed browser + render |

#### Command Matrix

| Command | Lint | Node | Headless | Coverage | Render |
|---------|------|------|----------|----------|--------|
| `test` | | ✓ | ✓ | | ✓ |
| `test-fast` | ✓ | ✓ | | | |
| `test-headless` | | | ✓ | | |
| `test-render` | | | | | ✓ |
| `test-ci` | | ✓ | ✓ | ✓ | ✓ |
| `test-browser` | | | ✓ (headed) | | ✓ |

**Note:** Coverage can be added to any vitest command with `--coverage`.

#### Scripts

```json
{
  "scripts": {
    "test": "vitest run --project node --project headless && npm run test-render",
    "test-fast": "ocular-lint && vitest run --project node",
    "test-headless": "vitest run --project headless",
    "test-render": "ocular-test browser-headless",
    "test-ci": "vitest run --project node --project headless --coverage && npm run test-render",
    "test-browser": "vitest run --project browser && npm run test-render"
  }
}
```

#### File Naming Convention

| Pattern | Environment | Use Case |
|---------|-------------|----------|
| `*.node.spec.ts` | Node only | Fast smoke tests (imports, basic logic) |
| `*.spec.ts` | Browser (headless/headed) | Full test suite with WebGL, DOM |

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

**Outcome:** Nearly all tests (~95%+) require browser environment due to WebGL/luma.gl dependencies. We adopted a simplified approach:
- **Node project**: Only runs `*.node.spec.ts` files (smoke tests)
- **Browser projects**: Run all other `*.spec.ts` files

**Node smoke tests (2 files):**
- `imports.node.spec.ts` - Verifies module exports
- `core-layers.node.spec.ts` - Basic layer instantiation

**Excluded tests (need fixes before inclusion):**
- `path-tesselator.spec.ts` - Was commented out in original suite
- `polygon-tesselation.spec.ts` - Was commented out in original suite
- `geocoders.spec.ts` - Never imported in original suite

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

**Outcome:**

**Custom vitest browser commands created** in `test/setup/browser-commands.ts`:
- `captureAndDiffScreen` - Takes screenshots via Playwright, compares with golden images using sharp + pixelmatch
- `emulateInput` - Emulates mouse/keyboard events via Playwright's Frame API
- `isHeadless` - Returns browser headless mode status

**Test runners migrated:**
- `SnapshotTestRunner` now uses `commands.captureAndDiffScreen()` instead of `window.browserTestDriver_captureAndDiffScreen()`
- `InteractionTestRunner` now uses `commands.emulateInput()` instead of `window.browserTestDriver_emulateInput()`
- `TestRunner` base class updated to remove probe.gl dependencies

**New test entry points created:**
- `test/render/index.spec.ts` - Vitest version of render tests
- `test/interaction/index.spec.ts` - Vitest version of interaction tests
- `test/interaction/map-controller.spec.ts` - MapController tests using `expect()`
- `test/interaction/picking.spec.ts` - Picking tests using `expect()`

**Interaction tests passing** - All 10 MapController tests and 1 Picking test pass.

**Render tests need additional work:**
- "Unimplemented type: 4" errors from PNG processing in vitest browser workers
- Temporarily excluded from vitest workspace until resolved
- May require regenerating golden images or fixing client-side dependencies

**Type declarations added:**
- `test/setup/vitest-browser-commands.d.ts` - Extends `@vitest/browser/context` BrowserCommands interface

**Dependencies added:**
- `pixelmatch` - Image comparison
- `pngjs` - PNG parsing (not used directly, but required by some deps)
- `sharp` - Robust image processing (handles various PNG color types)

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
3. ~~Timeline for deprecating tape support in `@deck.gl/test-utils`?~~ **Resolved:** See deprecation timeline below.
4. After Phase 4 discovery: What percentage of tests fail in Node? This determines whether to keep hybrid approach or fall back to browser-only.

## @deck.gl/test-utils Deprecation Timeline

**Goal:** Allow external consumers time to migrate while moving the ecosystem forward.

**Note:** `@deck.gl/test-utils` is published on npm with ~10k monthly downloads (~1% of core). While primarily intended for internal use, external consumers exist and deserve a migration path.

| Phase | Version | Timeline | Changes |
|-------|---------|----------|---------|
| **Compatibility** | 9.3.x | Next minor release | Add vitest as peer dependency alongside `@probe.gl/test-utils`. Both tape and vitest patterns work. |
| **Deprecation Warning** | 9.4.x | +1 minor release | Console warnings for tape-based patterns (`makeSpy`, `assert: t.ok`). Documentation updated with vitest examples. |
| **Removal** | 10.0.0 | Next major release | Remove tape/probe.gl support. `vi.spyOn` replaces `makeSpy`. Callbacks use vitest `expect()`. |

**Migration guide for external consumers:**

```typescript
// Before (tape)
import {testLayer} from '@deck.gl/test-utils';
import test from 'tape';

testLayer({assert: test.ok, onError: test.fail});

// After (vitest)
import {testLayer} from '@deck.gl/test-utils';
import {expect} from 'vitest';

testLayer({
  assert: (condition, message) => expect(condition, message).toBeTruthy(),
  onError: (error) => { throw error; }
});
```

## References

- [Vitest Documentation](https://vitest.dev/)
- [Vitest Browser Mode](https://vitest.dev/guide/browser/)
- [ocular-test source](https://github.com/visgl/dev-tools/blob/master/modules/dev-tools/src/test.ts)
