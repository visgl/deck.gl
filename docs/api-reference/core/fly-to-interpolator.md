# FlyToInterpolator

Performs "fly to" style interpolation between two geospatial view states. Implements [TransitionInterpolator](https://deck.gl/docs/api-reference/core/transition-interpolator.md).

See [View State Transitions](https://deck.gl/docs/developer-guide/animations-and-transitions.md#camera-transitions) for usage examples.

## Constructor[​](#constructor "Direct link to Constructor")

```
import {FlyToInterpolator} from '@deck.gl/core';



new FlyToInterpolator({speed: 2});
```

Parameters:

* options (object)

  <!-- -->

  * `curve` (number, optional) - The zooming "curve" that will occur along the flight path. Default `1.414`.
  * `speed` (number, optional) - The average speed of the animation defined in relation to `options.curve`, it linearly affects the duration, higher speed returns smaller durations and vice versa. Default `1.2`.
  * `screenSpeed` (number, optional) - The average speed of the animation measured in screenfuls per second. Similar to `speed` it linearly affects the duration, when specified `speed` is ignored.
  * `maxDuration` (number, optional) - Maximum duration in milliseconds, if calculated duration exceeds this value, `0` is returned.

## Source[​](#source "Direct link to Source")

[modules/core/src/transitions/fly-to-interpolator.ts](https://github.com/visgl/deck.gl/tree/9.4-release/modules/core/src/transitions/fly-to-interpolator.ts)
