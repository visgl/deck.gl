const utils = require('./utils');
const path = require('path');
const fs = require('fs');

const OUTPUT_DIR = 'dist';
const pages = utils.getAllMetadata();

fs.writeFileSync(
  path.resolve(OUTPUT_DIR, 'index.html'),
  utils.getIndexPage(pages, {analytics: true})
);

pages.forEach(page => {
  fs.writeFileSync(
    path.resolve(OUTPUT_DIR, `${page.name}.html`),
    utils.getPage(page, {analytics: true})
  );
});
