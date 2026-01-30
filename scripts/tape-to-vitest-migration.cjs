#!/usr/bin/env node
/**
 * Comprehensive tape-to-vitest migration script.
 *
 * This script reads test files from the master branch and converts them to Vitest syntax.
 * It's designed to be idempotent - running it multiple times produces the same result.
 *
 * Usage:
 *   node scripts/tape-to-vitest-migration.cjs [--dry-run] [file-pattern]
 *
 * Examples:
 *   node scripts/tape-to-vitest-migration.cjs                    # Convert all test files
 *   node scripts/tape-to-vitest-migration.cjs --dry-run          # Preview changes
 *   node scripts/tape-to-vitest-migration.cjs layer.spec.ts      # Convert specific file
 */

const {execSync} = require('child_process');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const filePattern = args.find(a => !a.startsWith('--'));

const testDir = path.join(__dirname, '..', 'test');

// Files with manual fixes that should NOT be overwritten by the migration script.
// These files have been manually edited after initial conversion and contain fixes
// that cannot be expressed as general migration rules.
const MANUAL_FIX_FILES = [
  // Uses manual call tracking instead of vi.spyOn (browser mode call-through issues)
  'test/modules/core/utils/memoize.spec.ts',
  // Uses toBeCloseTo for floating point DMS coordinate comparisons
  'test/modules/widgets/geocoders.spec.ts'
];

// Get list of test files to process - include both .spec.ts and utility .ts files
let files;
if (filePattern) {
  files = glob.sync(`**/*${filePattern}*`, {cwd: testDir, absolute: true});
} else {
  // Get all .spec.ts files and also utility files in the modules directory
  const specFiles = glob.sync('**/*.spec.ts', {cwd: testDir, absolute: true});
  const utilFiles = glob.sync('modules/**/*.ts', {cwd: testDir, absolute: true})
    .filter(f => !f.endsWith('.spec.ts')); // Exclude spec files (already included)
  files = [...specFiles, ...utilFiles];
}

console.log(`Processing ${files.length} test files${dryRun ? ' (dry run)' : ''}...\n`);

let totalConverted = 0;
let totalSkipped = 0;
let totalErrors = 0;

for (const file of files) {
  const relativePath = path.relative(path.join(__dirname, '..'), file);

  // Skip files with manual fixes that shouldn't be overwritten
  if (MANUAL_FIX_FILES.includes(relativePath)) {
    console.log(`  Skipping ${relativePath} (has manual fixes)`);
    totalSkipped++;
    continue;
  }

  try {
    // Get the original tape content from master
    let tapeContent;
    try {
      tapeContent = execSync(`git show master:${relativePath}`, {encoding: 'utf8', maxBuffer: 10 * 1024 * 1024});
    } catch (e) {
      // File doesn't exist in master, skip
      console.log(`  Skipping ${relativePath} (not in master)`);
      totalSkipped++;
      continue;
    }

    // Check if it's actually a tape file or uses tape assertions (via t parameter)
    const hasTapeImport = tapeContent.includes("from 'tape") || tapeContent.includes('from "tape');
    const hasTapeAssertions = /\bt\.(ok|notOk|equal|equals|deepEqual|is|same|assert)\s*\(/.test(tapeContent);

    if (!hasTapeImport && !hasTapeAssertions) {
      console.log(`  Skipping ${relativePath} (not a tape test)`);
      totalSkipped++;
      continue;
    }

    // Convert tape to vitest
    const vitestContent = convertTapeToVitest(tapeContent, relativePath);

    if (dryRun) {
      console.log(`Would convert: ${relativePath}`);
      // Optionally show diff
      // console.log(vitestContent.substring(0, 500) + '...');
    } else {
      fs.writeFileSync(file, vitestContent);
      // Run prettier to fix formatting
      try {
        execSync(`npx prettier --write "${file}"`, {encoding: 'utf8', stdio: 'pipe'});
      } catch (e) {
        // Prettier may not be available or may fail, that's ok
        console.log(`  Note: prettier formatting skipped for ${relativePath}`);
      }
      console.log(`Converted: ${relativePath}`);
    }
    totalConverted++;

  } catch (error) {
    console.error(`Error processing ${relativePath}: ${error.message}`);
    totalErrors++;
  }
}

console.log(`\nSummary:`);
console.log(`  Converted: ${totalConverted}`);
console.log(`  Skipped: ${totalSkipped}`);
console.log(`  Errors: ${totalErrors}`);

/**
 * Convert tape test file content to vitest syntax
 */
function convertTapeToVitest(content, filePath = '') {
  let result = content;
  const isUtilFile = !filePath.endsWith('.spec.ts');

  // Step 1: Convert imports - use a placeholder for now, we'll determine actual imports later
  // import test from 'tape-promise/tape' -> import {test, expect, describe} from 'vitest'
  // import test from 'tape-catch' -> import {test, expect, describe} from 'vitest'
  // import test from 'tape' -> import {test, expect, describe} from 'vitest'
  result = result.replace(
    /import\s+test\s+from\s+['"]tape(?:-promise\/tape|-catch)?['"]\s*;?/g,
    "__VITEST_IMPORT_PLACEHOLDER__"
  );

  // For utility files that use t. assertions but don't import tape,
  // we need to add the expect import after conversion
  const needsExpectImport = isUtilFile &&
    (content.includes('t.ok') || content.includes('t.equal') || content.includes('t.is') ||
     content.includes('t.notOk') || content.includes('t.deepEqual') || content.includes('t.same'));

  // Check if content has nested t.test() calls BEFORE converting (for Step 2a)
  const hasNestedTTest = /\bt\.test\s*\(/.test(content);

  // Step 1b: Convert t.test(), t0.test(), t1.test() etc. to test() BEFORE other conversions
  // This must happen first so that Step 2's regex doesn't match "t.test" as "test"
  // t.test('name', () => { -> test('name', () => {
  // t.test('name', t0 => { -> test('name', () => {
  result = result.replace(
    /t\d*\.test\s*\(\s*'([^']*)'\s*,\s*(async\s+)?\(\s*\)\s*=>\s*\{/g,
    (match, name, async) => `test('${name}', ${async || ''}() => {`
  );
  result = result.replace(
    /t\d*\.test\s*\(\s*"([^"]*)"\s*,\s*(async\s+)?\(\s*\)\s*=>\s*\{/g,
    (match, name, async) => `test("${name}", ${async || ''}() => {`
  );
  result = result.replace(
    /t\d*\.test\s*\(\s*`([^`]*)`\s*,\s*(async\s+)?\(\s*\)\s*=>\s*\{/g,
    (match, name, async) => `test(\`${name}\`, ${async || ''}() => {`
  );
  result = result.replace(
    /t\d*\.test\s*\(\s*'([^']*)'\s*,\s*(async\s+)?(\w+)\s*=>\s*\{/g,
    (match, name, async, param) => `test('${name}', ${async || ''}() => {`
  );
  result = result.replace(
    /t\d*\.test\s*\(\s*"([^"]*)"\s*,\s*(async\s+)?(\w+)\s*=>\s*\{/g,
    (match, name, async, param) => `test("${name}", ${async || ''}() => {`
  );
  result = result.replace(
    /t\d*\.test\s*\(\s*`([^`]*)`\s*,\s*(async\s+)?(\w+)\s*=>\s*\{/g,
    (match, name, async, param) => `test(\`${name}\`, ${async || ''}() => {`
  );

  // Step 2: Convert test function signatures with nested test parameter (t0, t1, etc.)
  // These are parent tests that contain nested t0.test() calls
  // Convert to describe() blocks: test('name', t0 => { -> describe('name', () => {
  result = result.replace(
    /test\s*\(\s*(['"`][^'"`]*['"`])\s*,\s*(async\s+)?t\d+\s*=>\s*\{/g,
    (match, name, async) => `describe(${name}, ${async || ''}() => {`
  );

  // Step 2a: Convert tests with t parameter that contain t.test() to describe()
  // This handles: test('name', t => { ... t.test('nested', ...) ... })
  // Use the hasNestedTTest flag captured BEFORE Step 1b converted t.test() to test()
  if (hasNestedTTest) {
    result = result.replace(
      /test\s*\(\s*(['"`][^'"`]*['"`])\s*,\s*(async\s+)?t\s*=>\s*\{/g,
      (match, name, async) => `describe(${name}, ${async || ''}() => {`
    );
  }

  // Step 2b: Convert regular test function signatures (including test.skip and test.only)
  // test('name', t => { -> test('name', () => {
  // test.skip('name', t => { -> test.skip('name', () => {
  // test('name', async t => { -> test('name', async () => {
  result = result.replace(
    /test(\.skip|\.only)?\s*\(\s*(['"`][^'"`]*['"`])\s*,\s*(async\s+)?t\s*=>\s*\{/g,
    (match, modifier, name, async) => `test${modifier || ''}(${name}, ${async || ''}() => {`
  );

  // Step 2c: Convert expression body arrow functions (no curly braces)
  // test('name', t => expr) -> test('name', () => expr)
  // test('name', async t => expr) -> test('name', async () => expr)
  // This handles cases like: test('name', async t => withMockFetch(...))
  result = result.replace(
    /test(\.skip|\.only)?\s*\(\s*(['"`][^'"`]*['"`])\s*,\s*(async\s+)?t\s*=>\s*(?!\{)/g,
    (match, modifier, name, async) => `test${modifier || ''}(${name}, ${async || ''}() => `
  );

  // Also handle function() style (including test.skip and test.only)
  result = result.replace(
    /test(\.skip|\.only)?\s*\(\s*(['"`][^'"`]*['"`])\s*,\s*(async\s+)?function\s*\(\s*t\s*\)\s*\{/g,
    (match, modifier, name, async) => `test${modifier || ''}(${name}, ${async || ''}() => {`
  );

  // Step 3: Remove t.end() and t0.end(), t1.end() etc. calls
  result = result.replace(/\s*t\d*\.end\(\)\s*;?\s*/g, '\n');

  // Step 4: Convert t.comment() to console.log()
  result = result.replace(/t\d*\.comment\s*\(([^)]+)\)/g, 'console.log($1)');

  // Step 5: Convert t.pass() to console.log() to preserve the message
  // t.pass('message') -> console.log('message')
  result = convertTapePassToLog(result);

  // Step 6: Convert t.fail() to throw (inline use)
  // Handle arrow functions with t.fail as body: () => t.fail(...) -> () => { throw new Error(...) }
  result = result.replace(/=>\s*t\d*\.fail\s*\(([^)]+)\)/g, '=> { throw new Error($1) }');
  // Handle other inline uses
  result = result.replace(/t\d*\.fail\s*\(([^)]+)\)/g, 'throw new Error($1)');

  // Step 6b: Convert t.fail used as callback (e.g., .catch(t.fail))
  result = result.replace(/\.catch\s*\(\s*t\d*\.fail\s*\)/g, '.catch(e => { throw e })');
  result = result.replace(/onError:\s*t\d*\.fail/g, 'onError: (err) => { throw err }');

  // Step 6c: Remove t.plan() - Vitest doesn't need this
  result = result.replace(/\s*t\d*\.plan\s*\([^)]*\)\s*;?\s*/g, '\n');

  // Step 6d: (Moved to Step 1b - t.test() conversion now happens early)

  // Step 6e: Convert t.assert() and t0.assert() -> expect().toBeTruthy()
  result = convertTapeAssertion(result, 't.assert', 'toBeTruthy()');
  result = convertTapeAssertion(result, 't0.assert', 'toBeTruthy()');
  result = convertTapeAssertion(result, 't1.assert', 'toBeTruthy()');

  // Step 6f: Convert t.same() -> expect().toEqual()
  result = convertTwoArgAssertion(result, 't.same', 'toEqual');
  result = convertTwoArgAssertion(result, 't0.same', 'toEqual');
  result = convertTwoArgAssertion(result, 't1.same', 'toEqual');

  // Step 7: Convert assertions (order matters - more specific patterns first)
  // Handle t., t0., t1. variants for all assertion types

  // Use balanced parentheses matching for complex patterns
  // t.ok(...) -> expect(...).toBeTruthy()
  for (const prefix of ['t', 't0', 't1', 't2']) {
    result = convertTapeAssertion(result, `${prefix}.ok`, 'toBeTruthy()');
    result = convertTapeAssertion(result, `${prefix}.notOk`, 'toBeFalsy()');
    result = convertTwoArgAssertion(result, `${prefix}.equal`, 'toBe');
    result = convertTwoArgAssertion(result, `${prefix}.equals`, 'toBe');
    result = convertTwoArgAssertion(result, `${prefix}.notEqual`, 'not.toBe');
    result = convertTwoArgAssertion(result, `${prefix}.notEquals`, 'not.toBe');
    result = convertTwoArgAssertion(result, `${prefix}.deepEqual`, 'toEqual');
    result = convertTwoArgAssertion(result, `${prefix}.deepEquals`, 'toEqual');
    result = convertTwoArgAssertion(result, `${prefix}.notDeepEqual`, 'not.toEqual');
    result = convertTwoArgAssertion(result, `${prefix}.notDeepEquals`, 'not.toEqual');
    result = convertTwoArgAssertion(result, `${prefix}.is`, 'toBe');
    result = convertTwoArgAssertion(result, `${prefix}.isNot`, 'not.toBe');
    result = convertTwoArgAssertion(result, `${prefix}.not`, 'not.toBe');
  }

  // t.true(value) -> expect(value).toBeTruthy()
  // Note: tape's t.true is an alias for t.ok/t.assert, which checks truthiness, not strict boolean true
  result = result.replace(
    /t\d*\.true\s*\(\s*([^,]+?)\s*,\s*(['"`][^'"`]*['"`])\s*\)/g,
    'expect($1, $2).toBeTruthy()'
  );
  result = result.replace(
    /t\d*\.true\s*\(\s*([^)]+?)\s*\)/g,
    (match, value) => `expect(${value.trim()}).toBeTruthy()`
  );

  // t.false(value) -> expect(value).toBeFalsy()
  // Note: tape's t.false is an alias for t.notOk, which checks falsiness, not strict boolean false
  result = result.replace(
    /t\d*\.false\s*\(\s*([^,]+?)\s*,\s*(['"`][^'"`]*['"`])\s*\)/g,
    'expect($1, $2).toBeFalsy()'
  );
  result = result.replace(
    /t\d*\.false\s*\(\s*([^)]+?)\s*\)/g,
    (match, value) => `expect(${value.trim()}).toBeFalsy()`
  );

  // t.throws(fn, 'message') -> expect(fn).toThrow()
  result = convertTapeAssertion(result, 't.throws', 'toThrow()');
  result = convertTapeAssertion(result, 't0.throws', 'toThrow()');
  result = convertTapeAssertion(result, 't1.throws', 'toThrow()');

  // t.doesNotThrow(fn) -> expect(fn).not.toThrow()
  result = convertTapeAssertion(result, 't.doesNotThrow', 'not.toThrow()');
  result = convertTapeAssertion(result, 't0.doesNotThrow', 'not.toThrow()');
  result = convertTapeAssertion(result, 't1.doesNotThrow', 'not.toThrow()');

  // Step 8: Convert callback patterns for test utilities
  // onError: t.notOk -> onError: (err) => expect(err).toBeFalsy()
  result = result.replace(/onError:\s*t\d*\.notOk/g, 'onError: (err) => expect(err).toBeFalsy()');

  // assert: t.ok -> assert: (cond, msg) => expect(cond, msg).toBeTruthy()
  result = result.replace(/assert:\s*t\d*\.ok/g, 'assert: (cond, msg) => expect(cond, msg).toBeTruthy()');

  // Step 8b: Convert sinon-style spy.called assertions to vitest toHaveBeenCalled()
  // expect(spy.called, 'message').toBeTruthy() -> expect(spy, 'message').toHaveBeenCalled()
  // expect(spy.called, 'message').toBeFalsy() -> expect(spy, 'message').not.toHaveBeenCalled()
  result = result.replace(
    /expect\(([^,)]+)\.called,\s*([^)]+)\)\.toBeTruthy\(\)/g,
    'expect($1, $2).toHaveBeenCalled()'
  );
  result = result.replace(
    /expect\(([^,)]+)\.called\)\.toBeTruthy\(\)/g,
    'expect($1).toHaveBeenCalled()'
  );
  result = result.replace(
    /expect\(([^,)]+)\.called,\s*([^)]+)\)\.toBeFalsy\(\)/g,
    'expect($1, $2).not.toHaveBeenCalled()'
  );
  result = result.replace(
    /expect\(([^,)]+)\.called\)\.toBeFalsy\(\)/g,
    'expect($1).not.toHaveBeenCalled()'
  );

  // Step 9: Handle utility files that export functions taking t as parameter
  // Convert: export function testFoo(t, ...) to export function testFoo(...)
  // These helper functions need the t parameter removed
  result = result.replace(
    /export\s+(default\s+)?(async\s+)?function\s+(\w+)\s*\(\s*t\s*,\s*/g,
    (match, defaultKw, async, name) => `export ${defaultKw || ''}${async || ''}function ${name}(`
  );

  // Also handle: export async function testFoo(t, data) -> export async function testFoo(data)
  result = result.replace(
    /export\s+(default\s+)?(async\s+)?function\s+(\w+)\s*\(\s*t\s*\)/g,
    (match, defaultKw, async, name) => `export ${defaultKw || ''}${async || ''}function ${name}()`
  );

  // Step 10: Clean up any remaining test parameter in regular function definitions
  // const validateFoo = (t, ...) => { -> const validateFoo = (...) => {
  result = result.replace(
    /const\s+(\w+)\s*=\s*\(\s*t\s*,\s*/g,
    (match, name) => `const ${name} = (`
  );

  // Step 11: Fix call sites that pass t as first argument to helper functions
  // Known helper functions that take t as first param: testController, testAsyncData, validateShaderAttributes
  // Pattern: functionName(t, ...) -> functionName(...)
  // We look for calls where t is passed as the first argument
  // await testController(t, MapView, {...}) -> await testController(MapView, {...})
  result = result.replace(
    /(\w+)\s*\(\s*t\s*,\s*/g,
    (match, fnName) => {
      // Only transform if it looks like a helper function call (not a method call with t as arg)
      // Skip if preceded by a dot (method call) or if fnName is a keyword
      const keywords = ['if', 'while', 'for', 'switch', 'catch', 'function', 'return'];
      if (keywords.includes(fnName)) {
        return match;
      }
      return `${fnName}(`;
    }
  );

  // Step 12: Fix any double-newlines created by removed code
  result = result.replace(/\n{3,}/g, '\n\n');

  // Step 13: Add expect import for utility files if needed
  if (needsExpectImport && !result.includes("from 'vitest'") && !result.includes('__VITEST_IMPORT_PLACEHOLDER__')) {
    // Find the first import statement and insert before it
    const firstImportMatch = result.match(/^import\s+/m);
    if (firstImportMatch) {
      const insertPos = result.indexOf(firstImportMatch[0]);
      result = result.substring(0, insertPos) + "import {expect} from 'vitest';\n" + result.substring(insertPos);
    } else {
      // No imports found, add after any header comments
      const lines = result.split('\n');
      let insertLineIdx = 0;
      // Skip comment lines and blank lines at the start
      while (insertLineIdx < lines.length) {
        const line = lines[insertLineIdx].trim();
        if (line.startsWith('//') || line.startsWith('/*') || line.startsWith('*') || line === '') {
          insertLineIdx++;
        } else {
          break;
        }
      }
      lines.splice(insertLineIdx, 0, "import {expect} from 'vitest';", '');
      result = lines.join('\n');
    }
  }

  // Step 14: Convert makeSpy from @probe.gl/test-utils to vi.spyOn from vitest
  // import {makeSpy} from '@probe.gl/test-utils'; -> (removed, vi added to vitest import)
  // makeSpy(obj, 'method') -> vi.spyOn(obj, 'method')
  const hasMakeSpy = result.includes("from '@probe.gl/test-utils'") && result.includes('makeSpy');
  if (hasMakeSpy) {
    // Remove makeSpy import from @probe.gl/test-utils
    // Handle: import {makeSpy} from '@probe.gl/test-utils';
    result = result.replace(
      /import\s*\{\s*makeSpy\s*\}\s*from\s*['"]@probe\.gl\/test-utils['"]\s*;?\n?/g,
      ''
    );
    // Handle: import {makeSpy, otherThing} from '@probe.gl/test-utils';
    result = result.replace(
      /import\s*\{([^}]*),\s*makeSpy\s*,([^}]*)\}\s*from\s*['"]@probe\.gl\/test-utils['"]/g,
      "import {$1,$2} from '@probe.gl/test-utils'"
    );
    result = result.replace(
      /import\s*\{([^}]*),\s*makeSpy\s*\}\s*from\s*['"]@probe\.gl\/test-utils['"]/g,
      "import {$1} from '@probe.gl/test-utils'"
    );
    result = result.replace(
      /import\s*\{\s*makeSpy\s*,([^}]*)\}\s*from\s*['"]@probe\.gl\/test-utils['"]/g,
      "import {$1} from '@probe.gl/test-utils'"
    );

    // Convert makeSpy calls to vi.spyOn
    result = result.replace(/makeSpy\s*\(/g, 'vi.spyOn(');
  }

  // Step 14b: Convert spy method calls from probe.gl to vitest (applies to all files)
  // These may come from makeSpy or from @deck.gl/test-utils's testLayer spies
  // spy.restore() -> spy.mockRestore()
  // spy.reset() -> spy.mockReset()
  result = result.replace(/\.restore\s*\(\s*\)/g, '.mockRestore()');
  result = result.replace(/\.reset\s*\(\s*\)/g, '.mockReset()');

  // Step 14c: Convert spy.called patterns to toHaveBeenCalled matchers
  // expect(spy.called).toBeTruthy() -> expect(spy).toHaveBeenCalled()
  // expect(spy.called).toBeFalsy() -> expect(spy).not.toHaveBeenCalled()
  // expect(spy.called).toBe(true) -> expect(spy).toHaveBeenCalled()
  // expect(spy.called).toBe(false) -> expect(spy).not.toHaveBeenCalled()
  result = result.replace(
    /expect\s*\(\s*(\w+)\.called\s*\)\s*\.toBeTruthy\s*\(\s*\)/g,
    'expect($1).toHaveBeenCalled()'
  );
  result = result.replace(
    /expect\s*\(\s*(\w+)\.called\s*\)\s*\.toBeFalsy\s*\(\s*\)/g,
    'expect($1).not.toHaveBeenCalled()'
  );
  result = result.replace(
    /expect\s*\(\s*(\w+)\.called\s*\)\s*\.toBe\s*\(\s*true\s*\)/g,
    'expect($1).toHaveBeenCalled()'
  );
  result = result.replace(
    /expect\s*\(\s*(\w+)\.called\s*\)\s*\.toBe\s*\(\s*false\s*\)/g,
    'expect($1).not.toHaveBeenCalled()'
  );
  // Also handle with message argument: expect(spy.called, 'msg').toBe(true)
  result = result.replace(
    /expect\s*\(\s*(\w+)\.called\s*,\s*(['"`][^'"`]*['"`])\s*\)\s*\.toBeTruthy\s*\(\s*\)/g,
    'expect($1, $2).toHaveBeenCalled()'
  );
  result = result.replace(
    /expect\s*\(\s*(\w+)\.called\s*,\s*(['"`][^'"`]*['"`])\s*\)\s*\.toBeFalsy\s*\(\s*\)/g,
    'expect($1, $2).not.toHaveBeenCalled()'
  );
  result = result.replace(
    /expect\s*\(\s*(\w+)\.called\s*,\s*(['"`][^'"`]*['"`])\s*\)\s*\.toBe\s*\(\s*true\s*\)/g,
    'expect($1, $2).toHaveBeenCalled()'
  );
  result = result.replace(
    /expect\s*\(\s*(\w+)\.called\s*,\s*(['"`][^'"`]*['"`])\s*\)\s*\.toBe\s*\(\s*false\s*\)/g,
    'expect($1, $2).not.toHaveBeenCalled()'
  );

  // Step 15: Replace import placeholder with actual imports based on usage
  if (result.includes('__VITEST_IMPORT_PLACEHOLDER__')) {
    const imports = ['test', 'expect'];
    // Check if describe is actually used in the converted content
    if (/\bdescribe\s*\(/.test(result)) {
      imports.push('describe');
    }
    // Check if vi.spyOn is used (from makeSpy conversion)
    if (/\bvi\.spyOn\s*\(/.test(result)) {
      imports.push('vi');
    }
    result = result.replace(
      '__VITEST_IMPORT_PLACEHOLDER__',
      `import {${imports.join(', ')}} from 'vitest';`
    );
  } else if (hasMakeSpy) {
    // No placeholder but we need to add vi to existing vitest import
    result = result.replace(
      /import\s*\{([^}]*)\}\s*from\s*['"]vitest['"]/,
      (match, imports) => {
        const importList = imports.split(',').map(s => s.trim());
        if (!importList.includes('vi')) {
          importList.push('vi');
        }
        return `import {${importList.join(', ')}} from 'vitest'`;
      }
    );
  }

  return result;
}

/**
 * Convert two-argument tape assertion (like t.equal, t.deepEqual) with balanced parentheses
 * Handles: t.equal(a, b) and t.equal(a, b, 'message')
 * Preserves the message as vitest's custom error message: expect(a, 'message').toBe(b)
 */
function convertTwoArgAssertion(content, tapeMethod, vitestMethod) {
  const methodPattern = new RegExp(escapeRegex(tapeMethod) + '\\s*\\(', 'g');
  let result = content;
  let match;

  // Find all occurrences and process them from end to start (to preserve indices)
  const matches = [];
  while ((match = methodPattern.exec(content)) !== null) {
    matches.push(match.index);
  }

  // Process from end to start
  for (let i = matches.length - 1; i >= 0; i--) {
    const startIdx = matches[i];
    const openParenIdx = content.indexOf('(', startIdx);

    if (openParenIdx === -1) continue;

    // Find matching closing paren
    const closeParenIdx = findMatchingParen(content, openParenIdx);
    if (closeParenIdx === -1) continue;

    // Extract arguments (content inside parens)
    const argsStr = content.substring(openParenIdx + 1, closeParenIdx).trim();

    // Parse arguments - split by comma, but respect nested structures
    const args = splitArgs(argsStr);

    if (args.length < 2) continue;

    // First arg is actual, second is expected, third (if present) is message
    const actual = args[0].trim();
    const expected = args[1].trim();
    const message = args.length > 2 ? args[2].trim() : null;

    // Build replacement - include message as vitest's custom error message
    // vitest syntax: expect(actual, 'message').toBe(expected)
    let replacement;
    if (message) {
      replacement = `expect(${actual}, ${message}).${vitestMethod}(${expected})`;
    } else {
      replacement = `expect(${actual}).${vitestMethod}(${expected})`;
    }

    // Replace in result
    result = result.substring(0, startIdx) + replacement + result.substring(closeParenIdx + 1);
  }

  return result;
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Convert tape assertion with balanced parentheses handling
 * Handles multiline assertions like:
 * t.ok(
 *   someFunc(...),
 *   'message'
 * );
 * Preserves the message as vitest's custom error message: expect(value, 'message').toBeTruthy()
 */
function convertTapeAssertion(content, tapeMethod, vitestMethod) {
  const methodPattern = new RegExp(escapeRegex(tapeMethod) + '\\s*\\(', 'g');
  let result = content;
  let match;

  // Find all occurrences and process them from end to start (to preserve indices)
  const matches = [];
  while ((match = methodPattern.exec(content)) !== null) {
    matches.push(match.index);
  }

  // Process from end to start
  for (let i = matches.length - 1; i >= 0; i--) {
    const startIdx = matches[i];
    const openParenIdx = content.indexOf('(', startIdx);

    if (openParenIdx === -1) continue;

    // Find matching closing paren
    const closeParenIdx = findMatchingParen(content, openParenIdx);
    if (closeParenIdx === -1) continue;

    // Extract the full call
    const fullCall = content.substring(startIdx, closeParenIdx + 1);

    // Extract arguments (content inside parens)
    const argsStr = content.substring(openParenIdx + 1, closeParenIdx).trim();

    // Parse arguments - split by comma, but respect nested structures
    const args = splitArgs(argsStr);

    if (args.length === 0) continue;

    // First arg is the value to test, second (if present) is the message
    const testValue = args[0].trim();
    const message = args.length > 1 ? args[1].trim() : null;

    // Build replacement - include message as vitest's custom error message
    // vitest syntax: expect(value, 'message').toBeTruthy()
    let replacement;
    if (message) {
      replacement = `expect(${testValue}, ${message}).${vitestMethod}`;
    } else {
      replacement = `expect(${testValue}).${vitestMethod}`;
    }

    // Replace in result
    result = result.substring(0, startIdx) + replacement + result.substring(closeParenIdx + 1);
  }

  return result;
}

/**
 * Find the index of the matching closing parenthesis
 */
function findMatchingParen(str, openIdx) {
  let depth = 1;
  for (let i = openIdx + 1; i < str.length; i++) {
    const char = str[i];
    if (char === '(') depth++;
    else if (char === ')') {
      depth--;
      if (depth === 0) return i;
    }
    // Skip string contents
    else if (char === '"' || char === "'" || char === '`') {
      const quote = char;
      i++;
      while (i < str.length && str[i] !== quote) {
        if (str[i] === '\\') i++; // skip escaped char
        i++;
      }
    }
  }
  return -1;
}

/**
 * Split arguments by comma, respecting nested parentheses and brackets
 */
function splitArgs(argsStr) {
  const args = [];
  let current = '';
  let depth = 0;
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < argsStr.length; i++) {
    const char = argsStr[i];

    if (inString) {
      current += char;
      if (char === stringChar && argsStr[i - 1] !== '\\') {
        inString = false;
      }
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      inString = true;
      stringChar = char;
      current += char;
      continue;
    }

    if (char === '(' || char === '[' || char === '{') {
      depth++;
      current += char;
      continue;
    }

    if (char === ')' || char === ']' || char === '}') {
      depth--;
      current += char;
      continue;
    }

    if (char === ',' && depth === 0) {
      args.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  if (current.trim()) {
    args.push(current);
  }

  return args;
}

/**
 * Convert t.pass() to console.log() with balanced parentheses handling
 * Handles template literals like: t.pass(`point (${d.p}) bin ${result}`)
 */
function convertTapePassToLog(content) {
  const methodPattern = /t\d*\.pass\s*\(/g;
  let result = content;
  let match;

  // Find all occurrences and process them from end to start (to preserve indices)
  const matches = [];
  while ((match = methodPattern.exec(content)) !== null) {
    matches.push(match.index);
  }

  // Process from end to start
  for (let i = matches.length - 1; i >= 0; i--) {
    const startIdx = matches[i];
    const openParenIdx = content.indexOf('(', startIdx);

    if (openParenIdx === -1) continue;

    // Find matching closing paren
    const closeParenIdx = findMatchingParen(content, openParenIdx);
    if (closeParenIdx === -1) continue;

    // Extract the message argument
    const message = content.substring(openParenIdx + 1, closeParenIdx).trim();

    // Replace t.pass(...) with console.log(...)
    result = result.substring(0, startIdx) + `console.log(${message})` + result.substring(closeParenIdx + 1);
  }

  return result;
}
