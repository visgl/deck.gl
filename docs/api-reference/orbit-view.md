<p class="badges">
  <img src="https://img.shields.io/badge/geopspatial-no-lightgrey.svg?style=flat-square" alt="geospatial" />
</p>

# OrbitView Class

The [OrbitView] class is a subclass of [View](/docs/api-reference/view.md) that creates an orbital view using classic "3D camera" view state parameters.

To render, `OrbitView` needs to be used together with a `viewState` with the following parameters:

* `orbitAxis` (`String`, optional) - Axis with 360 degrees rotating freedom, either `'Y'` or `'Z'`, default to `'Z'`.
* `target` (`Number[3]`) - The world position at the center of the viewport. Default `[0, 0, 0]`.
* `fovy` (`Number`, optional) - The field of view, in degrees. Default `50`.
* `rotationOrbit` (`Number`, optional) - Rotating angle around orbit axis. Default `0`.
* `rotationX` (`Number`, optional) - Rotating angle around X axis. Default `0`.
* `zoom` (`Number`, optional) - The zoom level of the viewport. `zoom: 0` maps one unit distance to one pixel on screen, and increasing `zoom` by `1` scales the same object to twice as large. Default `0`.
* `minZoom` (`Number`, optional) - The min zoom level of the viewport. Default `-Infinity`.
* `maxZoom` (`Number`, optional) - The max zoom level of the viewport. Default `Infinity`.
* `minRotationX` (`Number`, optional) - The min rotating angle around X axis. Default `-90`.
* `maxRotationX` (`Number`, optional) - The max rotating angle around X axis. Default `90`.

For more information on using `View` classes, consult the [Views](/docs/developer-guide/views.md) article.


## Constructor

```js
const view = new OrbitView({...});
```

`OrbitView` takes the same parameters as the [View](/docs/api-reference/view.md) superclass constructor.


## Methods

Inherits all [View methods](/docs/api-reference/view.md#methods).


## Source

[modules/core/src/views/orbit-view.js](https://github.com/uber/deck.gl/blob/master/modules/core/src/views/orbit-view.js)
