# Introduction
  
<p align="center">
  These docs are for
  &nbsp;
  <a href="https://github.com/visgl/deck.gl/blob/9.0-release/docs/README.md">
    <img src="https://img.shields.io/badge/deck.gl-v9.0-brightgreen.svg?style=flat-square" />
  </a>
  <br />
  Looking for an old version?
  &nbsp;
  <a href="https://github.com/visgl/deck.gl/blob/8.9-release/docs/README.md">
    <img src="https://img.shields.io/badge/deck.gl-v8.x-green.svg?style=flat-square" />
  </a>
  &nbsp;
  <a href="https://github.com/visgl/deck.gl/blob/7.3-release/docs/README.md">
    <img src="https://img.shields.io/badge/deck.gl-v7.x-green.svg?style=flat-square" />
  </a>
  &nbsp;
  <a href="https://github.com/visgl/deck.gl/blob/6.4-release/docs/README.md">
    <img src="https://img.shields.io/badge/deck.gl-v6.x-green.svg?style=flat-square" />
  </a>
</p>

deck.gl is designed to simplify high-performance, WebGPU/WebGL2 based visualization of large data sets. Users can quickly get impressive visual results with minimal effort by composing existing layers, or leverage deck.gl's extensible architecture to address custom needs.

deck.gl maps **data** (typically in the form of arrays of JSON objects or binary data columns) into a stack of visual **layers** - e.g. icons, polygons, texts; and lets the application render these through various **views**: e.g. map, first-person, orthographic.

deck.gl handles a number of challenges out of the box:

* Performant rendering of large data sets
* Interactive event handling such as picking, highlighting and filtering
* Cartographic projections and integration with major basemap providers including Mapbox, Google Maps and Esri ArcGIS
* A catalog of proven, well-tested layers

deck.gl is designed to be highly customizable. All layers come with flexible APIs to allow programmatic control of each aspect of the rendering. All core classes are easily extendable by the users to address custom use cases.

## Community

deck.gl is part of the OpenJS and Linux Foundations, and has a strong community of contributors and users. Please join our [Slack workspace](https://slack-invite.openjsf.org/) for learning and discussions. Our bi-weekly **meetings** and yearly **collaborator summits** are open to everyone and are announced in the slack channel.

## Flavors

deck.gl is packaged in a number of different ways to meet your needs:

| deck.gl Flavor            | Installed via                                                          | Get Started                                                              | Examples                                                                                |
| ------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| **JavaScript/Script Tag** | `<script src="https://unpkg.com/deck.gl@latest/dist.min.js"></script>` | [Get started](./get-started/using-standalone.md#using-the-scripting-api) | [Examples](https://github.com/visgl/deck.gl/tree/master/examples/get-started/scripting) |
| **TypeScript/Pure JS**    | `npm install deck.gl`                                                  | [Get started](./get-started/using-standalone.md)                         | [Examples](https://github.com/visgl/deck.gl/tree/master/examples/get-started/pure-js)   |
| **TypeScript/React**      | `npm install deck.gl`                                                  | [Get started](./get-started/using-with-react.md)                         | [Examples](https://github.com/visgl/deck.gl/tree/master/examples/get-started/react)     |
| **Python**                | `pip install pydeck`                                                   | [Get started](https://pydeck.gl/installation.html)                       | [Examples](https://pydeck.gl/)                                                          |
| **JSON**                  | `npm install @deck.gl/json`                                            |                                                                          |

## Ecosystem

deck.gl is the core framework in the **[vis.gl](http://vis.gl)** framework suite. To prevent the deck.gl code base from becoming an unmaintainable monolith, deck.gl relies on other official vis.gl companion frameworks for important functional areas such as data loading, low-level GPU access, and geospatial math:

| Framework                                                           | Description                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[react-map-gl](https://visgl.github.io/react-map-gl/)**           | A React wrapper around Mapbox GL which works seamlessly with deck.gl. There are two integration modes to choose from depending on which features you need, see [Using With Mapbox](./developer-guide/base-maps/using-with-mapbox.md#react-map-gl) for details. |
| **[react-google-maps](https://visgl.github.io/react-google-maps/)** | A React wrapper around Google Maps which works seamlessly with deck.gl.                                                                                                                                                                                        |
| **[loaders.gl](https://loaders.gl)**                                | Suite of framework-independent loaders for file formats focused on visualization of big geospatial data.                                                                                                                                                       |
| **[luma.gl](https://luma.gl/)**                                     | A general purpose WebGPU/WebGL2 library designed to be interoperable with other WebGPU/WebGL2 libraries. luma.gl can work with WebGL contexts created by other libraries.                                                                                      |
| **[math.gl](https://visgl.github.io/math.gl/)**                     | A 3D + geospatial math library.                                                                                                                                                                                                                                |
### deck.gl-community

A source of "semi-official" extension modules for deck.gl can be found in the [deck.gl-community](https://visgl.github.io/deck.gl-community/) repository, including:
- new layer packs (editable layers, graph layers, ...)
- additional base map integrations
- more React bindings

### Extensions and bindings

Additional "third party" add-on modules to deck.gl can be found on github and npm. Such extension modules can offer valuable functionality to deck.gl applications, but they are not always kept up to date with the latest deck.gl releases. 

| Language                            | Third-Party Binding                                                                      |
| ----------------------------------- | ---------------------------------------------------------------------------------------- |
| **R**                               | [mapdeck](https://symbolixau.github.io/mapdeck/articles/mapdeck.html)                    |
| **C++**                             | [deck.gl-native](https://github.com/UnfoldedInc/deck.gl-native)                          |
| **[Vega](https://vega.github.io/)** | [vega-deck.gl](https://github.com/microsoft/SandDance/tree/master/packages/vega-deck.gl) |
