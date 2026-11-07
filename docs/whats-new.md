Warning: truncated output (original token count: 35584)
Total output lines: 2465

# What's New

This page contains highlights of each deck.gl release. Also check our [vis.gl blog](https://medium.com/vis-gl) for news about new releases and features in deck.gl.

## Unreleased

### Custom aggregators and GPUVector inputs

GridLayer, HexagonLayer, ScreenGridLayer, and ContourLayer now accept custom aggregator
instances. Custom aggregators can consume GPUVector position/weight columns and publish
GPUVector cell results without copying them to the CPU. Existing defaults remain unchanged. See [Aggregator](./api-reference/aggregation-layers/aggregator.md) for ownership,
result layouts, and supported scales and contours.

### luma.gl v10 alpha.10

The v10 packages use luma.gl alpha.10. Layer models delegate typed vector and
constant-buffer binding and render-target format tracking to luma.gl. WebGPU
layer draws restore dynamic render-pass parameters after drawing. Custom shader
plugins use the renamed injection-target API; see the [upgrade guide](./upgrade-guide.md).

### ScatterplotLayer Arrow columns

ScatterplotLayer accepts Arrow vectors for positions and styling, with accessor and binary fallbacks. See [Using with Arrow](./developer-guide/using-with-arrow.md) for modes and [tabbed examples](./api-reference/layers/scatterplot-layer.md#arrow-columns).

### deck.gl v10 examples (Experimental)

The website gallery includes three new sections: Arrow Layers, Visual Effects, and GPU Graph Layers. Explore [streaming Arrow paths](/examples/v10/arrow-path-layer), [riverfront weather](/examples/v10/weather), and [GPU graph exploration](/examples/v10/gpu-graph-explorer), alongside the other copied luma.gl examples. Each page embeds the live demo and its controls. GPU graph exploration requires WebGPU; these examples use private prototype modules and remain experimental.

### Extension updates

Use [`DataFilterExtension`](./api-reference/extensions/data-filter-extension.md) with `countItems` to report how many objects pass numeric or category filters.

### Custom projections (Experimental)

[`_CustomProjectionView`](./api-reference/core/custom-projection-view.md), [`_CustomProjectionViewport`](./api-reference/core/custom-projection-viewport.md) and [`_CustomProjectionController`](./api-reference/core/custom-projection-controller.md) support planar maps using target CRS descriptors resolved by `@math.gl/geospatial/projection`. Input coordinates use WGS84; target axis units, normalization, bounds and ground distance scales come from the descriptor. Layer support includes scatterplots, lines and arcs, paths, polygons and GeoJSON, icons and text, columns and grid cells, point clouds, instanced meshes, and aggregation layers (contours, grids, hexagons, heatmaps, and screen grids). See the view documentation for coordinate conventions and limitations, including restrictions on tiled layers, bitmaps and great-circle arcs.

### Layer source CRS (Experimental)

Layers accept CRS identifiers and PROJ strings through `coordinateSystem`. A shared resolver loads descriptors before layer lifecycle updates. GPU-supported CRSs retain their original attribute coordinates; other CRSs are converted on the CPU into the view's supported attribute CRS.

Paths and polygon rings support opt-in `_projectionTolerance` refinement through math.gl to approximate curved projected edges. Refinement requires normalized geometry, CPU-readable coordinates and per-object styling; polygon interiors are triangulated separately.

## deck.gl v9.4

Release date: September 5, 2026

deck.gl v9.4 is expected to be the final release in the v9 series. It brings together a collection of completed improvements focused on performance, stability, and usability, and is intended to be a highly compatible, highly recommended upgrade for all v9 applications.

Looking ahead, deck.gl v10 is expected to introduce larger architectural changes, including luma.gl v10, loaders.gl v5, and support for more advanced binary data pipelines and GPU rendering techniques. As a result, v10 will likely be a more substantial and intentional upgrade for applications than this release.

### WebGPU

deck.gl v9.4 substantially expands its experimental WebGPU support. All layers in the official layer catalog now support WebGPU, including [`MVTLayer`](./api-reference/geo-layers/mvt-layer.md), with tile clipping for its circle, path, and polygon sublayers, and [`Tile3DLayer`](./api-reference/geo-layers/tile-3d-layer.md), with support for point-cloud, glTF scenegraph, and I3S mesh tile content. Big improvements are made to core WebGPU attribute-buffer assembly, render pass management, and device switching. Render tests are used to ensure WebGL-WebGPU parity covering most common use cases.

The WebGPU-capable code is included by default so that adopting WebGPU does not require changing application imports. Applications that only target WebGL2 can instead configure their bundler to resolve the custom export condition `visgl:webgl-only`; supported deck.gl packages will then use alternate builds with WebGPU branches and WGSL shader sources removed, reducing their contribution to bundle size without changing the imported APIs. See [Building Apps](./developer-guide/building-apps.md#bundle-size) for details.

WebGPU support remains experimental and is not yet recommended for production. Some layers and features remain unavailable or only partially supported. See the [WebGPU guide](./developer-guide/webgpu.md) for setup instructions, current limitations, and the complete compatibility matrix.

### Views and Controllers

<table style={{border: 0}} align="center">
  <tbody>
    <tr>
      <td>
        <img style={{maxHeight:240}} src="https://github.com/visgl/deck.gl-data/blob/master/images/whats-new/globe-tilt.gif?raw=true" />
        <p><i>GlobeView pitch and bearing</i></p>
      </td>
      <td>
        <img style={{maxHeight:240}} src="https://github.com/visgl/deck.gl-data/blob/master/images/whats-new/rubberband.gif?raw=true" />
        <p><i>Controller maxBounds + rubberBand</i></p>
      </td>
    </tr>
  </tbody>
</table>


deck.gl v9.4 brings numerous view and controller improvements on top of the substantial changes in v9.3.

**GlobeView compatibility and UX**

[`GlobeView`](./api-reference/core/globe-view.md) continues to mature, including significantly expanded layer compatibility:

- [TerrainLayer](./api-reference/geo-layers/terrain-layer.md) now renders correctly on `GlobeView`, producing properly projected terrain meshes on the globe.
- [`MaskExtension`](./api-reference/extensions/mask-extension.md) works in `GlobeView`; masks are evaluated in Web Mercator space, so the mask shape follows the same latitude stretch as the layers it masks.
- [TerrainExtension](./api-reference/extensions/terrain-extension.md) now supports `GlobeView`, enabling terrain-draped layers on the globe.
- [Tile3DLayer](./api-reference/geo-layers/tile-3d-layer.md) renders correctly on `GlobeView`.
- The [`project` shader module](./api-reference/core/project.md#project_common_position_to_flat) adds `project_common_position_to_flat` and its wrapped and continuous variants, so extensions and custom layers can test bounds or sample textures computed in flat Web Mercator space while rendering on the globe.
- [`PathStyleExtension`](./api-reference/extensions/path-style-extension.md) dashes render the same in `GlobeView` as in `MapView`.
- [IconLayer](./api-reference/layers/icon-layer.md), [TextLayer](./api-reference/layers/text-layer.md) and billboard [ScatterplotLayer](./api-reference/layers/scatterplot-layer.md) render on `GlobeView`: objects behind the globe are hidden, objects near the horizon are no longer clipped by the globe's surface, and objects with altitude stay visible past the ground horizon. The [`project` shader module](./api-reference/core/project.md#project_globe_is_occluded) exposes `project_globe_is_occluded` and `project_globe_billboard_clipspace` for custom billboard layers.
- [`ClipExtension`](./api-reference/extensions/clip-extension.md) clips by geometry on `GlobeView`, and `clipBounds` may cross the antimeridian, e.g. `[170, -20, -170, 20]`.
- [LineLayer](./api-reference/layers/line-layer.md) and [ArcLayer](./api-reference/layers/arc-layer.md) render on `GlobeView` with its default back-face culling; the `cullMode: 'none'` workaround is no longer needed.
- [`GlobeController`](./api-reference/core/globe-controller.md) now supports bearing and pitch, including shift/right-click drag and multi-touch rotation, as well as inertial spinning after a fling gesture.

**View management**

- [Views](./api-reference/core/view.md#parameters) now support a `parameters` prop for per-view GPU draw state overrides. `GlobeView` uses this to enable back-face culling by default, and applications can override it with:

  ```js
  new GlobeView({
    parameters: {
      cullMode: 'none'
    }
  });
  ```

- A new [`ViewLayout`](./api-reference/widgets/view-layout.md) system makes responsive and dynamic multi-view applications easier to build. Applications define nested, relative view layouts in a simple declarative syntax. The `buildViewsFromViewLayout()` helper then automatically regenerates `View` instances from the specified view layout tree based on browser window size, splitter widget positions, etc.

**Multi-canvas support**

New experimental multi-canvas foundations allow integrations to associate each `View` with a presentation canvas using `canvasId`. `Deck.getEventManager(viewId)` resolves the event manager responsible for a particular view, enabling view-scoped interaction across multiple canvases. This API is experimental and may change as multi-canvas support evolves.

**New controller options**

- All [controllers](./api-reference/core/controller.md) now support `doubleClickDragZoom` for continuous zooming by double-clicking or double-tapping and dragging vertically.
- The new `trackpadGesture` option enables native trackpad gestures, including two-finger pan, pinch-to-zoom, and rotate where supported.
- The new `zoomAround` option chooses whether pointer-based zoom interactions keep the pointer location or the viewport center fixed.
- The new `maxBoundsPadding` option fits `maxBounds` within a padded or asymmetrically positioned viewport region, with support for pixels, percentages, and CSS-style layout expressions.
- `OrthographicController` and `MapController` now support `rubberBand`, allowing pan and zoom interactions to temporarily overshoot their constraints before easing back on release.

### @deck.gl/maplibre

New [`@deck.gl/maplibre`](./api-reference/maplibre/overview.md) module is forked from the former `@deck.gl/mapbox` module. It provides support for overlaid and interleaved rendering with MapLibre GL JS v4, v5, and the recently released v6.

### Layers and Extensions


<table style={{border: 0}} align="center">
  <tbody>
    <tr>
      <td>
        <img style={{maxHeight:240}} src="https://github.com/visgl/deck.gl-data/blob/master/images/whats-new/antialiasing.png?raw=true" />
        <p><i>Analytic antialiasing</i></p>
      </td>
      <td>
        <img style={{maxHeight:240}} src="https://github.com/visgl/deck.gl-data/blob/master/images/whats-new/path-style.png?raw=true" />
        <p><i>PathStyleExtension dash config</i></p>
      </td>
      <td>
        <img style={{maxHeight:240}} src="https://github.com/visgl/deck.gl-data/blob/master/images/whats-new/fill-pattern.png?raw=true" />
        <p><i>FillStyleExtension procedural patterns</i></p>
      </td>
    </tr>
  </tbody>
</table>

- Picking performance has been optimized. Most layers now use shader builtins (`instance_index`) instead of picking color buffers, reducing GPU memory usage and layer initialization costs.
- [TileLayer](./api-reference/geo-layers/tile-layer.md) now prioritizes tile requests closest to the viewport center, improving perceived load times during panning and zooming.
- [TerrainLayer](./api-reference/geo-layers/terrain-layer.md) now correctly passes `zoomOffset` through to its child `TileLayer`.
- [ScatterplotLayer](./api-reference/layers/scatterplot-layer.md#getpixeloffset) adds a transition-enabled `getPixelOffset` accessor for positioning circles in screen space.
- [`PathLayer`](./api-reference/layers/path-layer.md), [`LineLayer`](./api-reference/layers/line-layer.md), [`ArcLayer`](./api-reference/layers/arc-layer.md), and [`PointCloudLayer`](./api-reference/layers/point-cloud-layer.md) now use analytic antialiasing for smooth edges without requiring MSAA. Composite layers that render paths, including `GeoJsonLayer`, `PolygonLayer`, and the geospatial cell layers, forward the new `antialiasing` prop to their path sublayers.
- [`PathStyleExtension`](./api-reference/extensions/path-style-extension.md) adds `dashMode` to choose whether a dash pattern restarts at each segment or runs continuously across a complete path, and `dashUnits` to express dash lengths in stroke widths, pixels, meters, or common units. Dash rendering is also more robust for dense and 3D paths, billboarded or offset strokes, long paths, and subpixel patterns.
- [`FillStyleExtension`](./api-reference/extensions/fill-style-extension.md) can generate hatch, cross-hatch, and dot patterns directly in the fragment shader without a texture atlas. It also adds `fillPatternSizeUnits` for ground- or screen-relative pattern sizing and `getFillPatternBackgroundColor` for compositing patterns over a per-object background color.
- [`FillStyleExtension`](./api-reference/extensions/fill-style-extension.md) patterns now render in [GlobeView](./api-reference/core/globe-view.md).

### Other Improvements

- [OrthographicView](./api-reference/core/orthographic-view.md#common-size-resolution) allows `zoom` to control the size of geometry in common units independently from positional `zoomX` and `zoomY`.
- [ZoomWidget](./api-reference/widgets/zoom-widget.md) now supports a `zoomStep` prop to configure the zoom level delta applied by each button click.
- Built-in widget buttons now use [styled, customizable tooltips](./api-reference/widgets/tooltips.md) that support text, HTML content, theming, and per-button disabling.
- Built-in widget icons now use Google Material Symbols, with a new [`--icon-size`](./api-reference/widgets/styling.md#size) theme variable for consistent sizing.
- [ScrollbarWidget](./api-reference/widgets/scrollbar-widget.md) now supports `contentBoundsPadding` to align its scroll range with padded content bounds. When explicit values are omitted, `contentBounds` and `contentBoundsPadding` fall back to the target view controller's `maxBounds` and `maxBoundsPadding`, respectively.
- `@deck.gl/arcgis`'s [`DeckRenderer`](./api-reference/arcgis/deck-renderer.md) now integrates with ArcGIS `SceneView` through the modern [`RenderNode`](https://developers.arcgis.com/javascript/latest/api-reference/esri-views-3d-webgl-RenderNode.html) API instead of the deprecated `externalRenderers` API.

### pydeck

deck.gl's Python bindings gain first-class support for [layer extensions](./api-reference/extensions/overview.md), available through a typed [`pydeck.Extension`](https://deckgl.readthedocs.io/en/latest/extension.html) wrapper, as well as lighting and post-processing effects through `pydeck.Effect`.

The Jupyter integration now recognizes the canonical `GlobeView` type name while retaining `_GlobeView` as a backwards-compatible alias.

pydeck documents [multi-view layouts](https://deckgl.readthedocs.io/en/latest/view.html) and the [`SplitterWidget`](https://deckgl.readthedocs.io/en/latest/widget.html), with gallery examples for both. `Deck` sends a top-level `controller` (new argument, default `True`) and leaves `views` to deck.gl, so widgets such as `SplitterWidget` can manage them.

```python
import pydeck as pdk

layer = pdk.Layer(
    "ScatterplotLayer",
    data=df,
    get_position="position",
    get_filter_value="value",
    filter_range=[0, 1],
    extensions=[pdk.Extension("DataFilterExtension", filter_size=1)],
)
```

Experiment with these features via the new [pydeck playground](https://deck.gl/pydeck).

pydeck draws [charts](https://deckgl.readthedocs.io/en/latest/view.html#non-geospatial-charts) on `OrthographicView` and `OrbitView` without a basemap. The gallery gains a [scatter plot](https://deckgl.readthedocs.io/en/latest/gallery/scatter_plot.html), a [bar chart](https://deckgl.readthedocs.io/en/latest/gallery/bar_chart.html) and a [surface plot](https://deckgl.readthedocs.io/en/latest/gallery/surface_plot.html).

[Custom layer libraries](https://deckgl.readthedocs.io/en/latest/custom_layers.html#es-module-bundles) published as ES modules load with `module=True`:

```python
import pydeck as pdk

pdk.settings.register_library("MyLayers", "https://example.com/my-layers.mjs", module=True)
layer = pdk.Layer("MyLayer", data=df)  # MyLayers exports MyLayer
```

HTML exports get lighter: `Deck.to_html()` embeds the deck.gl JSON compactly, without indentation, while `to_json()` keeps the pretty-printed form for notebooks and diffs.

## deck.gl v9.3

Release date: April 13, 2026

### Widgets


<table style={{border: 0}} align="center">
  <tbody>
    <tr>
      <td>
        <img style={{maxHeight:200}} src="https://github.com/visgl/deck.gl-data/blob/master/images/whats-new/popup.jpg?raw=true" />
        <p><i>PopupWidget</i></p>
      </td>
      <td>
        <img style={{maxHeight:200}} src="https://github.com/visgl/deck.gl-data/blob/master/images/whats-new/splitter.gif?raw=true" />
        <p><i>SplitterWidget</i></p>
      </td>
      <td>
        <img style={{maxHeight:200}} src="https://github.com/visgl/deck.gl-data/blob/master/images/whats-new/scrollbar.gif?raw=true" />
        <p><i>ScrollbarWidget</i></p>
      </td>
    </tr>
  </tbody>
</table>

Many experimental widgets got a design overhaul in v9.3, along with new additions to the catalog.

- The [InfoWidget](./api-reference/widgets/info-widget.md), [ContextMenuWidget](./api-reference/widgets/context-menu-widget.md) and the new [PopupWidget](./api-reference/widgets/popup-widget.md) now use [popper](http://floating-ui.com/) under the hood to provide smarter UI placement that responds to window size, content size and scroll position.
- New generic-purpose controls rendered by [IconWidget](./api-reference/widgets/icon-widget.md), [ToggleWidget](./api-reference/widgets/toggle-widget.md) and [SelectorWidget](./api-reference/widgets/selector-widget.md) cover many common use cases that would otherwise require implementing your own custom widget.
- [SplitterWidget](./api-reference/widgets/splitter-widget.md) now supports arbitrary division of the canvas, as well as a cleaner API that no longer requires any custom viewport calculation.
- New [ScrollbarWidget](./api-reference/widgets/scrollbar-widget.md) lets users get around a large orthographic canvas just like scrolling an HTML page.
- [TimelineWidget](./api-reference/widgets/timeline-widget.md) has a fresh new look that is entirely customizable via CSS variables.
- `FpsWidget` is merged into [StatsWidget](./api-reference/widgets/stats-widget.md) as a unified, sleek-looking debugging surface.

Widgets now support **controlled and uncontrolled component patterns**, enabling app developers to control, observe, and intercept user interactions. Widgets with internal state — such as [TimelineWidget](./api-reference/widgets/timeline-widget.md), [StatsWidget](./api-reference/widgets/stats-widget.md), and [ThemeWidget](./api-reference/widgets/theme-widget.md) — accept controlled props (e.g. `time`, `playing`, `expanded`, `themeMode`) alongside `initial*` props for uncontrolled defaults. All widgets now fire state change callbacks (`onTimeChange`, `onPlayingChange`, `onExpandedChange`, `onThemeModeChange`, `onFullscreenChange`, `onLoadingChange`, `onReset`, `onZoom`, `onGeocode`, `onChange`) for common integration patterns.

Aside from the above, all widgets also received the following improvements:

- You can pass a `_container` prop to a widget…25584 tokens truncated… module provides a new function `project_pixel_to_clipspace` for screen space calculations that takes variables like `useDevicePixels` and "focal distance" into account, making pixel space calculation simpler and less prone to fail when parameters change.
* The core deck.gl shader modules (`project` etc) now conform to the luma.gl shadertools conventions for naming uniforms and functions, making this module easier to describe and use. In spite of these changes, backwards compatible uniforms are provided to ensure that existing layers do not break.


### React Integration

#### React 16 Support

deck.gl v5 now supports React 16 and the `package.json` dependencies of all React-based examples have updated to React 16.


### Experimental Features

As usual, deck.gl 5.0 contains a number of experimental features, e.g. "multi viewport", "first person viewport" and "viewport transitions". These features are still being finalized and the APIs have not been frozen, but can still be accessed by early adopters. See the roadmap article for more information on these.


## deck.gl v4.1

Release date: July 27th, 2017

<table style={{border:0}} align="center">
  <tbody>
    <tr>
      <td>
        <img height="150" src="https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/webgl2.jpg" />
        <p><i>WebGL 2</i></p>
      </td>
      <td>
        <img height="150" src="https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/seer.png" />
        <p><i>Seer Extension</i></p>
      </td>
    </tr>
  </tbody>
</table>


### WebGL2 Support (provided by luma.gl v4)

deck.gl v4.1 is based on luma.gl v4, a major release that adds full WebGL2 support as well as powerful features like WebGL state management and an improve GLSL shader module system. On all browsers that supports WebGL2 (e.g. recent Chrome and Firefox browsers), deck.gl will obtain WebGL2 context and utilize WebGL2 functionalities. To know more about WebGL2, please check [here](https://www.khronos.org/registry/webgl/specs/latest/2.0/).


### Query Methods

Two new functions - `DeckGL.queryObject` and `DeckGL.queryVisibleObjects` allow developers to directly query the picking results, in addition to handling picking via built-in click and hover callbacks. This allows applications to build more advanced event handling and makes deck.gl easier to integrate with existing applications that have already implemented their own event handling.

In addition, the `queryObject` offers a much requested `radius` parameter, allowing the application to specify how close an object needs to be to the specified coordinate to be considered a match (in deck.gl v4.0, picking will only trigger if an object is actually visible on the queried pixel, making it hard for users to select small features and thin lines).

### Shader Assembly

For developers that write their own custom layers, the `shadertools` shader assembly system is now in place to replace the existing `assembleShaders` function in deck.gl. The new shader assembler system supports organizing shader code into modules and is integrated with luma.gl's [`Model`](https://luma.gl/docs/api-reference/engine/model) so users no longer need to call `assembleShaders` before creating the `Model` for the layer.

### Per-Layer Control of WebGL Parameters

The base `Layer` class (which is inherited by all layers) supports a new property `parameters` that allows applications to specify the state of WebGL parameters such as blending mode, depth testing etc. This provides applications with significant control over the detailed rendering of layers. Note that the new `parameters` prop directly leverages the luma.gl v4 [setParameters](https://luma.gl/docs/api-reference-legacy/context/parameter-setting#setparameters) API, which allows all WebGL parameters to be specified as keys in a single parameter object.


### Layer Attribute Control

Pre-calculated "Vertex Attributes" can now be passed as props, meaning that developers that are willing to learn how a deck.gl layer's vertex attributes are structured can pass in typed arrays as props to the layer and have these directly passed to the GPU. This prevents the layer's internal `AttributeManager` from generating the attributes from your data, allowing you to optimize by e.g. directly passing in binary data from calculations or a binary file load without having deck.gl do any transformation on your data.


### CompositeLayer

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

### New Examples

Several new examples have been added to illustrate the wide applicability of deck.gl. To name a few:

* Wind visualization in US. This example is featured on [OpenVIS 2017 by @philogb](https://www.youtube.com/watch?v=KPiONdmNOuI). This example shows how new features in WebGL2 can be used to accelerate compute intensive tasks through GPU computing right in the browsers
* Tagmap - This example by @rivulet-zhang shows some novel approching in placing and rendering text symbols in deck.gl
* Point cloud example - The point cloud example shows how deck.gl could be used to render large amount of 3D point cloud data without any basemap context.
* Node-link Graph - This is another example showing how deck.gl could be extended to the info-vis domain.


### Touch Support

deck.gl's default event handling now includes support for multitouch gestures to zoom and rotate the view. In addition, a new `EventManager` class solidifies deck.gl's support for event handling.


### Seer Integration

deck.gl is now integrated with the new [Seer Chrome extension](https://chrome.google.com/webstore/detail/seer/eogckabefmgphfgngjdmmlfbddmonfdh?hl=en). Simply installing Seer and rerunning your application opens up a new tab in the Chrome developer tools, providing you with the ability to see all your deck.gl layers, inspect (and edit) their properties and attributes and check per layer timings, such as the latest GPU draw calls or attribute updates.

And note that since luma.gl v4 also has a Seer integration, it is possible to follow links from deck.gl layer to luma.gl models inside Seer, enabling you to further drill down and understand what data is ultimately being generated and processed by the GPU.


## deck.gl v4.0

Release date: March 31, 2017

### Highlights

* **New Geospatial Layers** GeoJsonLayer, PathLayer, PolygonLayer, IconLayer, GridCellLayer, HexagonCellLayer, PointCloudLayer.
* **New Aggregating Layers** GridLayer and HexagonLayer now join the ScreenGridLayer in a growing family of layers that automatically "bin" your point data, in this case into grid cells or hexagons.
* **New Examples** deck.gl now provides multiple stand-alone examples, with minimal configuration files (`package.json`, `webpack.config.js` etc) intended to make it easy to just copy an example folder and get an app up and running in minutes.
* **Unified 64-bit Layers** - 64-bit Layers are now unified with 32-bit layers, controlled via a new `fp64` prop.
* **Library Size Reduction** - A number of npm package dependencies have been trimmed from deck.gl, and the distribution has initial support for "tree-shaking" bundlers like webpack2 and rollup.
* **Performance** A number of improvements across the core library and layers improves rendering and picking performance.
* **Model Matrix Support** - Model matrix support for the `METER_OFFSET` projection mode enables arbitrary coordinate transforms (translations, rotations, scaling etc) to be applied on individual layer enabling scene graph like layer composition and animation.
* **Documentation** Improved and reorganized in response to user feedback.
* **Experimental Features** Experimental support for non-Mercator projections and rendering effects (e.g. Reflections)

### New Layers

#### GeoJsonLayer

A layer that parses and renders GeoJson. Supports all GeoJson primitives (polygons, lines and points).
The GeoJsonLayer is an example of a composite layer that instantiates other layers (in this case `PathLayer`, `PolygonLayer` and `ScatterplotLayer`) to do the actual rendering. This layer replaces the now deprecated family of `ChoroplethLayer`s.

#### PathLayer

Takes a sequence of coordinates and renders them as a thick line with mitered or rounded end caps.

#### PolygonLayer

Each object in data is expected to provide a "closed" sequence of coordinates and renders them as a polygon, optionally extruded or in wireframe mode. Supports polygons with holes.

#### IconLayer

Allows the user to provide a texture atlas and a JSON configuration specifying where icons are located in the atlas.

#### GridLayer

A layer that draws rectangular, optionally elevated cells. A typical grid based heatmap layer. Differs from the `ScreenGridLayer` in that the cells are in world coordinates and pre aggregated.

#### HexagonLayer

A layer that draws hexagonal, optionally elevated cells.

#### Point Cloud Layer

Draws a LiDAR point cloud. Supports point position/normal/color.

### Improvements to all Layers

#### Support for Per-Layer Model Matrix

Each layer now supports a `modelMatrix` property that can be used to specify a local coordinate system for the data in that layer:

* Model matrices can dramatically simplify working with data in different coordinate systems, as the data does not need to be pre-transformed into a common coordinate system.

* Model matrices also enable interesting layer animation and composition possibilities as individual layers can be scaled, rotated, translated etc with very low computational cost (i.e. without modifying the data).

#### UpdateTriggers now accept Accessor Names

`updateTriggers` now accept Accessor Names.

The `updateTriggers` mechanism in deck.gl v3 required the user to know the name of the vertex attribute controlled by an accessor. It is now possible to supply names of `accessors`.

#### More intuitive mouse events

* `onHover` is now only fired on entering/exiting an object instead of on mouse move.
* `onClick` is now only fired on the picked layer instead of all pickable layers.

### New Features for Layer Subclassing

#### Overridable Shaders

All layers now have a `getShaders` method that can be overridden by subclasses, enables reuse of all layer code while just replacing one or both shaders, often dramatically reducing the amount of code needed to add a small feature or change to en existing layers.

### New Features for Layer Writers

#### `defaultProps` {#defaultprops}

Layers are now encouraged to define a `defaultProps` static member listing their props and default values, rather than programmatically declaring the props in constructor parameters etc. Using `defaultProps` means that many layer classes no longer need a constructor.

#### AttributeManager now accepts new `accessor` field

Can be a string or a an array of strings. Will be used to match `updateTriggers` accessor names with instance attributes.

#### `getPickingInfo()` {#getpickinginfo}

This method replaces the old `pick()` method and is expected to return an info object. Layers can block the execution of callback functions by returning `null`.

### Performance

A number of performance improvements and fixes have been gradually introduced since deck.gl v3.0 was launched. While many are not new in v4.0, cumulatively they enable noticeably better framerates and a lighter footprint when big data sets are loaded, compared to the initial v3.0.0 version.

The `AttributeManager` class now supports default logging of timings for attribute updates. This logging can be activated by simply setting `deck.log.priority=2` in the console (levels 1 and 2 provide different amounts of detail). This can be very helpful in verifying that your application is not triggering unnecessary attribute updates.

In addition, the new function `AttributeManager.setDefaultLogFunctions` allows the app to install its own custom logging functions to take even more control over logging of attribute updates.

### Library Improvements

JavaScript build tooling continues to evolve and efforts have been made to ensure deck.gl supports several popular new tooling setups:

* **Dependency Reduction** The number of npm dependencies (both in `deck.gl`, `luma.gl` and `react-map-gl`) have been reduced considerably, meaning that installing deck.gl and related modules will bring in less additional JavaScript code into your app, and your app will build and run faster.
* **Tree-shaking support**: deck.gl and related libraries now publish a "module" entry point in package.json which points to a parallel distribution (`deck.gl/dist-es6`) that preserves the `import` and `export` statements. This should allow tree shaking bundlers such as webpack 2 and rollup to further reduce bundle size.
* **Pure ES6 source code**: With few exceptions (e.g some JSX usage in examples), the source code of deck.gl and related modules are now all restricted to conformant ES6 (i.e. no ES2016 or ES2017, flow or similar syntax is used). This means that the source code can run directly (ie. without transpilation) in Node.js and modern browsers. You could potentially import code directly from `deck.gl/src` to experiment with this.
* **Buble support** in examples. [Buble](https://buble.surge.sh/guide/) is a nice alternative to babel if you have a simple app and don't need all the power of babel. Many of the examples now use buble for faster and smaller builds.

### Examples

Code examples have been improved in several ways:

* **Multiple Examples** deck.gl now provides multiple different examples in an `examples` folder, showing various interesting uses of deck.gl.
* **Stand Alone Examples** Examples are now stand alone, each with its own minimal `package.json` and configuration files, enabling them to be easily copied and modified.
* **Hello World Examples** Minimal examples for building with webpack 2 and browserify (previously called "exhibits") are still provided, and have been further simplified.
* **Layer Browser** The main `layer-browser` example has been expanded into a full "layer and property browser" allowing for easy testing of layers.

### Deprecations

The various Choropleth layers have been deprecated since deck.gl has new and better layers (`GeoJsonLayer`, `PathLayer`, `PolygonLayer`) that fill the same roles. The choropleth layers are still available but will not be maintained beyond critical bug fixes and will likely be removed in the next major version of deck.gl.

A careful API audit has also been done to align property names between old and
new layers. While this will makes the layers more consistent and the combined API easier to learn and work with, it does mean that some properties have been renamed, with the old name being deprecated, and in some very few cases, default values have changed.

For more information on deprecations and how to update your code in response to these changes, please consult the deck.gl [Upgrade Guide](./upgrade-guide.md).

## deck.gl v3.0

Release date: November, 2016

### Highlights

* New website
* Comprehensive documentation
* All Core Layers updated (API, features, performance)
* 64-bit Layers (High Precision)
* METERS projection mode (High Precision)
* Multi-Primitive Layer Support
* Composite Layer Support

### React Integration

* `DeckGL` (`DeckGLOverlay` in v2) component now requires a separate import (`import DeckGL from 'deck.gl/react'`). This allows the core deck.gl library to be imported by non-React applications without pulling in React.
* Adds `onLayerClick` and `onLayerHover` props to the `DeckGL` React component.
* The `DeckGL` component now cancels animation loop on unmount, important when repeatedly creating/destroying deck.gl components.
* The `DeckGL` component no longer manages WebGL blending modes, as this is better done directly by layers.

### Layers

* All layers now support accessors, removing the need for applications to transform data before passing it to deck.gl.
* Layer props and accessors now always expect arrays (e.g. colors are expected as `[r,g,b,a]` instead of `{r,g,b,a}` etc).
* line widths now takes device pixel ratio into account for more consistent look between displays
* METERS projection mode allows specifying positions in meter offsets in addition to longitude/latitude.
* Layers now receive viewport information from the `DeckGL` component. This implies that apps no longer need to pass the `width`, `height`, `longitude`, `latitude`, `zoom`, `pitch`, `bearing` and `bearing` props to each layer. These properties only need to be passed to the `DeckGL` react component.

#### Base Layer

* `deepCompare` prop replaced with more flexible `dataComparator`

#### ArcLayer

* Specify separate start and end color for each arc.
* Renders smoother arcs, especially for bottom arc segments close to map
* Fixes flickering last segments

#### ScatterplotLayer

* Adds drawOutline option.

##### ScreenGridLayer

* New name for deck.gl v2 GridLayer
* Now have accessors (getPosition, getWeight)
* Custom color ramps (minColor, maxColor)

##### ChoroplethLayer

* Now renders MultiPolygons and Polygons with holes

##### HexagonLayer (REMOVED)

* The v2 HexagonLayer has not yet been ported to v3.

#### 64bit layers

A set of new high precision layers that support extreme zoom levels

##### ArcLayer64 (NEW)

##### ChoroplethLayer64 (NEW)

##### ScatterplotLayer64 (NEW)

##### 64 bit ExtrudedChoroplethLayer (NEW)

* Great for rendering 3D buildings on top of maps
* Includes a basic shading model

##### GeoJsonLayer (NEW, EXPERIMENTAL)

* Initial composite layer, only Polygons for now.

#### Sample Layers

Sample layers now available through `import 'deck.gl/samples';`

### Changes affecting Custom Layers

#### Streamlined life cycle methods

* The Layer life cycle methods are now optimized for deck.gl's needs and no longer try to mimic React.
* Limited compatibility with deck.gl v2 is provided but it is strongly recommended to update layers to the new methods

#### Optimizations

* `Uint8Array` encoding is now supported for color and picking color attributes, which provides significant GPU memory savings.

#### GLSL package manager and modules

* All layers now use `assembleShaders` to inject GLSL packages and platform
  fixes
* GLSL `project` package
  + GLSL `fp64` emulated double precision floating point package
  + GLSL `fp32` package - 32bit improved precision library
    - Adds high precision version of trigonometry functions and `tan`
    - Especially for Intel GPUs

## deck.gl v2

Release date: May 2016

### Highlights

* 3D Perspective Mode
* Performance: Huge under the hood refactor of layer update logic
* Automatic attribute management (`AttributeManager` class)
* Linux fixes - deck.gl and luma.gl now work on Linux.
* Adopts [luma.gl](https://github.com/visgl/luma.gl) as default WebGL framework.
* Retina display support
* Support for disabling mercator project (experimental)

### React Integration

* Ability to specify canvas ID and customize styles

### Layers

* Added data deep comparison support

#### ScatterplotLayer

* Add per point radius support for the scatterplot-layer
* Added per point color support for the scatterplot-layer
* Fixed primitive distortion bug

#### LineLayer (NEW)

## deck.gl v1

Original release date: December 2015

Initial open-source version of deck.gl, with five sample layers.

