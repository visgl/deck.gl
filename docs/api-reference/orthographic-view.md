<p class="badges">
  <img src="https://img.shields.io/badge/geopspatial-no-lightgrey.svg?style=flat-square" alt="geospatial" />
</p>

# OrthographicView Class (Experimental)

The [`OrthographicView`] class is a subclass of [View](/docs/api-reference/view.md) that creates a perspective view using classic "3D camera" view state parameters.

To render, `OrthographicView` needs to be used together with a `viewState` with the following parameters:

* `eye` (`Number[3]`) - The eye position in world coordinates.
* `lookAt` (`Number[3]`) - The position being looked at.
* `up` (`Number[3]`) - The up direction.

For more information on using `View` classes, consult the [Views](/docs/developer-guide/views.md) article.


## Constructor

```js
new OrthographicView({left: 0, top: 0, width: 500, height: 500});
```

The `OrthographicView` constructor takes the same parameters as the [View](/docs/api-reference/view.md) superclass constructor, plus the following orthographic projection matrix arguments:

* `near` (`Number`, optional) - Distance of near clipping plane. Default to `1`.
* `far` (`Number`, optional) - Distance of far clipping plane. Default to `100`.
* `left` (`Number`) - Left bound of the frustum
* `top` (`Number`) - Top bound of the frustum
* `right` (`Number`, optional) - Right bound of the frustum. Automatically calculated if not provided.
* `bottom` (`Number`, optional) - Bottom bound of the frustum. Automatically calculated if not provided.


## Methods

Inherits all [Viewport methods](/docs/api-reference/view.md#methods).


## Remarks

* When zooming with orthographic view, the size (width and height) of the view and window are no longer the same. In such case, specify `right` and `bottom` together with `left` and `top` explicitly to define the view size.
* Refer to `examples/experimental/orthographic-zooming` for example.


## Source

[modules/core/src/core/views/orthographic-view.js](https://github.com/uber/deck.gl/blob/5.2-release/modules/core/src/core/views/orthographic-view.js)
