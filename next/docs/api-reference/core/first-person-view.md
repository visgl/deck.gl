# FirstPersonView

The `FirstPersonView` class is a subclass of [View](https://deck.gl/next/docs/api-reference/core/viewport.md) that describes a camera placed at a provided location, looking **towards** the direction and orientation specified by `viewState`. The behavior is similar to that of a [first-person game](https://en.wikipedia.org/wiki/First-person_\(gaming\)).

It's recommended that you read the [Views and Projections guide](https://deck.gl/next/docs/developer-guide/views.md) before using this class.

[deck.gl FirstPersonView](https://codepen.io/vis-gl/embed/oNYXxNE?height=450\&theme-id=light\&default-tab=result)

## Constructor[​](#constructor "Direct link to Constructor")

```
import {FirstPersonView} from '@deck.gl/core';

new FirstPersonView({id, ...});
```

`FirstPersonView` takes the same parameters as the [View](https://deck.gl/next/docs/api-reference/core/view.md) superclass constructor, plus the following:

#### `projectionMatrix` (number\[16], optional)[​](#projectionmatrix "Direct link to projectionmatrix")

Projection matrix.

If `projectionMatrix` is not supplied, the `View` class will build a projection matrix from the following parameters:

#### `fovy` (number, optional)[​](#fovy "Direct link to fovy")

Field of view covered by camera, in the perspective case. In degrees. Default `75`.

#### `near` (number, optional)[​](#near "Direct link to near")

Distance of near clipping plane. Default `0.1`.

#### `far` (number, optional)[​](#far "Direct link to far")

Distance of far clipping plane. Default `1000`.

#### `focalDistance` (number, optional)[​](#focaldistance "Direct link to focaldistance")

Modifier of viewport scale. Corresponds to the number of pixels per meter. Default `1`.

## View State[​](#view-state "Direct link to View State")

To render, a `FirstPersonView` needs to be combined with a `viewState` object with the following parameters:

* `longitude` (number, optional) - longitude of the camera
* `latitude` (number, optional) - latitude of the camera

- `position` (number\[3], optional) - meter offsets of the camera from the lng-lat anchor point. Default `[0, 0, 0]`.
- `bearing` (number, optional) - bearing angle in degrees. Default `0` (north).
- `pitch` (number, optional) - pitch angle in degrees. Default `0` (horizontal).

* `maxPitch` (number, optional) - max pitch angle. Default `90` (down).
* `minPitch` (number, optional) - min pitch angle. Default `-90` (up).

## Controller[​](#controller "Direct link to Controller")

By default, `FirstPersonView` uses the `FirstPersonController` to handle interactivity. To enable the controller, use:

```
const view = new FirstPersonView({id: 'pov', controller: true});
```

Visit the [FirstPersonController](https://deck.gl/next/docs/api-reference/core/first-person-controller.md) documentation for a full list of supported options.

## Source[​](#source "Direct link to Source")

[modules/core/src/views/first-person-view.ts](https://github.com/visgl/deck.gl/blob/master/modules/core/src/views/first-person-view.ts)
