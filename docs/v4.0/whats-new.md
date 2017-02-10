# deck.gl v4.0

Release date: TBD, Q1 2017

# Highlights


## Performance

A number of performance improvements and fixes have been gradually introduced
since deck.gl v3.0 was launched. While many are not new in v4.0, cumulatively
they enable noticeably better framerates and a lighter footprint when big data
sets are loaded, compared to the initial v3.0.0 version


## New Layers

* GeoJsonLayer

A composite layer that parses geojson and renders it as a `PathLayer`
and a `PolygonLayer`.

### PathLayer


### PolygonLayer


### IconLayer


### GridLayer

A layer that draws rectangular, optionally elevated cells.
A typical grid based heatmap layer.
Differs from the `ScreenGridLayer` in that the cells are in
world coordinates and pre aggregated.


### HexagonLayer

A layer that draws hexagonal, optionally elevated cells.


### Point Cloud Layer

Draws a point cloud. Supports point color/opacity. Points can be drawn using
GL.POINTS or using a primitive.


## `Layer


### TBD - support immutable data/ES6 containers?


### Support for Per-Layer Model Matrix

Each layer now supports a `modelMatrix` property that can be used to
specify a local coordinate system for the data in that layer:

* Model matrices can dramatically simplify working with data in different
  coordinate systems, as the data does not need to be pre-transformed into
  a common coordinate system.

* Model matrices also enable interesting layer animation and composition
  possibilities as individual layers can be scaled, rotated, translated etc
  with very low computational cost (i.e. without modifying the data).

TBD - `layerMatrix` vs `modelMatrix`


### **Overridable shaders** - All layers now have a `getShaders` method that can
  be overriden by subclasses, enables reuse of all layer code while just
  replacing one or both shaders, often dramatically reducing the amount of
  code needed to add a small feature or change to en existing layers


## New Features for Layer Writers

### `defaultProps` - layers are now encouraged to define a `defaultProps`
static member listing their props and default values, rather than programmatically
declaring the props in constructor parameters etc. Using `defaultProps` means
that many layer classes no longer need a constructor.

## New Examples


## Deprecations

The various Choropleth layers have been deprecated since deck.gl has new and
better layers that fill the same role. The choropleth layers are still available
but will not be maintained beyond critical bug fixes and will likely be
removed in the next major version of deck.gl.

A careful API audit has also been done to align property names between layers.
While this will makes the layers more consistent and easier to work with, it
does mean that some properties have been renamed, with the old name being
deprecated, and in some very few cases, default values have changed.

For more information on deprecations and how to update your code in response
to them, please consult the deck.gl [Upgrade Guide](upgrade-guide.md).


# deck.gl v3.0

Release date: November, 2016

## Highlights
  - New [website](http://uber.github.io/deck.gl/)
  - Comprehensive [documentation](http://uber.github.io/deck.gl/#/documentation/overview/introduction)
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

### Sample Layers

Sample layers now available through `import 'deck.gl/samples';

### GeoJsonLayer (NEW, EXPERIMENTAL)
- Initial composite layer, only Polygons for now.


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
