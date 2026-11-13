# GlobeController (Experimental)

Inherits from [Base Controller](./controller.md).

The `GlobeController` class can be passed to either the `Deck` class's [controller](./deck.md#controller) prop or a `View` class's [controller](./view.md#controller) prop to specify that viewport interaction should be enabled.

`GlobeController` is the default controller for [GlobeView](./globe-view.md).

## Usage

Use with the default view:

```js
import {Deck, _GlobeView as GlobeView} from '@deck.gl/core';

new Deck({
  views: new GlobeView(),
  controller: {keyboard: false, inertia: true},
  initialViewState: viewState
});
```

is equivalent to:

```js
import {Deck, _GlobeView as GlobeView} from '@deck.gl/core';

new Deck({
  views: new GlobeView({
    controller: {keyboard: false, inertia: true}
  }),
  initialViewState: viewState
})
```

## Options

Supports all [Controller options](./controller.md#options) with the following default behavior:

- `dragPan`: default `'pan'` (drag to pan)
- `dragRotate`: shift+drag or right-click drag to change bearing and pitch
- `multiTouchDrag`: two-pointer translation can pan or change bearing and pitch
- `keyboard`: arrow keys to pan, +/- to zoom
- `navigation`: default `'map'`. Pan and zoom preserve bearing. Use `'ball'` to opt into free rotation through the poles.
- `zoomAround`: default `'pointer'`. Keeps zoom anchored near the pointer, subject to the navigation mode and constraints. Use `'center'` to change scale without steering.
- `inertia`: when set to a number (milliseconds), movement continues after a fling with exponential decay, following the selected navigation mode. Default `false`.
- `maxBounds` - constrains the viewport to the specified bounding box `[[minLng, minLat], [maxLng, maxLat]]`
- `maxBoundsPadding` - padding inside the viewport when fitting `maxBounds`, using the same `{left, right, top, bottom}` format as view padding. Numeric values are pixels; strings may be percentages or layout expressions such as `calc(10% - 4px)`. Each side is measured from the projected globe center. Default `0`.
- `rubberBand` - default `false`. Enables resisted overshoot during continuous pan, zoom, bearing, and pitch (tilt) gestures. Applies to `maxBounds`, `minZoom`/`maxZoom`, `minPitch`/`maxPitch`, and optional `minBearing`/`maxBearing`. Releasing an overscrolled pan returns to the nearest valid view in 300 ms; rotation and zoom retain configured inertia when present, otherwise returning in 300 ms. Keyboard, wheel, double-click zoom, and programmatic transition destinations use hard constraints. Intermediate rebound frames preserve the displayed overshoot.

### Elastic constraints

Rubber band changes the response at a limit, not the navigation style. For example, with `maxPitch: 45`, a hard constraint stops tilt at 45 degrees. With `rubberBand: true`, a continuous drag can temporarily pull past 45 degrees with increasing resistance, then returns to the allowed range on release. If an axis has no limit, there is nothing to spring back from.

Configure geographic bounds on the controller and zoom/rotation limits on the view state:

```js
new Deck({
  views: new GlobeView(),
  controller: {
    rubberBand: true,
    maxBounds: [[-20, -20], [20, 20]],
    maxBoundsPadding: {left: 40, right: 40, top: 40, bottom: 40},
    multiTouchDrag: 'rotate'
  },
  initialViewState: {
    longitude: 0,
    latitude: 0,
    zoom: 5,
    minZoom: 3,
    maxZoom: 8,
    pitch: 30,
    minPitch: 0,
    maxPitch: 60,
    minBearing: -45,
    maxBearing: 45
  }
});
```

Explicit bearing rotation remains unrestricted by default. Set `minBearing` and `maxBearing` to limit it; there is no automatic return to north-up at low zoom. Bearing limits describe a numerical, increasing interval in degrees. For a range crossing south, use `minBearing: 170, maxBearing: 190` and `bearing: 185`, not its equivalent `-175`. Constrained bearings remain unwrapped on the configured interval, including elastic overshoot; unrestricted bearings are normalized to `[-180, 180]`. An interval spanning at least 360 degrees is unrestricted. Tilt is controlled by `pitch`; it is not a separate view-state property.

Elastic behavior follows the semantic action regardless of input mapping: drag, modifier/right-button drag, `dragMode`, two-finger translation, enabled trackpad gestures, pinch/twist, and double-click drag zoom use the same constraints. Disabled gestures remain disabled. Without `maxBounds`, panning has no regional limits; the selected navigation mode still enforces its latitude range.

`maxBounds` fits the viewport into a geographic region, not just its center. Its effective pan and minimum zoom limits depend on viewport size and `maxBoundsPadding`, so the camera can stop before its center reaches the region's edge.

### `navigation` (string) {#navigation}

- `'map'` (default): dragging, keyboard panning, pointer-anchored zoom, and pan inertia preserve the current bearing. With `bearing: 0`, north stays up. Latitude stops at approximately `±85.051°`, preventing pole crossing. Deliberate rotation gestures still change bearing and pitch.
- `'ball'`: dragging and pointer-anchored zoom rotate the full camera frame through the poles. Bearing evolves with the frame and pan inertia follows a fixed sphere axis.

Navigation does not switch automatically based on bearing or zoom. Changing `navigation` cancels active gesture anchors and inertia. `dragMode` still selects the primary drag action, and `zoomAround: 'center'` zooms without steering in either mode.

## Custom GlobeController

You can further customize the `GlobeController`'s behavior by extending the class:

```js
import {Deck, _GlobeView as GlobeView, _GlobeController as GlobeController} from '@deck.gl/core';

class MyGlobeController extends GlobeController {

  handleEvent(event) {
    if (event.type === 'pan') {
      // do something
    } else {
      super.handleEvent(event);
    }
  }
}

new Deck({
  views: new GlobeView(),
  controller: {type: MyGlobeController},
  initialViewState: viewState
})
```

See the `Controller` class [documentation](./controller.md#methods) for the methods that you can use and/or override.


## Source

[modules/core/src/controllers/globe-controller.ts](https://github.com/visgl/deck.gl/blob/master/modules/core/src/controllers/globe-controller.ts)
