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

<h5 align="center">A suite of WebGL2-powered data visualization layers</h5>

[![docs](http://i.imgur.com/mvfvgf0.jpg)](https://uber.github.io/deck.gl)

Provides tested, highly performant layers for data visualization, such as scatterplots, arcs, geometries defined in GeoJSON, etc.

deck.gl has extensive documentation, please refer to the [docs website](https://uber.github.io/deck.gl) or browse it directly in the github [docs folder](./docs).


## Using deck.gl

deck.gl can be used through its standard JavaScript API (available both as installable npm modules as well as a "script" file for use in scripting setups). However, if you are using React you will likely want to use the provided React integration. Again, consult the extensive documentation for more details on how to access what you need.


## Examples

To get a quick feel for deck.gl applicaiton source code might look like, say the application has some data representing flights with start and end positions for each item. If it wanted to display this data as a set of arcs it would simply import and render a deck.gl `ArcLayer`:

```javascript
import DeckGL, {ArcLayer} from 'deck.gl';

const flights = new ArcLayer({
  data: [] // Some flight points,
  ...
});

<DeckGL width={1920} height={1080} layers={[flights]} />
```

Simple usage of deck.gl is also showcased in the [hello-world examples](./examples/get-started), using both [webpack2](./examples/get-started/react-webpack-2) and [browserify](./examples/get-started/react-browserify), so you can choose which bundler you prefer or are more familiar with.

To learn how to use deck.gl through the many examples that coming with the deck.gl repo, please clone the latest **release** branch. `git clone -b 5.3-release --single-branch https://github.com/uber/deck.gl.git`

For the most up-to-date information, see our [docs](http://uber.github.io/deck.gl/#/docs/getting-started/installation?section=running-the-examples)


## Contributing

PRs and bug reports are welcome, and we are actively opening up the deck.gl roadmap to facilitate for external contributors.

Note that you once your PR is about to be merged, you will be asked to register as a contributor by filling in a short form.


## Data sources

Data sources are listed in each example.
