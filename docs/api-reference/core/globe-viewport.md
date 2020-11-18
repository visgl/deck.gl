# GlobeViewport (Experimental)

The `GlobeViewport` class takes globe view states (`latitude`, `longitude`, and `zoom`), and performs projections between world and screen coordinates. It is a helper class for visualizing the earth as a 3D globe.

## Usage

A `GlobeViewport` instance is created under the hood by a [GlobeView](/docs/api-reference/core/globe-view.md).

```js
import {_GlobeViewport as GlobeViewport} from '@deck.gl/core';

const viewport = new GlobeViewport({
  width: 600,
  height: 400,
  longitude: -122.45,
  latitude: 37.78,
  zoom: 12
});

viewport.project([-122.45, 37.78]);
// [300,200]
```


## Constructor

```js
new GlobeViewport({width, height, longitude, latitude, zoom});
```

Parameters:

* `opts` (Object) - Globe viewport options

  + `width` (Number) - Width of the viewport.
  + `height` (Number) - Height of the viewport.

  geospatial arguments:

  + `latitude` (Number, optional) - Latitude of the viewport center on map. Default to `0`.
  + `longitude` (Number, optional) - Longitude of the viewport center on map. Default to `0`.
  + `zoom` (Number, optional) - Map zoom (scale is calculated as `2^zoom`). Default to `11`.
  + `altitude` (Number, optional) - Altitude of camera, 1 unit equals to the height of the viewport. Default to `1.5`.

  projection matrix arguments:

  + `nearZMultiplier` (Number, optional) - Scaler for the near plane, 1 unit equals to the height of the viewport. Default to `0.1`.
  + `farZMultiplier` (Number, optional) - Scaler for the far plane, 1 unit equals to the distance from the camera to the top edge of the screen. Default to `1`.

Remarks:

* `width` and `height` are forced to 1 if supplied as 0, to avoid division by zero. This is intended to reduce the burden of apps to check values before instantiating a `Viewport`.
*  Per cartographic tradition, longitudes and latitudes are specified as degrees.

Inherits all [Viewport methods](/docs/api-reference/core/viewport.md#methods).

## Methods

Inherits all methods from [Viewport](/docs/api-reference/core/viewport.md).

##### `project`

Projects world coordinates to pixel coordinates on screen.

Parameters:

* `coordinates` (Array) - `[longitude, latitude, altitude]`. `altitude` is in meters and default to `0` if not supplied.
* `opts` (Object)
  + `topLeft` (Boolean, optional) - Whether projected coords are top left. Default to `true`.

Returns:

* `[x, y]` or `[x, y, z]` in pixels coordinates. `z` is pixel depth.
  + If input is `[longitude, latitude]`: returns `[x, y]`.
  + If input is `[longitude, latitude: altitude]`: returns `[x, y, z]`.


##### `unproject`

Unproject pixel coordinates on screen into world coordinates.

Parameters:

* `pixels` (Array) - `[x, y, z]` in pixel coordinates. Passing a `z` is optional.
* `opts` (Object)
  + `topLeft` (Boolean, optional) - Whether projected coords are top left. Default to `true`.
  + `targetZ` (Number, optional) - If pixel depth `z` is not specified in `pixels`, this is used as the elevation plane to unproject onto. Default `0`.

Returns:

* `[longitude, latitude]` or `[longitude, latitude, altitude]` in world coordinates. `altitude` is in meters.
  + If input is `[x, y]` without specifying `opts.targetZ`: returns `[longitude, latitude]`.
  + If input is `[x, y]` with `opts.targetZ`: returns `[longitude, latitude, targetZ]`.
  + If input is `[x, y, z]`: returns `[longitude, latitude, altitude]`.


## Source

[modules/core/src/viewports/globe-viewport.js](https://github.com/visgl/deck.gl/blob/master/modules/core/src/viewports/globe-viewport.js)
