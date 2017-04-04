# deck.gl v4.0

Release date: March 31, 2017

## Highlights

- **New Geospatial Layers** GeoJsonLayer, PathLayer, PolygonLayer, IconLayer,
  GridCellLayer, HexagonCellLayer, PointCloudLayer.
- **New Aggregating Layers** GridLayer and HexagonLayer now join the ScreenGridLayer
  in a growing family of layers that automatically "bin" your point data, in this
  case into grid cells or hexagons.
- **New Examples** deck.gl now provides multiple stand-alone examples, with minimal
  configuration files (`package.json`, `webpack.config.js` etc) intended to make it
  easy to just copy an example folder and get an app up and running in minutes.
- **Unified 64-bit Layers** - 64-bit Layers are now unified with 32-bit layers, controlled via a new `fp64` prop.
- **Library Size Reduction** - A number of npm package dependencies have been
  trimmed from deck.gl, and the distribution has initial support for "tree-shaking"
  bundlers like webpack2 and rollup.
- **Performance** A number of improvements across the core library and layers
   improves rendering and picking performance.
- **Model Matrix Support** - Model matrix support for the `METER_OFFSET` projection mode
  enables arbitrary coordinate transforms (translations, rotations, scaling etc)
  to be applied on individual layer enabling scene graph like layer composition and animation.
- **Documentation** Improved and reorganized in response to user feedback.
- **Experimental Features** Experimental support for non-Mercator projections and
  rendering effects (e.g. Reflections)

## New Layers

### GeoJsonLayer

A layer that parses and renders GeoJson. Supports all GeoJson primitives
(polygons, lines and points).
The GeoJsonLayer is an example of a composite layer that instantiates other layers
(in this case `PathLayer`, `PolygonLayer` and `ScatterplotLayer`) to do the actual
rendering. This layer replaces the now deprecated family of `ChoroplethLayer`s.

### PathLayer

Takes a sequence of coordinates and renders them as a thick line with
mitered or rounded end caps.

### PolygonLayer

Each object in data is expected to provide a "closed" sequence of coordinates
and renders them as a polygon, optionally extruded or in wireframe mode.
Supports polygons with holes.

### IconLayer

Allows the user to provide a texture atlas and a JSON configuration specifying
where icons are located in the atlas.

### GridLayer

A layer that draws rectangular, optionally elevated cells. A typical grid based
heatmap layer. Differs from the `ScreenGridLayer` in that the cells are in world
coordinates and pre aggregated.

### HexagonLayer

A layer that draws hexagonal, optionally elevated cells.

### Point Cloud Layer

Draws a LiDAR point cloud. Supports point position/normal/color.

## Improvements to all Layers

### Support for Per-Layer Model Matrix

Each layer now supports a `modelMatrix` property that can be used to
specify a local coordinate system for the data in that layer:

* Model matrices can dramatically simplify working with data in different
  coordinate systems, as the data does not need to be pre-transformed into
  a common coordinate system.

* Model matrices also enable interesting layer animation and composition
  possibilities as individual layers can be scaled, rotated, translated etc
  with very low computational cost (i.e. without modifying the data).

### UpdateTriggers now accept Accessor Names

`updateTriggers` now accept Accessor Names.

The `updateTriggers` mechanism in deck.gl v3 required the user to know the
name of the vertex attribute controlled by an accessor. It is now possible
to supply names of `accessors`.

### More intuitive mouse events

* `onHover` is now only fired on entering/exiting an object instead of on mouse move.
* `onClick` is now only fired on the picked layer instead of all pickable layers.

## New Features for Layer Subclassing

### Overridable Shaders

All layers now have a `getShaders` method that can
be overriden by subclasses, enables reuse of all layer code while just
replacing one or both shaders, often dramatically reducing the amount of
code needed to add a small feature or change to en existing layers.

## New Features for Layer Writers

### `defaultProps`

Layers are now encouraged to define a `defaultProps`
static member listing their props and default values, rather than programmatically
declaring the props in constructor parameters etc. Using `defaultProps` means
that many layer classes no longer need a constructor.

### AttributeManager now accepts new `accessor` field

Can be a string or a an array of strings. Will be used to match
`updateTriggers` accessor names with instance attributes.

### `getPickingInfo()`

This method replaces the old `pick()` method and is expected to return an info
object. Layers can block the execution of callback functions by returning `null`.

## Performance

A number of performance improvements and fixes have been gradually introduced
since deck.gl v3.0 was launched. While many are not new in v4.0, cumulatively
they enable noticeably better framerates and a lighter footprint when big data
sets are loaded, compared to the initial v3.0.0 version.

The `AttributeManager` class now supports default logging of timings for attribute
updates. This logging can be activated by simply setting `deck.log.priority=2`
in the console (levels 1 and 2 provide different amounts of detail).
This can be very helpful in verifying that your application is not triggering
unnecessary attribute updates.

In addition, the new function `AttributeManager.setDefaultLogFunctions` allows
the app to install its own custom logging functions to take even more control
over logging of attribute updates.

## Library Improvements

JavaScript build tooling continues to evolve and efforts have
been made to ensure deck.gl supports several popular new tooling setups:

* **Dependency Reduction** The number of npm dependencies (both in `deck.gl`,
  `luma.gl` and `react-map-gl`) have been reduced considerably, meaning that
  installing deck.gl and related modules will bring in less additional
  JavaScript code into your app, and your app will build and run faster.
* **Tree-shaking support**: deck.gl and related libraries now publish a "module"
  entry point in package.json which points to a parallel distribution (`deck.gl/dist-es6`)
  that preserves the `import` and `export` statements. This should allow tree
  shaking bundlers such as webpack 2 and rollup to further reduce bundle size.
* **Pure ES6 source code**: With few exceptions (e.g some JSX usage in examples),
  the source code of deck.gl and related modules are now all restricted to
  conformant ES6 (i.e. no ES2016 or ES2017, flow or similar syntax is used).
  This means that the source code can run directly (ie. without transpilation)
  in Node.js and modern browsers.
  You could potentially import code directly from `deck.gl/src` to experiment with
  this.
* **Buble support** in examples. [Buble](https://buble.surge.sh/guide/) is a nice
  alternative to babel if you have a simple app and don't need all the power of babel.
  Many of the examples now use buble for faster and smaller builds.

## Examples

Code examples have been improved in several ways:
* **Multiple Examples** deck.gl now provides multiple different examples in an
  [examples folder](https://github.com/uber/deck.gl/tree/4.0-release/examples),
  showing various interesting uses of deck.gl.
* **Stand Alone Examples** Examples are now stand alone, each with its own
  minimal `package.json` and configuration files, enabling them to be easily
  copied and modified.
* **Hello World Examples** Minimal examples for building with webpack 2
  and browserify (previously called "exhibits") are still provided,
  and have been further simplified.
* **Layer Browser** The main `layer-browser` example has been expanded
  into a full "layer and property browser" allowing for easy testing of layers.

## Deprecations

The various Choropleth layers have been deprecated since deck.gl has new and
better layers (`GeoJsonLayer`, `PathLayer`, `PolygonLayer`) that fill the same
roles. The choropleth layers are still available but will not be maintained
beyond critical bug fixes and will likely be removed in the next major version
of deck.gl.

A careful API audit has also been done to align property names between old and
new layers.
While this will makes the layers more consistent and the combined API easier
to learn and work with, it does mean that some properties have been renamed,
with the old name being deprecated, and in some very few cases,
default values have changed.

For more information on deprecations and how to update your code in response
to these changes, please consult the deck.gl [Upgrade Guide](/docs/get-started/upgrade-guide.md).

# deck.gl v3.0

Release date: November, 2016

## Highlights

- New website
- Comprehensive documentation
- All Core Layers updated (API, features, performance)
- 64-bit Layers (High Precision)
- METERS projection mode (High Precision)
- Multi-Primitive Layer Support
- Composite Layer Support

## React Integration

- `DeckGL` (`DeckGLOverlay` in v2) component now requires a separate
  import (`import DeckGL from 'deck.gl/react'`). This allows the core
  deck.gl library to be imported by non-React applications without
  pulling in React.
- Adds `onLayerClick` and `onLayerHover` props to the `DeckGL` React
  component.
- The `DeckGL` component now cancels animation loop on unmount,
  important when repeatedly creating/destroying deck.gl components.
- The `DeckGL` component no longer manages WebGL blending modes,
  as this is better done directly by layers.

## Layers

- All layers now support accessors, removing the need for applications to
  transform data before passing it to deck.gl.
- Layer props and accessors now always expect arrays (e.g. colors
  are expected as `[r,g,b,a]` instead of `{r,g,b,a}` etc).
- line widths now takes device pixel ratio into account for more consistent
  look between displays
- METERS projection mode allows specifying positions in meter offsets in
  addition to longitude/latitude.
- Layers now receive viewport information from the `DeckGL` component.
  This implies that apps no longer need to pass the `width`, `height`,
  `longitude`, `latitude`, `zoom`, `pitch`, `bearing` and `bearing`
  props to each layer.
  These properties only need to be passed to the `DeckGL` react component.

#### Base Layer

- `deepCompare` prop replaced with more flexible `dataComparator`

#### ArcLayer

- Specify separate start and end color for each arc.
- Renders smoother arcs, especially for bottom arc segments close to map
- Fixes flickering last segments

#### ScatterplotLayer.

- Adds drawOutline option.

#### ScreenGridLayer

- New name for deck.gl v2 GridLayer
- Now have accessors (getPosition, getWeight)
- Custom color ramps (minColor, maxColor)

#### ChoroplethLayer

- Now renders MultiPolygons and Polygons with holes

#### HexagonLayer (REMOVED)

- The v2 HexagonLayer has not yet been ported to v3.

### 64bit layers

A set of new high precision layers that support extreme zoom levels

#### ArcLayer64 (NEW)

#### ChoroplethLayer64 (NEW)

#### ScatterplotLayer64 (NEW)

#### 64 bit ExtrudedChoroplethLayer (NEW)

- Great for rendering 3D buildings on top of maps
- Includes a basic shading model

#### GeoJsonLayer (NEW, EXPERIMENTAL)

- Initial composite layer, only Polygons for now.

### Sample Layers

Sample layers now available through `import 'deck.gl/samples';

## Changes affecting Custom Layers

### Streamlined life cycle methods

- The Layer life cycle methods are now optimized for deck.gl's needs
  and no longer try to mimic React.
- Limited compatibility with deck.gl v2 is provided but it is strongly
  recommended to update layers to the new methods

### Optimizations

- `Uint8Array` encoding is now supported for color and picking color
   attributes, which provides significant GPU memory savings.

### GLSL package manager and modules

- All layers now use `assembleShaders` to inject GLSL packages and platform
  fixes
- GLSL `project` package -
- GLSL `fp64` emulated double precision floating point package
- GLSL `fp32` package - 32bit improved precision library
    - Adds high precision version of trigonometry functions and `tan`
    - Especially for Intel GPUs

# deck.gl v2

Release date: May 2016

## Highlights

- 3D Perspective Mode
- Performance: Huge under the hood refactor of layer update logic
- Automatic attribute management (`AttributeManager` class)
- Linux fixes - deck.gl and luma.gl now work on Linux.
- Adopts [luma.gl](https://github.com/uber/luma.gl) as default WebGL framework.
- Retina display support
- Support for disabling mercator project (experimental)

## React Integration

- Ability to specify canvas ID and customize styles

## Layers

- Added data deep comparison support

### ScatterplotLayer

- Add per point radius support for the scatterplot-layer
- Added per point color support for the scatterplot-layer
- Fixed primitive distortion bug

### LineLayer (NEW)

# deck.gl v1

Original release date: December 2015

Initial open-source version of deck.gl, with five sample layers.
