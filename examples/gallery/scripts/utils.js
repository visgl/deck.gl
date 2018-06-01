const fs = require('fs');
const path = require('path');

const {INPUT_DIR, IMAGE_DIR, MAPBOX_TOKEN, PORT} = require('./constants');

const ARGS = parseArgs();

let bundleUrl = null;
if (ARGS.version === 'local') {
  bundleUrl = `http://localhost:${PORT}/deckgl.min.js`;
} else if (ARGS.version) {
  bundleUrl = `https://unpkg.com/deck.gl@${ARGS.version}/deckgl.min.js`;
}

function getAllMetadata() {
  return fs
    .readdirSync(INPUT_DIR)
    .filter(filename => path.extname(filename) === '.html')
    .map(getPageMetadata);
}

function getPageMetadata(filename) {
  const name = path.basename(filename, '.html');
  const content = fs.readFileSync(path.join(INPUT_DIR, filename), 'utf-8');
  const title = content.match(/<title>(.*)<\/title>/);

  let image = path.join(IMAGE_DIR, `${name}.png`);
  if (!fileExists(image)) {
    image = path.join(IMAGE_DIR, `${name}.jpg`);
  }

  return {
    name,
    src: `src/${filename}`,
    image,
    title: title ? title[1] : name
  };
}

function getIndexPage(pages) {
  const links = pages.map(page => {
    return `<a href="${page.name}.html">
      <div class="thumb" style="background-image:url(${page.image})">
        <div class="title">${page.title}</div>
      </div>
    </a>`;
  });

  return `<html>
    <head>
      <title>deck.gl Gallery</title>
      <link rel="stylesheet" id="font-link" href="https://d1a3f4spazzrp4.cloudfront.net/uber-fonts/3.1.0/refresh.css">
      <style>
        body {font-family: ff-clan-web-pro, "Helvetica Neue", Helvetica, sans-serif !important;}
        * {box-sizing: border-box;}
        #container {width: 100%; max-width: 1280px; padding: 40px 12px; margin: auto;}
        a {display: inline-block; width: 30%; height: 30%; padding: 12px; box-shadow: 0 0 0 rgba(0,0,0,0.3); transition: box-shadow 0.3s;}
        a:hover {box-shadow: 0 0 4px rgba(0,0,0,0.3);}
        .thumb {width: 100%; height: 100%; background-size: cover; background-position: center; position: relative;}
        .title {font-size: 12px; text-decoration: none; color: #000; font-weight: 600; background: #fff; position: absolute; bottom: 0; width: 100%; padding: 8px 0 4px;}
        @media screen and (max-width: 768px) {
          a {width: 100%; height: 60%;}
        }
      </style>
    </head>
    <body>
      <div id="container">${links.join('\n')}</div>
    </body>
  </html>`;
}

function getPage(page, opts) {
  let content = fs.readFileSync(page.src, 'utf-8');
  if (bundleUrl) {
    content = content.replace(/src="[^"]+\/deckgl\.min\.js"/, `src="${bundleUrl}"`);
  }

  const iframeSrc = `data:text/html;charset=utf-8,${encodeURI(
    content.replace('<mapbox-access-token>', MAPBOX_TOKEN)
  )}`;

  return `<html>
    <head>
      <script src="https://cdn.rawgit.com/google/code-prettify/master/loader/run_prettify.js"></script>
      <link rel="stylesheet" id="font-link" href="https://d1a3f4spazzrp4.cloudfront.net/uber-fonts/3.1.0/refresh.css">
      <style>
        body {font-family: ff-clan-web-pro, "Helvetica Neue", Helvetica, sans-serif !important;}
        #container {width: 100%; max-width: 960px; padding: 40px 12px; margin: auto;}
        #source {margin: 12px 0; border: solid 1px #ccc; padding: 24px}
      </style>
    </head>
    <body>
      <div id="container">
        <h1>${page.title}</h1>
        <h2>Demo</h2>
        <iframe width="100%" height="450" frameborder="0" src="${iframeSrc}" ></iframe>
        <h2>Source</h2>
        <div id="source">
          <code class="prettyprint">${escapeHTML(content)}</code>
        </div>
      </div>
    </body>
  </html>`;
}

function parseArgs() {
  const args = process.argv.slice(2); // eslint-disable-line
  const argMap = {};

  for (let i = 0; i < args.length; i++) {
    const match = args[i].match(/--(\w+)=(.*)/);
    if (match) {
      argMap[match[1]] = match[2];
    }
  }
  return argMap;
}

function fileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
}

function escapeHTML(content) {
  return content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/[\n\r]/g, '<br/>')
    .replace(/ /g, '&nbsp;');
}

module.exports = {
  getAllMetadata,
  getIndexPage,
  getPage
};
