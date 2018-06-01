const express = require('express');
const path = require('path');
const fs = require('fs');

const {LOCAL_BUNDLE} = require('./constants');
const utils = require('./utils');

const app = express();

let pagesByName = {};

app.get('/', (req, resp) => {
  /* Refresh page index */
  const pages = utils.getAllMetadata();
  pagesByName = {};
  pages.forEach(meta => {
    pagesByName[meta.name] = meta;
  });

  resp.send(utils.getIndexPage(pages));
});

app.get('/404', (req, resp) => {
  resp.send('Page not found');
});

app.get('/deckgl.min.js', (req, resp) => {
  const src = fs.readFileSync(LOCAL_BUNDLE, 'utf-8');
  resp.append('Content-Type', 'text/javascript');
  resp.send(src);
});

app.get('/*.html', (req, resp) => {
  const name = path.basename(req.path, '.html');
  if (pagesByName[name]) {
    resp.send(utils.getPage(pagesByName[name]));
  } else {
    resp.redirect('/404');
  }
});

app.use('/images', express.static('./images'));

app.listen(3000);
