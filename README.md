<p align="right">
  <a href="https://npmjs.org/package/deck.gl">
    <img src="https://img.shields.io/npm/v/deck.gl.svg?style=flat-square" alt="version" />
  </a>
  <a href="https://travis-ci.org/uber/deck.gl">
    <img src="https://img.shields.io/travis/uber/deck.gl/master.svg?style=flat-square" alt="build" />
  </a>
  <a href="https://npmjs.org/package/deck.gl">
    <img src="https://img.shields.io/npm/dm/deck.gl.svg?style=flat-square" alt="downloads" />
  </a>
  <a href="http://starveller.sigsev.io/uber/deck.gl">
    <img src="http://starveller.sigsev.io/api/repos/uber/deck.gl/badge" alt="stars" />
  </a>
</p>

<h1 align="center">deck.gl | <a href="https://uber.github.io/deck.gl">Docs</a></h1>

<h5 align="center">A WebGL overlay suite for React providing a set of highly performant data visualization overlays</h5>

[![docs](http://i.imgur.com/mvfvgf0.jpg)](https://uber.github.io/deck.gl)

    npm install --save deck.gl

Provides tested, highly performant layers for basic data visualization
use cases, scatterplots, choropleths etc in 2 and 3 dimensions.

## Example

    import DeckGL from 'deck.gl/react';
    import {ArcLayer} from 'deck.gl';

    const flights = new ArcLayer({
      id: 'flights',
      data: [] // Some flight points
    });

    <DeckGL width={1920} height={1080} layers={[flights]} />

Take a look at the [docs website](https://uber.github.io/deck.gl) or browse the [docs folder](./docs).

## Developing

    npm install
    npm test
    npm start

Note: **Building** deck.gl (not importing) has a dependency on node
version 0.12 or higher. If you use an older version, you can install
a node version manager like nvm and use a separate shell to install
and build deck.gl.

    npm install -g nvm && nvm install 0.12 && nvm use 0.122

## Contributing

PRs and bug reports are welcome. Note that you once you open a PR your will be asked to
register as a contributor by filling in a small form.

## Data sources

[SF OpenData](https://data.sfgov.org)
