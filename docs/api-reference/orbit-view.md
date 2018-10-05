<p class="badges">
  <img src="https://img.shields.io/badge/geopspatial-no-lightgrey.svg?style=flat-square" alt="geospatial" />
</p>

# OrbitView Class

The [OrbitView`] class is a subclass of [View](/docs/api-reference/view.md) that creates an orbital view using classic "3D camera" view state parameters.

To render, `OrbitView` needs to be used together with a `viewState` with the following parameters:

* `lookAt` (`Number[3]`) - The position being looked at.
* `distance` (`Number`) - The distance from eye position to lookAt.
* `up` (`Number[3]`) - The up direction.
* `orbitAxis` (`String`) - Axis with 360 degrees rotating freedom, either 'Y' or 'Z', default to 'Z'.
* `rotationOrbit` (`Number`) - Rotating angle around orbit axis.
* `rotationX` (`Number`) - Rotating angle around X axis.

For more information on using `View` classes, consult the [Views](/docs/developer-guide/views.md) article.


## Constructor

```js
new OrbitView({...});
```

`OrbitView` takes the same parameters as the [View](/docs/api-reference/view.md) superclass constructor.


Projection matrix arguments:

* `fov` (Number, optional) - Field of view covered by camera. Default to `75`.
* `near` (Number, optional) - Distance of near clipping plane. Default to `1`.
* `far` (Number, optional) - Distance of far clipping plane. Default to `100`.


## Methods

Inherits all [View methods](/docs/api-reference/view.md#methods).


## Source

[modules/core/src/core/views/orbit-view.js](https://github.com/uber/deck.gl/blob/6.2-release/modules/core/src/views/orbit-view.js)
