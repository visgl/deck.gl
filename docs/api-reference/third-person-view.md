<p class="badges">
  <img src="https://img.shields.io/badge/geopspatial-yes-lightgrey.svg?style=flat-square" alt="geospatial" />
</p>

# ThirdPersonView Class (Experimental)

The [`ThirdPersonView`] class is a subclass of [View](/docs/api-reference/view.md). This view creates a "camera" in a position that looks **at** an exact position, position using the direction, distance and orientation specified by the application, in contrast with e.g. [FirstPersonView](/docs/api-reference/view.md) that looks out **from** the position specified in the view state.

To render, a `ThirdPersonView` needs to be combined with a `viewState` object with the following parameters:

* `position` (`Number[3]`) - position


A `ThirdPersonView` will work with geospatial coordinate systems if a geospatial "anchor point" is provided in the `viewState` via:

* `longitude`
* `latitude`
* `zoom`

The `position` vector will then be interpreted as meter offsets from this anchor point.

For more information on using `View` classes, consult the [Views](/docs/developer-guide/views.md) article.


## Constructor

```js
new ThirdPersonView({...});
```

`ThirdPersonView` takes the same parameters as the [View](/docs/api-reference/view.md) superclass constructor.


## Methods

Inherits all [View methods](/docs/api-reference/view.md#methods).


## Remarks

* Like all `View`s, the `ThirdPersonView` will work with all geospatial coordinate systems if a geospatial "anchor point" is supplied through the `longitude`, `latitude` and `zoom` options. The `position` vector will then be interpreted as meter offsets from this anchor point.


## Source

[modules/core/src/views/third-person-view.js](https://github.com/uber/deck.gl/blob/7.0-release/modules/core/src/views/third-person-view.js)
