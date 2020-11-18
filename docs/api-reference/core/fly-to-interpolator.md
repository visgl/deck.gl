# FlyToInterpolator

Performs "fly to" style interpolation between two geospatial view states. Implements [TransitionInterpolator](/docs/api-reference/core/transition-interpolator.md).

See [View State Transitions](/docs/developer-guide/view-state-transitions.md) for usage examples.


## Constructor

```js
import {FlyToInterpolator} from '@deck.gl/core';

new FlyToInterpolator({speed: 2});
```

Parameters:

- options (Object)
  * `curve` (Number, optional) - The zooming "curve" that will occur along the flight path. Default `1.414`.
  * `speed` (Number, optional) - The average speed of the animation defined in relation to `options.curve`, it linearly affects the duration, higher speed returns smaller durations and vice versa. Default `1.2`.
  * `screenSpeed` (Number, optional) - The average speed of the animation measured in screenfuls per second. Similar to `speed` it linearly affects the duration,  when specified `speed` is ignored.
  * `maxDuration` (Number, optional) - Maximum duration in milliseconds, if calculated duration exceeds this value, `0` is returned.


## Source

[modules/core/src/transitions/viewport-fly-to-interpolator.js](https://github.com/visgl/deck.gl/blob/master/modules/core/src/transitions/viewport-fly-to-interpolator.js)
