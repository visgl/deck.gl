#!/usr/bin/env node
/**
 * jscodeshift-based tape-to-vitest migration runner.
 *
 * This script reads test files from the master branch and converts them to Vitest syntax
 * using an AST-based jscodeshift transform for more accurate conversions.
 *
 * Usage:
 *   node scripts/codemods/tape-to-vitest/run.cjs [--dry-run] [file-pattern]
 *
 * Examples:
 *   node scripts/codemods/tape-to-vitest/run.cjs                    # Convert all test files
 *   node scripts/codemods/tape-to-vitest/run.cjs --dry-run          # Preview changes
 *   node scripts/codemods/tape-to-vitest/run.cjs layer.spec.ts      # Convert specific file
 */

const {execSync} = require('child_process');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Dynamic import for ESM jscodeshift
let jscodeshift;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const filePattern = args.find(a => !a.startsWith('--'));

const scriptDir = __dirname;
const rootDir = path.join(scriptDir, '..', '..', '..');
const testDir = path.join(rootDir, 'test');

// Files with manual fixes that should NOT be overwritten by the migration script.
const MANUAL_FIX_FILES = [
  // Uses manual call tracking instead of vi.spyOn (browser mode call-through issues)
  'test/modules/core/utils/memoize.spec.ts',
  // Uses toBeCloseTo for floating point DMS coordinate comparisons
  'test/modules/widgets/geocoders.spec.ts'
];

async function loadTransform() {
  // Use ts-node or tsx to load the TypeScript transform
  const transformPath = path.join(scriptDir, 'transform.ts');

  // We'll use jscodeshift's built-in TypeScript support
  jscodeshift = require('jscodeshift');

  // Load the transform module using tsx
  const transform = require('./transform.ts').default;
  return transform;
}

async function main() {
  const transform = await loadTransform();

  // Get list of test files to process
  let files;
  if (filePattern) {
    files = glob.sync(`**/*${filePattern}*`, {cwd: testDir, absolute: true});
  } else {
    // Get all .spec.ts files and also utility files in the modules directory
    const specFiles = glob.sync('**/*.spec.ts', {cwd: testDir, absolute: true});
    const utilFiles = glob.sync('modules/**/*.ts', {cwd: testDir, absolute: true})
      .filter(f => !f.endsWith('.spec.ts'));
    files = [...specFiles, ...utilFiles];
  }

  console.log(`Processing ${files.length} test files${dryRun ? ' (dry run)' : ''}...\n`);
  console.log('Using jscodeshift AST-based transform\n');

  let totalConverted = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const file of files) {
    const relativePath = path.relative(rootDir, file);

    // Skip files with manual fixes
    if (MANUAL_FIX_FILES.includes(relativePath)) {
      console.log(`  Skipping ${relativePath} (has manual fixes)`);
      totalSkipped++;
      continue;
    }

    try {
      // Get the original tape content from master
      let tapeContent;
      try {
        tapeContent = execSync(`git show master:${relativePath}`, {
          encoding: 'utf8',
          maxBuffer: 10 * 1024 * 1024,
          cwd: rootDir
        });
      } catch (e) {
        console.log(`  Skipping ${relativePath} (not in master)`);
        totalSkipped++;
        continue;
      }

      // Check if it's actually a tape file
      const hasTapeImport = tapeContent.includes("from 'tape") || tapeContent.includes('from "tape');
      const hasTapeAssertions = /\bt\d*\.(ok|notOk|equal|equals|deepEqual|is|same|assert)\s*\(/.test(tapeContent);

      if (!hasTapeImport && !hasTapeAssertions) {
        console.log(`  Skipping ${relativePath} (not a tape test)`);
        totalSkipped++;
        continue;
      }

      // Create jscodeshift API
      const j = jscodeshift.withParser('tsx');
      const fileInfo = {path: file, source: tapeContent};
      const api = {
        jscodeshift: j,
        j,
        stats: () => {},
        report: () => {}
      };

      // Run the transform
      const vitestContent = transform(fileInfo, api, {});

      if (!vitestContent) {
        console.log(`  Warning: Transform returned empty for ${relativePath}`);
        totalSkipped++;
        continue;
      }

      if (dryRun) {
        console.log(`Would convert: ${relativePath}`);
      } else {
        fs.writeFileSync(file, vitestContent);
        // Run prettier to fix formatting
        try {
          execSync(`npx prettier --write "${file}"`, {
            encoding: 'utf8',
            stdio: 'pipe',
            cwd: rootDir
          });
        } catch (e) {
          console.log(`  Warning: Prettier failed for ${relativePath}`);
        }
        console.log(`  Converted: ${relativePath}`);
      }
      totalConverted++;
    } catch (e) {
      console.error(`  Error processing ${relativePath}: ${e.message}`);
      totalErrors++;
    }
  }

  console.log(`\n========================================`);
  console.log(`Converted: ${totalConverted}`);
  console.log(`Skipped:   ${totalSkipped}`);
  console.log(`Errors:    ${totalErrors}`);
  console.log(`========================================`);

  if (totalErrors > 0) {
    process.exit(1);
  }
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
