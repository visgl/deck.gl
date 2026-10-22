# OrthographicView

The `OrthographicView` class is a subclass of [View](https://deck.gl/docs/api-reference/core/view.md) that creates a top-down view of the XY plane. It is usually used for rendering 2D charts in non-geospatial use cases.

It's recommended that you read the [Views and Projections guide](https://deck.gl/docs/developer-guide/views.md) before using this class.

[deck.gl OrthographicView](https://codepen.io/vis-gl/embed/YzpXqzv?height=450\&theme-id=light\&default-tab=result)

## Constructor[​](#constructor "Direct link to Constructor")

```
import {OrthographicView} from '@deck.gl/core';

const view = new OrthographicView({id, ...});
```

`OrthographicView` takes the same parameters as the [View](https://deck.gl/docs/api-reference/core/view.md) superclass constructor, plus the following:

#### `flipY` (boolean)[​](#flipy "Direct link to flipy")

Whether to use top-left coordinates (`true`) or bottom-left coordinates (`false`). Default `true`.

#### `near` (number, optional)[​](#near "Direct link to near")

Distance of near clipping plane. Default `0.1`.

#### `far` (number, optional)[​](#far "Direct link to far")

Distance of far clipping plane. Default `1000`.

## View State[​](#view-state "Direct link to View State")

To render, `OrthographicView` needs to be used together with a `viewState` with the following parameters:

* `target` (number\[3], optional) - The world position at the center of the viewport. Default `[0, 0, 0]`.
* `zoom` (number, optional) - The zoom level of the viewport. `zoom: 0` maps one unit distance to one pixel on screen, and increasing `zoom` by `1` scales the same object to twice as large. To apply independent zoom levels to the X and Y axes, use `zoomX` and `zoomY`. Default `0`.
* `zoomX` (number, optional) - The zoom level along X axis. Overrides `zoom` if supplied.
* `zoomY` (number, optional) - The zoom level along Y axis. Overrides `zoom` if supplied.
* `minZoom` (number, optional) - The min zoom level of the viewport. Default `-Infinity`.
* `maxZoom` (number, optional) - The max zoom level of the viewport. Default `Infinity`.
* `minZoomX` (number, optional) - The min zoom level of the viewport on X axis. Default `minZoom`.
* `maxZoomX` (number, optional) - The max zoom level of the viewport on X axis. Default `maxZoom`.
* `minZoomY` (number, optional) - The min zoom level of the viewport on Y axis. Default `minZoom`.
* `maxZoomY` (number, optional) - The max zoom level of the viewport on Y axis. Default `maxZoom`.

## Controller[​](#controller "Direct link to Controller")

By default, `OrthographicView` uses the `OrthographicController` to handle interactivity. To enable the controller, use:

```
const view = new OrthographicView({id: '2d-scene', controller: true});
```

Visit the [OrthographicController](https://deck.gl/docs/api-reference/core/orthographic-controller.md) documentation for a full list of supported options.

## Remarks[​](#remarks "Direct link to Remarks")

### Common size resolution[​](#common-size-resolution "Direct link to Common size resolution")

This section describes how geometry size (e.g. scatterplot radius, path width, text size) of [common units](https://deck.gl/docs/developer-guide/coordinate-systems.md#common) is resolved in OrthographicView.

When a uniform zoom is used, like all other view types, the `zoom` view state is used to project both position and size. When the X and Y axes zoom independently, it becomes ambiguous whether size should follow X or Y. By default, size is scaled to `Math.min(zoomX, zoomY)`, to provide visual stability. You may override this behavior by supplying a `zoom` value. While `zoom` is shadowed by `zoomX` and `zoomY` during position projection, it will be used to project sizes.

## Source[​](#source "Direct link to Source")

[modules/core/src/views/orthographic-view.ts](https://github.com/visgl/deck.gl/tree/9.4-release/modules/core/src/views/orthographic-view.ts)
