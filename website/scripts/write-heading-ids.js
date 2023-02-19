/** Write custom heading ids for all files in the docs directory */
const fs = require('fs/promises');
const path = require('path');

const docsDir = path.resolve(__dirname, '../../docs');
const headerTest = /^(#+)\s+(?<headerContent>.*?)\s*(?<customId>\{#[\w\-]+\})?$/;
const apiTest = /^`(?<code>\w[^`]+)`\s*(\(.*?\)|$)/;

test();
main();

async function main() {
  const files = await listFiles(docsDir, '.md');
  for (const f of files) {
    await processFile(f);
  }
}

function test() {
  expect(
    getCustomId(`The line width of each object, in units specified by widthUnits (default pixels). `)?.[2],
    undefined,
    'not header'
  );
  expect(
    getCustomId(`## Learning deck.gl`)?.[2],
    undefined,
    'does not contain code'
  );
  expect(
    getCustomId(`## Changes to \`TileLayer\``)?.[2],
    undefined,
    'is not api'
  );
  expect(
    getCustomId(`## \`pickObjects\``)?.[2],
    '{#pickobjects}',
    'single word api'
  );
  expect(
    getCustomId(`## \`@deck.gl/extensions\``)?.[2],
    undefined,
    'Package name'
  );
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
    getCustomId(`##### \`getWidth\` ([Function](../../developer-guide/using-layers.md#accessors)|Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")`)?.[2],
    '{#getwidth}',
    'with extra flag'
  );
}

function getCustomId(line) {
  const m = line.trim().match(headerTest);
  if (!m) {
    return null;
  }
  const m1 = m.groups.headerContent.match(apiTest);
  if (m1) {
    const code = m1.groups.code.match(/^\w+/);
    const customId = code[0].toLowerCase();
    return [m[1], m[2], `{#${customId}}`];
  }
  return null;
}

async function processFile(path) {
  const context = await fs.readFile(path, {encoding: 'utf-8'});
  let changed = false;
  const lines = context.split('\n').map(line => {
    const customId = getCustomId(line);
    if (customId) {
      changed = true;
      return customId.join(' ');
    }
    return line;
  })
  if (changed) {
    await fs.writeFile(path, lines.join('\n'));
  }
}

async function listFiles(path, extension) {
  const result = [];
  const items = await fs.readdir(path);
  for (const item of items) {
    const itemPath = `${path}/${item}`;
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

function expect(value1, value2, message) {
  console.log(message, value2 || '');
  if (value1 !== value2) {
    throw new Error(`Expect ${value2}, got ${value1}`);
  }
}
