<p align="right">
  <a href="https://npmjs.org/package/deck.gl">
    <img src="https://img.shields.io/npm/v/deck.gl.svg?style=flat-square" alt="version" />
  </a>
  <a href="https://travis-ci.com/uber/deck.gl">
    <img src="https://api.travis-ci.com/uber/deck.gl.svg?branch=master" alt="build" />
  </a>
  <a href="https://npmjs.org/package/deck.gl">
    <img src="https://img.shields.io/npm/dm/deck.gl.svg?style=flat-square" alt="downloads" />
  </a>
  <a href='https://coveralls.io/github/uber/deck.gl?branch=master'>
    <img src='https://img.shields.io/coveralls/uber/deck.gl.svg?style=flat-square' alt='Coverage Status' />
  </a>
</p>

<h1 align="center">deck.gl | <a href="https://uber.github.io/deck.gl">Website</a></h1>

<h5 align="center"> WebGL2-powered, highly performant large-scale data visualization</h5>

[![docs](http://i.imgur.com/mvfvgf0.jpg)](https://uber.github.io/deck.gl)


## Installation

```
npm install deck.gl
```

## Using deck.gl

deck.gl offers an extensive catalog of pre-packaged visualization "layers", including [ScatterplotLayer](http://deck.gl/#/documentation/deckgl-api-reference/layers/scatterplot-layer), [ArcLayer](http://deck.gl/#/documentation/deckgl-api-reference/layers/arc-layer), [TextLayer](http://deck.gl/#/documentation/deckgl-api-reference/layers/text-layer), [GeoJsonLayer](http://deck.gl/#/documentation/deckgl-api-reference/layers/geojson-layer), etc. The input to a layer is usually an array of JSON objects. Each layer offers a highly-flexible API to customize how the data should be rendered.

Example constructing a deck.gl ScatterplotLayer:

```js
import {ScatterplotLayer} from '@deck.gl/layers';

/**
 * data is an array of object in the shape of:
 * {
 *   "name":"Montgomery St. (MONT)",
 *   "address":"598 Market Street, San Francisco CA 94104",
 *   "entries":"43430",
 *   "exits":"45128",
 *   "coordinates":[-122.401407,37.789256]
 * }
 */
const scatterplotLayer = new ScatterplotLayer({
  id: 'bart-stations',
  data: 'https://github.com/uber-common/deck.gl-data/blob/master/website/bart-stations.json',
  getRadius: d => Math.sqrt(d.entries) / 100,
  getPosition: d => d.coordinates,
  getFillColor: [255, 228, 0],
});
```

## Using deck.gl with React

```js
import DeckGL from 'deck.gl';

<DeckGL
  width="100%"
  height="100%"
  initialViewState={{longitude: -122.4, latitude: 37.78, zoom: 8}}
  controller={true}
  layers={[scatterplotLayer]} />
```

## Using deck.gl with Pure JS

```js
import {Deck} from '@deck.gl/core';

const deck = new Deck({
  width: '100vw',
  height: '100vh',
  initialViewState: {
    longitude: -122.4,
    latitude: 37.78,
    zoom: 8
  },
  controller: true,
  layers: [scatterplotLayer]
});
```

Minimum setups of end-to-end deck.gl usage is also showcased in the [hello-world examples](./examples/get-started), using both [webpack](https://webpack.js.org/) and [browserify](http://browserify.org/), so you can choose which bundler you prefer or are more familiar with.

To learn how to use deck.gl through the many examples that come with the deck.gl repo, please clone the latest **release** branch:

```
git clone -b 7.3-release --single-branch https://github.com/uber/deck.gl.git
```

For the most up-to-date information, see our [API documentations](http://deck.gl/#/documentation)


## Contributing

PRs and bug reports are welcome, and we are actively opening up the deck.gl [roadmap](./dev-docs) to facilitate for external contributors.

Note that once your PR is about to be merged, you will be asked to register as a contributor by filling in a short form.

## Attributions

#### Data sources

Data sources are listed in each example.


#### The deck.gl project is supported by

<a href="https://www.browserstack.com/">
 <img src="https://d98b8t1nnulk5.cloudfront.net/production/images/static/logo.svg" alt="BrowserStack" width="200" />
</a>

