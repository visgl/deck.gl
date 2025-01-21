# LinearInterpolator

Performs simple linear interpolation between two view states. Implements [TransitionInterpolator](./transition-interpolator.md).

See [View State Transitions](../../developer-guide/animations-and-transitions.md#camera-transitions) for usage examples.


## Constructor

```js
import {LinearInterpolator} from '@deck.gl/core';

new LinearInterpolator({transitionProps: ['target', 'zoom']});
```

Parameters:

- options (object)
  * `transitionProps` (string[], optional) - Array of prop names that should be linearly interpolated. Default `['longitude', 'latitude', 'zoom', 'bearing', 'pitch']`.
  * `around` (number[2], optional) - A point to zoom/rotate around, `[x, y]` in screen pixels. If provided, the location at this point will not move during the transition.
  * `makeViewport` (Function, optional) - Called to construct a [viewport](./viewport.md), e.g. `props => new WebMercatorViewport(props)`. Must be provided if `around` is used.

## Source

[modules/core/src/transitions/linear-interpolator.ts](https://github.com/visgl/deck.gl/tree/9.1-release/modules/core/src/transitions/linear-interpolator.ts)
