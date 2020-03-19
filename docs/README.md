# Introduction

<p align="center">
  These docs are for
  <a href="https://github.com/uber/deck.gl/blob/8.1-release/docs/README.md">
    <img src="https://img.shields.io/badge/deck.gl-v8.1-brightgreen.svg?style=flat-square" />
  </a>
  Looking for an old version?
  <a href="https://github.com/uber/deck.gl/blob/8.0-release/docs/README.md">
    <img src="https://img.shields.io/badge/deck.gl-v8.0-green.svg?style=flat-square" />
  </a>
  <a href="https://github.com/uber/deck.gl/blob/7.3-release/docs/README.md">
    <img src="https://img.shields.io/badge/deck.gl-v7.3-green.svg?style=flat-square" />
  </a>
  <a href="https://github.com/uber/deck.gl/blob/6.4-release/docs/README.md">
    <img src="https://img.shields.io/badge/deck.gl-v6.4-green.svg?style=flat-square" />
  </a>
</p>


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
- [Full examples](https://github.com/uber/deck.gl/tree/master/examples/get-started/pure-js)

#### React

- [Get started](/docs/get-started/using-with-react.md)
- [Full examples](https://github.com/uber/deck.gl/tree/master/examples/get-started/react)

### Python

```bash
pip install pydeck
```

- [Get started](https://github.com/uber/deck.gl/blob/master/bindings/pydeck/README.md)

### Third-Party Bindings

- [deckgl-typings](https://github.com/danmarshall/deckgl-typings) (Typescript)
- [mapdeck](https://symbolixau.github.io/mapdeck/articles/mapdeck.html) (R)
- [vega-deck.gl](https://github.com/microsoft/SandDance/tree/master/packages/vega-deck.gl) ([Vega](https://vega.github.io/))

## Ecosystem

deck.gl is one of the main frameworks in the [vis.gl](http://vis.gl) framework suite.

deck.gl is developed in parallel with a number of companion modules, including:

* [luma.gl](https://luma.gl/) - A general purpose WebGL library designed to be interoperable both with the raw WebGL API and (as far as possible) with other WebGL libraries. In particular, luma.gl does not claim ownership of the WebGL context, and can work with any supplied context, including contexts created by the application or other WebGL libraries.
* [loaders.gl](https://loaders.gl) - a suite of framework-independent loaders for file formats focused on visualization of big data, including point clouds, 3D geometries, images, geospatial formats as well as tabular data.
* [react-map-gl](https://uber.github.io/react-map-gl/) - A React wrapper around Mapbox GL which works seamlessly with deck.gl.
* [nebula.gl](https://nebula.gl/) - A high-performance feature editing framework for deck.gl.


## Learning deck.gl

How you approach learning deck.gl will depend on your previous knowledge and how you want to use it.

Getting familiar with the various layers and their props, and reading the basic articles in the deck.gl developer guide should of course be one of the first steps.

Exploring the deck.gl examples is a good starting point.

In-depth tutorials for how to develop deck.gl applications are available on the [Vis Academy](http://vis.academy/#/) website.

And our [blog](https://medium.com/vis-gl) contains a lot of additional information that might be helpful.

But where to go after that?


### Learning Reactive UI Programming

deck.gl is designed according to functional UI programming principles, made fashionable by frameworks like React. The key to writing good, performant deck.gl applications and layers lies in knowing how to minimize updates and redundant calculations, understanding concepts like "shallow equality" etc. This is critical when using deck.gl with React, but can still be helpful to understand when using deck.gl in non-React contexts.

There is an impressive amount of information (documentation, blog posts, educational videos, etc.) on the reactive programming paradigm in relation to modern web frameworks such as React, Flux and Redux. Where to start depends mostly on your application architecture choices. Exploring such information will take you beyond what we can cover in the basic deck.gl developer guide article on Updates.


### Understanding WebGL

Knowledge of WebGL is only needed if you want to create custom layers in deck.gl. Note that while trying out a new ambitious rendering approach for a new layer will likely require deeper knowledge, it is often possible to modify or extend existing deck.gl layers (including modifying the shader code) with a surprisingly limited amount of WebGL knowledge.

There are many web resources for learning WebGL. [luma.gl](https://luma.gl/) can be a good start.
