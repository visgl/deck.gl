# deck.gl v.Next

Interesting in what is coming down the road? The deck.gl roadmap is now public. RFCs (Requests For Comments) for features in upcoming releases are available in the [developer documents](https://github.com/uber/deck.gl/tree/master/dev-docs/RFCs) section of the github repo.


# deck.gl v4.2 (Under development)

Release date: TBD, late 2017

## Multi-Viewport Support

deck.gl can now render your layers to multiple viewports. It is e.g. possible to mix map-overlaid views with first person views for dramatic new perspectives on your data. E.g. you can walk around in the city on which your data is overlaid.

A new `ViewportLayout` React component makes it trivial to precisely position multiple base maps and other background HTML components under multi-viewport layouts, automatically taking care of complexities like `devicePixelRatio`, inverted WebGL/CSS coordinate systems etc. This component will also automatically hide base maps when the viewport parameters can not be supported by the underlying map component.


## All Viewports Now Geospatially Enabled

All `Viewport` classes are now geospatially enabled: they now take an optional `longitude`/`latitude` reference point. In this mode, `position`s will be treated as meter offsets from that reference point per `COORDINATE_SYSTEM.METER_OFFSET` conventions.

This means that you can now use a FirstPersonViewport (the successor to the `PerspectiveViewport` with layers encoded in `COORDINATE_SYSTEM.LNG_LAT` and `COORDINATE_SYSTEM.METER_OFFSETS`) and place a camera anywhere in the scene (in contrast to the `WebMercatorViewport` which only allows you to look "down" on a position on the map).

Viewports even accept a `modelMatrix` to allow viewport/camera positions to be specified in exactly the same coordinates as `METER_OFFSET` layers, making it possible to place a camera at the exact location any of your existing data points without having to think or do any math.


## WebVR Support and Example

Multi viewport support can be used to integrate with the WebVR API and create dual WebVR compatible viewports that render a first person view of your data for left and right eye respectively which will display as stereoscopic 3D in supporting hardware.


## Controller Classes

deck.gl's controller classes have been significantly refactored, providing you with lots of options for how to control how the user interacts with your viewports. Also the controllers are no longer categorized as "experimental" exports, so you can import and use them in your apps knowing that they will be supported in future releases the same way as any other deck.gl feature.

TBA...


## Automatic Highlighting of Hovered Elements

Three new `Layer` props (`autoHighlight`, `highlightColor` and `highlightedObjectIndex`) have been added to enable simple and efficient highlighting of a single object in a layer. Highlighting is either automatic on hover, or programmatically controlled through specifying the index of the selected object. The actual highlighting is done on the GPU and this feature is thus very performant, in particular as it lets applications avoid cumbersome techniques like modifying data or using a secondary layer for highlighting.


## Control over DevicePixelRatio

The new `useDevicePixelRatio` prop on the `DeckGL` React component can be used to disable usage of full resolution on retina/HD displays. Disabling deck.gl's default behavior of always rendering at maximum device resolution can reduce the render buffer size with a factor of 4x on retina devices and lead to significant performance improvements on typical fragment shader bound rendering. This option can be especially interesting on "retina" type mobile phone displays where pixels are so small that the visual quality loss may be largely imperceptible.


## CompositeLayer Improvements

* **Property Forwarding Support** - A new method `CompositeLayer.getBaseLayerProps()` simplifies forwarding base layer props to sub layers, removing code clutter and reducing the risk of forgetting to forward an important base layer property.


## PathLayer: Dashed Line Support

Added new props (`getDashArray` and `justified`) enabling you render paths as dashed lines. Naturally these props are also accessible in composite layers built on top of the `PathLayer`, such as the `GeoJsonLayer`.


## Shader Modules

* Shader module documentation is much improved, both in deck.gl and luma.gl. In the deck.gl docs, shader modules are listed in the "API Reference" section, after the JavaScript classes.
* The `project` module provides a new function `project_pixel_to_clipspace` for screen space calculations that takes variables like `useDevicePixelRatio` and "focal distance" into account, making pixel space calculation simpler and less prone to fail when parameters change.
* The core deck.gl shader modules (`project` etc) now conform to the luma.gl shadertools conventions, making this module easier to describe and use. In spite of these changes, backwards compatible uniforms are of course provided to ensure that existing layers do not break.

## HexagonLayer / GridLayer: Elevation by Value Support
Add `getElevationValue` to `HexagonLayer` and `GridLayer` to enable elevation aggregation by value. This allow both color and elevation to be calculated based on customized aggregation function.

# deck.gl v4.1

Release date: July 27th, 2017

## WebGL2 Support (provided by luma.gl v4)

deck.gl v4.1 is based on luma.gl v4, a major release that adds full WebGL2 support as well as powerful features like WebGL state management and an improve GLSL shader module system. On all browsers that supports WebGL2 (e.g. recent Chrome and Firefox browsers), deck.gl will obtain WebGL2 context and utilize WebGL2 functionalities. To know more about WebGL2, please check [here](https://www.khronos.org/registry/webgl/specs/latest/2.0/).

## Query Methods

Two new functions - `DeckGL.queryObject` and `DeckGL.queryVisibleObjects` allow developers to directly query the picking results, in addition to handling picking via built-in click and hover callbacks. This allows applications to build more advanced event handling and makes deck.gl easier to integrate with existing applications that have already implemented their own event handling.

In addition, the `queryObject` offers a much requested `radius` parameter, allowing the application to specify how close an object needs to be to the specified coordinate to be considered a match (in deck.gl v4.0, picking will only trigger if an object is actually visible on the queried pixel, making it hard for users to select small features and thin lines).

## Shader Assembly

For developers that write their own custom layers, the `shadertools` shader assembly system is now in place to replace the existing `assembleShaders` function in deck.gl. The new shader assembler system supports organizing shader code into modules and is integrated with luma.gl's [`Model`]() so users no longer need to call `assembleShaders` before creating the `Model` for the layer.

## Per-Layer Control of WebGL Parameters

The base `Layer` class (which is inherited by all layers) supports a new property `parameters` that allows applications to specify the state of WebGL parameters such as blending mode, depth testing etc. This provides applications with significant control over the detailed rendering of layers. Note that the new `parameters` prop directly leverages the luma.gl v4 [setParameters](http://uber.github.io/luma.gl/#/documentation/api-reference/get-parameter) API, which allows all WebGL parameters to be specified as keys in a single parameter object.


## Layer Attribute Control

Pre-calculated "Vertex Attributes" can now be passed as props, meaning that applications that are willing to learn how a deck.gl layer's vertex attributes are structured can pass in typed arrays as props to the layer and have these directly passed to the GPU. This prevents the layer's internal `AttributeManager` from generating the attributes from your data, allowing you to optimize by e.g. directly passing in binary data from calculations or a binary file load without having deck.gl do any transformation on your data.


## CompositeLayer

Composite layers, which were introduced in v4.0, have received some polish and performance improvements. In subclassed `CompositeLayer`s, the `renderLayers` function can now return a nested array that could contain `null` values, and deck.gl will automatically flatten, filter and render all layers in the array. This is a small convenience that can make your `renderLayers` methods in complex composite layers a little more readable.

```js
   renderLayers() {
      return [
         setting1 && new ScatterplotLayer(...),
         setting2 && new LineLayer(...),
         this._renderAdditionalLayerList()
      ];
   }
```

Also, as a performance improvements, deck.gl now avoids "rerendering" sublayers of `CompositeLayer` whose props haven't changed.

## New Examples

Several new examples have been added to illustrate the wide applicability of deck.gl. To name a few:
* Wind visualization in US. This example is featured on [OpenVIS 2017 by @philogb](https://www.youtube.com/watch?v=KPiONdmNOuI). This example shows how new features in WebGL2 can be used to accelerate compute intensive tasks through GPU computing right in the browsers
* Tagmap - This example by @rivulet-zhang shows some novel approching in placing and rendering text symbols in deck.gl
* Point cloud example - The point cloud example shows how deck.gl could be used to render large amount of 3D point cloud data without any basemap context.
* Node-link Graph - This is another example showing how deck.gl could be extended to the info-vis domain.


## Touch Support

deck.gl's default event handling now includes support for multitouch gestures to zoom and rotate the view. In addition, a new `EventManager` class solidifies deck.gl's support for event handling.


## Seer Integration

deck.gl is now integrated with the new Seer Chrome extension. Simply installing Seer and rerunning your application opens up a new tab in the Chrome developer tools, providing you with the ability to see all your deck.gl layers, inspect (and edit) their properties and attributes and check per layer timings, such as the latest GPU draw calls or attribute updates.

And note that since luma.gl v4 also has a Seer integration, it is possible to follow links from deck.gl layer to luma.gl models inside Seer, enabling you to further drill down and understand what data is ultimately being generated and processed by the GPU.


# deck.gl v4.0

Release date: March 31, 2017

## Highlights

- **New Geospatial Layers** GeoJsonLayer, PathLayer, PolygonLayer, IconLayer, GridCellLayer, HexagonCellLayer, PointCloudLayer.
- **New Aggregating Layers** GridLayer and HexagonLayer now join the ScreenGridLayer in a growing family of layers that automatically "bin" your point data, in this case into grid cells or hexagons.
- **New Examples** deck.gl now provides multiple stand-alone examples, with minimal configuration files (`package.json`, `webpack.config.js` etc) intended to make it easy to just copy an example folder and get an app up and running in minutes.
- **Unified 64-bit Layers** - 64-bit Layers are now unified with 32-bit layers, controlled via a new `fp64` prop.
- **Library Size Reduction** - A number of npm package dependencies have been trimmed from deck.gl, and the distribution has initial support for "tree-shaking" bundlers like webpack2 and rollup.
- **Performance** A number of improvements across the core library and layers improves rendering and picking performance.
- **Model Matrix Support** - Model matrix support for the `METER_OFFSET` projection mode enables arbitrary coordinate transforms (translations, rotations, scaling etc) to be applied on individual layer enabling scene graph like layer composition and animation.
- **Documentation** Improved and reorganized in response to user feedback.
- **Experimental Features** Experimental support for non-Mercator projections and rendering effects (e.g. Reflections)

## New Layers

### GeoJsonLayer

A layer that parses and renders GeoJson. Supports all GeoJson primitives (polygons, lines and points).
The GeoJsonLayer is an example of a composite layer that instantiates other layers (in this case `PathLayer`, `PolygonLayer` and `ScatterplotLayer`) to do the actual rendering. This layer replaces the now deprecated family of `ChoroplethLayer`s.

### PathLayer

Takes a sequence of coordinates and renders them as a thick line with mitered or rounded end caps.

### PolygonLayer

Each object in data is expected to provide a "closed" sequence of coordinates and renders them as a polygon, optionally extruded or in wireframe mode. Supports polygons with holes.

### IconLayer

Allows the user to provide a texture atlas and a JSON configuration specifying where icons are located in the atlas.

### GridLayer

A layer that draws rectangular, optionally elevated cells. A typical grid based heatmap layer. Differs from the `ScreenGridLayer` in that the cells are in world coordinates and pre aggregated.

### HexagonLayer

A layer that draws hexagonal, optionally elevated cells.

### Point Cloud Layer

Draws a LiDAR point cloud. Supports point position/normal/color.

## Improvements to all Layers

### Support for Per-Layer Model Matrix

Each layer now supports a `modelMatrix` property that can be used to specify a local coordinate system for the data in that layer:

* Model matrices can dramatically simplify working with data in different coordinate systems, as the data does not need to be pre-transformed into a common coordinate system.

* Model matrices also enable interesting layer animation and composition possibilities as individual layers can be scaled, rotated, translated etc with very low computational cost (i.e. without modifying the data).

### UpdateTriggers now accept Accessor Names

`updateTriggers` now accept Accessor Names.

The `updateTriggers` mechanism in deck.gl v3 required the user to know the name of the vertex attribute controlled by an accessor. It is now possible to supply names of `accessors`.

### More intuitive mouse events

* `onHover` is now only fired on entering/exiting an object instead of on mouse move.
* `onClick` is now only fired on the picked layer instead of all pickable layers.

## New Features for Layer Subclassing

### Overridable Shaders

All layers now have a `getShaders` method that can be overriden by subclasses, enables reuse of all layer code while just replacing one or both shaders, often dramatically reducing the amount of code needed to add a small feature or change to en existing layers.

## New Features for Layer Writers

### `defaultProps`

Layers are now encouraged to define a `defaultProps` static member listing their props and default values, rather than programmatically declaring the props in constructor parameters etc. Using `defaultProps` means that many layer classes no longer need a constructor.

### AttributeManager now accepts new `accessor` field

Can be a string or a an array of strings. Will be used to match `updateTriggers` accessor names with instance attributes.

### `getPickingInfo()`

This method replaces the old `pick()` method and is expected to return an info object. Layers can block the execution of callback functions by returning `null`.

## Performance

A number of performance improvements and fixes have been gradually introduced since deck.gl v3.0 was launched. While many are not new in v4.0, cumulatively they enable noticeably better framerates and a lighter footprint when big data sets are loaded, compared to the initial v3.0.0 version.

The `AttributeManager` class now supports default logging of timings for attribute updates. This logging can be activated by simply setting `deck.log.priority=2` in the console (levels 1 and 2 provide different amounts of detail). This can be very helpful in verifying that your application is not triggering unnecessary attribute updates.

In addition, the new function `AttributeManager.setDefaultLogFunctions` allows the app to install its own custom logging functions to take even more control over logging of attribute updates.

## Library Improvements

JavaScript build tooling continues to evolve and efforts have been made to ensure deck.gl supports several popular new tooling setups:

* **Dependency Reduction** The number of npm dependencies (both in `deck.gl`, `luma.gl` and `react-map-gl`) have been reduced considerably, meaning that installing deck.gl and related modules will bring in less additional JavaScript code into your app, and your app will build and run faster.
* **Tree-shaking support**: deck.gl and related libraries now publish a "module" entry point in package.json which points to a parallel distribution (`deck.gl/dist-es6`) that preserves the `import` and `export` statements. This should allow tree shaking bundlers such as webpack 2 and rollup to further reduce bundle size.
* **Pure ES6 source code**: With few exceptions (e.g some JSX usage in examples), the source code of deck.gl and related modules are now all restricted to conformant ES6 (i.e. no ES2016 or ES2017, flow or similar syntax is used). This means that the source code can run directly (ie. without transpilation) in Node.js and modern browsers. You could potentially import code directly from `deck.gl/src` to experiment with this.
* **Buble support** in examples. [Buble](https://buble.surge.sh/guide/) is a nice alternative to babel if you have a simple app and don't need all the power of babel. Many of the examples now use buble for faster and smaller builds.

## Examples

Code examples have been improved in several ways:
* **Multiple Examples** deck.gl now provides multiple different examples in an `examples` folder, showing various interesting uses of deck.gl.
* **Stand Alone Examples** Examples are now stand alone, each with its own minimal `package.json` and configuration files, enabling them to be easily copied and modified.
* **Hello World Examples** Minimal examples for building with webpack 2 and browserify (previously called "exhibits") are still provided, and have been further simplified.
* **Layer Browser** The main `layer-browser` example has been expanded into a full "layer and property browser" allowing for easy testing of layers.

## Deprecations

The various Choropleth layers have been deprecated since deck.gl has new and better layers (`GeoJsonLayer`, `PathLayer`, `PolygonLayer`) that fill the same roles. The choropleth layers are still available but will not be maintained beyond critical bug fixes and will likely be removed in the next major version of deck.gl.

A careful API audit has also been done to align property names between old and
new layers. While this will makes the layers more consistent and the combined API easier to learn and work with, it does mean that some properties have been renamed, with the old name being deprecated, and in some very few cases, default values have changed.

For more information on deprecations and how to update your code in response to these changes, please consult the deck.gl [Upgrade Guide](/docs/get-started/upgrade-guide.md).

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

- `DeckGL` (`DeckGLOverlay` in v2) component now requires a separate import (`import DeckGL from 'deck.gl/react'`). This allows the core deck.gl library to be imported by non-React applications without pulling in React.
- Adds `onLayerClick` and `onLayerHover` props to the `DeckGL` React component.
- The `DeckGL` component now cancels animation loop on unmount, important when repeatedly creating/destroying deck.gl components.
- The `DeckGL` component no longer manages WebGL blending modes, as this is better done directly by layers.

## Layers

- All layers now support accessors, removing the need for applications to transform data before passing it to deck.gl.
- Layer props and accessors now always expect arrays (e.g. colors are expected as `[r,g,b,a]` instead of `{r,g,b,a}` etc).
- line widths now takes device pixel ratio into account for more consistent look between displays
- METERS projection mode allows specifying positions in meter offsets in addition to longitude/latitude.
- Layers now receive viewport information from the `DeckGL` component. This implies that apps no longer need to pass the `width`, `height`, `longitude`, `latitude`, `zoom`, `pitch`, `bearing` and `bearing` props to each layer. These properties only need to be passed to the `DeckGL` react component.

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

Sample layers now available through `import 'deck.gl/samples';`

## Changes affecting Custom Layers

### Streamlined life cycle methods

- The Layer life cycle methods are now optimized for deck.gl's needs and no longer try to mimic React.
- Limited compatibility with deck.gl v2 is provided but it is strongly recommended to update layers to the new methods

### Optimizations

- `Uint8Array` encoding is now supported for color and picking color attributes, which provides significant GPU memory savings.

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
