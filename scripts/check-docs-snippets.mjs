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
 * Snippets that use `@deck.gl/react`, not `@deck.gl/react/legacy`, are also checked for patterns
 * that only `/legacy` supports: deck.gl classes used as JSX, function or HTML children of `DeckGL`
 * or a view, a react-map-gl `<Map>` child, `ref.current.deck`, and the `ContextProvider` and `Deck`
 * props. Each finding names the migration guide section that explains the change.
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

/** The migration guide, where each legacy pattern's replacement is explained. */
const MIGRATION_GUIDE = 'docs/developer-guide/react/migrate-from-deckgl-react.md';

/** Whether a snippet uses `@deck.gl/react` rather than `@deck.gl/react/legacy`. */
function usesReactRenderer(sourceFile) {
  const modules = sourceFile.statements
    .filter(ts.isImportDeclaration)
    .map(statement => statement.moduleSpecifier.text);
  const react = modules.filter(
    module => module === '@deck.gl/react' || module.startsWith('@deck.gl/react/')
  );
  return react.length > 0 && !react.includes('@deck.gl/react/legacy');
}

/** Maps each name a snippet imports from a deck.gl module other than `@deck.gl/react` to the module. */
function getDeckClassImports(sourceFile) {
  const names = new Map();
  for (const statement of sourceFile.statements.filter(ts.isImportDeclaration)) {
    const module = statement.moduleSpecifier.text;
    if (!DECK_MODULE.test(module) || module.startsWith('@deck.gl/react')) {
      continue;
    }
    for (const element of statement.importClause?.namedBindings?.elements ?? []) {
      names.set(element.name.text, module);
    }
  }
  return names;
}

/** The tag name of a JSX element, or `''` for a fragment. */
function getTagName(node) {
  const tag = ts.isJsxElement(node) ? node.openingElement.tagName : node.tagName;
  return tag ? tag.getText() : '';
}

/** Whether a JSX tag is the `DeckGL` root or a view, whose children deck.gl renders. */
function isDeckContainer(tagName) {
  return tagName === 'DeckGL' || /View$/.test(tagName);
}

/** Finds the patterns that only `@deck.gl/react/legacy` supports, as `{node, message}` pairs. */
function findLegacyPatterns(sourceFile) {
  const findings = [];
  const deckClasses = getDeckClassImports(sourceFile);
  const visit = node => {
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tagName = getTagName(node);
      const module = deckClasses.get(tagName);
      if (module) {
        findings.push({
          node,
          message: `<${tagName}> is the deck.gl class from ${module}. Use its component from a @deck.gl/react subpath; see "Change the imports".`
        });
      }
      const attributes = ts.isJsxElement(node) ? node.openingElement.attributes : node.attributes;
      for (const attribute of attributes.properties) {
        const name = attribute.name?.getText();
        if (tagName === 'DeckGL' && (name === 'ContextProvider' || name === 'Deck')) {
          findings.push({
            node: attribute,
            message: `The ${name} prop is /legacy only; see "Replace DeckGLRef" and "Remove unsupported children".`
          });
        }
      }
      if (ts.isJsxElement(node) && isDeckContainer(tagName)) {
        for (const child of node.children) {
          if (
            ts.isJsxExpression(child) &&
            child.expression &&
            (ts.isArrowFunction(child.expression) || ts.isFunctionExpression(child.expression))
          ) {
            findings.push({
              node: child,
              message: `A function child of <${tagName}> is /legacy only; see "Remove unsupported children".`
            });
          } else if (ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child)) {
            const childTag = getTagName(child);
            if (/^[a-z]/.test(childTag) && !childTag.startsWith('deck')) {
              findings.push({
                node: child,
                message: `An HTML child (<${childTag}>) of <${tagName}> is /legacy only; see "Remove unsupported children".`
              });
            } else if (/^(Map|StaticMap|ReactMapGL)$/.test(childTag)) {
              findings.push({
                node: child,
                message: `A react-map-gl <${childTag}> child is /legacy only; use a map root, see "Remove unsupported children".`
              });
            }
          }
        }
      }
    }
    if (
      ts.isPropertyAccessExpression(node) &&
      node.name.text === 'deck' &&
      /\.current\??$/.test(node.expression.getText())
    ) {
      findings.push({
        node,
        message: `The root's ref is the Deck instance: replace ${node.getText()} with ${node.expression.getText()}; see "Replace DeckGLRef".`
      });
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return findings;
}

/** Prints one finding as `file:line  code  message`. */
function report(snippet, sourceFile, position, code, message) {
  const {line} = sourceFile.getLineAndCharacterOfPosition(position);
  console.log(
    `${path.relative(ROOT, snippet.markdownFile)}:${snippet.startLine + line}  ${code}  ${message}`
  );
}

let errorCount = 0;
let legacyCount = 0;
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
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n').split('\n')[0];
    report(snippet, sourceFile, diagnostic.start ?? 0, `TS${diagnostic.code}`, message);
    errorCount++;
  }
  if (usesReactRenderer(sourceFile)) {
    for (const {node, message} of findLegacyPatterns(sourceFile)) {
      report(snippet, sourceFile, node.getStart(sourceFile), 'LEGACY', message);
      legacyCount++;
    }
  }
}

const kind = reportAll ? 'errors' : 'import errors';
console.log(
  `\nChecked ${snippets.length} snippets in ${markdownFiles.length} files: ${errorCount} ${kind}, ${legacyCount} /legacy patterns (see ${MIGRATION_GUIDE}).`
);
process.exitCode = errorCount || legacyCount ? 1 : 0;
