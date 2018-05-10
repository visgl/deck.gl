<p class="badges">
  <img src="https://img.shields.io/badge/geopspatial-yes-lightgrey.svg?style=flat-square" alt="geospatial" />
</p>

# FirstPersonView Class (Experimental)

The [`FirstPersonView`] class is a subclass of [View](/docs/api-reference/viewport.md) that describes a "camera" placed at the exact position specified by the `viewState`, looking **towards** the direction and orientation specified by the application.

This is in contrast with e.g. [ThirdPersonView](/docs/api-reference/viewport.md) where the camera will be create at a distance from and looking **at** the specified position.

To render, a `FirstPersonView` needs to be combined with a `viewState` object with the following parameters:

* `position` (`Number[3]`) - position

A `FirstPersonView` will work with geospatial coordinate systems if a geospatial "anchor point" is provided in the `viewState` via:

* `longitude`
* `latitude`
* `zoom`

The `position` vector will then be interpreted as meter offsets from this anchor point.

For more information on using `View` classes, consult the [Views](/docs/developer-guide/views.md) article.


## Usage

Creating a new `FirstPersonView`

```js
const viewport = new FirstPersonView({
  // Projection parameters (perspective projection)
  fov: 45,
});
```

## Constructor

```js
new FirstPersonView({...});
```

`FirstPersonView` takes the same parameters as the [View](/docs/api-reference/view.md) superclass constructor, with the following additions:

Projection matrix arguments:

* `fov` (Number, optional) - Field of view covered by camera. Default `75`.
* `near` (Number, optional) - Distance of near clipping plane. Default `0.1`.
* `far` (Number, optional) - Distance of far clipping plane. Default `1000`.


## Methods

Inherits all [View methods](/docs/api-reference/viewport.md#methods).


## Source

[modules/core/src/core/views/first-person-view.js](https://github.com/uber/deck.gl/blob/5.2-release/modules/core/src/core/views/first-person-view.js)
