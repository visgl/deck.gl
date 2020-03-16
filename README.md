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


deck.gl is designed to simplify high-performance, WebGL-based visualization of large data sets. Users can quickly get impressive visual results with minimal effort by composing existing layers, or leverage deck.gl's extensible architecture to address custom needs.

deck.gl maps **data** (usually an array of JSON objects) into a stack of visual **layers** - e.g. icons, polygons, texts; and look at them with **views**: e.g. map, first-person, orthographic.

deck.gl handles a number of challenges out of the box:

* Performant rendering and updating of large data sets
* Interactive event handling such as picking, highlighting and filtering
* Cartographic projections and integration with major basemap providers
* A catalog of proven, well-tested layers

Deck.gl is designed to be highly customizable. All layers come with flexible APIs to allow programmatic control of each aspect of the rendering. All core classes such are easily extendable by the users to address custom use cases.

## Flavors

### Script Tag

```html
<script src="https://unpkg.com/deck.gl@latest/dist.min.js"></script>
```

- [Get started](/docs/get-started/using-standalone.md#using-the-scripting-api)
- [Full examples](https://github.com/uber/deck.gl/tree/master/examples/get-started/scripting)

### NPM Module

```bash
npm install deck.gl
```

#### Pure JS

- [Get started](/docs/get-started/using-standalone.md)
- [Full examples](/examples/get-started/pure-js)

#### React

- [Get started](/docs/get-started/using-with-react.md)
- [Full examples](/examples/get-started/react)

### Python

```bash
pip install pydeck
```

- [Get started](/bindings/pydeck/README.md)

### Third-Party Bindings

- [deckgl-typings](https://github.com/danmarshall/deckgl-typings) (Typescript)
- [mapdeck](https://symbolixau.github.io/mapdeck/articles/mapdeck.html) (R)
- [vega-deck.gl](https://github.com/microsoft/SandDance/tree/master/packages/vega-deck.gl) ([Vega](https://vega.github.io/))


## Learning Resources

* [API documentation](https://deck.gl/#/documentation) for the latest release
* [Website demos](https://deck.gl/#/examples) with links to source
* [Interactive playground](https://deck.gl/playground)
* [deck.gl Codepen demos](https://codepen.io/vis-gl/)
* [deck.gl Observable demos](https://beta.observablehq.com/@pessimistress)
* [vis.gl Medium blog](https://medium.com/vis-gl) 
* [deck.gl Slack workspace](https://join.slack.com/t/deckgl/shared_invite/zt-7oeoqie8-NQqzSp5SLTFMDeNSPxi7eg)

## Contributing

Pull requests and bug reports are welcome, and all of deck.gl's roadmaps and feature planning is done openly on GitHub. Read the [developement guidelines](/dev-docs) to learn about our dev process.

Note that once your PR is about to be merged, you will be asked to register as a contributor by filling in a short form.

## Attributions

#### Data sources

Data sources are listed in each example.


#### The deck.gl project is supported by

<a href="https://www.browserstack.com/">
 <img src="https://d98b8t1nnulk5.cloudfront.net/production/images/static/logo.svg" alt="BrowserStack" width="200" />
</a>

