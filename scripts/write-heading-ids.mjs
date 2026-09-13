/**
 * This script adds custom heading ids to all files in the docs directory.
 * The headings in our API reference may have format such as

    + ### `opacity` (Number, optional)
    + ### `opacity?: number`
    + ### `getPosition` ([Function](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")
    + ### `needsRedraw(options?: {clearRedrawFlags?: boolean}): string | false`

 * The default generated hash id by Docusaurus will be something like:

    + #-opacity-number-optional
    + #-opacity-number-
    + #-getposition-functiondeveloper-guideusing-layersmdaccessors-optional-transition-enabledhttpsimgshieldsiobadgetransition-enabled-greensvgstyleflat-square
    + #-needsredraw-options-clearredrawflags-boolean-string-false-

 * They are long, difficult to read, subject to how the documentation is written, and when the call signature changes.
 * This script appends a custom id tag to the end of such headings, so that their hash ids will look like:

    + #opacity
    + #opacity
    + #getposition
    + #needsredraw

 */
import {promises as fs} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const docsDirectory = path.resolve(dirname, '../docs');
/** Should match if the line is a header */
const headerTest = /^(#+)\s+(?<headerContent>.*?)\s*(?<customId>\{#[\w\-]+\})?$/;
/** Should match if the header describes an API */
const apiTest = /^`((?<code>\w+)[^`]*)`\s*(\(.*?\)|$)/;

test();
await main();

/** Test that getCustomId handles different formats correctly */
function test() {
  expect(
    getCustomId(
      `The line width of each object, in units specified by widthUnits (default pixels). `
    )?.[2],
    undefined,
    'not header'
  );
  expect(getCustomId(`## Learning deck.gl`)?.[2], undefined, 'does not contain code');
  expect(getCustomId(`## Changes to \`TileLayer\``)?.[2], undefined, 'is not api');
  expect(getCustomId(`## \`pickObjects\``)?.[2], '{#pickobjects}', 'single word api');
  expect(getCustomId(`## \`@deck.gl/extensions\``)?.[2], undefined, 'Package name');
  expect(
    getCustomId(`## \`strokeOpacity\` (Number)`)?.[2],
    '{#strokeopacity}',
    'with type annotation 1'
  );
  expect(
    getCustomId(`## \`backgroundPadding:number[]\``)?.[2],
    '{#backgroundpadding}',
    'with type annotation 2'
  );
  expect(
    getCustomId(`## \`onBeforeRender(gl: WebGLRenderingContext)\``)?.[2],
    '{#onbeforerender}',
    'with call signature'
  );
  expect(
    getCustomId(
      `##### \`getWidth\` ([Function](../../developer-guide/using-layers.md#accessors)|Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")`
    )?.[2],
    '{#getwidth}',
    'with extra flag'
  );
  console.log('All tests pass!\n');
}

/** Traverse all files in the docs directory, append custom ids if necessary */
async function main() {
  const files = await listFiles(docsDirectory, '.md');
  for (const file of files) {
    await processFile(file);
  }
}

/** Parse a single line of text in a .md file.
 * @returns new content in 3 parts if custom id is needed, null otherwise.
 */
function getCustomId(line) {
  const match = line.trim().match(headerTest);
  if (!match) {
    return null;
  }
  const apiMatch = match.groups.headerContent.match(apiTest);
  if (!apiMatch) {
    return null;
  }
  const customId = apiMatch.groups.code.toLowerCase();
  return [match[1], match[2], `{#${customId}}`];
}

/** Process a md file. Rewrites the file content if custom ids are needed. */
async function processFile(filePath) {
  const context = await fs.readFile(filePath, {encoding: 'utf-8'});
  let changed = false;
  const lines = context.split('\n').map(line => {
    const customId = getCustomId(line);
    if (customId) {
      const updatedLine = customId.join(' ');
      if (updatedLine !== line) {
        changed = true;
        return updatedLine;
      }
    }
    return line;
  });
  if (changed) {
    console.log(filePath);
    await fs.writeFile(filePath, lines.join('\n'));
  }
}

/** Recursively get all files within the given directory. */
async function listFiles(directoryPath, extension) {
  const result = [];
  const items = await fs.readdir(directoryPath);
  for (const item of items) {
    const itemPath = `${directoryPath}/${item}`;
    const info = await fs.lstat(itemPath);
    if (item.endsWith(extension) && info.isFile()) {
      result.push(itemPath);
    } else if (info.isDirectory()) {
      const files = await listFiles(itemPath, extension);
      result.push(...files);
    }
  }
  return result;
}

/* Test utils */

function expect(value1, value2, message) {
  if (value1 === value2) {
    console.log('Ok', message, value2 || '');
  } else {
    console.log('Not ok', message);
    throw new Error(`Expect ${value2}, got ${value1}`);
  }
}
