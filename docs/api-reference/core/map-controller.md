# MapController

Inherits from [Base Controller](./controller.md).

The `MapController` class can be passed to either the `Deck` class's [controller](./deck.md#controller) prop or a `View` class's [controller](./view.md#controller) prop to specify that map interaction should be enabled.

`MapController` is the default controller for [MapView](./map-view.md)..

## Usage

Use with the default view:

```js
import {Deck} from '@deck.gl/core';

new Deck({
  controller: {doubleClickZoom: false, inertia: true},
  initialViewState: viewState
});
```

is equivalent to:

```js
import {Deck} from '@deck.gl/core';

new Deck({
  views: new MapView({
    controller: {doubleClickZoom: false,  inertia: true}
  }),
  initialViewState: viewState
})
```

## Options

Supports all [Controller options](./controller.md#options) with the following default behavior:

- `dragMode` - default `'pan'` (drag to pan, shift/ctrl + drag to rotate)
- `keyboard` - arrow keys to pan, arrow keys with shift/ctrl down to rotate, +/- to zoom
- `normalize` - normalize viewport props to fit map height into viewport. Default `true`

## Custom MapController

You can further customize the `MapController`'s behavior by extending the class:

```js
import {Deck, MapController} from '@deck.gl/core';

class MyMapController extends MapController {

  handleEvent(event) {
    if (event.type === 'pan') {
      // do something
    } else {
      super.handleEvent(event);
    }
  }
}

new Deck({
  controller: {type: MyMapController},
  initialViewState: viewState
})
```

See the `Controller` class [documentation](./controller.md#methods) for the methods that you can use and/or override.

## MapState

The `MapState` class manages the internal state of the map controller. It provides methods for handling user interactions like panning, rotating, and zooming.

### Usage

```js
import {MapState} from '@deck.gl/core';

// Create a MapState instance
const mapState = new MapState({
  width: 800,
  height: 600,
  latitude: 37.7749,
  longitude: -122.4194,
  zoom: 11,
  bearing: 0,
  pitch: 0,
  makeViewport: (props) => new WebMercatorViewport(props)
});

// Use MapState methods
const newState = mapState.pan({pos: [100, 100]});
const zoomedState = mapState.zoom({pos: [400, 300], scale: 2});
```

### Methods

MapState provides the following interaction methods:

- `panStart({pos})` - Start a pan interaction
- `pan({pos, startPos})` - Pan the map
- `panEnd()` - End a pan interaction
- `rotateStart({pos})` - Start a rotation interaction
- `rotate({pos, deltaAngleX, deltaAngleY})` - Rotate the map
- `rotateEnd()` - End a rotation interaction
- `zoomStart({pos})` - Start a zoom interaction
- `zoom({pos, startPos, scale})` - Zoom the map
- `zoomEnd()` - End a zoom interaction
- `zoomIn(speed)` - Zoom in
- `zoomOut(speed)` - Zoom out
- `moveLeft(speed)`, `moveRight(speed)`, `moveUp(speed)`, `moveDown(speed)` - Move the map
- `rotateLeft(speed)`, `rotateRight(speed)`, `rotateUp(speed)`, `rotateDown(speed)` - Rotate the map

## MapStateProps

The `MapStateProps` type defines the properties for configuring map viewport state.

### Properties

- `width` (number) - The width of the viewport
- `height` (number) - The height of the viewport
- `latitude` (number) - The latitude at the center of the viewport
- `longitude` (number) - The longitude at the center of the viewport
- `zoom` (number) - The tile zoom level of the map
- `bearing` (number, optional) - The bearing of the viewport in degrees. Default `0`
- `pitch` (number, optional) - The pitch of the viewport in degrees. Default `0`
- `altitude` (number, optional) - Specify the altitude of the viewport camera. Unit: map heights. Default `1.5`
- `position` ([number, number, number], optional) - Viewport position. Default `[0, 0, 0]`
- `maxZoom` (number, optional) - Maximum zoom level. Default `20`
- `minZoom` (number, optional) - Minimum zoom level. Default `0`
- `maxPitch` (number, optional) - Maximum pitch in degrees. Default `60`
- `minPitch` (number, optional) - Minimum pitch in degrees. Default `0`
- `normalize` (boolean, optional) - Normalize viewport props to fit map height into viewport. Default `true`

### Usage

```js
import type {MapStateProps} from '@deck.gl/core';

const viewState: MapStateProps = {
  width: 800,
  height: 600,
  latitude: 37.7749,
  longitude: -122.4194,
  zoom: 11,
  bearing: 0,
  pitch: 45,
  maxZoom: 18,
  minZoom: 5
};
```

## Source

[modules/core/src/controllers/map-controller.ts](https://github.com/visgl/deck.gl/blob/master/modules/core/src/controllers/map-controller.ts)
