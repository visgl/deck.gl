#!/usr/bin/env node
// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/**
 * Checks the imports in the docs' code snippets against the deck.gl source.
 *
 * Every ts, tsx, js or jsx code block under `docs/` that imports a deck.gl package is
 * type-checked with the TypeScript compiler, with each `@deck.gl/*` package and subpath resolved
 * to its source. Snippets are often fragments, so only import errors are reported: a deck.gl
 * module that doesn't exist, or a name that a module doesn't export. Third-party packages that
 * the repository doesn't install are not reported.
 *
 * What's new and the upgrade guide show past APIs on purpose, so they are skipped unless passed
 * as paths. To skip one code block, such as a "before" example, put `<!-- snippet-check: skip -->`
 * on the line before it.
 *
 * Usage: node scripts/check-docs-snippets.mjs [--all] [path ...]
 *   --all   report every TypeScript error in the snippets, not only import errors
 *   path    markdown files or directories to check, `docs` by default
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** TypeScript error codes that mean an import doesn't resolve. */
const IMPORT_ERROR_CODES = new Set([
  1192, // Module has no default export
  2305, // Module has no exported member
  2307, // Cannot find module
  2459, // Module declares the name locally, but it is not exported
  2460, // Module declares the name locally, but it is exported as another name
  2614, // Module has no exported member. Did you mean to use a default import?
  2724 // Module has no exported member. Did you mean another name?
]);

/** Code block languages that are checked, and the file extension each is checked as. */
const LANGUAGE_EXTENSIONS = {
  ts: '.tsx',
  tsx: '.tsx',
  typescript: '.tsx',
  js: '.jsx',
  jsx: '.jsx',
  javascript: '.jsx'
};

/** Pages that document past APIs, skipped unless passed explicitly. */
const HISTORICAL_PAGES = new Set(['docs/whats-new.md', 'docs/upgrade-guide.md']);

/** "Cannot find module", which is reported only for deck.gl modules. */
const CANNOT_FIND_MODULE = 2307;

/** A deck.gl module specifier. */
const DECK_MODULE = /^(@deck\.gl\/|deck\.gl$|deck\.gl\/)/;

/** The comment that skips the code block after it. */
const SKIP_COMMENT = '<!-- snippet-check: skip -->';

/** A code block that imports from a deck.gl package. */
const DECK_IMPORT = /from\s+['"](@deck\.gl\/[\w-]+(\/[\w-]+)*|deck\.gl)['"]/;

const args = process.argv.slice(2);
const reportAll = args.includes('--all');
const inputs = args.filter(arg => !arg.startsWith('--'));

/** Lists the markdown files under the given files and directories. */
function listMarkdownFiles(entries, explicit = true) {
  const files = [];
  for (const entry of entries) {
    const absolute = path.resolve(ROOT, entry);
    if (fs.statSync(absolute).isDirectory()) {
      for (const child of fs.readdirSync(absolute)) {
        files.push(...listMarkdownFiles([path.join(absolute, child)], false));
      }
    } else if (!explicit && HISTORICAL_PAGES.has(path.relative(ROOT, absolute))) {
      continue;
    } else if (absolute.endsWith('.md') || absolute.endsWith('.mdx')) {
      files.push(absolute);
    }
  }
  return files;
}

/** Returns the code blocks of a markdown file that import a deck.gl package. */
function extractSnippets(markdownFile) {
  const lines = fs.readFileSync(markdownFile, 'utf8').split('\n');
  const snippets = [];
  let block = null;
  lines.forEach((line, index) => {
    const fence = line.match(/^\s*```\s*([\w-]*)/);
    if (!fence) {
      block?.lines.push(line);
      return;
    }
    if (block) {
      if (DECK_IMPORT.test(block.lines.join('\n'))) {
        snippets.push(block);
      }
      block = null;
    } else if (
      LANGUAGE_EXTENSIONS[fence[1].toLowerCase()] &&
      lines[index - 1]?.trim() !== SKIP_COMMENT
    ) {
      // `startLine` is the 1-based markdown line of the block's first code line
      block = {
        extension: LANGUAGE_EXTENSIONS[fence[1].toLowerCase()],
        startLine: index + 2,
        lines: []
      };
    }
  });
  return snippets.map((snippet, index) => ({
    ...snippet,
    markdownFile,
    fileName: path.join(
      ROOT,
      '.docs-snippets',
      `${path.relative(ROOT, markdownFile)}.${index}${snippet.extension}`
    ),
    text: snippet.lines.join('\n')
  }));
}

/** Maps every export of each deck.gl module, its root and its subpaths, to its source file. */
function getExportPaths() {
  const paths = {};
  for (const dir of fs.readdirSync(path.join(ROOT, 'modules'))) {
    const manifestPath = path.join(ROOT, 'modules', dir, 'package.json');
    if (!fs.existsSync(manifestPath)) {
      continue;
    }
    const {name, exports} = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    for (const [subpath, target] of Object.entries(exports ?? {})) {
      if (subpath.includes('*') || typeof target !== 'object' || !target.types) {
        continue;
      }
      const source = target.types
        .replace(/^\.\/dist\//, `./modules/${dir}/src/`)
        .replace(/\.d\.ts$/, '');
      paths[`${name}${subpath.slice(1)}`] = [source];
    }
  }
  return paths;
}

/** Compiler options: the repository's, with every deck.gl import resolved to source. */
function getCompilerOptions() {
  const configFile = ts.readConfigFile(path.join(ROOT, 'tsconfig.json'), ts.sys.readFile);
  const {options} = ts.parseJsonConfigFileContent(configFile.config, ts.sys, ROOT);
  return {
    ...options,
    paths: {...getExportPaths(), ...options.paths},
    jsx: ts.JsxEmit.ReactJSX,
    allowJs: true,
    checkJs: true,
    noEmit: true,
    skipLibCheck: true,
    plugins: []
  };
}

const markdownFiles = listMarkdownFiles(inputs.length ? inputs : ['docs']);
const snippets = markdownFiles.flatMap(extractSnippets);
const snippetsByFile = new Map(snippets.map(snippet => [snippet.fileName, snippet]));

const options = getCompilerOptions();
const host = ts.createCompilerHost(options);
const readFile = host.readFile.bind(host);
const fileExists = host.fileExists.bind(host);
const getSourceFile = host.getSourceFile.bind(host);
host.readFile = fileName => snippetsByFile.get(fileName)?.text ?? readFile(fileName);
host.fileExists = fileName => snippetsByFile.has(fileName) || fileExists(fileName);
host.getSourceFile = (fileName, languageVersion, ...rest) => {
  const snippet = snippetsByFile.get(fileName);
  return snippet
    ? ts.createSourceFile(fileName, snippet.text, languageVersion, true)
    : getSourceFile(fileName, languageVersion, ...rest);
};

/** Whether a diagnostic is an import error in a deck.gl module or a missing export. */
function isImportError(diagnostic) {
  if (!IMPORT_ERROR_CODES.has(diagnostic.code)) {
    return false;
  }
  if (diagnostic.code !== CANNOT_FIND_MODULE) {
    return true;
  }
  const specifier =
    ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n').match(/'([^']+)'/)?.[1] ?? '';
  return DECK_MODULE.test(specifier);
}

const program = ts.createProgram([...snippetsByFile.keys()], options, host);

let errorCount = 0;
for (const snippet of snippets) {
  const sourceFile = program.getSourceFile(snippet.fileName);
  const diagnostics = [
    ...program.getSyntacticDiagnostics(sourceFile),
    ...program.getSemanticDiagnostics(sourceFile)
  ];
  for (const diagnostic of diagnostics) {
    if (!reportAll && !isImportError(diagnostic)) {
      continue;
    }
    const {line} = sourceFile.getLineAndCharacterOfPosition(diagnostic.start ?? 0);
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n').split('\n')[0];
    console.log(
      `${path.relative(ROOT, snippet.markdownFile)}:${snippet.startLine + line}  TS${diagnostic.code}  ${message}`
    );
    errorCount++;
  }
}

const kind = reportAll ? 'errors' : 'import errors';
console.log(
  `\nChecked ${snippets.length} snippets in ${markdownFiles.length} files: ${errorCount} ${kind}.`
);
process.exitCode = errorCount ? 1 : 0;
