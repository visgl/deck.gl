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
  <a href='https://coveralls.io/github/uber/deck.gl?branch=master'>
    <img src='https://img.shields.io/coveralls/uber/deck.gl.svg?style=flat-square' alt='Coverage Status' />
  </a>
</p>

<h1 align="center">deck.gl | <a href="https://uber.github.io/deck.gl">Docs</a></h1>

<h5 align="center">A WebGL overlay suite for React providing a set of highly performant data visualization overlays</h5>

[![docs](http://i.imgur.com/mvfvgf0.jpg)](https://uber.github.io/deck.gl)

Provides tested, highly performant layers for data visualization
use cases, such as scatterplots, choropleths etc in 2 and 3 dimensions.

    npm install --save deck.gl

## Example

```javascript
import DeckGL from 'deck.gl';
import {ArcLayer} from 'deck.gl';

const flights = new ArcLayer({
  id: 'flights',
  data: [] // Some flight points
});

<DeckGL width={1920} height={1080} layers={[flights]} />
```

A very simple usage of deck.gl is showcased in the [hello-world examples](./examples),
using both [webpack2](./examples/hello-world-webpack2) and
[browserify](./examples/hello-world-browserify),
so you can choose which setup you prefer or are more familiar with.

You can also take a look at the [docs website](https://uber.github.io/deck.gl)
or browse directly the [docs folder](./docs).

## Developing

    npm install # or yarn
    npm test
    npm start  # See note below

Note that you will also need to do an npm install in the main example (`examples/layer-browser`)
since the npm start command tries to build and run that example.

    cd examples/layer-browser
    npm install
    cd ../..

Note that `npm start` in the main directory actually runs `examples/main`.
You will need to install dependencies in that example first:

    cd examples/main
    npm install # or yarn
    cd ../..
    npm start


#### Node Version Requirement

Running deck.gl as a dependency in another project (e.g. via `npm i deck.gl`) requires Node `v4` or higher.
Building deck.gl from source has a dependency on Node `v6.4` or higher.
Either upgrade to a supported version, or install something like
[nvm](https://github.com/creationix/nvm) to manage Node versions.

#### Install yarn
On macOS deck.gl uses [yarn](https://www.npmjs.com/package/yarn) to manage packages.
To develop deck.gl, [install yarn](https://yarnpkg.com/en/docs/install) with brew
```
brew update
brew install yarn

```

## Contributing

PRs and bug reports are welcome. Note that you once your PR is
about to be merged, you will be asked to register as a contributor
by filling in a short form.

## Data sources

[SF OpenData](https://data.sfgov.org)

[TLC Trip Record Data](http://www.nyc.gov/html/tlc/html/about/trip_record_data.shtml)

[Mapzen](https://mapzen.com/)
