const express = require('express');
const path = require('path');
const fs = require('fs');

const {LOCAL_BUNDLE} = require('./constants');
const utils = require('./utils');

const app = express();

let pagesByName = {};

app.use('/images', express.static('./images'));

app.get('/', (req, resp) => {
  /* Refresh page index */
  const pages = utils.getAllMetadata();
  pagesByName = {};
  pages.forEach(meta => {
    pagesByName[meta.name] = meta;
  });

  resp.send(utils.getIndexPage(pages, {noCache: true}));
});

app.get('/404', (req, resp) => {
  resp.send('Page not found');
});

app.get('/deckgl.min.js', (req, resp) => {
  const src = fs.readFileSync(LOCAL_BUNDLE, 'utf-8');
  resp.append('Content-Type', 'text/javascript');
  resp.send(src);
});

app.get('/*', (req, resp) => {
  const name = path.basename(req.path, '.html');
  const page = pagesByName[name] && utils.getPage(pagesByName[name], {noCache: true});

  if (page) {
    resp.send(page);
  } else {
    resp.redirect('/404');
  }
});

app.listen(3000);
