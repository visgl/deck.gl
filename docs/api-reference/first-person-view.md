# FirstPersonView Class

The [`FirstPersonView`] class is a subclass of [View](/docs/api-reference/viewport.md) that describes a camera placed at a provided location, looking **towards** the direction and orientation specified by `viewState`. The behavior is similar to that of a [first-person game](https://en.wikipedia.org/wiki/First-person_(gaming)).

It's recommended that you read the [Views and Projections guide](/docs/developer-guide/views.md) before using this class.


## Constructor

```js
import {FirstPersonView} from '@deck.gl/core';
new FirstPersonView({id, ...});
```

`FirstPersonView` takes the same parameters as the [View](/docs/api-reference/view.md) superclass constructor.


## View State

To render, a `FirstPersonView` needs to be combined with a `viewState` object with the following parameters:

- `longitude` (`Number`, optional) - longitude of the camera
- `latitude` (`Number`, optional) - latitude of the camera
* `position` (`Number[3]`, optional) - meter offsets of the camera from the lng-lat anchor point. Default `[0, 0, 0]`.
* `bearing` (`Number`, optional) - bearing angle in degrees. Default `0` (north).
* `pitch` (`Number`, optional) - pitch angle in degrees. Default `0` (horizontal).
- `maxPitch` (`Number`, optional) - max pitch angle. Default `90` (up).
- `minPitch` (`Number`, optional) - min pitch angle. Default `-90` (down).


## FirstPersonController

By default, `FirstPersonView` uses the `FirstPersonController` to handle interactivity. To enable the controller, use:

```js
const view = new FirstPersonView({id: 'first-person', controller: true});
```

`FirstPersonController` supports the following interactions:

- `dragRotate`: Drag to rotate
- `scrollZoom`: Mouse wheel to zoom
- `doubleClickZoom`: Double click to zoom in, with shift/ctrl down to zoom out
- `touchZoom`: Pinch zoom
- `touchRotate`: Multi-touch rotate
- `keyboard`: Keyboard (arrow keys to move camera, arrow keys with shift/ctrl down to rotate, +/- to zoom)

You can further customize its behavior by extending the class:

```js
import {FirstPersonController} from '@deck.gl/core';

class MyFirstPersonController extends FirstPersonController {}

const view = new FirstPersonView({id: 'first-person', controller: MyFirstPersonController});
```

See the documentation of [Controller](/docs/api-reference/controller.md) for implementation details.


## Source

[modules/core/src/views/first-person-view.js](https://github.com/uber/deck.gl/blob/master/modules/core/src/views/first-person-view.js)
