import {existsSync, readdirSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const websiteDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const buildDirectory = path.join(websiteDirectory, 'build');
const llmsTxtPath = path.join(buildDirectory, 'llms.txt');
const websiteOrigin = 'https://deck.gl';
const websiteBasePathSegments = (process.env.WEBSITE_BASE_URL || '/').split('/').filter(Boolean);

function fail(message) {
  throw new Error(`llms.txt output normalization failed: ${message}`);
}

function findFiles(directory, extension) {
  if (!existsSync(directory)) {
    return [];
  }

  const filePaths = [];
  for (const entry of readdirSync(directory, {withFileTypes: true})) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      filePaths.push(...findFiles(entryPath, extension));
    } else if (entry.isFile() && entryPath.endsWith(extension)) {
      filePaths.push(entryPath);
    }
  }
  return filePaths;
}

function normalizeIndexHierarchy(markdown) {
  const lines = markdown.split('\n');
  const firstSectionIndex = lines.findIndex((line) => line.startsWith('## '));
  if (firstSectionIndex === -1) {
    fail('llms.txt does not contain a section heading');
  }
  if (lines[firstSectionIndex] === '## docs') {
    return markdown;
  }

  let wrapperIndex = firstSectionIndex;
  for (const [segmentIndex, segment] of websiteBasePathSegments.entries()) {
    const expectedHeading = `${'#'.repeat(segmentIndex + 2)} ${segment}`;
    if (lines[wrapperIndex] !== expectedHeading) {
      fail(`expected base-path heading "${expectedHeading}"`);
    }
    lines.splice(wrapperIndex, 1);
    while (lines[wrapperIndex] === '') {
      lines.splice(wrapperIndex, 1);
    }
  }

  const basePathDepth = websiteBasePathSegments.length;
  const firstContentHeadingDepth = basePathDepth + 2;
  const normalizedLines = lines.map((line) => {
    const headingMatch = line.match(/^(#+) (.+)$/);
    if (!headingMatch || headingMatch[1].length < firstContentHeadingDepth) {
      return line;
    }
    return `${headingMatch[1].slice(basePathDepth)} ${headingMatch[2]}`;
  });
  return normalizedLines.join('\n');
}

if (websiteBasePathSegments.length === 0) {
  console.log('No llms.txt base-path normalization needed.');
  process.exit(0);
}
if (!existsSync(llmsTxtPath) || !statSync(llmsTxtPath).isFile()) {
  fail('missing llms.txt');
}

const websiteBasePath = `/${websiteBasePathSegments.join('/')}/`;
const websiteUrl = new URL(websiteBasePath, websiteOrigin);
const duplicatedWebsiteBaseUrl = new URL(websiteBasePath.slice(1), websiteUrl).href;
const markdownPaths = [llmsTxtPath, ...findFiles(buildDirectory, '.md')];
let normalizedFileCount = 0;

for (const markdownPath of markdownPaths) {
  const markdown = readFileSync(markdownPath, 'utf8');
  // Stable plugin 1.2.2 prepends the already-based site URL to base-prefixed links.
  let normalizedMarkdown = markdown.split(duplicatedWebsiteBaseUrl).join(websiteUrl.href);
  if (markdownPath === llmsTxtPath) {
    // The same plugin version exposes each base-path segment as an index category.
    normalizedMarkdown = normalizeIndexHierarchy(normalizedMarkdown);
  }
  if (normalizedMarkdown !== markdown) {
    writeFileSync(markdownPath, normalizedMarkdown);
    normalizedFileCount++;
  }
}

console.log(`Normalized ${normalizedFileCount} LLM documentation files for ${websiteBasePath}.`);
