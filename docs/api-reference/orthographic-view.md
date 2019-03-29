<p class="badges">
  <img src="https://img.shields.io/badge/geopspatial-no-lightgrey.svg?style=flat-square" alt="geospatial" />
</p>

# OrthographicView Class (Experimental)

The [`OrthographicView`] class is a subclass of [View](/docs/api-reference/view.md) that creates a perspective view using classic "3D camera" view state parameters.

To render, `OrthographicView` needs to be used together with a `viewState` with the following parameters:

* `pixelOffset` (`Number[2]`, optional) - The offset of the viewport, in screen pixels. Default `[0, 0]` (the `lookAt` position is projected to the center of the viewport).
* `zoom` (`Number`, optional) - The zoom level of the viewport. `zoom: 0` maps one unit distance to one pixel on screen, and increasing `zoom` by `1` scales the same object to twice as large. Default `0`.
* `minZoom` (`Number`, optional) - The min zoom level of the viewport. Default `-Infinity`.
* `maxZoom` (`Number`, optional) - The max zoom level of the viewport. Default `Infinity`.

For more information on using `View` classes, consult the [Views](/docs/developer-guide/views.md) article.


## Constructor

```js
new OrthographicView({controller: true});
```

The `OrthographicView` constructor takes the same parameters as the [View](/docs/api-reference/view.md) superclass constructor, plus the following orthographic projection matrix arguments:

* `center` (`Number[3]`, optional) - The world position at the center of the viewport. Default `[0, 0, 0]`.
* `up` (`Number[3]`, optional) - The up direction. Default `[0, 1, 0]`.
* `near` (`Number`, optional) - Distance of near clipping plane. Default to `1`.
* `far` (`Number`, optional) - Distance of far clipping plane. Default to `100`.


## Methods

Inherits all [View methods](/docs/api-reference/view.md#methods).


## Remarks

* When zooming with orthographic view, the size (width and height) of the view and window are no longer the same. In such case, specify `right` and `bottom` together with `left` and `top` explicitly to define the view size.
* Refer to `examples/experimental/orthographic-zooming` for example.


## Source

[modules/core/src/views/orthographic-view.js](https://github.com/uber/deck.gl/blob/master/modules/core/src/views/orthographic-view.js)
