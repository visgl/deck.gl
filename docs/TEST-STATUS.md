# Test Status Report

This document tracks all failing, skipped, excluded, and problematic tests in the deck.gl vitest migration.

## Table of Contents

1. [Excluded from CI (vitest.config.ts)](#excluded-from-ci-vitestconfigts)
2. [Skipped Tests (test.skip)](#skipped-tests-testskip)
3. [Manual Fix Files (codemod exclusions)](#manual-fix-files-codemod-exclusions)
4. [Codemod Cosmetic Issues](#codemod-cosmetic-issues)
5. [Codemod Buggy Transformations](#codemod-buggy-transformations)

---

## Excluded from CI (vitest.config.ts)

These tests are completely excluded from the vitest test run via the `excludedTests` array.

### Never Imported / Broken on Master

| File | Reason |
|------|--------|
| `test/modules/carto/index.spec.ts` | Never imported in original test suite |
| `test/modules/layers/path-tesselator.spec.ts` | Never imported in original test suite |
| `test/modules/layers/polygon-tesselation.spec.ts` | Never imported in original test suite |
| `test/modules/widgets/geocoders.spec.ts` | Never imported in original test suite |

### API Changes (luma.gl v9)

| File | Reason |
|------|--------|
| `test/modules/extensions/mask/mask.spec.ts` | Commented out on master - luma.gl v9 uniforms API change |
| `test/modules/extensions/mask/mask-pass.spec.ts` | Commented out on master - luma.gl v9 uniforms API change |
| `test/modules/layers/path-layer/path-layer-vertex.spec.ts` | Commented out on master - Transform not exported from @luma.gl/engine |
| `test/modules/extensions/collision-filter/collision-filter.spec.ts` | Commented out on master |

### Pre-existing Code Bugs

| File | Reason |
|------|--------|
| `test/modules/core/lib/attribute/attribute.spec.ts` | Pre-existing bug: data-column.ts overwrites user stride/offset - fix on master first |

### Timeout / Async Issues

| File | Reason |
|------|--------|
| `test/modules/geo-layers/tile-3d-layer/tile-3d-layer.spec.ts` | Timeout, spy count mismatch, async timing issues |
| `test/modules/core/lib/layer-extension.spec.ts` | Needs investigation |
| `test/modules/core/lib/pick-layers.spec.ts` | Needs investigation |
| `test/modules/geo-layers/terrain-layer.spec.ts` | Timeout issues |
| `test/modules/geo-layers/mvt-layer.spec.ts` | Timeout issues |
| `test/modules/carto/layers/h3-tile-layer.spec.ts` | H3TileLayer autoHighlight test times out (>30s) |
| `test/modules/extensions/terrain/terrain-effect.spec.ts` | TerrainEffect tests timeout (>30s) with isolate: false |

### Flaky with isolate: false (GPU/WebGL State Leakage)

These tests pass when run individually but fail in the full suite due to state leakage between tests. The `isolate: false` setting is required for reasonable import times (2s vs 1090s).

| File | Reason |
|------|--------|
| `test/modules/aggregation-layers/hexbin.spec.ts` | GPU state leakage |
| `test/modules/core/lib/deck-picker.spec.ts` | State leakage (undefined layer) |
| `test/modules/carto/layers/schema/carto-raster-tile-loader.spec.ts` | Data format state issues |
| `test/modules/carto/layers/schema/carto-raster-tile.spec.ts` | Data format state issues |
| `test/modules/core/controllers/controllers.spec.ts` | Timing/state issues |
| `test/modules/core/passes/layers-pass.spec.ts` | GLViewport state leakage |

### Timing-Sensitive (CI Headless Mode)

| File | Reason |
|------|--------|
| `test/interaction/map-controller.spec.ts` | Interaction tests fail in CI headless mode - work in render project with proper viewport |

---

## Skipped Tests (test.skip)

These tests exist in the codebase but are explicitly skipped using `test.skip()`.

### Interaction Tests

| File | Test Name | Reason |
|------|-----------|--------|
| `test/interaction/picking.spec.ts:83` | `Picking hover` | Unknown - needs investigation |
| `test/interaction/map-controller.spec.ts:148` | `MapController keyboard left` | Keyboard interaction timing |
| `test/interaction/map-controller.spec.ts:159` | `MapController keyboard up` | Keyboard interaction timing |
| `test/interaction/map-controller.spec.ts:170` | `MapController keyboard shift-left rotate` | Keyboard interaction timing |
| `test/interaction/map-controller.spec.ts:181` | `MapController keyboard shift-up rotate` | Keyboard interaction timing |
| `test/interaction/map-controller.spec.ts:192` | `MapController keyboard minus zoom out` | Keyboard interaction timing |
| `test/interaction/map-controller.spec.ts:203` | `MapController keyboard shift-plus zoom in` | Keyboard interaction timing |

### Module Tests

| File | Test Name | Reason |
|------|-----------|--------|
| `test/modules/aggregation-layers/heatmap-layer/heatmap-layer.spec.ts:61` | `HeatmapLayer#updates` | Unknown - needs investigation |
| `test/modules/extensions/terrain/terrain-cover.spec.ts:151` | `TerrainCover#layers diffing#non-geo` | Unknown - needs investigation |
| `test/modules/extensions/terrain/terrain-cover.spec.ts:211` | `TerrainCover#layers diffing#geo` | Unknown - needs investigation |
| `test/modules/carto/layers/raster-tile-layer.spec.ts:65` | `RasterLayer` | Unknown - needs investigation |
| `test/modules/geo-layers/wms-layer.spec.ts:14` | `WMSLayer` | Unknown - needs investigation |

### Render Tests (Dynamic Skip)

Render tests use `test.skip(tc.name, () => {})` for test cases with `tc.skip: true` in their data files. **These tests DO run** - only individual test cases marked as skip are skipped.

| File | Behavior |
|------|----------|
| `test/render/test-cases/*.spec.ts` (28 files) | Tests run normally; `test.skip` is for test cases with `skip: true` in data files |

### Render Project Test Results (Headless Mode)

**Run:** `npx vitest run --project render` (March 3, 2026)

**Summary:** 161 passed, 3 failed, 9 skipped

#### Failed Tests (3)

| File | Test | Error |
|------|------|-------|
| `map-controller.spec.ts` | MapController pan | `map moved: expected false to be truthy` - drag interaction not working |
| `map-controller.spec.ts` | MapController rotate | `map rotated: expected false to be truthy` - drag interaction not working |
| `polygon-layer.spec.ts` | polygon-lnglat | Match 98.45% below threshold 99% - golden image mismatch |

#### Dynamically Skipped Tests (9)

| File | Test | Reason |
|------|------|--------|
| `map-controller.spec.ts` | MapController keyboard left | `test.skip` in code |
| `map-controller.spec.ts` | MapController keyboard up | `test.skip` in code |
| `map-controller.spec.ts` | MapController keyboard shift-left rotate | `test.skip` in code |
| `map-controller.spec.ts` | MapController keyboard shift-up rotate | `test.skip` in code |
| `map-controller.spec.ts` | MapController keyboard minus zoom out | `test.skip` in code |
| `map-controller.spec.ts` | MapController keyboard shift-plus zoom in | `test.skip` in code |
| `picking.spec.ts` | Picking hover | `test.skip` in code |
| `terrain-extension.spec.ts` | terrain-extension-drape | `tc.skip: true` in test case data |
| `terrain-extension.spec.ts` | terrain-extension-offset | `tc.skip: true` in test case data |

### Render Tests: Headed vs Headless Mode

| Mode | Config | Status |
|------|--------|--------|
| Headless (`headless: true`) | `render` project (vitest.config.ts:252) | polygon-lnglat fails at 98.45% |
| Headed (`headless: false`) | `browser` project (vitest.config.ts:220) | More failures - vitest UI interference |

**Headed mode issue:** The screenshot includes vitest's browser UI (test status indicators, progress bar).

In `browser-commands.ts`, the `captureAndDiffScreen` function:
```javascript
// Line 92: Takes screenshot of the ENTIRE PAGE
const screenshotBuffer = await page.screenshot(screenshotOptions);
```

In headed mode, vitest renders a browser UI with test counts/status above or around the iframe. This UI:
1. Gets included in the `page.screenshot()` capture
2. Shifts the iframe position, throwing off clip region coordinates
3. Causes golden image mismatches

**Fix options:**
1. **Screenshot the iframe element directly** (not the page):
   ```javascript
   const screenshotBuffer = await frameElement.screenshot(screenshotOptions);
   ```
2. **Hide vitest UI before screenshots** using CSS or playwright commands
3. **Screenshot just the canvas element** within the frame

**Headless mode issue:** `polygon-lnglat` test fails at 98.45% match even in headless mode. This suggests either:
1. Golden image needs regeneration
2. Rendering difference between when golden was created vs now
3. Platform-specific rendering difference (needs platform override golden image)

---

## Manual Fix Files (Codemod Exclusions)

These files are excluded from the codemod in `run.cjs` because they required manual fixes that the codemod cannot reproduce.

| File | Reason |
|------|--------|
| `test/modules/core/utils/memoize.spec.ts` | Uses manual call tracking instead of `vi.spyOn` (browser mode call-through issues) |
| `test/modules/widgets/geocoders.spec.ts` | Uses `toBeCloseTo` for floating point DMS coordinate comparisons |

---

## Codemod Cosmetic Issues

The jscodeshift transform produces output that differs from the regex script's output in these ways. These are **stylistic differences** between the two migration approaches.

**Important context:** The jscodeshift runner reads from master and writes fresh output. It does NOT read the regex script's output. So these differences occur because:
1. jscodeshift and regex made different stylistic choices
2. jscodeshift/recast has different formatting behavior
3. Prettier runs on both, but some differences persist

### 1. Array Indentation

**Affected files:** `cpu-aggregator.spec.ts`, `webgl-aggregator.spec.ts`, `path-tesselator.spec.ts`

**Root cause:** jscodeshift's `recast` printer doesn't preserve original array indentation. Prettier should fix this, but if not, it may be a prettier config difference.

**Status:** Should be fixed by prettier post-processing. If not, investigate prettier config.

### 2. Trailing Whitespace After Imports

**Affected files:** `basemap.spec.ts`, `fetch-map.spec.ts`, `h3-tile-layer.spec.ts`, `web-mercator-project-unproject.spec.ts`

**Root cause:** jscodeshift/recast whitespace handling.

**Status:** Should be fixed by prettier. If persisting, investigate.

### 3. Blank Line After Vitest Import

**Affected files:** `attribute.spec.ts`, `layer.spec.ts`, `collision-filter-effect.spec.ts`, `terrain-effect.spec.ts`

**Root cause:** When the transform adds the vitest import, it adds a blank line. The regex script may not have.

**Status:** Can be fixed in transform by not adding blank line, or accept as cosmetic.

### 4. Comment Placement Changes

**Affected files:** `controllers.spec.ts`

**Pattern:**
```typescript
// Regex script has:
    },
    // GlobeView cannot be rotated

// Jscodeshift outputs:
    }, // GlobeView cannot be rotated
```

**Root cause:** AST-based transforms don't preserve exact comment positioning. This is a fundamental limitation of AST transforms vs regex.

**Status:** Accept as cosmetic difference, or don't use jscodeshift for files with complex comment layouts.

### 5. Variable Naming: `e` vs `err`

**Affected files:** `vector-tile-layer.spec.ts`

**Pattern:**
```typescript
// Regex script has:
.catch(e => { throw e; })

// Jscodeshift outputs:
.catch(err => { throw err; })
```

**Root cause:** jscodeshift transform intentionally uses `err` as the error parameter name (see line 697 of transform.ts). The regex script uses `e`.

**Status:** This is a stylistic choice. Can be changed in transform if consistency with regex script is desired.

---

## Codemod Architecture Issue (Priority: High)

The jscodeshift codemod has a fundamental architecture issue that causes it to **overwrite the regex script's work**.

### Root Cause

The runner in `run.cjs` does this:

```javascript
// Line 89: Reads from MASTER, not current branch
tapeContent = execSync(`git show master:${relativePath}`, ...)

// Line 121: Transforms master content
const vitestContent = transform(fileInfo, api, {});

// Line 137: Overwrites current branch file
fs.writeFileSync(file, vitestContent);
```

This means **any work done by the regex script is completely discarded**. The jscodeshift codemod produces fresh output from master, ignoring:
- Regex script conversions
- Any manual fixes
- Stylistic choices made by the regex script

### Manifestations of This Issue

#### 1. Code Inside Comments Gets Reverted

**Affected files:** `google-maps-overlay.spec.ts`

```typescript
// Regex script converted (inside /* */ comment):
/*
const pointerMoveSpy = vi.spyOn(overlay._deck, '_onPointerMove');
expect(pointerMoveSpy).toHaveBeenCalledTimes(1);
*/

// Jscodeshift overwrites with master content:
/*
const pointerMoveSpy = makeSpy(overlay._deck, '_onPointerMove');
t.is(pointerMoveSpy.callCount, 1);
*/
```

**Explanation:** The regex script converted the commented-out code. Jscodeshift reads master (which has tape syntax) and writes that.

#### 2. t.comment Restored Instead of console.log

**Affected files:** `wms-layer.spec.ts`

```typescript
// Regex script converted:
// console.log(actual);

// Jscodeshift overwrites with master:
// t.comment(actual);
```

**Explanation:** Same issue - regex script made this change, jscodeshift ignores it.

#### 3. `return;` After `throw` Handling Differs

**Affected files:** `label-utils.spec.ts`

**Master has:**
```typescript
t.fail('points should not be null');
return t.end();
```

**Regex script converted to:**
```typescript
throw new Error('points should not be null');
return;  // Kept return, removed t.end()
```

**Jscodeshift converts to:**
```typescript
throw new Error('points should not be null');
// Entire "return t.end();" removed
```

**Explanation:** This is a legitimate difference in approach:
- Regex script: Removed `t.end()` but kept `return`
- Jscodeshift: Removes entire `return t.end();` statement (technically more correct since code after `throw` is unreachable)

### Fix Options

1. **Run on current branch instead of master**: Only files that still have tape imports need conversion
2. **Skip already-converted files**: Check if current branch file has tape imports before processing
3. **Use jscodeshift only for fresh conversions**: Don't run on files the regex script already handled
4. **Accept the differences**: If jscodeshift output is correct, use it to replace regex script output

---

## Summary Statistics

| Category | Count |
|----------|-------|
| Excluded from CI (vitest.config.ts) | 18 files |
| Skipped tests (test.skip in code) | 7 interaction + 5 module |
| Render project skipped (tc.skip) | 9 tests |
| Render project failed | 3 tests (2 interaction, 1 golden image) |
| Manual fix files | 2 |
| Codemod cosmetic differences | 5 patterns |
| Codemod architecture issue | 1 (affects all files) |

---

## Next Steps

### Priority 1: Fix Codemod Architecture

The jscodeshift runner overwrites regex script work. Options:
1. **Recommended**: Run jscodeshift on current branch content, not master. Skip files that don't have tape imports.
2. Alternative: Only use jscodeshift for files not yet converted by regex script.

### Priority 2: Investigate Skipped Module Tests

| Test | Status |
|------|--------|
| `HeatmapLayer#updates` | Unknown - needs investigation |
| `TerrainCover#layers diffing#non-geo` | Unknown - needs investigation |
| `TerrainCover#layers diffing#geo` | Unknown - needs investigation |
| `RasterLayer` | Unknown - needs investigation |
| `WMSLayer` | Unknown - needs investigation |

### Priority 3: Re-enable Excluded Tests

Some excluded tests may work now. Test individually:
- `hexbin.spec.ts` - try with `isolate: true`
- `deck-picker.spec.ts` - try with `isolate: true`
- `controllers.spec.ts` - try with `isolate: true`

### Priority 4: Cosmetic Consistency

Decide whether to:
- Accept jscodeshift output as canonical (different but correct)
- Modify jscodeshift to match regex script style (`e` vs `err`, etc.)
- Keep using regex script and deprecate jscodeshift
