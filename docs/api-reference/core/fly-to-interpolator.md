# FlyToInterpolator

Performs "fly to" style interpolation between two geospatial view states. Implements [TransitionInterpolator](./transition-interpolator.md).

The camera's `longitude`, `latitude`, and `zoom` follow a smooth flight path that combines panning and zooming. For distant destinations, the camera can zoom out to show more of the route, then zoom in to the target zoom level as it approaches the destination. The `curve` option controls how much zooming occurs along the path.

The camera’s `bearing`, `pitch`, `roll`, and `position` are interpolated linearly during the flight.

See [View State Transitions](../../developer-guide/animations-and-transitions.md#camera-transitions) for usage examples.


## Constructor

```js
import {FlyToInterpolator} from '@deck.gl/core';

new FlyToInterpolator({speed: 2});
```

Parameters:

- options (object)
  * `curve` (number, optional) - The zooming "curve" that will occur along the flight path. Default `1.414`.
  * `speed` (number, optional) - The average speed of the animation defined in relation to `options.curve`, it linearly affects the duration, higher speed returns smaller durations and vice versa. Default `1.2`.
  * `screenSpeed` (number, optional) - The average speed of the animation measured in screenfuls per second. Similar to `speed` it linearly affects the duration,  when specified `speed` is ignored.
  * `maxDuration` (number, optional) - Maximum duration in milliseconds, if calculated duration exceeds this value, `0` is returned.


## Source

[modules/core/src/transitions/fly-to-interpolator.ts](https://github.com/visgl/deck.gl/blob/master/modules/core/src/transitions/fly-to-interpolator.ts)
