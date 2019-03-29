<p class="badges">
  <img src="https://img.shields.io/badge/geopspatial-no-lightgrey.svg?style=flat-square" alt="geospatial" />
</p>

# OrbitView Class

The [OrbitView`] class is a subclass of [View](/docs/api-reference/view.md) that creates an orbital view using classic "3D camera" view state parameters.

To render, `OrbitView` needs to be used together with a `viewState` with the following parameters:

* `rotationOrbit` (`Number`, optional) - Rotating angle around orbit axis. Default `0`.
* `rotationX` (`Number`, optional) - Rotating angle around X axis. Default `0`.
* `pixelOffset` (`Number[2]`, optional) - The offset of the viewport, in screen pixels. Default `[0, 0]` (the `lookAt` position is projected to the center of the viewport).
* `zoom` (`Number`, optional) - The zoom level of the viewport. `zoom: 0` maps one unit distance to one pixel on screen, and increasing `zoom` by `1` scales the same object to twice as large. Default `0`.
* `minZoom` (`Number`, optional) - The min zoom level of the viewport. Default `-Infinity`.
* `maxZoom` (`Number`, optional) - The max zoom level of the viewport. Default `Infinity`.

For more information on using `View` classes, consult the [Views](/docs/developer-guide/views.md) article.


## Constructor

```js
new OrbitView({...});
```

`OrbitView` takes the same parameters as the [View](/docs/api-reference/view.md) superclass constructor.


Projection matrix arguments:

* `orbitAxis` (`String`, optional) - Axis with 360 degrees rotating freedom, either `'Y'` or `'Z'`, default to `'Z'`.
* `center` (`Number[3]`) - The world position at the center of the viewport. Default `[0, 0, 0]`.
* `fovy` (`Number`, option) - The field of view, in degrees. Default `50`.
* `up` (`Number[3]`) - The up direction. Default `[0, 1, 0]`.
* `near` (`Number`, optional) - Distance of near clipping plane. Default to `0.1`.
* `far` (`Number`, optional) - Distance of far clipping plane. Default to `1000`.


## Methods

Inherits all [View methods](/docs/api-reference/view.md#methods).


## Source

[modules/core/src/views/orbit-view.js](https://github.com/uber/deck.gl/blob/master/modules/core/src/views/orbit-view.js)
