# GlobeView

The `GlobeView` class is a subclass of [View](https://deck.gl/next/docs/api-reference/core/view.md). This view projects the earth into a 3D globe.

It's recommended that you read the [Views and Projections guide](https://deck.gl/next/docs/developer-guide/views.md) before using this class.

[deck.gl GlobeView](https://codepen.io/vis-gl/embed/JjbdXjr?height=450\&theme-id=light\&default-tab=result)

## Target CRS[​](#target-crs "Direct link to Target CRS")

`GlobeViewport.crs` describes standard geocentric XYZ coordinates in meters on the existing deck.gl sphere, with radius 6370972 meters. The descriptor is defined locally using math.gl's geocentric projection plugin. The viewport retains its common-space orientation, radius, and altitude behavior during the CRS transition.

Descriptor bounds enclose the reference sphere and describe a rendering target, not coordinate validity or limits on altitude.

## Limitations[​](#limitations "Direct link to Limitations")

The goal of `GlobeView` is to provide a generic solution to rendering and navigating data in the 3D space.

* Above zoom 12, `GlobeView` renders with a [WebMercatorViewport](https://deck.gl/next/docs/api-reference/core/web-mercator-viewport.md), at the same precision as `MapView`. Below zoom 12, positions are projected with 32-bit floats; software renderers such as SwiftShader can place them hundreds of meters off.

* Supports layers in `'lnglat'` (the default value of the `coordinateSystem` prop) and `'meter-offsets'` coordinates.

* Polygons, paths and tiles follow the curve of the globe only when the view's `resolution` is set, e.g. `new GlobeView({resolution: 36})` for 10° steps. With the default `0`, their edges are straight.

* A layer shared across views prepares one set of geometry using the first viewport in which it is eligible to draw during a non-picking pass. To prepare geometry separately for a map and a globe, use separate layer instances with distinct IDs and filter each to its own viewport using [`layerFilter`](https://deck.gl/next/docs/api-reference/core/deck.md#layerfilter).

* These layers currently do not work in this view:

  <!-- -->

  * Aggregation layers: `HeatmapLayer`, `ContourLayer`, `GridLayer`, `HexagonLayer`, `ScreenGridLayer`
  * `MVTLayer` polygon fills

* Support for `TerrainLayer` and [TerrainExtension](https://deck.gl/next/docs/api-reference/extensions/terrain-extension.md) is experimental.

* In interleaved MapLibre globe mode, the depth test can hide deck.gl layers at some zoom levels. Use the overlaid mode (`interleaved: false`), or `parameters: {depthCompare: 'always'}` on the layer.

When GeoJson paths and polygons are rendered with this view, the straight lines and flat surfaces are warped to the surface of the globe. Note that the warped edges still correspond to straight lines in the Mercator projection. To draw lines along the shortest distance on the globe, use the [GreatCircleLayer](https://deck.gl/next/docs/api-reference/geo-layers/great-circle-layer.md).

## Constructor[​](#constructor "Direct link to Constructor")

```
import {GlobeView} from '@deck.gl/core';

const view = new GlobeView({id, ...});
```

`GlobeView` takes the same parameters as the [View](https://deck.gl/next/docs/api-reference/core/view.md) superclass constructor, plus the following:

#### `nearZMultiplier` (number, optional)[​](#nearzmultiplier "Direct link to nearzmultiplier")

Scaler for the near plane, 1 unit equals to the height of the viewport. Default to `0.1`. Overwrites the `near` parameter.

#### `farZMultiplier` (number, optional)[​](#farzmultiplier "Direct link to farzmultiplier")

Scaler for the far plane, 1 unit equals to the distance from the camera to the edge of the screen. Default to `2`. Overwrites the `far` parameter.

#### `minimumElevation` (number, optional)[​](#minimumelevation "Direct link to minimumelevation")

Lowest visible elevation in meters when `GlobeView` switches to Web Mercator above zoom 12. See [`MapView.minimumElevation`](https://deck.gl/next/docs/api-reference/core/map-view.md#minimumelevation) for defaults and clipping behavior.

#### `parameters` (object, optional)[​](#parameters "Direct link to parameters")

`GlobeView` enables back-face culling by default with `parameters: {cullMode: 'back'}`. To override this behavior, supply the desired GPU parameters to the constructor:

```
new GlobeView({

  parameters: {cullMode: 'none'}

});
```

## View State[​](#view-state "Direct link to View State")

To render, `GlobeView` needs to be used together with a `viewState` with the following parameters:

* `longitude` (number) - longitude at the viewport center
* `latitude` (number) - latitude at the viewport center
* `zoom` (number) - zoom level
* `bearing` (number, optional) - bearing angle in degrees. Default `0` (north up).
* `pitch` (number, optional) - pitch angle in degrees. `0` looks straight down at the earth. Default `0`.
* `maxZoom` (number, optional) - max zoom level. Default `20`.
* `minZoom` (number, optional) - min zoom level. Default `0`.
* `maxPitch` (number, optional) - max pitch angle. Default `60`.
* `minPitch` (number, optional) - min pitch angle. Default `0`.
* `position` (number\[3], optional) - Viewport center offsets from lng, lat in meters. Default: `[0,0,0]`.

When `bearing` is `0` (the default), north is always kept pointing up and the globe behaves like a traditional desk globe — horizontal drag changes longitude, vertical drag changes latitude, and the polar axis stays fixed. When the user changes the bearing (via shift+drag or right-click drag), the globe enters free rotation mode where bearing evolves naturally to avoid orientation discontinuities near the poles.

## Controller[​](#controller "Direct link to Controller")

By default, `GlobeView` uses the `GlobeController` to handle interactivity. To enable the controller, use:

```
const view = new GlobeView({id: 'globe', controller: true});
```

Visit the [GlobeController](https://deck.gl/next/docs/api-reference/core/globe-controller.md) documentation for a full list of supported options.

# Remarks

## Occlusion[​](#occlusion "Direct link to Occlusion")

In the MapView, it is often sufficient to provide a solid background color where there is no geometry. In the GlobeView, the user can "see through" to the other side of the earth. There are two ways to fix this:

* Render a polygon that represents the surface of the earth:

```
new SolidPolygonLayer({

  id: 'background',

  data: [

    [[-180, 90], [0, 90], [180, 90], [180, -90], [0, -90], [-180, -90]]

  ],

  getPolygon: d => d,

  stroked: false,

  filled: true,

  getFillColor: [40, 40, 40]

})
```

* Discard surfaces that face away from the camera. This is the default: `GlobeView` sets `parameters: {cullMode: 'back'}`, see [parameters](#parameters).

## Source[​](#source "Direct link to Source")

[modules/core/src/views/globe-view.ts](https://github.com/visgl/deck.gl/blob/master/modules/core/src/views/globe-view.ts)
