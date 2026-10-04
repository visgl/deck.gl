import {existsSync, readdirSync, readFileSync, statSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const websiteDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const buildDirectory = path.join(websiteDirectory, 'build');
const llmsTxtPath = path.join(buildDirectory, 'llms.txt');
const llmsFullTxtPath = path.join(buildDirectory, 'llms-full.txt');
const websiteOrigin = 'https://deck.gl';
const websiteBasePath = normalizeWebsiteBasePath(process.env.WEBSITE_BASE_URL || '/');
const websiteUrl = new URL(websiteBasePath, websiteOrigin);
const duplicatedWebsiteBaseUrl =
  websiteBasePath === '/' ? null : new URL(websiteBasePath.slice(1), websiteUrl).href;

function normalizeWebsiteBasePath(basePath) {
  const pathSegments = basePath.split('/').filter(Boolean);
  return pathSegments.length === 0 ? '/' : `/${pathSegments.join('/')}/`;
}

function stripWebsiteBasePath(pathname) {
  if (websiteBasePath === '/' || !pathname.startsWith(websiteBasePath)) {
    return pathname;
  }
  return `/${pathname.slice(websiteBasePath.length)}`;
}

function fail(message) {
  throw new Error(`llms.txt output check failed: ${message}`);
}

function requireFile(relativePath) {
  const filePath = path.join(buildDirectory, relativePath);
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    fail(`missing ${relativePath}`);
  }
  return filePath;
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

function extractMarkdownLinks(markdown) {
  const links = [];
  const markdownLinkPattern = /!?\[[^\]]*\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g;
  for (const match of markdown.matchAll(markdownLinkPattern)) {
    links.push(match[1].replace(/^<|>$/g, ''));
  }
  return links;
}

function resolveGeneratedMarkdownLink(sourcePath, link) {
  if (link.startsWith('#') || link.startsWith('mailto:')) {
    return null;
  }

  let pathname;
  try {
    const url = new URL(link);
    if (url.origin !== websiteUrl.origin) {
      return null;
    }
    pathname = decodeURIComponent(url.pathname);
  } catch {
    const linkWithoutFragment = link.split('#', 1)[0].split('?', 1)[0];
    if (!linkWithoutFragment.endsWith('.md')) {
      return null;
    }
    if (linkWithoutFragment.startsWith('/')) {
      pathname = decodeURIComponent(linkWithoutFragment);
    } else {
      return path.resolve(path.dirname(sourcePath), decodeURIComponent(linkWithoutFragment));
    }
  }

  if (!pathname.endsWith('.md')) {
    return null;
  }
  pathname = stripWebsiteBasePath(pathname);
  if (path.isAbsolute(pathname) && pathname.startsWith(buildDirectory)) {
    return pathname;
  }
  return path.join(buildDirectory, pathname.replace(/^\/+/, ''));
}

if (!existsSync(llmsTxtPath)) {
  fail('missing llms.txt');
}
if (existsSync(llmsFullTxtPath)) {
  fail('llms-full.txt must not be generated');
}

const llmsTxt = readFileSync(llmsTxtPath, 'utf8');
if (!llmsTxt.startsWith('# deck.gl\n')) {
  fail('llms.txt has an unexpected title');
}
const firstSectionHeading = llmsTxt.match(/^## .+$/m)?.[0];
if (firstSectionHeading !== '## docs') {
  fail(`llms.txt has an unexpected first section: ${firstSectionHeading || 'none'}`);
}
if (llmsTxt.includes('/docs/legacy/')) {
  fail('llms.txt contains a legacy guide');
}
if (llmsTxt.includes('/examples/')) {
  fail('llms.txt contains a standalone example page');
}

const requiredIndexLinks = [
  'docs.md',
  'docs/get-started/getting-started.md',
  'docs/whats-new.md',
  'docs/upgrade-guide.md',
  'docs/developer-guide/base-maps/using-with-maplibre.md',
  'docs/api-reference/layers/scatterplot-layer.md',
  'docs/api-reference/json/overview.md'
].map((relativePath) => new URL(relativePath, websiteUrl).href);
for (const link of requiredIndexLinks) {
  if (!llmsTxt.includes(link)) {
    fail(`llms.txt is missing ${link}`);
  }
}

const gettingStartedPath = requireFile('docs/get-started/getting-started.md');
requireFile('docs.md');
requireFile('docs/whats-new.md');
requireFile('docs/upgrade-guide.md');
requireFile('docs/developer-guide/base-maps/using-with-maplibre.md');
requireFile('docs/api-reference/layers/scatterplot-layer.md');
requireFile('docs/api-reference/json/overview.md');


const markdownFiles = findFiles(buildDirectory, '.md');
if (markdownFiles.length < 100) {
  fail(`only ${markdownFiles.length} documentation Markdown files were generated`);
}

const gettingStarted = readFileSync(gettingStartedPath, 'utf8');
if (gettingStarted.trim().length < 80) {
  fail('rendered Getting Started Markdown has empty editorial content');
}
if (/<(?:Tabs|TabItem|Link)\b/.test(gettingStarted)) {
  fail('rendered Getting Started Markdown contains unprocessed MDX components');
}


const brokenLinks = [];
for (const markdownPath of [llmsTxtPath, ...markdownFiles]) {
  const markdown = readFileSync(markdownPath, 'utf8');
  const relativeMarkdownPath = path.relative(buildDirectory, markdownPath);
  if (markdown.trim().length < 40) {
    fail(`${relativeMarkdownPath} has empty extracted content`);
  }
  if (duplicatedWebsiteBaseUrl && markdown.includes(duplicatedWebsiteBaseUrl)) {
    fail(`${relativeMarkdownPath} contains a duplicated website base path`);
  }

  for (const link of extractMarkdownLinks(markdown)) {
    const targetPath = resolveGeneratedMarkdownLink(markdownPath, link);
    if (targetPath && !existsSync(targetPath)) {
      brokenLinks.push(
        `${path.relative(buildDirectory, markdownPath)} -> ${path.relative(
          buildDirectory,
          targetPath
        )}`
      );
    }
  }
}

if (brokenLinks.length > 0) {
  fail(`broken Markdown links:\n${brokenLinks.slice(0, 20).join('\n')}`);
}

console.log(`Validated llms.txt and ${markdownFiles.length} raw documentation pages.`);
