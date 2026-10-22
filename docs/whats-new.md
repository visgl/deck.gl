# What's New

This page contains highlights of each deck.gl release. Also check our [vis.gl blog](https://medium.com/vis-gl) for news about new releases and features in deck.gl.

## deck.gl v9.4[​](#deckgl-v94 "Direct link to deck.gl v9.4")

Release date: September 5, 2026

deck.gl v9.4 is expected to be the final release in the v9 series. It brings together a collection of completed improvements focused on performance, stability, and usability, and is intended to be a highly compatible, highly recommended upgrade for all v9 applications.

Looking ahead, deck.gl v10 is expected to introduce larger architectural changes, including luma.gl v10, loaders.gl v5, and support for more advanced binary data pipelines and GPU rendering techniques. As a result, v10 will likely be a more substantial and intentional upgrade for applications than this release.

### WebGPU[​](#webgpu "Direct link to WebGPU")

deck.gl v9.4 substantially expands its experimental WebGPU support. All layers in the official layer catalog now support WebGPU, including [`MVTLayer`](https://deck.gl/docs/api-reference/geo-layers/mvt-layer.md), with tile clipping for its circle, path, and polygon sublayers, and [`Tile3DLayer`](https://deck.gl/docs/api-reference/geo-layers/tile-3d-layer.md), with support for point-cloud, glTF scenegraph, and I3S mesh tile content. Big improvements are made to core WebGPU attribute-buffer assembly, render pass management, and device switching. Render tests are used to ensure WebGL-WebGPU parity covering most common use cases.

The WebGPU-capable code is included by default so that adopting WebGPU does not require changing application imports. Applications that only target WebGL2 can instead configure their bundler to resolve the custom export condition `visgl:webgl-only`; supported deck.gl packages will then use alternate builds with WebGPU branches and WGSL shader sources removed, reducing their contribution to bundle size without changing the imported APIs. See [Building Apps](https://deck.gl/docs/developer-guide/building-apps.md#bundle-size) for details.

WebGPU support remains experimental and is not yet recommended for production. Some layers and features remain unavailable or only partially supported. See the [WebGPU guide](https://deck.gl/docs/developer-guide/webgpu.md) for setup instructions, current limitations, and the complete compatibility matrix.

### Views and Controllers[​](#views-and-controllers "Direct link to Views and Controllers")

|                                                                                                                              |                                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| ![](https://github.com/visgl/deck.gl-data/blob/master/images/whats-new/globe-tilt.gif?raw=true)*GlobeView pitch and bearing* | ![](https://github.com/visgl/deck.gl-data/blob/master/images/whats-new/rubberband.gif?raw=true)*Controller maxBounds + rubberBand* |

deck.gl v9.4 brings numerous view and controller improvements on top of the substantial changes in v9.3.

**GlobeView compatibility and UX**

[`GlobeView`](https://deck.gl/docs/api-reference/core/globe-view.md) continues to mature, including significantly expanded layer compatibility:

* [TerrainLayer](https://deck.gl/docs/api-reference/geo-layers/terrain-layer.md) now renders correctly on `GlobeView`, producing properly projected terrain meshes on the globe.
* [TerrainExtension](https://deck.gl/docs/api-reference/extensions/terrain-extension.md) now supports `GlobeView`, enabling terrain-draped layers on the globe.
* [Tile3DLayer](https://deck.gl/docs/api-reference/geo-layers/tile-3d-layer.md) renders correctly on `GlobeView`.
* The [`project` shader module](https://deck.gl/docs/api-reference/core/project.md#project_common_position_to_flat) adds `project_common_position_to_flat` and its wrapped and continuous variants, so extensions and custom layers can test bounds or sample textures computed in flat Web Mercator space while rendering on the globe.
* [`PathStyleExtension`](https://deck.gl/docs/api-reference/extensions/path-style-extension.md) dashes render the same in `GlobeView` as in `MapView`.
* [`GlobeController`](https://deck.gl/docs/api-reference/core/globe-controller.md) now supports bearing and pitch, including shift/right-click drag and multi-touch rotation, as well as inertial spinning after a fling gesture.

**View management**

* [Views](https://deck.gl/docs/api-reference/core/view.md#parameters) now support a `parameters` prop for per-view GPU draw state overrides. `GlobeView` uses this to enable back-face culling by default, and applications can override it with:

  ```
  new GlobeView({

    parameters: {

      cullMode: 'none'

    }

  });
  ```

* A new [`ViewLayout`](https://deck.gl/docs/api-reference/widgets/view-layout.md) system makes responsive and dynamic multi-view applications easier to build. Applications define nested, relative view layouts in a simple declarative syntax. The `buildViewsFromViewLayout()` helper then automatically regenerates `View` instances from the specified view layout tree based on browser window size, splitter widget positions, etc.

**Multi-canvas support**

New experimental multi-canvas foundations allow integrations to associate each `View` with a presentation canvas using `canvasId`. `Deck.getEventManager(viewId)` resolves the event manager responsible for a particular view, enabling view-scoped interaction across multiple canvases. This API is experimental and may change as multi-canvas support evolves.

**New controller options**

* All [controllers](https://deck.gl/docs/api-reference/core/controller.md) now support `doubleClickDragZoom` for continuous zooming by double-clicking or double-tapping and dragging vertically.
* The new `trackpadGesture` option enables native trackpad gestures, including two-finger pan, pinch-to-zoom, and rotate where supported.
* The new `zoomAround` option chooses whether pointer-based zoom interactions keep the pointer location or the viewport center fixed.
* The new `maxBoundsPadding` option fits `maxBounds` within a padded or asymmetrically positioned viewport region, with support for pixels, percentages, and CSS-style layout expressions.
* `OrthographicController` and `MapController` now support `rubberBand`, allowing pan and zoom interactions to temporarily overshoot their constraints before easing back on release.

### @deck.gl/maplibre[​](#deckglmaplibre "Direct link to @deck.gl/maplibre")

New [`@deck.gl/maplibre`](https://deck.gl/docs/api-reference/maplibre/overview.md) module is forked from the former `@deck.gl/mapbox` module. It provides support for overlaid and interleaved rendering with MapLibre GL JS v4, v5, and the recently released v6.

### Layers and Extensions[​](#layers-and-extensions "Direct link to Layers and Extensions")

|                                                                                                                          |                                                                                                                                 |                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| ![](https://github.com/visgl/deck.gl-data/blob/master/images/whats-new/antialiasing.png?raw=true)*Analytic antialiasing* | ![](https://github.com/visgl/deck.gl-data/blob/master/images/whats-new/path-style.png?raw=true)*PathStyleExtension dash config* | ![](https://github.com/visgl/deck.gl-data/blob/master/images/whats-new/fill-pattern.png?raw=true)*FillStyleExtension procedural patterns* |

* Picking performance has been optimized. Most layers now use shader builtins (`instance_index`) instead of picking color buffers, reducing GPU memory usage and layer initialization costs.
* [TileLayer](https://deck.gl/docs/api-reference/geo-layers/tile-layer.md) now prioritizes tile requests closest to the viewport center, improving perceived load times during panning and zooming.
* [TerrainLayer](https://deck.gl/docs/api-reference/geo-layers/terrain-layer.md) now correctly passes `zoomOffset` through to its child `TileLayer`.
* [ScatterplotLayer](https://deck.gl/docs/api-reference/layers/scatterplot-layer.md#getpixeloffset) adds a transition-enabled `getPixelOffset` accessor for positioning circles in screen space.
* [`PathLayer`](https://deck.gl/docs/api-reference/layers/path-layer.md), [`LineLayer`](https://deck.gl/docs/api-reference/layers/line-layer.md), [`ArcLayer`](https://deck.gl/docs/api-reference/layers/arc-layer.md), and [`PointCloudLayer`](https://deck.gl/docs/api-reference/layers/point-cloud-layer.md) now use analytic antialiasing for smooth edges without requiring MSAA. Composite layers that render paths, including `GeoJsonLayer`, `PolygonLayer`, and the geospatial cell layers, forward the new `antialiasing` prop to their path sublayers.
* [`PathStyleExtension`](https://deck.gl/docs/api-reference/extensions/path-style-extension.md) adds `dashMode` to choose whether a dash pattern restarts at each segment or runs continuously across a complete path, and `dashUnits` to express dash lengths in stroke widths, pixels, meters, or common units. Dash rendering is also more robust for dense and 3D paths, billboarded or offset strokes, long paths, and subpixel patterns.
* [`FillStyleExtension`](https://deck.gl/docs/api-reference/extensions/fill-style-extension.md) can generate hatch, cross-hatch, and dot patterns directly in the fragment shader without a texture atlas. It also adds `fillPatternSizeUnits` for ground- or screen-relative pattern sizing and `getFillPatternBackgroundColor` for compositing patterns over a per-object background color.

### Other Improvements[​](#other-improvements "Direct link to Other Improvements")

* [OrthographicView](https://deck.gl/docs/api-reference/core/orthographic-view.md#common-size-resolution) allows `zoom` to control the size of geometry in common units independently from positional `zoomX` and `zoomY`.
* [ZoomWidget](https://deck.gl/docs/api-reference/widgets/zoom-widget.md) now supports a `zoomStep` prop to configure the zoom level delta applied by each button click.
* Built-in widget buttons now use [styled, customizable tooltips](https://deck.gl/docs/api-reference/widgets/tooltips.md) that support text, HTML content, theming, and per-button disabling.
* Built-in widget icons now use Google Material Symbols, with a new [`--icon-size`](https://deck.gl/docs/api-reference/widgets/styling.md#size) theme variable for consistent sizing.
* [ScrollbarWidget](https://deck.gl/docs/api-reference/widgets/scrollbar-widget.md) now supports `contentBoundsPadding` to align its scroll range with padded content bounds. When explicit values are omitted, `contentBounds` and `contentBoundsPadding` fall back to the target view controller's `maxBounds` and `maxBoundsPadding`, respectively.
* `@deck.gl/arcgis`'s [`DeckRenderer`](https://deck.gl/docs/api-reference/arcgis/deck-renderer.md) now integrates with ArcGIS `SceneView` through the modern [`RenderNode`](https://developers.arcgis.com/javascript/latest/api-reference/esri-views-3d-webgl-RenderNode.html) API instead of the deprecated `externalRenderers` API.

### pydeck[​](#pydeck "Direct link to pydeck")

deck.gl's Python bindings gain first-class support for [layer extensions](https://deck.gl/docs/api-reference/extensions/overview.md), available through a typed [`pydeck.Extension`](https://deckgl.readthedocs.io/en/latest/extension.html) wrapper, as well as lighting and post-processing effects through `pydeck.Effect`.

The Jupyter integration now recognizes the canonical `GlobeView` type name while retaining `_GlobeView` as a backwards-compatible alias.

pydeck documents [multi-view layouts](https://deckgl.readthedocs.io/en/latest/view.html) and the [`SplitterWidget`](https://deckgl.readthedocs.io/en/latest/widget.html), with gallery examples for both. `Deck` sends a top-level `controller` (new argument, default `True`) and leaves `views` to deck.gl, so widgets such as `SplitterWidget` can manage them.

```
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

```
import pydeck as pdk



pdk.settings.register_library("MyLayers", "https://example.com/my-layers.mjs", module=True)

layer = pdk.Layer("MyLayer", data=df)  # MyLayers exports MyLayer
```

## deck.gl v9.3[​](#deckgl-v93 "Direct link to deck.gl v9.3")

Release date: April 13, 2026

### Widgets[​](#widgets "Direct link to Widgets")

|                                                                                                         |                                                                                                               |                                                                                                                 |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| ![](https://github.com/visgl/deck.gl-data/blob/master/images/whats-new/popup.jpg?raw=true)*PopupWidget* | ![](https://github.com/visgl/deck.gl-data/blob/master/images/whats-new/splitter.gif?raw=true)*SplitterWidget* | ![](https://github.com/visgl/deck.gl-data/blob/master/images/whats-new/scrollbar.gif?raw=true)*ScrollbarWidget* |

Many experimental widgets got a design overhaul in v9.3, along with new additions to the catalog.

* The [InfoWidget](https://deck.gl/docs/api-reference/widgets/info-widget.md), [ContextMenuWidget](https://deck.gl/docs/api-reference/widgets/context-menu-widget.md) and the new [PopupWidget](https://deck.gl/docs/api-reference/widgets/popup-widget.md) now use [popper](http://floating-ui.com/) under the hood to provide smarter UI placement that responds to window size, content size and scroll position.
* New generic-purpose controls rendered by [IconWidget](https://deck.gl/docs/api-reference/widgets/icon-widget.md), [ToggleWidget](https://deck.gl/docs/api-reference/widgets/toggle-widget.md) and [SelectorWidget](https://deck.gl/docs/api-reference/widgets/selector-widget.md) cover many common use cases that would otherwise require implementing your own custom widget.
* [SplitterWidget](https://deck.gl/docs/api-reference/widgets/splitter-widget.md) now supports arbitrary division of the canvas, as well as a cleaner API that no longer requires any custom viewport calculation.
* New [ScrollbarWidget](https://deck.gl/docs/api-reference/widgets/scrollbar-widget.md) lets users get around a large orthographic canvas just like scrolling an HTML page.
* [TimelineWidget](https://deck.gl/docs/api-reference/widgets/timeline-widget.md) has a fresh new look that is entirely customizable via CSS variables.
* `FpsWidget` is merged into [StatsWidget](https://deck.gl/docs/api-reference/widgets/stats-widget.md) as a unified, sleek-looking debugging surface.

Widgets now support **controlled and uncontrolled component patterns**, enabling app developers to control, observe, and intercept user interactions. Widgets with internal state — such as [TimelineWidget](https://deck.gl/docs/api-reference/widgets/timeline-widget.md), [StatsWidget](https://deck.gl/docs/api-reference/widgets/stats-widget.md), and [ThemeWidget](https://deck.gl/docs/api-reference/widgets/theme-widget.md) — accept controlled props (e.g. `time`, `playing`, `expanded`, `themeMode`) alongside `initial*` props for uncontrolled defaults. All widgets now fire state change callbacks (`onTimeChange`, `onPlayingChange`, `onExpandedChange`, `onThemeModeChange`, `onFullscreenChange`, `onLoadingChange`, `onReset`, `onZoom`, `onGeocode`, `onChange`) for common integration patterns.

Aside from the above, all widgets also received the following improvements:

* You can pass a `_container` prop to a widget to render it into any parent container.
* All widgets now have React wrappers, exported from `@deck.gl/react`.
* All widget documentation pages now have live demos and easy-to-follow code samples.
* A bug was fixed where widgets used with the `DeckGL` React component did not block pointer interaction with the canvas underneath.

### Views and Controllers[​](#views-and-controllers-1 "Direct link to Views and Controllers")

deck.gl v9.3 is a substantial step forward in 3D navigation and rendering support. See the new [Using with 3D Tiles](https://deck.gl/docs/developer-guide/base-maps/using-with-3d-tiles.md) guide for a complete walkthrough.

New `pickable: '3d'` [option](https://deck.gl/docs/api-reference/core/layer.md) on all layers enables depth picking, returning actual 3D coordinates on picked geometry.

View layout props (`x`, `y`, `width`, `height`, and padding) now accept CSS-style expressions such as `calc(50% - 10px)` so you can mix relative percentages with fixed pixel offsets when arranging multi-view layouts.

Class-specific improvements:

* New [TerrainController](https://deck.gl/docs/api-reference/core/terrain-controller.md) - A terrain-aware controller that automatically adjusts camera elevation to follow 3D tilesets and elevated terrain.
* [MapController](https://deck.gl/docs/api-reference/core/map-controller.md) - New `rotationPivot: '3d'` option rotates around the object under the pointer, for more natural interaction with terrain and 3D tiles.
* [OrbitController](https://deck.gl/docs/api-reference/core/orbit-controller.md) now uses 3D picking to determine zoom and pan anchors, providing more intuitive navigation around 3D content.
* All controllers - New `maxBounds` option constrains the camera within a (2D or 3D) bounding box, preventing users from navigating outside of the content area.
* [GlobeController](https://deck.gl/docs/api-reference/core/globe-controller.md) - Major bug fixes and improved stability.
* [OrthographicView](https://deck.gl/docs/api-reference/core/orthographic-view.md) is moving away from 2d-array zoom and adds per-axis `zoom*`, `minZoom*`, `maxZoom*` props.

### Layers[​](#layers "Direct link to Layers")

![TextLayer clipping feature](https://github.com/visgl/deck.gl-data/blob/master/images/whats-new/text-clipping.gif?raw=true)

* [TextLayer](https://deck.gl/docs/api-reference/layers/text-layer.md) now supports per-object clipping box; and making text "sticky" when its container is partially off-screen. See a demo with this [new example](https://deck.gl/examples/text-layer-clipping).
* [TileLayer](https://deck.gl/docs/api-reference/geo-layers/tile-layer.md) adds new `visibleMinZoom` and `visibleMaxZoom` props to control the zoom range at which tiles are drawn, independent of the zoom range at which data is loaded.
* Improvements to [Tile3DLayer](https://deck.gl/docs/api-reference/geo-layers/tile-3d-layer.md) including better performance and tile tracking.
* WebGPU now materializes constant layer attributes into full buffers through `AttributeManager`, improving compatibility for layers that rely on constant accessors.

### Extensions[​](#extensions "Direct link to Extensions")

* [PathStyleExtension](https://deck.gl/docs/api-reference/extensions/path-style-extension.md) now supports dashed strokes on [ScatterplotLayer](https://deck.gl/docs/api-reference/layers/scatterplot-layer.md) and [TextLayer](https://deck.gl/docs/api-reference/layers/text-layer.md) backgrounds, in addition to PathLayer. See [#9864](https://github.com/visgl/deck.gl/issues/9864).

### @deck.gl/mapbox[​](#deckglmapbox "Direct link to @deck.gl/mapbox")

* In interleaved mode, `MapboxOverlay` now always renders layers in groups by `beforeId` or `slot`. This enables cross-layer extension handling (e.g. MaskExtension, CollisionFilterExtension) by default, without needing the previously experimental `_renderLayersInGroups` prop.
* Multi-view setups now work consistently across overlaid and interleaved modes.
* Basemap now works correctly when canvas has zero dimensions.
* Heatmap layer now blends correctly in interleaved mode.

### @deck.gl/google-maps[​](#deckglgoogle-maps "Direct link to @deck.gl/google-maps")

* Overlaid layers now render at the correct DOM position when `interleaved: false`.

## deck.gl v9.2[​](#deckgl-v92 "Direct link to deck.gl v9.2")

Release date: October 7, 2025

|                                                                                                   |                                                                                                     |                                                                                                                  |
| ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| ![](https://github.com/user-attachments/assets/df179a80-c82e-4677-87aa-52388a3a64cb)*New widgets* | ![](https://github.com/user-attachments/assets/dd797761-28bb-4b9a-927c-ab56bcafb8c3)*WebGPU layers* | ![](https://github.com/user-attachments/assets/b7168647-d318-486e-bf34-747b1ff8865a)*Interleaved postprocessing* |

### Widgets[​](#widgets-1 "Direct link to Widgets")

* A suite of new widgets have been added to the [`@deck.gl/widgets`](https://deck.gl/docs/api-reference/widgets/overview.md) module:

  <!-- -->

  * [ContextMenuWidget](https://deck.gl/docs/api-reference/widgets/context-menu-widget.md)
  * FpsWidget
  * [GeocoderWidget](https://deck.gl/docs/api-reference/widgets/geocoder-widget.md)
  * [GimbalWidget](https://deck.gl/docs/api-reference/widgets/gimbal-widget.md)
  * [InfoWidget](https://deck.gl/docs/api-reference/widgets/info-widget.md)
  * [LoadingWidget](https://deck.gl/docs/api-reference/widgets/loading-widget.md)
  * [ResetViewWidget](https://deck.gl/docs/api-reference/widgets/reset-view-widget.md)
  * [ScaleWidget](https://deck.gl/docs/api-reference/widgets/scale-widget.md)
  * [ScreenshotWidget](https://deck.gl/docs/api-reference/widgets/screenshot-widget.md)
  * [SplitterWidget](https://deck.gl/docs/api-reference/widgets/splitter-widget.md)
  * [StatsWidget](https://deck.gl/docs/api-reference/widgets/stats-widget.md)
  * [ThemeWidget](https://deck.gl/docs/api-reference/widgets/theme-widget.md)
  * [TimelineWidget](https://deck.gl/docs/api-reference/widgets/timeline-widget.md)
  * ViewSelectorWidget

* Pre-wrapped React components - deck.gl widgets are available via the [`@deck.gl/react`](https://deck.gl/docs/api-reference/react/overview.md) package

* Custom widgets in pydeck - via the `custom_libraries` parameter, Python users can integrate custom deck.gl widgets seamlessly

* Documentation for styling and custom themes - see [Styling Widgets](https://deck.gl/docs/api-reference/widgets/styling.md)

### WebGPU Early Preview[​](#webgpu-early-preview "Direct link to WebGPU Early Preview")

A few deck.gl layers can now be run on WebGPU in the website, by selecting the `WebGPU` tab:

* [LineLayer](https://deck.gl/examples/line-layer)
* [PointCloudLayer](https://deck.gl/examples/point-cloud-layer)
* [ScatterplotLayer](https://deck.gl/examples/scatterplot-layer)

See documentation about how to [test WebGPU support](https://deck.gl/docs/developer-guide/webgpu.md).

### Core[​](#core "Direct link to Core")

* [`PostProcessEffect`](https://deck.gl/docs/api-reference/core/post-process-effect.md) now works correctly in interleaved mode
* [`View.clone()`](https://deck.gl/docs/api-reference/core/view.md#clone) - New method that simplifies creating new Views with modified props, similar to `Layer.clone()`
* Multi-view clear support - Enhanced support for controlling clear color, depth, and stencil buffers across multiple views, via [`clear`](https://deck.gl/docs/api-reference/core/view.md#clear), [`clearColor`](https://deck.gl/docs/api-reference/core/view.md#clearcolor), [`clearDepth`](https://deck.gl/docs/api-reference/core/view.md#cleardepth), [`clearStencil`](https://deck.gl/docs/api-reference/core/view.md#clearstencil) props

### Layers[​](#layers-1 "Direct link to Layers")

* New [A5Layer](https://deck.gl/docs/api-reference/geo-layers/a5-layer.md) - renders cells from the [A5](https://a5geo.org) geospatial indexing system. See new [Global Grid Layers](https://deck.gl/examples/global-grids) example
* IconLayer - new [`sizeBasis`](https://deck.gl/docs/api-reference/layers/icon-layer.md#sizebasis) prop
* TextLayer - new [`backgroundBorderRadius`](https://deck.gl/docs/api-reference/layers/text-layer.md#backgroundborderradius) prop

### CARTO[​](#carto "Direct link to CARTO")

* [ClusterTileLayer](https://deck.gl/docs/api-reference/carto/cluster-tile-layer.md) and [HeatmapTileLayer](https://deck.gl/docs/api-reference/carto/heatmap-tile-layer.md) support H3 data
* [VectorTileLayer](https://deck.gl/docs/api-reference/carto/vector-tile-layer.md) supports labels for line & polygon data, via new [`autoLabels`](https://deck.gl/docs/api-reference/carto/vector-tile-layer.md#autolabels) prop

### Mapbox[​](#mapbox "Direct link to Mapbox")

* [`MapboxOverlay`](https://deck.gl/docs/api-reference/mapbox/mapbox-overlay.md#constructor) - When using `interleaved: true` and a Mapbox v3 Standard style, you may now control the ordering of layers by adding the [`slot`](https://docs.mapbox.com/mapbox-gl-js/guides/migrate/#layer-slots) prop to a layer.

## deck.gl v9.1[​](#deckgl-v91 "Direct link to deck.gl v9.1")

Release date: Jan 21, 2025

|                                                                                                           |                                                                                                         |                                                                                                          |                                                                                  |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| ![](https://github.com/user-attachments/assets/e522d961-600a-4405-9f09-c247b42f7e62)*Maplibre Globe View* | ![](https://github.com/visgl/deck.gl/assets/453755/f1a10ffd-d403-4ea5-958d-3bc8fea412fe)*React Widgets* | ![](https://github.com/user-attachments/assets/a3cc7c70-10a5-40c1-a5a8-d5d8b2d165ba)*Aggregation Layers* | ![](https://www.w3.org/2023/02/webgpu-logos/webgpu-notext.svg)*WebGPU readiness* |

### Globe View ♥ MapLibre[​](#globe-view--maplibre "Direct link to Globe View ♥ MapLibre")

deck.gl now works seamlessly with the MapLibre v5 [globe view](https://maplibre.org/maplibre-gl-js/docs/examples/globe-vector-tiles/) for all three [Basemap Integration Modes](https://deck.gl/docs/developer-guide/base-maps/using-with-maplibre.md#integration-modes). The experimental [`GlobeView`](https://deck.gl/docs/api-reference/core/globe-view.md) has been updated to match MapLibre's camera at the same zoom level. [`MapboxOverlay`](https://deck.gl/docs/api-reference/mapbox/mapbox-overlay.md) works with maplibre-gl globe map without additional configuration.

*The Maplibre globe view integration was done in close collaboration with the MapLibre team.*

### React Widgets[​](#react-widgets "Direct link to React Widgets")

deck.gl v9.0 added support for widgets, with v9.1 users can now create React components with the same level of deep deck.gl integration.

* All the official deck.gl widgets can now be easily wrapped into React components with the new [`useWidget`](https://deck.gl/docs/api-reference/react/use-widget.md) hook.
* Pre-wrapped React components for existing widget are available from the [`@deck.gl/react`](https://deck.gl/docs/api-reference/react/overview.md) package.
* To try it out, check out our [React getting started example](https://github.com/visgl/deck.gl/tree/9.4-release/examples/get-started/react/basic) for using widgets in React.

##### Widgets Developer Guide[​](#widgets-developer-guide "Direct link to Widgets Developer Guide")

deck.gl v9.1 provides the ability to for applications to write React component that integrate with deck.gl using the widget interface.

### Aggregation layers upgrade[​](#aggregation-layers-upgrade "Direct link to Aggregation layers upgrade")

v9.1 restores the GPU aggregation functionality that was temporarily disabled in v9.0. It brings a major refactor of the aggregation layers, with full TypeScript and unit test coverage. A new generic `Aggregator` interface makes it much easier to support custom aggregation operations. The current implementations of this interface include `CPUAggregator` and `WebGLAggregator`, with `WebGPUAggregator` on the roadmap.

Highlights:

* `GridLayer` now utilized both CPU and GPU aggregators in the same code path.
* `HexagonLayer` now supports GPU aggregation. Enable with `gpuAggregation: true`.
* `GridLayer` and `HexagonLayer` can use `*ScaleType`, `*UpperPercentile`, `*LowerPercentile`, `onSet*Domain` props along with GPU aggregation.
* `GridLayer` and `HexagonLayer` now support non-geospatial views.
* New picking info types for each aggregation layer.

See [upgrade guide](https://deck.gl/docs/upgrade-guide.md) for more details.

### WebGPU readiness[​](#webgpu-readiness "Direct link to WebGPU readiness")

* luma.gl has been updated to v9.1 which focuses on improved WebGPU support. For details see [release notes](https://luma.gl/docs/whats-new#version-91-in-development) and [upgrade-guide](https://luma.gl/docs/upgrade-guide#upgrading-to-v91).
* As part of WebGPU readiness, all shader code in deck.gl v9.1 (layers and extensions) have been migrated to use uniform buffers instead of WebGL1 style uniforms.
* For most users this change should be transparent, but custom layers that add `uniforms` should [start migrating asap](https://deck.gl/docs/upgrade-guide.md) as WebGL1 style uniform support is being actively phased out.

## deck.gl v9.0[​](#deckgl-v90 "Direct link to deck.gl v9.0")

Release date: March 21, 2024

|                                                                        |                                                                                                                                        |                                                                                                   |                                                                                                              |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| ![](https://www.w3.org/2023/02/webgpu-logos/webgpu-notext.svg)*WebGPU* | ![](https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Typescript_logo_2020.svg/480px-Typescript_logo_2020.svg.png)*Typescript* | ![](https://github.com/visgl/deck.gl/assets/453755/f1a10ffd-d403-4ea5-958d-3bc8fea412fe)*Widgets* | ![](https://github.com/visgl/deck.gl/assets/453755/e05863e2-777f-46fa-a04a-1bf4aa0625e2)*Category filtering* |

### WebGPU enablement[​](#webgpu-enablement "Direct link to WebGPU enablement")

deck.gl v9 adopts the luma.gl v9 API. This will enable deck.gl to run on WebGPU in future releases, however it does cause some unavoidable breaking changes.

WebGPU is the next generation API for accessing GPU capabilities on the web. Unlike the incremental transition from WebGL to WebGL2, the shift to WebGPU completely changes the way the browser will interact with the GPU. The new (v9) version of [luma.gl](https://luma.gl/) has been rewritten to adopt a WebGPU-compatible interface, while maintaining full support for WebGL2. deck.gl v9 has been extensively refactored on top of the new luma.gl API, but the deck.gl API itself includes minimal changes. This should allow applications to smoothly update to the latest version.

While the v9 luma.gl release is feature-complete and well-tested for the WebGL2 adapter, work is still required to provide full WebGPU support. The team is planning to follow the v9 releases soon with v9.1, which will provide the WebGPU implementation in luma.gl along with the complimentary updates in deck.gl.

### Development experience[​](#development-experience "Direct link to Development experience")

Typescript types, which were provided as an opt-in in 8.9, has now been enabled by default in v9.

|                                                                                          |
| ---------------------------------------------------------------------------------------- |
| ![](https://github.com/visgl/deck.gl/assets/453755/d92fb611-8e86-428a-a524-e9cc313c7252) |

All the deck.gl packages are now published as fully ESM-compatible.

### Improved FirstPersonController[​](#improved-firstpersoncontroller "Direct link to Improved FirstPersonController")

The behavior of the [FirstPersonController](https://deck.gl/docs/api-reference/core/first-person-controller.md) has been modified to more accurately reflect the motion of a human, making it more intuitive to navigate a 3D space. In addition, panning is supported.

|                                                                                           |
| ----------------------------------------------------------------------------------------- |
| ![](https://github.com/visgl/deck.gl/assets/2461547/ea476da0-6943-4a08-9c3d-aa86f13629a8) |

### Category filtering in DataFilterExtension[​](#category-filtering-in-datafilterextension "Direct link to Category filtering in DataFilterExtension")

The [DataFilterExtension](https://deck.gl/docs/api-reference/extensions/data-filter-extension.md) has been enhanced to support filtering based on categories. A new accessor, [getFilterCategory](https://deck.gl/docs/api-reference/extensions/data-filter-extension.md), is added which allows filtering using the new [filterCategories](https://deck.gl/docs/api-reference/extensions/data-filter-extension.md#filtercategories).

### `@deck.gl/widgets` (New module)[​](#deckglwidgets-new-module "Direct link to deckglwidgets-new-module")

You can now add UI components to deck.gl. This new module lets apps add controls and information that can interact with deck.gl's cameras and layers for a better user experience. To get started, check out [the example](https://github.com/visgl/deck.gl/tree/9.4-release/examples/get-started/pure-js/widgets) and [the documentation](https://deck.gl/docs/api-reference/widgets/overview.md).

This module initially contains the following widgets:

* [FullscreenWidget](https://deck.gl/docs/api-reference/widgets/fullscreen-widget.md)
* [ZoomWidget](https://deck.gl/docs/api-reference/widgets/zoom-widget.md)
* [CompassWidget](https://deck.gl/docs/api-reference/widgets/compass-widget.md)

You can also create your own widget by implementing the [`Widget`](https://deck.gl/docs/api-reference/core/widget.md) interface.

### `@deck.gl/carto`[​](#deckglcarto "Direct link to deckglcarto")

* New CARTO module architecture: Sources and Layers replace the CartoLayer. Read more in the [Upgrade Guide](https://deck.gl/docs/upgrade-guide.md#deckglcarto).

* Public preview for Boundary Sources (experimental): easily aggregate large data volumes aggregated into common or custom geographic boundaries, such as postal codes. Learn more about Boundaries in the CARTO [documentation](https://docs.carto.com/carto-for-developers/guides/use-boundaries-in-your-application).

### Known Limitations[​](#known-limitations "Direct link to Known Limitations")

The following issues are known and will be resolved in a v9.0 patch release:

* `@deck.gl/aggregation-layers` (`ScreenGridLayer`, ...) performance - aggregation layers temporarily use CPU fallbacks which are less performant.

## deck.gl v8.9[​](#deckgl-v89 "Direct link to deck.gl v8.9")

Release date: March 9, 2023

|                                                                                                                                           |                                                                                                                          |                                                                                                          |
| ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| ![](https://github.com/visgl/deck.gl-data/blob/master/images/whats-new/collision-filter-extension.gif?raw=true)*CollisionFilterExtension* | ![](https://github.com/visgl/deck.gl-data/blob/master/images/whats-new/terrain-extension.gif?raw=true)*TerrainExtension* | ![](https://github.com/visgl/deck.gl-data/blob/master/images/whats-new/wms-layer.gif?raw=true)*WMSLayer* |

### Extensions[​](#extensions-1 "Direct link to Extensions")

Two new extensions are added in the 8.9 release: `CollisionFilterExtension` and `TerrainExtension`.

The `CollisionFilterExtension` allows layers to hide features which overlap with other features. An example is a dense `ScatterplotLayer` with many points which overlap: by using this extension points that collide with others are hidden such that only one of the colliding points is shown. The collisions are computed on the GPU in realtime, allowing the collisions to be updated smoothly on every frame. Visit the [documentation](https://deck.gl/docs/api-reference/extensions/collision-filter-extension.md) and [example](https://deck.gl/examples/text-layer) to get started.

The experimental `TerrainExtension` renders otherwise 2D data along a 3D surface. For example, a GeoJSON of city streets and building footprints can be overlaid on top of a [elevation model](https://en.wikipedia.org/wiki/Digital_elevation_model). It is useful when viewing a mixture of 2D and 3D data sources. The re-positioning of geometries is performed on the GPU. Visit the [documentation](https://deck.gl/docs/api-reference/extensions/terrain-extension.md) and [example](https://deck.gl/examples/terrain-extension) to get started.

In addition, `MaskExtension` now supports `FirstPersonView`, and supports a new `maskInverted` prop.

### WMSLayer[​](#wmslayer "Direct link to WMSLayer")

The new experimental [`WMSLayer`](https://deck.gl/docs/api-reference/geo-layers/wms-layer.md) simplifies connection to WMS and similar map image services. In contrast to the `TileLayer` which loads many small image tiles, the `WMSLayer` loads a single image that covers the entire viewport in one single request, and updates the image by performing additional requests when the viewport changes.

### Other Enhancements[​](#other-enhancements "Direct link to Other Enhancements")

* [MapLibre GL](https://maplibre.org/) basemap is now supported out-of-the-box by the [scripting interface](https://deck.gl/docs/api-reference/core/deckgl.md#map).
* `BitmapLayer` now mixes translucent pixels correctly (Note: [breaking change](https://deck.gl/docs/upgrade-guide.md))
* `TextLayer` handles text outlines better in sdf mode. Outlines are no longer clipped and responds to `outlineWidth` as expected.
* `TextLayer`'s `maxWidth` is changed to use a more intuitive unit. See upgrade guide for details.
* `IconLayer` when used with auto packing preserves the aspect ratio of icons.
* `SolidPolygonLayer` and `GeoJsonLayer` add a `_full3d` prop that tesselate 3D polygons better.
* `@deck.gl/mapbox` now synchronizes camera better when the base map contains terrain.
* TypeScript: data prop now correctly typed for each layer class

### Code base upgrades[​](#code-base-upgrades "Direct link to Code base upgrades")

In preparation for the 8.9 release, we made major upgrades to the tools that support the development and publishing of deck.gl. This allows us to iterate faster and makes it easier for first-time users to get started.

* All examples are bootstrapped with [vite](https://vitejs.dev)
* Pre-bundled scripts built with [esbuild](https://esbuild.github.io)
* Website rewritten using [Docusaurus](https://docusaurus.io)
* Tests are run with `tsnode` with ESM modules for node, and `vite` for the browser

### pydeck 0.8[​](#pydeck-08 "Direct link to pydeck 0.8")

* Compatibility with JupyterLab 3 and Google Colab
* Support `types.Function` in [JSON Converter](https://deck.gl/docs/api-reference/json/conversion-reference), `configuration` and `default_layer_attributes` in settings
* pydeck-carto: support `CartoLayer`, styling functions (`color_bins`, `color_categories`, `color continuous`), and authentication using [carto-auth](https://github.com/CartoDB/carto-auth)

## deck.gl v8.8[​](#deckgl-v88 "Direct link to deck.gl v8.8")

Release date: June, 2022

### TypeScript[​](#typescript "Direct link to TypeScript")

Official typings are now available in deck.gl for public preview. It was a tremendous effort converting the deck.gl code base into TypeScript. We did it not just for TypeScript users to easily consume this library, but also for the overall robustness and maintainability of our own code base.

In v8.x, the types will not be exposed by default to prevent any typing errors from breaking existing TypeScript applications. You can opt in to using the typed version by switching your import statements to the `@deck.gl/*/typed` endpoints. Visit [getting started with TypeScript](https://deck.gl/docs/get-started/using-with-typescript.md) to find out more.

### Custom Indexing System in TileLayer[​](#custom-indexing-system-in-tilelayer "Direct link to Custom Indexing System in TileLayer")

The [TileLayer](https://deck.gl/docs/api-reference/geo-layers/tile-layer.md) is fundamental when it comes to visualizing datasets so big that they cannot fit in the browser's memory. The idea is to only fetch and render content that is visible in the current viewport, and at the appropriate detail level. Up till now, the `TileLayer` has exclusively implemented [the OSM tile index](https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames). If you wish to use it with your dataset, you had to use an offline tool or an backend that partitioned geospatial data into OSM tiles.

Starting from v8.8, the `TileLayer` supports custom indexing systems. Applications can now supply a custom implementation of [Tileset2D](https://deck.gl/docs/api-reference/geo-layers/tile-layer.md#tileset2d) to the `TilesetClass` prop. This makes it possible to use incremental loading with other indexing systems such as [H3](https://h3geo.org/) and [S2](https://s2geometry.io/). The immediate use case is to allow the client visualization to work with any geospatial partitioning algorithm available in a database solution.

Due to this generalization, there is a breaking change affecting indexing properties (`x`, `y` and `z`) in the `TileLayer` API. See [upgrade guide](https://deck.gl/docs/upgrade-guide.md) for details.

### MapboxOverlay[​](#mapboxoverlay "Direct link to MapboxOverlay")

The `@deck.gl/mapbox` module now exports a new class [MapboxOverlay](https://deck.gl/docs/api-reference/mapbox/mapbox-overlay.md). The class implements Mapbox GL JS's [IControl](https://docs.mapbox.com/mapbox-gl-js/api/markers/#icontrol) API. When adding a `MapboxOverlay` control to an mapbox map, deck.gl layers are rendered in synchronization with the base map layers. This control supports both [overlaid and interleaved](https://deck.gl/docs/get-started/using-with-map.md) rendering modes. See the new [get started example](https://github.com/visgl/deck.gl/tree/9.4-release/examples/get-started/pure-js/maplibre/).

If you are using react-map-gl v7, this is the only solution to use deck.gl with React map control components (`Navigationcontrol`, `GeolocateControl`, etc.). See [example](https://github.com/visgl/react-map-gl/blob/master/examples/deckgl-overlay/src/app.tsx).

### `@deck.gl/carto`[​](#deckglcarto-1 "Direct link to deckglcarto-1")

CartoLayer includes native support to work with spatial indexes like [H3](https://h3geo.org) or [QuadBin](https://docs.carto.com/data-and-analysis/analytics-toolbox-for-bigquery/key-concepts/spatial-indexes#quadbin). More info [here](https://docs.carto.com/data-and-analysis/analytics-toolbox-for-bigquery/key-concepts/spatial-indexes).

### Enhancements[​](#enhancements "Direct link to Enhancements")

* Views now accept a [padding](https://deck.gl/docs/api-reference/core/view.md#padding) option to offset the focal point.
* Improved performance when there are many invisible layers
* Improved picking performance when using the `TileLayer`

## deck.gl v8.7[​](#deckgl-v87 "Direct link to deck.gl v8.7")

Release date: February 25, 2022

### MaskExtension[​](#maskextension "Direct link to MaskExtension")

The new [MaskExtension](https://deck.gl/docs/api-reference/extensions/mask-extension.md) allows layers to show/hide objects by a geofence. For example, a map may filter a list of user locations by the boundaries of a given country, or highlight part of a base map that is inside a user-drawn circle or lasso area.

![Masking Manhattan buildings](https://raw.githubusercontent.com/visgl/deck.gl-data/master/images/whats-new/mask-extension.gif)

### QuadkeyLayer[​](#quadkeylayer "Direct link to QuadkeyLayer")

The new [QuadkeyLayer](https://deck.gl/docs/api-reference/geo-layers/quadkey-layer.md) renders filled and/or stroked polygons, with geometry automatically calculated based on a quadkey (geospatial index).

### Enhancements[​](#enhancements-1 "Direct link to Enhancements")

* `TileLayer` reduced `refinementStrategy: 'no-overlap'`.
* `TileLayer` `refinementStrategy` now accepts a callback function enabling customer refinement strategies.
* `TerrainLayer` can now be used with non-geospatial views.
* `ColumnLayer` adds `flatShading` prop.
* `GlobeView` lighting in 3D layers is more consistent.
* `GoogleMapsOverlay` supports camera tilt and bearing for raster maps.
* `MVTLayer` now supports `pointType: 'text'` in `binary` mode.
* Picking with `project3D: true` now returns more accurate result in non-geospatial views.

### `@deck.gl/carto`[​](#deckglcarto-2 "Direct link to deckglcarto-2")

* **fetchMap** - [fetchMap](https://deck.gl/docs/api-reference/carto/fetch-map.md) is added to the [CARTO deck.gl submodule](https://deck.gl/docs/api-reference/carto/overview.md), streamlining the display of maps created using CARTO platform.
* **Support for large tables and Databricks**. See [CARTO documentation](https://docs.carto.com/deck-gl/getting-started/) for more details.

## deck.gl v8.6[​](#deckgl-v86 "Direct link to deck.gl v8.6")

Release date: October 11, 2021

### Interleaving deck.gl layers with Google Maps vector rendering[​](#interleaving-deckgl-layers-with-google-maps-vector-rendering "Direct link to Interleaving deck.gl layers with Google Maps vector rendering")

![Interleaving deck.gl layers with Google Maps vector buildings](https://github.com/visgl/deck.gl-data/blob/master/images/whats-new/googlemaps-scenegraph.png?raw=true)

The [GoogleMapsOverlay class](https://deck.gl/docs/api-reference/google-maps/google-maps-overlay.md) supports Google Maps' new [vector map](https://developers.google.com/maps/documentation/javascript/vector-map), providing the following advantages:

* Shared 3D space: objects drawn by the `GoogleMapsOverlay` class appear inside the Google Maps scene, correctly intersecting with 3D buildings and behind the contextual labels drawn by Google Maps.
* Tilting and rotating the view is supported.
* Rendering uses the same WebGL context as Google Maps, improving performance.

See blog posts from [Google Cloud](https://cloud.google.com/blog/products/maps-platform/richer-data-visualization-google-maps-platform-using-deckgl) and [our own](https://medium.com/vis-gl/deck-gl-v8-6-now-available-with-deeper-google-maps-support-b734719076a7) for the potentials of this feature.

Visit the new [Google Maps integration example](https://github.com/visgl/deck.gl/tree/9.4-release/examples/get-started/pure-js/google-maps) to get started.

### OrthographicView[​](#orthographicview "Direct link to OrthographicView")

It is now possible to independently control the zoom of the X and Y axes.

* The `zoom` prop of the `OrthographicView` now also supports an `[x, y]` Array to specify independent zoom levels.
* A `zoomAxis` option is added to the `OrthographicController` to restrict zooming to the X or Y axes.

### MapView[​](#mapview "Direct link to MapView")

|                                                                                                                               |                                                                                                                               |
| ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| ![](https://user-images.githubusercontent.com/2059298/129981707-46532b3b-6e84-4cc3-bec5-af083a71e5c7.gif)*Meter sizes in 8.5* | ![](https://user-images.githubusercontent.com/2059298/129981718-21ab67a0-31a5-4866-8469-f9acf37c983a.gif)*Meter sizes in 8.6* |

* Meter sizes are now correctly calculated based on the latitude of the point being drawn, whereas they previously were based on the center point of the viewport. This brings the view into full compliance with the Web Mercator projection.
* A new unit enum `common` is added for scaling geometries without the distortion of the projection method. See updated documentation about the [unit system](https://deck.gl/docs/developer-guide/coordinate-systems.md#dimensions).
* A new `projectionMatrix` option allows overriding of the matrix that would otherwise be created from the other view states.

### Layer Enhancements[​](#layer-enhancements "Direct link to Layer Enhancements")

* `CartoLayer` adds new `geoColumn` and `columns` props, enables more granular data fetching from CARTO backend.
* `ColumnLayer` and `GridCellLayer` add `radiusUnits` prop.
* `H3HexagonLayer` now supports manually forcing low-precision, high-performance rendering with `highPrecision: false`.
* `HeatmapLayer` adds `weightsTextureSize` and `debounceTimeout` props for fine-tuning performance.
* `MVTLayer` now defaults to handling geometries in binary.
* `Scatterplot` and `GeoJsonLayer` add option to turn off antialiasing to avoid artifacts in depth oclusion.
* `TileLayer` no longer purges its cache when data changes, resulting in a smoother "reload" experience

## deck.gl v8.5[​](#deckgl-v85 "Direct link to deck.gl v8.5")

Release date: July 26, 2021

|                                                                                                                                                            |                                                                                                                                 |                                                                                                                                              |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| ![](https://github.com/visgl/deck.gl-data/blob/master/images/whats-new/text-layer-styling.gif?raw=true)*TextLayer background, border, padding and outline* | ![](https://github.com/visgl/deck.gl-data/blob/master/images/whats-new/geojson-point-type.png?raw=true)*GeoJsonLayer pointType* | ![](https://github.com/visgl/deck.gl-data/blob/master/images/whats-new/i3s-picking.gif?raw=true)*Tile3DLayer+I3S picking individual objects* |

### Layer Improvements[​](#layer-improvements "Direct link to Layer Improvements")

#### MVTLayer[​](#mvtlayer "Direct link to MVTLayer")

Mapbox Vector Tiles parsing throughput is now 2-3x faster, due to MVT tiles being parsed directly into binary attributes rather than GeoJSON, and additional work (including [triangulation](https://github.com/visgl/loaders.gl/blob/master/docs/whats-new.md#v30-in-development)) being performed on worker threads. Speed comparison on some example data sets (MVT tiles parsed per second):

| Data set           | `binary: false` | `binary: true` | Speed increase |
| ------------------ | --------------- | -------------- | -------------- |
| Block Groups       | 2.86/s          | 5.57/s         | 1.94x          |
| Census Layer       | 6.09/s          | 11.9/s         | 1.95x          |
| Counties Layer     | 72.5/s          | 141/s          | 1.94x          |
| USA Zip Code Layer | 8.45/s          | 20.3/s         | 2.4x           |

*Benchmarks ran using scripts on a 2012 MacBook Pro, 2.3 GHz Intel Core i7, 8 GB, measuring parsing time of MVTLoader only (network time and rendering is not included)*

#### GeoJsonLayer[​](#geojsonlayer "Direct link to GeoJsonLayer")

GeoJSONLayer now supports rendering point features as icons and/or text labels in addition to circles. Use the new `pointType` prop:

```
new GeoJsonLayer({

  ...

  pointType: 'circle+text',

  getText: f => f.properties.name,

  getTextSize: 12

})
```

For a full list of new props, visit the updated [documentation](https://deck.gl/docs/api-reference/layers/geojson-layer.md).

#### TextLayer[​](#textlayer "Direct link to TextLayer")

The layer now supports automatically detecting the characters used in the data. Set `characterSet: 'auto'` to enable this feature.

New props are added for more flexible styling of the texts:

* `background`
* `backgroundPadding`
* `outlineWidth`
* `outlineColor`
* `getBackgroundColor`
* `getBorderWidth`
* `getBorderColor`

See [documentation](https://deck.gl/docs/api-reference/layers/text-layer.md) for details.

#### Tile3DLayer[​](#tile3dlayer "Direct link to Tile3DLayer")

Tile3DLayer can now be rendered in multiple views. Previously if you use multiple views it was required to create one Tile3DLayer for each view. Using a single layer is more efficient by sharing the tile cache.

The layer now takes full advantage of new features in I3S 1.7 tile sets, including:

* Picking individual objects inside a tile
* Page nodes (improved performance)
* Draco compressed meshes (improved performance)
* Compressed textures (improved performance)
* PBR materials
* Vertex colors
* UVRegions

#### Other layer improvements[​](#other-layer-improvements "Direct link to Other layer improvements")

* `ScatterplotLayer` adds `billboard` mode
* `TripLayer` adds `fadeTrail` mode
* `PathLayer` now supports controlling `jointRounded` and `capRounded` separately. Dashed lines via `PathStyleExtension` also respects the cap type.
* `PolygonLayer` and `GeoJsonLayer`: `autoHighlight` now highlight both the outline and the fill of the hovered polygon, instead of either the outline or the fill.
* `HeatmapLayer` now correctly renders `aggregation: 'MEAN'` with user-supplied `colorDomain`.

### Default transpilation and bundle size[​](#default-transpilation-and-bundle-size "Direct link to Default transpilation and bundle size")

The NPM distribution has dropped IE 11 support in exchange for an almost 20% reduction in size.

| Entry point       | 8.5 Bundle (gzipped) | 8.4 Bundle (gzipped) | Comments                         |
| ----------------- | -------------------- | -------------------- | -------------------------------- |
| module (dist/esm) | 398 KB (115 KB)      | 485 KB (128 KB)      | Transpiled, tree-shaking enabled |
| main (dist/es5)   | 686 KB (178 KB)      | 812 KB (197 KB)      | Transpiled, no tree-shaking      |

*Measured as the footprint of @deck.gl/core, bundled and minified with Webpack 4*

To support older or less common browsers, make sure that `node_modules` is included in your application's babel settings.

For backward compatibility, the pre-built bundle (`dist.min.js`) is not affected by this change.

### @deck.gl/react[​](#deckglreact "Direct link to @deck.gl/react")

The `DeckGL` React component is rewritten using functional component and hooks.

### @deck.gl/carto[​](#deckglcarto-3 "Direct link to @deck.gl/carto")

* Integration with **CARTO 3 platform**. With deck.gl and the CARTO 3 platform you can access directly your datasets and tilesets hosted in your current data warehouse (BigQuery, Snowflake, Redshift, Postgres). You don't need to move your data to CARTO plaform.
* A new `CartoLayer` is available to unify `CartoBQTilerLayer` and `CartoSQLLayer`. There are migration guides for both: [CartoSQLLayer](https://github.com/visgl/deck.gl/blob/8.5-release/docs/api-reference/carto/carto-sql-layer.md#migration-to-cartolayer#migration-to-cartolayer) and [CartoBQTilerLayer](https://github.com/visgl/deck.gl/blob/8.5-release/docs/api-reference/carto/carto-bqtiler-layer.md#migration-to-cartolayer#migration-to-cartolayer).
* New `getData` method in CARTO 3 [to support other deck.gl layers](https://deck.gl/docs/api-reference/carto/overview.md#support-for-other-deckgl-layers).

## deck.gl v8.4[​](#deckgl-v84 "Direct link to deck.gl v8.4")

Release date: Jan 31, 2021

### Better Interaction[​](#better-interaction "Direct link to Better Interaction")

#### Improved experience on mobile devices[​](#improved-experience-on-mobile-devices "Direct link to Improved experience on mobile devices")

All controllers now support smooth easing at the end of dragging and pinching. This can be turned on via the new [inertia](https://deck.gl/docs/api-reference/core/controller.md#options) option:

```
controller: {inertia: true}
```

In addition, a three-finger swipe gesture is added to support changing pitch on mobile. It is enabled via the `touchRotate` option.

#### More customizable controller behavior[​](#more-customizable-controller-behavior "Direct link to More customizable controller behavior")

* New `dragMode` option for flipping pan/rotate modes
* The `keyboard` option now accepts an object for customizing movement speed
* The `scrollZoom` option now accepts an object for customizing wheel zoom speed and easing

#### New Deck component API[​](#new-deck-component-api "Direct link to New Deck component API")

* `eventRecognizerOptions` for fine-tuning gesture recognition
* `onInteractionStateChange` callback
* The `getCursor` now receives an `isHovering` argument that indicates whether the pointer is over a pickable object.

### MVT Layer[​](#mvt-layer "Direct link to MVT Layer")

#### TileJSON[​](#tilejson "Direct link to TileJSON")

The `data` prop now accepts a [TileJSON](https://github.com/mapbox/tilejson-spec) URL. The `onDataLoad` callback is fired when the TileJSON loads.

#### Query rendered features[​](#query-rendered-features "Direct link to Query rendered features")

A new method `getRenderedFeatures` is added for querying all visible features in the current viewport.

#### Features in WGS84 coordinates[​](#features-in-wgs84-coordinates "Direct link to Features in WGS84 coordinates")

`onHover`, `onClick`, `onTileLoad`, `onTileError` and `onViewportLoad` callbacks can now access features in WGS84 coordinates.

#### Binary mode[​](#binary-mode "Direct link to Binary mode")

A new prop `binary` is added to the MVTLayer. If set to `true`, it removes the need for serialization and deserialization of data transferred by the worker back to the main process, as well as attribute packing in the main thread. The following numbers show the performance improvements in loading and rendering a full viewport:

|                    | N Vertex |  Binary | Non-Binary | Change  |
| ------------------ | -------- | ------- | ---------- | ------- |
| Usa Admin States   | 12K      |  963ms  | 1109ms     | -13.16% |
| Counties Layer     | 175K     | 1222ms  | 1956ms     | -37.52% |
| Census Tract       | 988K     |  2713ms | 6242ms     | -56.53% |
| Block groups       | 1.57M    | 4261ms  | 9202ms     | -53.69% |
| Usa Zip Code Layer | 1.38M    | 2938ms  | 6564ms     | -55.24% |

*Benchmark run on 2017 Macbook Pro, 3,1 GHz Dual-Core Intel Core i5, 16 GB memory, Intel Iris Plus Graphics 650 1536 MB. Resolution 1140x900. Network transfer time is not included*

### Layer improvements[​](#layer-improvements-1 "Direct link to Layer improvements")

* **All layers**

  * Add a new `loaders` prop to support additional data formats. See the [Data Loading Guide](https://deck.gl/docs/developer-guide/loading-data.md) for examples.
  * Layers that use a texture (e.g. `BitmapLayer`, `IconLayer`, `SimpleMeshLayer`) now offer consistent support for a variety of input formats. Newly supported are plain object descriptors (e.g. `{data: <Uint8Array>, width, height}`) and `HTMLVideoElement` that continuously updates. A new prop `textureParameters` also allows easy customization of texture settings.

* **HeatmapLayer** adds new prop `aggregation` which can be either `SUM` (default) or `MEAN`.

* **BitmapLayer**

  * picking callbacks now provide information on which pixel was picked.
  * Adds experimental `_imageCoordinateSystem` prop, so that raster tiles may render correctly in `GlobeView`.

* **GlobeView** now works with `COORDINATE_SYSTEM.CARTESIAN` and `SunLight`.

* **TileLayer** now supports `modelMatrix`.

* **IconLayer** adds `onIconError` callback.

* **OrthographicView** adds `flipY` option.

* **ArcLayer** and **LineLayer** now render the shortest path with `wrapLongitude: true`.

Additionally, various layers received performance optimization, corrected lighting calculation, and API consistency improvements. See [upgrade guide](https://deck.gl/docs/upgrade-guide.md) for a list breaking changes in this release.

### Functions in declarative language[​](#functions-in-declarative-language "Direct link to Functions in declarative language")

[@@function](https://deck.gl/docs/api-reference/json/conversion-reference.md#functions-and-using-function) prefix is included to interpret a string as a JavaScript function.

### @deck.gl/carto[​](#deckglcarto-4 "Direct link to @deck.gl/carto")

Adds [helper functions](https://deck.gl/docs/api-reference/carto/styles.md) to create data-driven map visualizations using [CARTOColors](https://carto.com/carto-colors/)

## deck.gl v8.3[​](#deckgl-v83 "Direct link to deck.gl v8.3")

Release Date: Oct 12, 2020

### New module: @deck.gl/carto[​](#new-module-deckglcarto "Direct link to New module: @deck.gl/carto")

|                                                                                               |                                                                                               |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| ![](https://github.com/visgl/deck.gl-data/blob/master/images/whats-new/carto-01.gif?raw=true) | ![](https://github.com/visgl/deck.gl-data/blob/master/images/whats-new/carto-02.gif?raw=true) |

Integration with the powerful geospatial analytics platform [CARTO](https://carto.com).

This new modules makes it easy to visualize regular Tables and vector tilesets in CARTO. It offers two new layers:

* [CartoSQLLayer](https://github.com/visgl/deck.gl/blob/8.3-release/docs/api-reference/carto/carto-sql-layer.md): a layer to visualize data hosted in your CARTO account and to apply custom SQL.
* [CartoBQTilerLayer](https://github.com/visgl/deck.gl/blob/8.3-release/docs/api-reference/carto/carto-bqtiler-layer.md): a layer to visualize large datasets (millions or billions of rows) directly from [Google BigQuery](https://cloud.google.com/bigquery).

This effort enables applications to leverage CARTO's smart back-end capabilities, dynamic queries and much more. Visit the module's [documentation](https://deck.gl/docs/api-reference/carto/overview.md) to get started.

### TileLayer[​](#tilelayer "Direct link to TileLayer")

* `getTileData` now receives an additional argument `signal` that implements [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal). Tile requests may now be aborted if there are too many queued or ongoing requests.
* The `getTileData` function passed in to the current layer instance will be called rather than the first layer instance. This allows applications to progressively adjust loading behavior without having to reload all tiles.
* New `onTileUnload` callback
* URL templates now support `{-y}` for TMS indexing
* Experimental support for `GlobeView` in `TileLayer` and `MVTLayer`
* Improved memory usage in tile caching

### General Performance[​](#general-performance "Direct link to General Performance")

Layers with `pickable` disabled (the default) skip generating picking attributes. This can improve initial loading time and memory usage if a large layer does not have to be interactive.

If no layer is pickable, deck no longer creates the picking FrameBuffer to save memory.

`Deck` also added some experimental [optimization options](https://deck.gl/docs/developer-guide/tips-and-tricks.md#optimization-for-mobile) to allow more fine-grained control of memory usage on memory-restricted devices.

### pydeck 0.5[​](#pydeck-05 "Direct link to pydeck 0.5")

pydeck 0.5 includes new event handlers — `on_hover`, `on_click`, `on_view_state_change`, and `on_resize` — which can be used to create rich interactive applications in Jupyter. This release works in sync with deck.gl 8.3.

|                                                                                                                                      |                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| ![](https://github.com/visgl/deck.gl-data/blob/master/images/whats-new/pydeck-event-handling.gif?raw=true)*Event handling in pydeck* | ![](https://github.com/visgl/deck.gl-data/blob/master/images/whats-new/high-precision-dash.png?raw=true)*highPrecisionDash in PathStyleExtension* |

### Other Improvements[​](#other-improvements-1 "Direct link to Other Improvements")

* `SimpleMeshLayer` adds `_useMeshColors` prop to use vertex colors from `mesh` instead of `getColor`
* `DataFilterExtension` adds a `countItems` option. It enables the GPU to report the number of objects that pass the filter criteria via the `onFilteredItemsChange` callback.
* `PathStyleExtension` adds a `highPrecisionDash` option. It creates nicer dashes when used with small path segments, at the price of some CPU overhead.
* `IconLayer` fixed an issue of visual artifacts rendering anti-aliased borders

## deck.gl v8.2[​](#deckgl-v82 "Direct link to deck.gl v8.2")

Release Date: June 28, 2020

|                                                                                                                              |                                                                                                                                     |                                                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| ![](https://user-images.githubusercontent.com/2059298/84559353-a9d93600-acee-11ea-89ff-b404d798ba17.gif)*FillStyleExtension* | ![](https://user-images.githubusercontent.com/4319728/85549259-183bc380-b620-11ea-83c8-8f4abec732f6.gif)*MVTLayer highlight - v8.1* | ![](https://user-images.githubusercontent.com/4319728/85549267-1a9e1d80-b620-11ea-9aa4-3ec108d08db7.gif)*MVTLayer highlight - v8.2* |

### Tiled Layers[​](#tiled-layers "Direct link to Tiled Layers")

Many new features are added to `TileLayer`, `MVTLayer` and `TerrainLayer` to improve correctness, performance and ease of use.

* `MVTLayer` projects more accurately at high zoom levels.
* `autoHighlight` in the `MVTLayer` now works on features that are split across multiple tiles, identified by the new `uniqueIdProperty` prop.
* All geospatially tiled layers now handle high pitch angles better. Far away tiles from the camera are loaded at lower zoom levels, avoiding loading too many tiles.
* Tiled layers now use a request scheduler to prioritize loading the most recently visible tiles during viewport navigation. See the new `maxRequests` prop.
* `TileLayer` may continue to display tiles when underzoomed. See the new `extent` prop.
* Fine-tune the tiles displayed by the `TileLayer` with the new `zRange` prop when dealing with 3D content. This is used by the `TerrainLayer` when viewing high-altitude regions.
* `TileLayer`'s `tileSize` prop can be used to fine-tune the zoom level at which tiles are loaded.
* `TileLayer`'s `renderSubLayers` is now always called after the tile layer is loaded, i.e. `props.data` is never a Promise.
* `TileLayer` can now be used in multi-view applications, as long as each `TileLayer` instance is rendered into one view. See [documentation](https://deck.gl/docs/developer-guide/views.md#rendering-layers-in-multiple-views) for an example.

### GlobeView[​](#globeview "Direct link to GlobeView")

![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/globe.gif)

For geospatial data, a new projection mode -- globe projection is now available alongside Web Mercator projection. In this release, the feature is exposed via the experimental `GlobeView` class.

Currently there is no base map provider under this view. You may use the `BitmapLayer` or `GeoJsonLayer` to render a backdrop for your data.

Before getting started with [this example](https://github.com/visgl/deck.gl/tree/9.4-release/examples/get-started/pure-js/globe), make sure you check out the [docs](https://deck.gl/docs/api-reference/core/globe-view.md) for the limitations of the current implementation.

### Antimeridian Handling[​](#antimeridian-handling "Direct link to Antimeridian Handling")

* `GreatCircleLayer` now renders correctly across the 180th meridian.
* The `PathLayer`, `PolygonLayer` and `GeoJsonLayer` now support the `wrapLongitude` prop.When enabled, the connection between any two neighboring vertices is drawn on the shorter side of the world, and split into two if it crosses the 180th meridian. Note that this introduces CPU overhead at runtime.

### Pydeck[​](#pydeck-1 "Direct link to Pydeck")

Pydeck 0.4.0 introduces support for JupyterLab 2.0, support for a Google Maps base map, a new UI element for providing text descriptions of a map, and many of the new features of deck.gl 8.2, like the ability to render data to either a globe or a Mercator projection. See the new [website](https://pydeck.gl/) for documentation and examples.

### Miscellaneous[​](#miscellaneous "Direct link to Miscellaneous")

* Multiple layers that share the same `data` URL now only download the data once.
* `ScatterplotLayer` added `radiusUnits` prop
* New `FillStyleExtension` fills polygons with repeated pattern from a sprite image.
* `ArcLayer` added `greatCircle` prop. `GreatCircleLayer` is now a special case of the `ArcLayer` and support rendering an elevated curve by supplying `getHeight`.
* `@deck.gl/test-utils` added new `testLayerAsync` API.
* When using auto-highlight, `highlightColor` now accepts a callback that returns a color based on which object is picked.

## deck.gl v8.1[​](#deckgl-v81 "Direct link to deck.gl v8.1")

Release Date: Mar 17, 2020

### Growing Tile Solutions[​](#growing-tile-solutions "Direct link to Growing Tile Solutions")

|                                                                                                              |                                                                                                |                                                                                                  |
| ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/tile-2d.gif)*Non-geospatial TileLayer* | ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/mvt-layer.jpg)*MVTLayer* | ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/terrain.jpg)*TerrainLayer* |

The `@deck.gl/geo-layers` module added many new features to address popular tiled data use cases.

#### TileLayer[​](#tilelayer-1 "Direct link to TileLayer")

Multiple bugs have been fixed in the [TileLayer](https://deck.gl/docs/api-reference/geo-layers/tile-layer.md) regarding data fetching and tree traversal.

The layer now supports non-geospatial views. Check out this [example](https://github.com/visgl/deck.gl/tree/9.4-release/examples/website/image-tile) by [@ilan-gold](https://github.com/ilan-gold) that renders a 576 Megapixel image of the moon.

New props are added to better control the layer's behavior:

* `maxCacheByteSize`: for precise management of memory usage
* `refinementStrategy`: to reduce flashing/overlapping during loading
* `tileSize` (non-geospatial only)

#### MVTTileLayer[​](#mvttilelayer "Direct link to MVTTileLayer")

Based on the `TileLayer`, [MVTTileLayer](https://deck.gl/docs/api-reference/geo-layers/mvt-layer.md) loads and renders tiles in the [Mapbox Vector Tiles specification](https://github.com/mapbox/vector-tile-spec). This new layer make it easier to leverage the many great [open source tools](https://github.com/mapbox/awesome-vector-tiles) in use with deck.gl.

This effort is led by contributors from [CARTO](https://carto.com/).

#### TerrainLayer[​](#terrainlayer "Direct link to TerrainLayer")

[TerrainLayer](https://deck.gl/docs/api-reference/geo-layers/terrain-layer.md) loads color-encoded heightmap and reconstructs 3D mesh surfaces. Check out our [example](https://github.com/visgl/deck.gl/tree/9.4-release/examples/website/terrain).

### ESRI + deck.gl[​](#esri--deckgl "Direct link to ESRI + deck.gl")

|                                                                                                             |                                                                                                        |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/arcgis.jpg)*deck.gl + ArcGIS basemap* | ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/esri-i3s.gif)*Tile3DLayer + I3S* |

In collaboration with GIS industry leader [ESRI](https://www.esri.com), we are releasing new experimental features that work with ArcGIS basemap and I3S tiles.

#### @deck.gl/arcgis[​](#deckglarcgis "Direct link to @deck.gl/arcgis")

You can now use ArcGIS basemaps with deck.gl. This new module lets apps render deck.gl layers into the WebGL context of [ArcGIS API for JavaScript](https://developers.arcgis.com/javascript/). 3D scene view support is experimental in this initial release. To get started, check out [the example](https://deck.gl/gallery/boiler-plate-arcgis) and [the documentation](https://deck.gl/docs/api-reference/arcgis/overview.md).

#### Tile3DLayer and I3S format[​](#tile3dlayer-and-i3s-format "Direct link to Tile3DLayer and I3S format")

`Tile3DLayer` is adding preliminary support for the [OGC Indexed 3d Scene (I3S)](https://docs.opengeospatial.org/cs/17-014r5/17-014r5.html) format. See [documentation](https://deck.gl/docs/api-reference/geo-layers/tile-3d-layer.md) for details.

### World Repeating in Web Mercator Maps[​](#world-repeating-in-web-mercator-maps "Direct link to World Repeating in Web Mercator Maps")

![Repeating worlds at low zoom levels](https://user-images.githubusercontent.com/2059298/71849768-b397a700-3087-11ea-8c48-93d8bb9188db.gif)

The `MapView` now supports repeating worlds at low zoom levels. For backward compatibility, this feature is opt-in. Apps may turn it on by setting `views: new MapView({repeat: true})` on `Deck` or `DeckGL`.

Repeating is always on when using `MapboxLayer` and [GoogleMapsOverlay](https://deck.gl/docs/api-reference/google-maps/google-maps-overlay.md).

As a result, `GoogleMapsOverlay` now supports all Google Maps zoom levels.

### pydeck 0.3.0[​](#pydeck-030 "Direct link to pydeck 0.3.0")

pydeck now uses the [binary attribute API](https://deck.gl/docs/developer-guide/performance.md#supply-attributes-directly) to communicate between Python and JavaScript. This greatly increases the speed and the amount of data that it can render.

pydeck now supports external layer modules via a new `custom_libraries` setting.

### Other Improvements[​](#other-improvements-2 "Direct link to Other Improvements")

* When using `Deck` as a stateful component, you can now update its `initialViewState` prop to reset the camera.
* A new prop `onError` is added to `Deck` to handle errors, instead of crashing the app.
* `Layer` instances now expose a new member `isLoaded`.
* `PathLayer`'s joint calculation is improved when using with short line segments and extreme angles.
* `BrushingExtension` supports a new `brushingTarget` mode `source_target`.
* `PathStyleExtension` now has a new mode `offset`. This feature can be used for positioning polygon strokes inside/outside, or rendering overlapped paths in opposite directions.
* `TextLayer` now supports [binary attributes](https://deck.gl/docs/api-reference/layers/text-layer.md#use-binary-attributes).

## deck.gl v8.0[​](#deckgl-v80 "Direct link to deck.gl v8.0")

Release Date: Dec 20, 2019

### Performance[​](#performance "Direct link to Performance")

Performance is one of the biggest focus of this update. Layer updates (data change) is 1.5x the speed of the last release, and redraw (viewport change) is 2.5x.

*Benchmark of using 1000 ScatterplotLayers on 2016 Macbook Pro, 2.8 GHz Intel Core i7, 16 GB memory, AMD Radeon R9 M370X 2 GB*

|                   | v7.3  | v8.0  | Change |
| ----------------- | ----- | ----- | ------ |
| Initialize        | 298ms | 235ms | -21%   |
| Update            | 112ms | 72ms  | -36%   |
| Redraw (CPU Time) | 76ms  | 26ms  | -66%   |
| Redraw (GPU Time) | 17ms  | 10ms  | -41%   |

In addition to runtime performance, deck.gl also added a production mode to optimize bundle size. The v8.0 minified bundle of `@deck.gl/core` is 50kb lighter than that of v7.3.

### Better Binary Data Support[​](#better-binary-data-support "Direct link to Better Binary Data Support")

It is now possible to replace a layer's accessors with binary data attributes. This technique offers the maximum performance in terms of data throughput in applications where a lot of data is loaded and/or frequently updated:

```
const data = new Float32Array([

  0.7, 0.2, 0, 0, 0, 0,

  0.8, 0.6, 0, 0, 5, 0,

  0.3, 0.5, 0, 5, 5, 0,

  0, 0.8, 0.6, 5, 10, 0,

  0, 0.5, 0.7, 10, 10, 0

]);



new deck.ScatterplotLayer({

  id: 'points',

  data: {

    length: 5,

    attributes: {

      getPosition: {value: data, size: 3, offset: 12, stride: 24},

      getFillColor: {value: data, size: 3, offset: 0, stride: 24}

    }

  }

  getRadius: 1

})
```

This use case is discussed in detail in the [performance developer guide](https://deck.gl/docs/developer-guide/performance.md#supply-attributes-directly).

### GPU Data Filter in Aggregation Layers[​](#gpu-data-filter-in-aggregation-layers "Direct link to GPU Data Filter in Aggregation Layers")

[DataFilterExtension](https://deck.gl/docs/api-reference/extensions/data-filter-extension.md) now supports the following layers from `@deck.gl/aggregation-layers`:

* `HeatMapLayer`
* `GPUGridLayer`
* `ScreenGridlayer` (GPU aggregation only)
* `ContourLayer` (GPU aggregation only)
* `GridLayer` (GPU aggregation only)

### pydeck[​](#pydeck-2 "Direct link to pydeck")

* pydeck now supports JupyterLab.
* The Jupyter widget now allows users to click multiple objects in a visualization and pass them to the Python backend.
* JavaScript errors are now surfaced in the Jupyter UI.
* Support for non-Mercator visualizations.
* The JSON parser has introduced syntactic identifiers in an effort to become more generic and robust. It is able to work with a wider range of data formats and layer types. See upgrade guide for details.

### Other New Features and Improvements[​](#other-new-features-and-improvements "Direct link to Other New Features and Improvements")

* Render to a frame buffer by specifying the `_framebuffer` prop of [Deck](https://deck.gl/docs/api-reference/core/deck.md).
* Pick a 3d surface point in the scene by passing `unproject3D: true` to `deck.pickObject` or `deck.pickMultipleObjects`.
* [ArcLayer](https://deck.gl/docs/api-reference/layers/arc-layer.md) supports drawing arcs between two 3D positions.
* [TextLayer](https://deck.gl/docs/api-reference/layers/text-layer.md) adds a new prop `backgroundColor`. Picking works when the cursor is over an empty pixel in the text.
* [TextLayer](https://deck.gl/docs/api-reference/layers/text-layer.md) adds `maxWidth` and `wordBreak` props to support text wrapping.
* [ScenegraphLayer](https://deck.gl/docs/api-reference/mesh-layers/scenegraph-layer.md) adds props `sizeMinPixels` and `sizeMaxPixels`.
* 64-bit positions are now 3D instead of 2D. This improves render precision when using `OrbitView`.
* `FirstPersonView` now supports pitch; controller works more intuitively; graduates from experimental status.
* `FlyToInterpolator` now supports `duration: 'auto'`.

## deck.gl v7.3[​](#deckgl-v73 "Direct link to deck.gl v7.3")

Release Date: Sep 26, 2019

|                                                                                                       |                                                                                                                |                                                                                                                 |
| ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/tile-3d-layer.gif)*Tile3DLayer* | ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/jupyter-integration.gif)*Jupyter Widget* | ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/spring-transition.gif)*Spring Transition* |

### Tile3DLayer[​](#tile3dlayer-1 "Direct link to Tile3DLayer")

deck.gl has partnered with [Cesium](https://cesium.com/) to implement support for the OGC [3D Tiles specification](https://github.com/AnalyticalGraphicsInc/3d-tiles/tree/master/specification). This makes it possible to to render city-scale (billions of points/features) and country-scale (trillions of features) datasets in the browser.

In this initial release, the layer has full support for point clouds and experimental support for glTF tiles. Try the [demo](https://deck.gl/examples/tile-3d-layer) for yourself.

### pydeck: deck.gl for Python and Jupyter Notebooks[​](#pydeck-deckgl-for-python-and-jupyter-notebooks "Direct link to pydeck: deck.gl for Python and Jupyter Notebooks")

We have released a python module `pydeck` for Python developers to interact with deck.gl via a native Python API:

```
pip install pydeck
```

`pydeck` is also integrated with Jupyter Notebook, enabling you to interactively create deck.gl visualizations right in your notebooks. See [documentation](https://github.com/visgl/deck.gl/blob/master/bindings/python/pydeck/README.md) for details.

### Transition System Improvements[​](#transition-system-improvements "Direct link to Transition System Improvements")

* Generic prop transition: the layer `transitions` prop now supports many more props than just accessors! Any prop of type `number` or `array` can now also use the built-in transition system.
* New transition type: spring-based transition support is added to the transition settings. See [documentation](https://deck.gl/docs/api-reference/core/layer.md#transitions) for details.

### @deck.gl/json[​](#deckgljson "Direct link to @deck.gl/json")

The `JSONConverter` class has been generalized and can now be used independently of deck.gl to "hydrate" JavaScript from JSON text specifications. This supports its use a foundation technology for providing non-JavaScript bindings such as `pydeck`. This has caused some breaking changes to this experimental module. For details and work-arounds see the upgrade guide.

### Under the Hood[​](#under-the-hood "Direct link to Under the Hood")

We have introduced a new resource management system to luma.gl and deck.gl core. This significantly reduces the initial loading time if an app uses multiple layers of the same type.

It is now easier to supply external buffers to layer attributes as deck.gl no longer requires them to match the default buffer type.

For custom layer authors: the attribute system is simplified. One may now use `type: GL.DOUBLE` when adding an attribute to the `AttributeManager`. the attribute will automatically be mapped to two 32-bit shader attributes `<attrbName>` and `<attrbName>64xyLow`.

### Auto Tooltip[​](#auto-tooltip "Direct link to Auto Tooltip")

A new prop [getTooltip](https://deck.gl/docs/api-reference/core/deck.md#gettooltip) is added to the `Deck` class. By supplying this callback, an app may specify the content and styling of a built-in tooltip.

### Other Features/Improvements[​](#other-featuresimprovements "Direct link to Other Features/Improvements")

* **OrbitController** now supports 360 degree rotation on both axis. Relax `minRotationX` and `maxRotationX` to use this feature.
* **Customizable device pixel ratio**: `Deck`'s `useDevicePixels` prop now accepts a number as well as boolean values.
* **SimpleMeshLayer** and **ScenegraphLayer** now respect the `opacity` prop.
* **IconLayer** has added a new prop `alphaCutoff` for customizing picking behavior.
* **HeatmapLayer** is out of `Experimental` phase and can now be rendered using `WebGL1` context. A new prop `colorDomain` added for custom domain specification.

## deck.gl v7.2[​](#deckgl-v72 "Direct link to deck.gl v7.2")

Release Date: Aug 10, 2019

### Layer Extensions[​](#layer-extensions "Direct link to Layer Extensions")

A new module [`@deck.gl/extensions`](https://deck.gl/docs/api-reference/extensions/overview.md) has joined the deck.gl family. Layer extensions are bonus features that you can optionally add to the core deck.gl layers. As a start, this module offers the following extensions:

* [BrushingExtension](https://deck.gl/docs/api-reference/extensions/brushing-extension.md): GPU-based data brushing, see "examples" section of this website
* [DataFilterExtension](https://deck.gl/docs/api-reference/extensions/data-filter-extension.md): GPU-based data filtering, see "examples" section of this website
* [Fp64Extension](https://deck.gl/docs/api-reference/extensions/fp64-extension.md): See [upgrade guide](https://deck.gl/docs/upgrade-guide.md) if you are using the deprecated `fp64` mode.

For instructions on authoring your own layer extensions, visit [developer guide](https://deck.gl/docs/developer-guide/custom-layers/layer-extensions.md).

|                                                                                                        |                                                                                                                 |                                                                                                                |
| ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/heatmap-layer.gif)*HeatmapLayer* | ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/shadow-nyc.jpg)*GeoJsonLayer with shadow* | ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/shadow-uk.jpg)*HexagonLayer with shadow* |

### HeatmapLayer[​](#heatmaplayer "Direct link to HeatmapLayer")

The `@deck.gl/aggregation-layers` module now offers `HeatmapLayer` as an experimental layer. It performs density distribution on the GPU to provide fast dynamic heatmaps. The layer currently only supports WebGL2-enabled browsers. A fallback solution for WebGL1 will be added later.

### Shadows in LightingEffect[​](#shadows-in-lightingeffect "Direct link to Shadows in LightingEffect")

As an experimental feature, the [LightingEffect](https://deck.gl/docs/api-reference/core/lighting-effect.md) can now render shadows from up to two directional light sources. To enable shadows, set `_shadow: true` when constructing a [DirectionalLight](https://deck.gl/docs/api-reference/core/directional-light.md) or [SunLight](https://deck.gl/docs/api-reference/core/sun-light.md).

### New Ways to Supply and Update Layer Data[​](#new-ways-to-supply-and-update-layer-data "Direct link to New Ways to Supply and Update Layer Data")

#### Streaming Data Support[​](#streaming-data-support "Direct link to Streaming Data Support")

Layers now have built-in streaming support. The `data` prop now accepts an [async iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/asyncIterator) object. As new batches of data are resolved, the layer is updated incrementally. This eliminates the need to manually merge chunks of data or manage multiple layer instances. See details in the [data prop](https://deck.gl/docs/api-reference/core/layer.md#basic-properties) documentation and the updated [performance optimization](https://deck.gl/docs/developer-guide/performance.md) examples.

#### Partial Data Update[​](#partial-data-update "Direct link to Partial Data Update")

By default, when the `data` prop value of a layer changes shallowly, all of its attributes are recalculated and re-uploaded to the GPU. You may now compare the old and new data arrays and only update the range of elements that have actually changed. This can lead to significant performance improvement if a few rows in a large data table need to change frequently. See the [\_dataDiff prop](https://deck.gl/docs/api-reference/core/layer.md#data-properties) documentation.

#### Using External Buffers[​](#using-external-buffers "Direct link to Using External Buffers")

It is now easier to build attributes as typed arrays outside of a layer, e.g. in a web worker or on the server. See the "Supplying attributes directly" section in [performance optimization](https://deck.gl/docs/developer-guide/performance.md).

### Other Layer Features and Optimizations[​](#other-layer-features-and-optimizations "Direct link to Other Layer Features and Optimizations")

* [BitmapLayer](https://deck.gl/docs/api-reference/layers/bitmap-layer.md)'s `image` prop now accepts a `HTMLVideoElement`.
* [TextLayer](https://deck.gl/docs/api-reference/layers/text-layer.md) now supports line breaks in the text string. A new prop `lineHeight` is added.
* Layer matching performance is improved. This affects applications with a large number of layers.
* [HeatmapLayer](https://deck.gl/docs/api-reference/aggregation-layers/heatmap-layer.md) now supports WebGL1.

## deck.gl v7.1[​](#deckgl-v71 "Direct link to deck.gl v7.1")

Release Date: 2019

### Post-processing Effects[​](#post-processing-effects "Direct link to Post-processing Effects")

A new [PostProcessEffect](https://deck.gl/docs/api-reference/core/post-process-effect.md) class, working with `@luma.gl/effects` module, offers screen-space post-processing effects such as blur, noise, halftone, ink, etc.

|                                                                                                                      |                                                                                                                              |
| -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| ![](https://raw.github.com/visgl/deck.gl-data/master/images/samples/post-processing/noise.jpg)*noise effect*         | ![](https://raw.github.com/visgl/deck.gl-data/master/images/samples/post-processing/colorhalftone.gif)*colorHalftone effect* |
| ![](https://raw.github.com/visgl/deck.gl-data/master/images/samples/post-processing/tiltshift.jpg)*tiltShift effect* | ![](https://raw.github.com/visgl/deck.gl-data/master/images/samples/post-processing/zoomblur.jpg)*zoomBlur effect*           |

### Layer Enhancements[​](#layer-enhancements-1 "Direct link to Layer Enhancements")

#### GridLayer[​](#gridlayer "Direct link to GridLayer")

`GridLayer` is enhanced to support GPU Aggregation. By default GPU Aggregation is disabled, and can be enabled using `gpuAggregation` prop. For more details check [GridLayer](https://deck.gl/docs/api-reference/aggregation-layers/grid-layer.md). Two new layers GPUGridLayer and CPUGridLayer are also offered, which perform aggregation on CPU and GPU respectively.

The following table compares the performance between CPU and GPU aggregations using random data points:

| #points | CPU #iternations/sec | GPU #iterations/sec | Notes                   |
| ------- | -------------------- | ------------------- | ----------------------- |
| 25K     | 535                  | 359                 | GPU is **33%** slower   |
| 100K    | 119                  | 437                 | GPU is **267%** faster  |
| 1M      | 12.7                 | 158                 | GPU is **1144%** faster |

*Numbers are collected on a 2018 15-inch Macbook Pro (CPU: 2.6 GHz Intel Core i7 and GPU: Radeon Pro 560X 4 GB)*

#### ColumnLayer & H3HexagonLayer[​](#columnlayer--h3hexagonlayer "Direct link to ColumnLayer & H3HexagonLayer")

* Now support drawing outline. In 3D mode (extruded), set `wireframe: true`. In 2D mode, enable stroke by setting `stroked: true` with `getLineWidth`, `getLineColor` among other stroke options.
* Improved the performance of `H3HexagonLayer`.

#### PathLayer[​](#pathlayer "Direct link to PathLayer")

* Added `billboard` prop for screen space extrusion when rendering 3D paths
* Improved precision of joint calculation

#### TripsLayer[​](#tripslayer "Direct link to TripsLayer")

* Now support 3D paths by adding a `getTimestamps` accessor. See layer documentation for details.

#### ScenegraphLayer[​](#scenegraphlayer "Direct link to ScenegraphLayer")

* Added `getScene` and `getAnimator` to allow more flexibility when loading models.
* Experimental `_lighting` property for PBR lighting.
* Experimental `_imageBasedLightingEnvironment` property for image-based lighting.

### 64-bit Precision in Info-vis[​](#64-bit-precision-in-info-vis "Direct link to 64-bit Precision in Info-vis")

`OrthographicView` and `OrbitView` now also support 64-bit projection, with no extra code changes required. This greatly improves the visual quality when rendering very large and/or dense graphs.

### Use react-map-gl Components with DeckGL[​](#use-react-map-gl-components-with-deckgl "Direct link to Use react-map-gl Components with DeckGL")

For React users, it is now easy to use [react-map-gl](https://visgl.github.io/react-map-gl/examples/controls) components with DeckGL, including DOM-based [marker](https://visgl.github.io/react-map-gl/docs/api-reference/marker), [popup](https://visgl.github.io/react-map-gl/docs/api-reference/popup), [navigation control](https://visgl.github.io/react-map-gl/docs/api-reference/navigation-control) and [fullscreen control](https://visgl.github.io/react-map-gl/docs/api-reference/fullscreen-control). This can be done by supplying the `ContextProvider` prop on `DeckGL`:

```
/// Example using react-map-gl controls with deck.gl

import {DeckGL} from '@deck.gl/react';

import {_MapContext as MapContext, NavigationControl} from 'react-map-gl';



<DeckGL ... ContextProvider={MapContext.Provider}>

  <div style={{margin: 10, position: 'absolute', zIndex: 1}}>

    <NavigationControl />

  </div>

</DeckGL>
```

### Performance Metrics[​](#performance-metrics "Direct link to Performance Metrics")

* Added a `metrics` property to `Deck` instances that tracks performance statistics like fps, CPU/GPU render time and memory usage. See [Deck](https://deck.gl/docs/api-reference/core/deck.md) class documentation for details.

## deck.gl v7.0[​](#deckgl-v70 "Direct link to deck.gl v7.0")

Release Date: April 19, 2019

### New Layer Catalog[​](#new-layer-catalog "Direct link to New Layer Catalog")

|                                                                                                      |                                                                                                        |                                                                                                                 |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/bitmap-layer.png)*BitmapLayer* | ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/column-layer.png)*ColumnLayer*   | ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/tile-layer.gif)*TileLayer*                |
| ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/s2-layer.png)*S2Layer*         | ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/h3-layer.png)*H3HexagonLayer*    | ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/h3-cluster-layer.png)*H3ClusterLayer*     |
| ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/trips-layer.gif)*TripsLayer*   | ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/mesh-layer.gif)*ScenegraphLayer* | ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/great-circle-layer.png)*GreatCircleLayer* |

As the number of deck.gl layers grow, we are splitting existing and new layers into multiple submodules for better dependency management. These new layer modules are:

* `@deck.gl/layers` - Primitive layers that are the building blocks of all visualizations

  <!-- -->

  * [ArcLayer](https://deck.gl/docs/api-reference/layers/arc-layer.md)
  * [BitmapLayer](https://deck.gl/docs/api-reference/layers/bitmap-layer.md) **New**
  * [ColumnLayer](https://deck.gl/docs/api-reference/layers/column-layer.md) **New**
  * [GeoJsonLayer](https://deck.gl/docs/api-reference/layers/geojson-layer.md)
  * [GridCellLayer](https://deck.gl/docs/api-reference/layers/grid-cell-layer.md)
  * [IconLayer](https://deck.gl/docs/api-reference/layers/icon-layer.md)
  * [LineLayer](https://deck.gl/docs/api-reference/layers/line-layer.md)
  * [PathLayer](https://deck.gl/docs/api-reference/layers/path-layer.md)
  * [PointCloudLayer](https://deck.gl/docs/api-reference/layers/point-cloud-layer.md)
  * [PolygonLayer](https://deck.gl/docs/api-reference/layers/polygon-layer.md)
  * [ScatterplotLayer](https://deck.gl/docs/api-reference/layers/scatterplot-layer.md)
  * [SolidPolygonLayer](https://deck.gl/docs/api-reference/layers/solid-polygon-layer.md)
  * [TextLayer](https://deck.gl/docs/api-reference/layers/text-layer.md)

* `@deck.gl/aggregation-layers` - Advanced layers that aggregate data into alternative representations, e.g. heatmap, contour, hex bins, etc.

  <!-- -->

  * [ContourLayer](https://deck.gl/docs/api-reference/aggregation-layers/contour-layer.md)
  * GPUGridLayer
  * [GridLayer](https://deck.gl/docs/api-reference/aggregation-layers/grid-layer.md)
  * [HexagonLayer](https://deck.gl/docs/api-reference/aggregation-layers/hexagon-layer.md)
  * [ScreenGridLayer](https://deck.gl/docs/api-reference/aggregation-layers/screen-grid-layer.md)

* `@deck.gl/geo-layers` - Additional layers that handle geospatial use cases and GIS formats.

  <!-- -->

  * [GreatCircleLayer](https://deck.gl/docs/api-reference/geo-layers/great-circle-layer.md) **New**
  * [H3ClusterLayer](https://deck.gl/docs/api-reference/geo-layers/h3-cluster-layer.md) **New**
  * [H3HexagonLayer](https://deck.gl/docs/api-reference/geo-layers/h3-hexagon-layer.md) **New**
  * [S2Layer](https://deck.gl/docs/api-reference/geo-layers/s2-layer.md) **New**
  * [TileLayer](https://deck.gl/docs/api-reference/geo-layers/tile-layer.md) **New**
  * [TripsLayer](https://deck.gl/docs/api-reference/geo-layers/trips-layer.md) **New**

* `@deck.gl/mesh-layers` - Additional layers that render 3D meshes and [scene graphs](https://en.wikipedia.org/wiki/Scene_graph).

  <!-- -->

  * [SimpleMeshLayer](https://deck.gl/docs/api-reference/mesh-layers/simple-mesh-layer.md) **New**
  * [ScenegraphLayer](https://deck.gl/docs/api-reference/mesh-layers/scenegraph-layer.md) **New**

### glTF Support and Loaders.gl[​](#gltf-support-and-loadersgl "Direct link to glTF Support and Loaders.gl")

![](https://raw.github.com/visgl/deck.gl-data/master/images/branding/gltf.png)

The new [ScenegraphLayer](https://deck.gl/docs/api-reference/mesh-layers/scenegraph-layer.md) and [SimpleMeshLayer](https://deck.gl/docs/api-reference/mesh-layers/simple-mesh-layer.md) support loading 3D models and scenegraphs in the popular [glTF™](https://www.khronos.org/gltf/) asset format. glTF is a royalty-free specification for the efficient transmission and loading of 3D assets, with a rich ecosystem of tools and extensions. All variants of glTF 2.0 are supported, including binary `.glb` files as well as JSON `.gltf` files with binary assets in base64 encoding or in separate files.

We are releasing [loaders.gl](https://loaders.gl/) as a major new companion framework to deck.gl and luma.gl. Loaders.gl provides a suite of 3D file format loaders. See [What's New in luma.gl v7.0](https://github.com/visgl/luma.gl/blob/master/docs/whats-new.md) for more details.

### New Effects System[​](#new-effects-system "Direct link to New Effects System")

|                                                                                                                 |                                                                                                       |
| --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/ambient-light.gif)*Ambient Light*         | ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/point-light.gif)*Point Light*   |
| ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/directional-light.gif)*Directional Light* | ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/camera-light.gif)*Camera Light* |

A new effects system is written from the ground up for v7.0. This opens the possibilities for many exciting visual effect features down the road. As a start, we're introducing [LightingEffect](https://deck.gl/docs/api-reference/core/lighting-effect.md) - an easier, more comprehensive way to control the lighting for your layers. See [Using Lighting](https://deck.gl/docs/developer-guide/using-effects.md#lighting) for details.

### Layer API[​](#layer-api "Direct link to Layer API")

* **Binary data support**: In v7.0 we are making binary data a first-class citizen of deck.gl. Whereas the `data` prop of layers only accepted JavaScript arrays in the past, you may now provide a non-iterable object to `data`. See [example](https://deck.gl/docs/developer-guide/performance.md#use-binary-data).
* **Size units**: In the past, some deck.gl layers use pixel sizes (e.g. `IconLayer`, `TextLayer`, `LineLayer` and `ArcLayer`) and some layers use meter sizes (e.g. `ScatterplotLayer`, `PathLayer`). In v7.0 we are introducing new props `sizeUnits` and `widthUnits` that allow users to tweak these behaviors. `*MinPixels` and `*MaxPixels` props are also added for layers that previously only support pixel sizes.
* **Billboard**: Prior this v7.0, `IconLayer` and `TextLayer` are rendered as billboards (i.e. always facing the camera). A prop `billboard` is added to these layers so that you can place icons and texts relative to the world.

### Google Maps Integration[​](#google-maps-integration "Direct link to Google Maps Integration")

Starting v7.0, deck.gl has experimental support for Google Maps with the [@deck.gl/google-maps](https://deck.gl/docs/api-reference/google-maps/overview.md) module. It allows you to construct a Deck instance as a custom Google Maps [OverlayView](https://developers.google.com/maps/documentation/javascript/reference/#OverlayView). See module documentation page for a full list of supported features.

![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/google-maps.jpg)

*GoogleMapsOverlay*

### Improved Test Utilities[​](#improved-test-utilities "Direct link to Improved Test Utilities")

The `@deck.gl/test-utils` module is revamped with two new exports:

* `generateLayerTests` - automatically create test cases for use with [`testLayer`](https://deck.gl/docs/api-reference/test-utils/test-layer.md) to test layer conformance.
* `SnapshotTestRunner` - automated integration test for WebGL. Renders deck.gl layers, takes screenshot and compare with golden images in headless Chromium.

Read more in [Developer Guide: Testing](https://deck.gl/docs/developer-guide/testing.md).

## deck.gl v6.4[​](#deckgl-v64 "Direct link to deck.gl v6.4")

Release Date: Jan 29, 2019

|                                                                                                              |                                                                                                                                    |                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/deck64-sdf.gif)*SDF font in TextLayer* | ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/deck64-scatterplot.jpg)*Stroke and fill in ScatterplotLayer* | ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/deck64-isoband.jpg)*Isoband in ContourLayer* |

### Layer API Improvements[​](#layer-api-improvements "Direct link to Layer API Improvements")

* `ScatterplotLayer` now supports drawing both stroke and fill, and outline width can be controlled per-instance.
* `ContourLayer` now supports isoband - filling between two thresholds.
* `ScreenGridLayer` now supports aggregating by min/max/mean.
* `TextLayer` adds new props that allow better control of the font rendering quality, including font weight and raster size. The layer can also optionally generate a font atlas with [Signed Distance Fields](http://cs.brown.edu/people/pfelzens/papers/dt-final.pdf), which yields a much crisper look when rendering large font sizes.
* `IconLayer` supports dynamically packed icon atlas. Users can now load programmatically generated image urls as icons, for example Facebook profile images.
* `PathLayer`'s `getPath` and `PolygonLayer`'s `getPolygon` props now support flattened coordinates instead of nested arrays, making it easier for these layers to use binary data.

See each layer's documentation for full API changes.

### Composite Layer Customization (experimental)[​](#composite-layer-customization-experimental "Direct link to Composite Layer Customization (experimental)")

It is now possible to fine-tune sublayer appearances by passing a new experimental prop `_subLayerProps` to a composite layer. For example, in a `GeoJsonLayer`, one may wish to make only the point features interactive, or replace the circles with icons.

This offers a light alternative to overriding composite layer behaviors without creating a custom class. See [CompositeLayer](https://deck.gl/docs/api-reference/core/composite-layer.md) for details.

## deck.gl v6.3[​](#deckgl-v63 "Direct link to deck.gl v6.3")

Release Date: Nov 19, 2018

### Prop Types System[​](#prop-types-system "Direct link to Prop Types System")

Layers can now supply rich definitions to their default props. This enables prop validation in debug mode and aggressively blocks unnecessary layer update to boost rendering performance. Complex composite layers such as the GeoJsonLayer can be up to 2x faster in certain React applications. See [upgrade guide](https://deck.gl/docs/upgrade-guide.md) if you are an author of custom layers.

### New Interaction Callbacks[​](#new-interaction-callbacks "Direct link to New Interaction Callbacks")

`onDragStart`, `onDrag` and `onDragEnd` callback props are added to `Deck` and base `Layer` class.

### GPUAggregator Improvements[​](#gpuaggregator-improvements "Direct link to GPUAggregator Improvements")

The experimental `GPUAggregator` class now supports Min/Max/Mean in addition to Sum. Also added the ability to specify multiple weights with custom aggregation operation.

## deck.gl v6.2[​](#deckgl-v62 "Direct link to deck.gl v6.2")

Release Date: Oct 15, 2018

|                                                                                                                                  |                                                                                                                            |
| -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/new-projection-mode.gif)*32-bit High-Precision Projection* | ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/mapbox-layers.jpg)*Mixing Mapbox and deck.gl Layers* |

### Mapbox Custom Layer API[​](#mapbox-custom-layer-api "Direct link to Mapbox Custom Layer API")

A new experimental module `@deck.gl/mapbox` makes deck.gl work with the custom layers API in the latest Mapbox release. Using this feature, mapbox and deck.gl layers can be freely "interleaved", enabling a number of layer mixing effects, such as drawing behind map labels, z-occlusion between deck.gl 3D objects and Mapbox buildings, etc. For usage and limitations, see [module documentation](https://deck.gl/docs/api-reference/mapbox/overview.md).

### 32-bit High-Precision Projection[​](#32-bit-high-precision-projection "Direct link to 32-bit High-Precision Projection")

First introduced in v6.1 as `COORDINATE_SYSTEM.LNGLAT_EXPERIMENTAL`, the new projection system offers high-precision results similar to that of the old `fp64` mode without the compatibility issues or performance hit of running the much heavier 64-bit shader. Starting v6.2, this coordinate system becomes the default for all layers. See [upgrade guide](https://deck.gl/docs/upgrade-guide.md) if you still need the old `fp64` mode.

### CPU/GPU Parity in Projection[​](#cpugpu-parity-in-projection "Direct link to CPU/GPU Parity in Projection")

The `layer.project()` method now supports all coordinate systems including METER\_OFFSETS, LNGLAT\_OFFSETS and IDENTITY.

## deck.gl v6.1[​](#deckgl-v61 "Direct link to deck.gl v6.1")

Release date: Sep 7, 2018

|                                                                                                        |                                                                                                                   |                                                                                                                    |
| ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/json-layers-thumb.gif)*JSON API* | ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/minimap-thumb.gif)*Enhanced Multi-View API* | ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/contour-layer-cell-resize.gif)*ContourLayer* |

### High-Precision Geospatial Projection (Experimental)[​](#high-precision-geospatial-projection-experimental "Direct link to High-Precision Geospatial Projection (Experimental)")

The projection algorithm used for geospatial coordinates (layers with `coordinateSystem: COORDINATE_SYSTEM.LNGLAT`) has supplemented with a "hybrid" projection/offset based implementation (`COORDINATE_SYSTEM.LNGLAT_EXPERIMENTAL`) that rivals 64-bit precision at 32-bit speeds. This mode is expected to make the use of `fp64` precision unnecessary for most applications, which in turn should increase application performance and avoid issues on untested graphics drivers.

### Dynamic Meridian[​](#dynamic-meridian "Direct link to Dynamic Meridian")

`LNGLAT` projection modes can automatically wrap coordinates over the 180th meridian for the best placement in the current viewport. Set the `wrapLongitude` prop in a layer to `true` to enable this behavior. This mode will be helpful when visualizing data close to the ante-meridian (e.g. New Zealand, Australia etc).

### JSON API (Experimental)[​](#json-api-experimental "Direct link to JSON API (Experimental)")

A new experimental module `@deck.gl/json` provides a set of classes that allows deck.gl layers and views to be specified using JSON-formatted text files. To facilitate experimentation, a JSON layer browser is available on <http://deck.gl/playground>.

### Enhanced Multiview Support[​](#enhanced-multiview-support "Direct link to Enhanced Multiview Support")

deck.gl's multiview support has been significantly enhanced. New `View` properties give applications more control over rendering, making it possible to implement e.g. overlapping views, partially synchronized views (share some but not all view state props), views with different background colors etc.

### ContourLayer[​](#contourlayer "Direct link to ContourLayer")

deck.gl's layer catalog is extended by adding new `ContourLayer`, this layer can be used to render contours, also called iso-lines for given set of threshold values. `ContourLayer` supports both WebMercator projection (geospatial applications) and Orthographic projection (infovis applications).

### IconLayer[​](#iconlayer "Direct link to IconLayer")

When the `mask` of the icon is `false`, the opacity of the icon can be controlled by `getColor` while still keeping the pixel color from image. When `mask` is `true`, user defined color is applied.

### GPU Aggregation Enhancements (Experimental)[​](#gpu-aggregation-enhancements-experimental "Direct link to GPU Aggregation Enhancements (Experimental)")

Several under the hood changes in GPU Aggregation flow to support multiple layer coordinate systems (LNGLAT and IDENTITY).

## deck.gl v6.0[​](#deckgl-v60 "Direct link to deck.gl v6.0")

Release date: July 18, 2018

|                                                                                                                     |                                                                                                                                   |                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/attribute-transition.gif)*GeoJson Transition* | ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/viewstateTransitionsFlyTo.gif)*ViewState flyTo Transitions* | ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/GPUAcceleratedScreenGridAggregation.gif)*GPU Accelerated ScreenGrid Layer* |

#### Attribute Transitions (WebGL2-compatible browsers only)[​](#attribute-transitions-webgl2-compatible-browsers-only "Direct link to Attribute Transitions (WebGL2-compatible browsers only)")

Attribute transitions enable applications to simultaneously animate changes in positions, colors and other attributes of all objects in a layer. GPU acceleration to All core deck.gl layers now support attribute transitions, including `HexagonLayer`, `GridLayer` and `GeoJsonLayer`. GPU Accelerations allow millions of objects to be animated. Transition settings also support `enter` callback to customize instance entrance behavior. See documentation of the [transitions prop](https://deck.gl/docs/api-reference/core/layer.md).

#### View State Transitions[​](#view-state-transitions "Direct link to View State Transitions")

View State Transitions (aka Viewport Transitions) are now officially supported. Transitions are provided through the `DeckGL.viewState` prop. For more details check [ViewState Transitions](https://deck.gl/docs/developer-guide/animations-and-transitions.md#camera-transitions) documentation.

#### ScreenGridLayer: GPU accelerated aggregation[​](#screengridlayer-gpu-accelerated-aggregation "Direct link to ScreenGridLayer: GPU accelerated aggregation")

ScreenGridLayer is updated to support aggregation on GPU. GPU aggregation can be 10x faster and is capable of aggregating large data sets (millions of points). Two new props `gpuAggregation` for selecting CPU or GPU aggregation and `cellMarginPixels` to control cell margin size have been added. Finally, picking information now contains aggregated details.

#### Controllers: Simplified Usage[​](#controllers-simplified-usage "Direct link to Controllers: Simplified Usage")

deck.gl can now infer appropriate `Controller` types from the types of your `View`. For example, when using the default geospatial view (`MapView`), a `MapController` can now be requested simply by setting the view's `controller` props to `true`. You may also pass an object with additional controller options to this prop, for example `controller={{doubleClickZoom: false}}`. See documentation of [View](https://deck.gl/docs/api-reference/core/view.md).

#### Pixel Sizes aligned with HTML/CSS[​](#pixel-sizes-aligned-with-htmlcss "Direct link to Pixel Sizes aligned with HTML/CSS")

deck.gl pixel sizes (e.g. in `LineLayer`, `IconLayer` and `TextLayer`) now match their HTML/SVG counterparts.

#### WebGL parameters can now be set declaratively[​](#webgl-parameters-can-now-be-set-declaratively "Direct link to WebGL parameters can now be set declaratively")

It is now possible to set global WebGL parameters (controlling how the GPU renders) by supplying a `Deck.parameters` property object. This gives applications a simple declarative way to control things like blend modes and depth testing, without having to define an `onWebGLInitialized()` callback. Note that `parameters` can still be supplied to individual layers, overriding any global parameters for that layer only.

#### React API Enhancements[​](#react-api-enhancements "Direct link to React API Enhancements")

The `DeckGL` React component now provides a more powerful API to create sophisticated visualizations, highlights including:

* `DeckGL` can be used as a "stateful" component providing automatic interactivity
* You can now specify deck.gl views (in addition to layers) directly using JSX
* Adds "render callbacks" for dynamically rendering React children based on deck.gl view states, providing more control over synchronization of positions and sizes between deck.gl's WebGL view layouts and React's DOM components.

See [Use with React](https://deck.gl/docs/get-started/using-with-react.md) for more details.

## deck.gl v5.3[​](#deckgl-v53 "Direct link to deck.gl v5.3")

Release date: June 01, 2018

|                                                                                                            |
| ---------------------------------------------------------------------------------------------------------- |
| ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/orthographic.gif)*Orthographic Mode* |

#### Automatic Interactivity[​](#automatic-interactivity "Direct link to Automatic Interactivity")

A new `Deck.initialViewState` property allows the application to enable map or view interactivity simply by supplying an initial view state, e.g. `{longitude, latitude, zoom}`. deck.gl will automatically initialize a Controller class and listen to view state changes, without the application having to implement callbacks to track the view state.

#### Automatic Data Loading[​](#automatic-data-loading "Direct link to Automatic Data Loading")

The `Layer.data` prop now accepts URLs (i.e. strings). deck.gl will automatically start loading such URLs, parse them as JSON and once loaded, use the resulting data to render the layer. This can e.g. remove the need for applications to set up callbacks to handle load completion.

#### Deep Picking[​](#deep-picking "Direct link to Deep Picking")

deck.gl can now pick occluded objects using the new `Deck.pickMultipleObjects` method, which returns a list of all objects under the mouse, instead of just the top-most object.

#### Switch between Perspective and Orthographic mode[​](#switch-between-perspective-and-orthographic-mode "Direct link to Switch between Perspective and Orthographic mode")

The [`View`](https://deck.gl/docs/api-reference/core/view.md) classes can now build an orthographic projection matrix from the same "field of view" parameter it uses to create perspective mode (rather than requiring a separate set of parameters). This makes switching between perspective and orthographic projection modes easier then ever (simply set the new `View.orthographic` prop to `true` to activate orthographic projection).

#### Per-instance stroke width in LineLayer and ArcLayer[​](#per-instance-stroke-width-in-linelayer-and-arclayer "Direct link to Per-instance stroke width in LineLayer and ArcLayer")

LineLayer and ArcLayer added a new accessor `getStrokeWidth` to replace the old `strokeWidth` prop. When specified with a function, you can control the width of each arc/line segment dynamically.

#### Constant Accessors[​](#constant-accessors "Direct link to Constant Accessors")

Many layer accessor props now accept constant values. For example, when constructing a ScatterplotLayer, what used to be `getColor: d => [255, 200, 0]` can now be written as `getColor: [255, 200, 0]`. This is not only a convenience: constant values of accessors don't use GPU memory and can be updated very quickly and thus do not require an `updateTrigger`. Consult the documentation for each layer to see which accessors are supported.

#### @deck.gl/layers submodule[​](#deckgllayers-submodule "Direct link to @deck.gl/layers submodule")

Core layers are broken out from `@deck.gl/core` to a new submodule `@deck.gl/layers`. Users of `deck.gl` are not affected by this change.

## deck.gl v5.2[​](#deckgl-v52 "Direct link to deck.gl v5.2")

Release date: April 24, 2018

|                                                                                                      |                                                                                                                                     |                                                                                                               |
| ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/text-layer.gif)*New TextLayer* | ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/screenGrid-colorRangeDomain.gif)*ScreenGridLayer Color Scale* | ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/test-utils.gif)*Automated Render Tests* |

### Use deck.gl without React[​](#use-deckgl-without-react "Direct link to Use deck.gl without React")

deck.gl can now be used in non-React applications. A new top-level JavaScript class [`Deck`](https://deck.gl/docs/api-reference/core/deck.md) is provided as an alternative to the traditional top-level `DeckGL` React component, and the core deck.gl npm module no longer has any React dependencies. This allows deck.gl to be used in any JavaScript application or framework.

The new non-React API is officially supported, however since it is not yet extensively battle-tested in applications there may be some rough corners, so to help developers set expectations we are labeling this as a "pre release" intended for early adopters.

### Scripting Support[​](#scripting-support "Direct link to Scripting Support")

deck.gl now publishes a bundle that can be imported using a simple `<script>` statement in HTML to give access to the deck.gl API. This makes deck.gl easy to use in e.g. "codepens" and for casual programming and visualizations.

See our [scripting blog post](https://medium.com/vis-gl/start-scripting-with-deck-gl-c9036d7a6011).

### Multiple Modules[​](#multiple-modules "Direct link to Multiple Modules")

deck.gl is now published as multiple npm modules allowing applications to choose which features to import. The basic modules are:

* [`@deck.gl/core`](https://www.npmjs.com/package/@deck.gl/core) - the core deck.gl API (JavaScript classes, including the `Deck` top-level class).
* [`@deck.gl/react`](https://www.npmjs.com/package/@deck.gl/react) - React bindings for deck.gl (i.e. the top-level `DeckGL` React class).
* [`deck.gl`](https://www.npmjs.com/package/deck.gl) - The classic module is still supported for backwards compatibility with React applications.

### Multi-Viewport Support[​](#multi-viewport-support "Direct link to Multi-Viewport Support")

deck.gl allows you to divide your screen into multiple viewports and render layers from different perspectives. It is e.g. possible to render a top-down map view next to a first person view and allow your users to "walk around" in the city onto which your data is overlaid.

The [`Deck.views`](https://deck.gl/docs/developer-guide/views.md) property accepts instances of [`View`](https://deck.gl/docs/api-reference/core/view.md) classes, such as [`MapView`](https://deck.gl/docs/api-reference/core/view.md) and [`FirstPersonView`](https://deck.gl/docs/api-reference/core/first-person-view.md):

```
<DeckGL

  views=[

    new MapView({id: 'map', width: '50%'}),

    new FirstPersonView({x: '50%', width: '50%'})

  ]

/>
```

### MapController[​](#mapcontroller "Direct link to MapController")

It is now possible to specify a `MapController` as a `controller` for the `Deck` or `DeckGL` classes, instead of relying on e.g. `react-map-gl` or experimental classes to drive event handling.

### Automatic Resize Handling[​](#automatic-resize-handling "Direct link to Automatic Resize Handling")

It is no longer necessary for deck.gl applications to track screen size and manage the exact `width` and `height` of the `Deck` or `DeckGL` components. `width` and `height` can now be specified using CSS descriptors (e.g. `width = 100%`):

```
<DeckGL width='100%' height='100%'/>
```

### Layers[​](#layers-2 "Direct link to Layers")

#### TextLayer (New)[​](#textlayer-new "Direct link to TextLayer (New)")

A [TextLayer](https://deck.gl/docs/api-reference/layers/text-layer.md) has been added to the core layer catalog for rendering labels with WebGL.

#### ScreenGridLayer[​](#screengridlayer "Direct link to ScreenGridLayer")

**Color Scale Support** (Experimental) - New experimental props `colorRange` and `colorDomain` are added to ScreenGridLayer. These props provide more fine tune control over how grid cells are colored, and brings the ScreenGridLayer into parity with other aggregation layers (i.e. HexagonLayer and GridLayer).

#### Experimental Layers[​](#experimental-layers "Direct link to Experimental Layers")

A number of experimental deck.gl layers are published in a new module [@deck.gl/experimental-layers](https://www.npmjs.com/package/@deck.gl/experimental-layers). Be aware that use of these layers come with caveats and are mainly intended for early adopters. Please refer to [roadmap](https://deck.gl/docs/roadmap.md) for more information.

### Test Utilities[​](#test-utilities "Direct link to Test Utilities")

deck.gl now provides a suite of [test utilities](https://deck.gl/docs/developer-guide/testing.md) that make it easy to test both layers and applications. The utilities support visual regression testing against "golden" images, as well as utilities for traditional unit testing of layers. The utilities come pre-integrated with tools that help automate the running of browser based render tests from the console. To start using the utilities, install the new ([@deck.gl/test-utils](https://www.npmjs.com/package/@deck.gl/test-utils)) module.

### Dist Size Reduction[​](#dist-size-reduction "Direct link to Dist Size Reduction")

Work on bundle size reduction continues. In this release, the focus has been on leveraging the tree-shaking abilities of the Babel 7 and Webpack 4 combination. In addition, new article about [Application Bundling and Tree Shaking](https://deck.gl/docs/developer-guide/building-apps.md) has been added to the docs.

### Shader Modules[​](#shader-modules "Direct link to Shader Modules")

#### project32 (New)[​](#project32-new "Direct link to project32 (New)")

**Unified 32/64-bit projection** - A new common API for projection is implemented in both the `project64` shader module and a new `project32` shader module allowing the same vertex shader can be used for both 32-bit and 64-bit projection. This simplifies adding fp64 support to layers and reduces bundle size. See [docs](https://deck.gl/docs/api-reference/core/project32.md) for more details.

## deck.gl v5.1[​](#deckgl-v51 "Direct link to deck.gl v5.1")

Release date: Feb 16, 2018

|                                                                                                           |                                                                                                   |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/transitions.gif)*Layer Transitions* | ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/jsx-layers.png)*JSX Layers* |

### Layer Improvements[​](#layer-improvements-2 "Direct link to Layer Improvements")

#### Layer Transitions[​](#layer-transitions "Direct link to Layer Transitions")

Many layers now support smooth visual transitions of e.g. positions and colors of layer elements, animating the update of the layers element to match a new data set. The animations are done on the GPU and can thus support very large number of elements. Use the new [`transitions`](https://deck.gl/docs/api-reference/core/layer.md) prop on the `Layer` class to specify things like *transition duration*, *easing function* and *callbacks*.

> Transitions are only supported on WebGL2-capable browsers such as Chrome and Firefox. The `transitions` prop will simply be ignored on WebGL1 browsers.

### React Improvements[​](#react-improvements "Direct link to React Improvements")

#### Use JSX to render deck.gl Layers[​](#use-jsx-to-render-deckgl-layers "Direct link to Use JSX to render deck.gl Layers")

It is now possible to use JSX syntax to create (or "render") deck.gl layers. Many React users feel that this results in a more natural coding style.

```
  <DeckGL {...viewport}>

    <LineLayer data={data} />

  <DeckGL />
```

> There are limitations (deck.gl layers are **not** React components), for more information see [Using deck.gl with React](https://deck.gl/docs/get-started/using-with-react.md).

## deck.gl v5[​](#deckgl-v5 "Direct link to deck.gl v5")

Release date: Dec 21, 2017

|                                                                                                                        |                                                                                                           |                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/object-highlighting.gif)*GPU-based Highlighting* | ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/path-dashes.png)*Dashes in GeoJson* | ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/react-16.png)*React 16 Support* |

All new additions to the official deck.gl 5.0 API are listed here. Note that in addition to the official new features in this release, deck.gl 5.0 also contains a number of significant under the hoods changes to prepare for new features and optimizations. Some of these are available as experimental APIs, see below.

As always, for information on deprecations and how to update your code in response to any API changes, please read the deck.gl [upgrade Guide](https://deck.gl/docs/upgrade-guide.md).

### DeckGL Component[​](#deckgl-component "Direct link to DeckGL Component")

#### DeckGL: Control over DevicePixelRatio[​](#deckgl-control-over-devicepixelratio "Direct link to DeckGL: Control over DevicePixelRatio")

The new `useDevicePixels` prop on the `DeckGL` React component can be used to disable usage of full resolution on retina/HD displays. Disabling deck.gl's default behavior of always rendering at maximum device resolution can reduce the render buffer size with a factor of 4x on retina devices and lead to significant performance improvements on typical fragment shader bound rendering. This option can be especially interesting on "retina" type mobile phone displays where pixels are so small that the visual quality loss may be largely imperceptible.

#### DeckGL: Layer Filtering[​](#deckgl-layer-filtering "Direct link to DeckGL: Layer Filtering")

A new `DeckGL` prop `layerFilter` gives the application an opportunity to filter out layers from the layer list during rendering and/or picking. Filtering can be done per layer or per viewport (experimental) or both. This enables techniques like adding helper layers that work as masks during picking but do not show up during rendering, or rendering different additional information in different viewports (experimental).

#### DeckGL: Allow overriding canvas component style[​](#deckgl-allow-overriding-canvas-component-style "Direct link to DeckGL: Allow overriding canvas component style")

Users can now override the canvas size, position and offset via the style prop passed to the DeckGL component.

### Layer Improvements[​](#layer-improvements-3 "Direct link to Layer Improvements")

#### Layer: Automatic Highlighting of Hovered Elements[​](#layer-automatic-highlighting-of-hovered-elements "Direct link to Layer: Automatic Highlighting of Hovered Elements")

Three new `Layer` props (`autoHighlight`, `highlightColor` and `highlightedObjectIndex`) have been added to enable simple and efficient highlighting of a single object in a layer. Highlighting is either automatic on hover, or programmatically controlled through specifying the index of the selected object. The actual highlighting is done on the GPU and this feature is thus very performant, in particular as it lets applications avoid cumbersome techniques like modifying data or using a secondary layer for highlighting.

See our [blog post](https://medium.com/vis-gl/automatic-gpu-based-object-highlighting-in-deck-gl-layers-7fe3def44c89)

#### CompositeLayer: Property Forwarding Support[​](#compositelayer-property-forwarding-support "Direct link to CompositeLayer: Property Forwarding Support")

A new method `CompositeLayer.getSubLayerProps()` simplifies forwarding base layer props to sub layers, removing code clutter and reducing the risk of forgetting to forward an important base layer property.

#### PathLayer & GeoJsonLayer: Dashed Line Support[​](#pathlayer--geojsonlayer-dashed-line-support "Direct link to PathLayer & GeoJsonLayer: Dashed Line Support")

Added new props (`getDashArray` and `dashJustified`) enabling you render paths as dashed lines. Naturally these props are also accessible in composite layers built on top of the `PathLayer`, such as the `GeoJsonLayer`.

#### PolygonLayer & GeoJsonLayer: Elevation Scale[​](#polygonlayer--geojsonlayer-elevation-scale "Direct link to PolygonLayer & GeoJsonLayer: Elevation Scale")

Added new prop `elevationScale` to enable fast scaling elevation of all extruded polygons.

#### HexagonLayer / GridLayer: Elevation by Value Support[​](#hexagonlayer--gridlayer-elevation-by-value-support "Direct link to HexagonLayer / GridLayer: Elevation by Value Support")

Add `getElevationValue` to `HexagonLayer` and `GridLayer` to enable elevation aggregation by value. This allow both color and elevation to be calculated based on customized aggregation function.

### Seer Improvements[​](#seer-improvements "Direct link to Seer Improvements")

The [Seer](https://chrome.google.com/webstore/detail/seer/eogckabefmgphfgngjdmmlfbddmonfdh?hl=en) Chrome Debug Extension now remembers its "on/off" setting across application reloads. This is significant because it means that the Seer extension can be left installed even in heavy deck.gl applications with lots of layers, and turned on only during debugging, without any performance impact during normal usage.

### Shader Modules[​](#shader-modules-1 "Direct link to Shader Modules")

Note: This change is mainly relevant to developers who write custom deck.gl layers.

* Shader module documentation is much improved, both in deck.gl and luma.gl. In the deck.gl docs, shader modules are listed in the "API Reference" section, after the JavaScript classes.
* The `project` module provides a new function `project_pixel_to_clipspace` for screen space calculations that takes variables like `useDevicePixels` and "focal distance" into account, making pixel space calculation simpler and less prone to fail when parameters change.
* The core deck.gl shader modules (`project` etc) now conform to the luma.gl shadertools conventions for naming uniforms and functions, making this module easier to describe and use. In spite of these changes, backwards compatible uniforms are provided to ensure that existing layers do not break.

### React Integration[​](#react-integration "Direct link to React Integration")

#### React 16 Support[​](#react-16-support "Direct link to React 16 Support")

deck.gl v5 now supports React 16 and the `package.json` dependencies of all React-based examples have updated to React 16.

### Experimental Features[​](#experimental-features "Direct link to Experimental Features")

As usual, deck.gl 5.0 contains a number of experimental features, e.g. "multi viewport", "first person viewport" and "viewport transitions". These features are still being finalized and the APIs have not been frozen, but can still be accessed by early adopters. See the roadmap article for more information on these.

## deck.gl v4.1[​](#deckgl-v41 "Direct link to deck.gl v4.1")

Release date: July 27th, 2017

|                                                                                            |                                                                                                 |
| ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/webgl2.jpg)*WebGL 2* | ![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/seer.png)*Seer Extension* |

### WebGL2 Support (provided by luma.gl v4)[​](#webgl2-support-provided-by-lumagl-v4 "Direct link to WebGL2 Support (provided by luma.gl v4)")

deck.gl v4.1 is based on luma.gl v4, a major release that adds full WebGL2 support as well as powerful features like WebGL state management and an improve GLSL shader module system. On all browsers that supports WebGL2 (e.g. recent Chrome and Firefox browsers), deck.gl will obtain WebGL2 context and utilize WebGL2 functionalities. To know more about WebGL2, please check [here](https://www.khronos.org/registry/webgl/specs/latest/2.0/).

### Query Methods[​](#query-methods "Direct link to Query Methods")

Two new functions - `DeckGL.queryObject` and `DeckGL.queryVisibleObjects` allow developers to directly query the picking results, in addition to handling picking via built-in click and hover callbacks. This allows applications to build more advanced event handling and makes deck.gl easier to integrate with existing applications that have already implemented their own event handling.

In addition, the `queryObject` offers a much requested `radius` parameter, allowing the application to specify how close an object needs to be to the specified coordinate to be considered a match (in deck.gl v4.0, picking will only trigger if an object is actually visible on the queried pixel, making it hard for users to select small features and thin lines).

### Shader Assembly[​](#shader-assembly "Direct link to Shader Assembly")

For developers that write their own custom layers, the `shadertools` shader assembly system is now in place to replace the existing `assembleShaders` function in deck.gl. The new shader assembler system supports organizing shader code into modules and is integrated with luma.gl's [`Model`](https://luma.gl/docs/api-reference/engine/model) so users no longer need to call `assembleShaders` before creating the `Model` for the layer.

### Per-Layer Control of WebGL Parameters[​](#per-layer-control-of-webgl-parameters "Direct link to Per-Layer Control of WebGL Parameters")

The base `Layer` class (which is inherited by all layers) supports a new property `parameters` that allows applications to specify the state of WebGL parameters such as blending mode, depth testing etc. This provides applications with significant control over the detailed rendering of layers. Note that the new `parameters` prop directly leverages the luma.gl v4 [setParameters](https://luma.gl/docs/api-reference-legacy/context/parameter-setting#setparameters) API, which allows all WebGL parameters to be specified as keys in a single parameter object.

### Layer Attribute Control[​](#layer-attribute-control "Direct link to Layer Attribute Control")

Pre-calculated "Vertex Attributes" can now be passed as props, meaning that developers that are willing to learn how a deck.gl layer's vertex attributes are structured can pass in typed arrays as props to the layer and have these directly passed to the GPU. This prevents the layer's internal `AttributeManager` from generating the attributes from your data, allowing you to optimize by e.g. directly passing in binary data from calculations or a binary file load without having deck.gl do any transformation on your data.

### CompositeLayer[​](#compositelayer "Direct link to CompositeLayer")

Composite layers, which were introduced in v4.0, have received some polish and performance improvements. In subclassed `CompositeLayer`s, the `renderLayers` function can now return a nested array that could contain `null` values, and deck.gl will automatically flatten, filter and render all layers in the array. This is a small convenience that can make your `renderLayers` methods in complex composite layers a little more readable.

```
   renderLayers() {

      return [

         setting1 && new ScatterplotLayer(...),

         setting2 && new LineLayer(...),

         this._renderAdditionalLayerList()

      ];

   }
```

Also, as a performance improvements, deck.gl now avoids "rerendering" sublayers of `CompositeLayer` whose props haven't changed.

### New Examples[​](#new-examples "Direct link to New Examples")

Several new examples have been added to illustrate the wide applicability of deck.gl. To name a few:

* Wind visualization in US. This example is featured on [OpenVIS 2017 by @philogb](https://www.youtube.com/watch?v=KPiONdmNOuI). This example shows how new features in WebGL2 can be used to accelerate compute intensive tasks through GPU computing right in the browsers
* Tagmap - This example by @rivulet-zhang shows some novel approching in placing and rendering text symbols in deck.gl
* Point cloud example - The point cloud example shows how deck.gl could be used to render large amount of 3D point cloud data without any basemap context.
* Node-link Graph - This is another example showing how deck.gl could be extended to the info-vis domain.

### Touch Support[​](#touch-support "Direct link to Touch Support")

deck.gl's default event handling now includes support for multitouch gestures to zoom and rotate the view. In addition, a new `EventManager` class solidifies deck.gl's support for event handling.

### Seer Integration[​](#seer-integration "Direct link to Seer Integration")

deck.gl is now integrated with the new [Seer Chrome extension](https://chrome.google.com/webstore/detail/seer/eogckabefmgphfgngjdmmlfbddmonfdh?hl=en). Simply installing Seer and rerunning your application opens up a new tab in the Chrome developer tools, providing you with the ability to see all your deck.gl layers, inspect (and edit) their properties and attributes and check per layer timings, such as the latest GPU draw calls or attribute updates.

And note that since luma.gl v4 also has a Seer integration, it is possible to follow links from deck.gl layer to luma.gl models inside Seer, enabling you to further drill down and understand what data is ultimately being generated and processed by the GPU.

## deck.gl v4.0[​](#deckgl-v40 "Direct link to deck.gl v4.0")

Release date: March 31, 2017

### Highlights[​](#highlights "Direct link to Highlights")

* **New Geospatial Layers** GeoJsonLayer, PathLayer, PolygonLayer, IconLayer, GridCellLayer, HexagonCellLayer, PointCloudLayer.
* **New Aggregating Layers** GridLayer and HexagonLayer now join the ScreenGridLayer in a growing family of layers that automatically "bin" your point data, in this case into grid cells or hexagons.
* **New Examples** deck.gl now provides multiple stand-alone examples, with minimal configuration files (`package.json`, `webpack.config.js` etc) intended to make it easy to just copy an example folder and get an app up and running in minutes.
* **Unified 64-bit Layers** - 64-bit Layers are now unified with 32-bit layers, controlled via a new `fp64` prop.
* **Library Size Reduction** - A number of npm package dependencies have been trimmed from deck.gl, and the distribution has initial support for "tree-shaking" bundlers like webpack2 and rollup.
* **Performance** A number of improvements across the core library and layers improves rendering and picking performance.
* **Model Matrix Support** - Model matrix support for the `METER_OFFSET` projection mode enables arbitrary coordinate transforms (translations, rotations, scaling etc) to be applied on individual layer enabling scene graph like layer composition and animation.
* **Documentation** Improved and reorganized in response to user feedback.
* **Experimental Features** Experimental support for non-Mercator projections and rendering effects (e.g. Reflections)

### New Layers[​](#new-layers "Direct link to New Layers")

#### GeoJsonLayer[​](#geojsonlayer-1 "Direct link to GeoJsonLayer")

A layer that parses and renders GeoJson. Supports all GeoJson primitives (polygons, lines and points). The GeoJsonLayer is an example of a composite layer that instantiates other layers (in this case `PathLayer`, `PolygonLayer` and `ScatterplotLayer`) to do the actual rendering. This layer replaces the now deprecated family of `ChoroplethLayer`s.

#### PathLayer[​](#pathlayer-1 "Direct link to PathLayer")

Takes a sequence of coordinates and renders them as a thick line with mitered or rounded end caps.

#### PolygonLayer[​](#polygonlayer "Direct link to PolygonLayer")

Each object in data is expected to provide a "closed" sequence of coordinates and renders them as a polygon, optionally extruded or in wireframe mode. Supports polygons with holes.

#### IconLayer[​](#iconlayer-1 "Direct link to IconLayer")

Allows the user to provide a texture atlas and a JSON configuration specifying where icons are located in the atlas.

#### GridLayer[​](#gridlayer-1 "Direct link to GridLayer")

A layer that draws rectangular, optionally elevated cells. A typical grid based heatmap layer. Differs from the `ScreenGridLayer` in that the cells are in world coordinates and pre aggregated.

#### HexagonLayer[​](#hexagonlayer "Direct link to HexagonLayer")

A layer that draws hexagonal, optionally elevated cells.

#### Point Cloud Layer[​](#point-cloud-layer "Direct link to Point Cloud Layer")

Draws a LiDAR point cloud. Supports point position/normal/color.

### Improvements to all Layers[​](#improvements-to-all-layers "Direct link to Improvements to all Layers")

#### Support for Per-Layer Model Matrix[​](#support-for-per-layer-model-matrix "Direct link to Support for Per-Layer Model Matrix")

Each layer now supports a `modelMatrix` property that can be used to specify a local coordinate system for the data in that layer:

* Model matrices can dramatically simplify working with data in different coordinate systems, as the data does not need to be pre-transformed into a common coordinate system.

* Model matrices also enable interesting layer animation and composition possibilities as individual layers can be scaled, rotated, translated etc with very low computational cost (i.e. without modifying the data).

#### UpdateTriggers now accept Accessor Names[​](#updatetriggers-now-accept-accessor-names "Direct link to UpdateTriggers now accept Accessor Names")

`updateTriggers` now accept Accessor Names.

The `updateTriggers` mechanism in deck.gl v3 required the user to know the name of the vertex attribute controlled by an accessor. It is now possible to supply names of `accessors`.

#### More intuitive mouse events[​](#more-intuitive-mouse-events "Direct link to More intuitive mouse events")

* `onHover` is now only fired on entering/exiting an object instead of on mouse move.
* `onClick` is now only fired on the picked layer instead of all pickable layers.

### New Features for Layer Subclassing[​](#new-features-for-layer-subclassing "Direct link to New Features for Layer Subclassing")

#### Overridable Shaders[​](#overridable-shaders "Direct link to Overridable Shaders")

All layers now have a `getShaders` method that can be overridden by subclasses, enables reuse of all layer code while just replacing one or both shaders, often dramatically reducing the amount of code needed to add a small feature or change to en existing layers.

### New Features for Layer Writers[​](#new-features-for-layer-writers "Direct link to New Features for Layer Writers")

#### `defaultProps`[​](#defaultprops "Direct link to defaultprops")

Layers are now encouraged to define a `defaultProps` static member listing their props and default values, rather than programmatically declaring the props in constructor parameters etc. Using `defaultProps` means that many layer classes no longer need a constructor.

#### AttributeManager now accepts new `accessor` field[​](#attributemanager-now-accepts-new-accessor-field "Direct link to attributemanager-now-accepts-new-accessor-field")

Can be a string or a an array of strings. Will be used to match `updateTriggers` accessor names with instance attributes.

#### `getPickingInfo()`[​](#getpickinginfo "Direct link to getpickinginfo")

This method replaces the old `pick()` method and is expected to return an info object. Layers can block the execution of callback functions by returning `null`.

### Performance[​](#performance-1 "Direct link to Performance")

A number of performance improvements and fixes have been gradually introduced since deck.gl v3.0 was launched. While many are not new in v4.0, cumulatively they enable noticeably better framerates and a lighter footprint when big data sets are loaded, compared to the initial v3.0.0 version.

The `AttributeManager` class now supports default logging of timings for attribute updates. This logging can be activated by simply setting `deck.log.priority=2` in the console (levels 1 and 2 provide different amounts of detail). This can be very helpful in verifying that your application is not triggering unnecessary attribute updates.

In addition, the new function `AttributeManager.setDefaultLogFunctions` allows the app to install its own custom logging functions to take even more control over logging of attribute updates.

### Library Improvements[​](#library-improvements "Direct link to Library Improvements")

JavaScript build tooling continues to evolve and efforts have been made to ensure deck.gl supports several popular new tooling setups:

* **Dependency Reduction** The number of npm dependencies (both in `deck.gl`, `luma.gl` and `react-map-gl`) have been reduced considerably, meaning that installing deck.gl and related modules will bring in less additional JavaScript code into your app, and your app will build and run faster.
* **Tree-shaking support**: deck.gl and related libraries now publish a "module" entry point in package.json which points to a parallel distribution (`deck.gl/dist-es6`) that preserves the `import` and `export` statements. This should allow tree shaking bundlers such as webpack 2 and rollup to further reduce bundle size.
* **Pure ES6 source code**: With few exceptions (e.g some JSX usage in examples), the source code of deck.gl and related modules are now all restricted to conformant ES6 (i.e. no ES2016 or ES2017, flow or similar syntax is used). This means that the source code can run directly (ie. without transpilation) in Node.js and modern browsers. You could potentially import code directly from `deck.gl/src` to experiment with this.
* **Buble support** in examples. [Buble](https://buble.surge.sh/guide/) is a nice alternative to babel if you have a simple app and don't need all the power of babel. Many of the examples now use buble for faster and smaller builds.

### Examples[​](#examples "Direct link to Examples")

Code examples have been improved in several ways:

* **Multiple Examples** deck.gl now provides multiple different examples in an `examples` folder, showing various interesting uses of deck.gl.
* **Stand Alone Examples** Examples are now stand alone, each with its own minimal `package.json` and configuration files, enabling them to be easily copied and modified.
* **Hello World Examples** Minimal examples for building with webpack 2 and browserify (previously called "exhibits") are still provided, and have been further simplified.
* **Layer Browser** The main `layer-browser` example has been expanded into a full "layer and property browser" allowing for easy testing of layers.

### Deprecations[​](#deprecations "Direct link to Deprecations")

The various Choropleth layers have been deprecated since deck.gl has new and better layers (`GeoJsonLayer`, `PathLayer`, `PolygonLayer`) that fill the same roles. The choropleth layers are still available but will not be maintained beyond critical bug fixes and will likely be removed in the next major version of deck.gl.

A careful API audit has also been done to align property names between old and new layers. While this will makes the layers more consistent and the combined API easier to learn and work with, it does mean that some properties have been renamed, with the old name being deprecated, and in some very few cases, default values have changed.

For more information on deprecations and how to update your code in response to these changes, please consult the deck.gl [Upgrade Guide](https://deck.gl/docs/upgrade-guide.md).

## deck.gl v3.0[​](#deckgl-v30 "Direct link to deck.gl v3.0")

Release date: November, 2016

### Highlights[​](#highlights-1 "Direct link to Highlights")

* New website
* Comprehensive documentation
* All Core Layers updated (API, features, performance)
* 64-bit Layers (High Precision)
* METERS projection mode (High Precision)
* Multi-Primitive Layer Support
* Composite Layer Support

### React Integration[​](#react-integration-1 "Direct link to React Integration")

* `DeckGL` (`DeckGLOverlay` in v2) component now requires a separate import (`import DeckGL from 'deck.gl/react'`). This allows the core deck.gl library to be imported by non-React applications without pulling in React.
* Adds `onLayerClick` and `onLayerHover` props to the `DeckGL` React component.
* The `DeckGL` component now cancels animation loop on unmount, important when repeatedly creating/destroying deck.gl components.
* The `DeckGL` component no longer manages WebGL blending modes, as this is better done directly by layers.

### Layers[​](#layers-3 "Direct link to Layers")

* All layers now support accessors, removing the need for applications to transform data before passing it to deck.gl.
* Layer props and accessors now always expect arrays (e.g. colors are expected as `[r,g,b,a]` instead of `{r,g,b,a}` etc).
* line widths now takes device pixel ratio into account for more consistent look between displays
* METERS projection mode allows specifying positions in meter offsets in addition to longitude/latitude.
* Layers now receive viewport information from the `DeckGL` component. This implies that apps no longer need to pass the `width`, `height`, `longitude`, `latitude`, `zoom`, `pitch`, `bearing` and `bearing` props to each layer. These properties only need to be passed to the `DeckGL` react component.

#### Base Layer[​](#base-layer "Direct link to Base Layer")

* `deepCompare` prop replaced with more flexible `dataComparator`

#### ArcLayer[​](#arclayer "Direct link to ArcLayer")

* Specify separate start and end color for each arc.
* Renders smoother arcs, especially for bottom arc segments close to map
* Fixes flickering last segments

#### ScatterplotLayer[​](#scatterplotlayer "Direct link to ScatterplotLayer")

* Adds drawOutline option.

##### ScreenGridLayer[​](#screengridlayer-1 "Direct link to ScreenGridLayer")

* New name for deck.gl v2 GridLayer
* Now have accessors (getPosition, getWeight)
* Custom color ramps (minColor, maxColor)

##### ChoroplethLayer[​](#choroplethlayer "Direct link to ChoroplethLayer")

* Now renders MultiPolygons and Polygons with holes

##### HexagonLayer (REMOVED)[​](#hexagonlayer-removed "Direct link to HexagonLayer (REMOVED)")

* The v2 HexagonLayer has not yet been ported to v3.

#### 64bit layers[​](#64bit-layers "Direct link to 64bit layers")

A set of new high precision layers that support extreme zoom levels

##### ArcLayer64 (NEW)[​](#arclayer64-new "Direct link to ArcLayer64 (NEW)")

##### ChoroplethLayer64 (NEW)[​](#choroplethlayer64-new "Direct link to ChoroplethLayer64 (NEW)")

##### ScatterplotLayer64 (NEW)[​](#scatterplotlayer64-new "Direct link to ScatterplotLayer64 (NEW)")

##### 64 bit ExtrudedChoroplethLayer (NEW)[​](#64-bit-extrudedchoroplethlayer-new "Direct link to 64 bit ExtrudedChoroplethLayer (NEW)")

* Great for rendering 3D buildings on top of maps
* Includes a basic shading model

##### GeoJsonLayer (NEW, EXPERIMENTAL)[​](#geojsonlayer-new-experimental "Direct link to GeoJsonLayer (NEW, EXPERIMENTAL)")

* Initial composite layer, only Polygons for now.

#### Sample Layers[​](#sample-layers "Direct link to Sample Layers")

Sample layers now available through `import 'deck.gl/samples';`

### Changes affecting Custom Layers[​](#changes-affecting-custom-layers "Direct link to Changes affecting Custom Layers")

#### Streamlined life cycle methods[​](#streamlined-life-cycle-methods "Direct link to Streamlined life cycle methods")

* The Layer life cycle methods are now optimized for deck.gl's needs and no longer try to mimic React.
* Limited compatibility with deck.gl v2 is provided but it is strongly recommended to update layers to the new methods

#### Optimizations[​](#optimizations "Direct link to Optimizations")

* `Uint8Array` encoding is now supported for color and picking color attributes, which provides significant GPU memory savings.

#### GLSL package manager and modules[​](#glsl-package-manager-and-modules "Direct link to GLSL package manager and modules")

* All layers now use `assembleShaders` to inject GLSL packages and platform fixes

* GLSL `project` package

  <!-- -->

  * GLSL `fp64` emulated double precision floating point package

  * GLSL `fp32` package - 32bit improved precision library

    <!-- -->

    * Adds high precision version of trigonometry functions and `tan`
    * Especially for Intel GPUs

## deck.gl v2[​](#deckgl-v2 "Direct link to deck.gl v2")

Release date: May 2016

### Highlights[​](#highlights-2 "Direct link to Highlights")

* 3D Perspective Mode
* Performance: Huge under the hood refactor of layer update logic
* Automatic attribute management (`AttributeManager` class)
* Linux fixes - deck.gl and luma.gl now work on Linux.
* Adopts [luma.gl](https://github.com/visgl/luma.gl) as default WebGL framework.
* Retina display support
* Support for disabling mercator project (experimental)

### React Integration[​](#react-integration-2 "Direct link to React Integration")

* Ability to specify canvas ID and customize styles

### Layers[​](#layers-4 "Direct link to Layers")

* Added data deep comparison support

#### ScatterplotLayer[​](#scatterplotlayer-1 "Direct link to ScatterplotLayer")

* Add per point radius support for the scatterplot-layer
* Added per point color support for the scatterplot-layer
* Fixed primitive distortion bug

#### LineLayer (NEW)[​](#linelayer-new "Direct link to LineLayer (NEW)")

## deck.gl v1[​](#deckgl-v1 "Direct link to deck.gl v1")

Original release date: December 2015

Initial open-source version of deck.gl, with five sample layers.
