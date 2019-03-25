const fs = require('fs');
const path = require('path');
const Mustache = require('mustache');

Mustache.escape = escapeHTML;

const {INPUT_DIR, IMAGE_DIR, MAPBOX_TOKEN, PORT} = require('./constants');

const ARGS = parseArgs();
const CACHE = {};
const analytics = `<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-7157694-83', 'auto');
  ga('send', 'pageview');
</script>`;

let bundleUrl = null;
if (ARGS.version === 'local') {
  bundleUrl = `http://localhost:${PORT}/deckgl.min.js`;
} else if (ARGS.version) {
  bundleUrl = `https://unpkg.com/deck.gl@${ARGS.version}/dist.min.js`;
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

function getIndexPage(pages, opts = {}) {
  if (!CACHE.indexTemplate || opts.noCache) {
    CACHE.indexTemplate = fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf-8');
  }

  return Mustache.render(CACHE.indexTemplate, {
    pages,
    analytics: opts.analytics && analytics
  });
}

function getPage(page, opts = {}) {
  let content = fs.readFileSync(page.src, 'utf-8');
  if (bundleUrl) {
    content = content.replace(/src=".+?\/@?deck\.gl.*?\/dist\.min\.js"/, `src="${bundleUrl}"`);
  }

  if (!CACHE.pageTemplate || opts.noCache) {
    CACHE.pageTemplate = fs.readFileSync(path.resolve(__dirname, './page.html'), 'utf-8');
  }

  return Mustache.render(CACHE.pageTemplate, {
    ...page,
    iframeSrc: `<script>var src = unescape('${escape(
      content.replace('<mapbox-access-token>', MAPBOX_TOKEN)
    )}');</script>`,
    content,
    analytics: opts.analytics && analytics
  });
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
    .replace(/ {2,}/g, $0 => {
      return new Array($0.length).fill('&nbsp;').join('');
    });
}

module.exports = {
  getAllMetadata,
  getIndexPage,
  getPage
};
