# LinearInterpolator

Performs simple linear interpolation between two view states. Implements [TransitionInterpolator](/docs/api-reference/core/transition-interpolator.md).

See [View State Transitions](/docs/developer-guide/view-state-transitions.md) for usage examples.


## Constructor

```js
import {LinearInterpolator} from '@deck.gl/core';

new LinearInterpolator(['target', 'zoom']);
```

Parameters:

* transitionProps (Array) - Array of prop names that should be linearly interpolated. Default `['longitude', 'latitude', 'zoom', 'bearing', 'pitch']`.

## Source

[modules/core/src/transitions/linear-interpolator.js](https://github.com/visgl/deck.gl/blob/master/modules/core/src/transitions/linear-interpolator.js)
