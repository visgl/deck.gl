# View Class

The `View` class and it subclasses are used to specify where and how your deck.gl layers should be rendered. Applications typically instantitate at least one `View` subclass.

Views allow you to specify:

* Relative dimensions of viewports
* Projection Matrix

For more information, consult the [Views](/docs/advanced/views.md) article.


## Usage

Create a new `View` (note: normally apps use a `View` subclass)

```js
const view = new View({});
```

Get the dimensions of a `View`

```js
const {x, y, width, height} = view.getDimensions({width: 1024, height: 768});
```


## Constructor

```js
const view = View({id, x, y, width, height, ...});
```

Parameters:

* `opts` (Object) - View options

  + `id` (String)
  + `x` (String|Number) - A relative or absolute position. Default `0`.
  + `y` (String|Number) - A relative or absolute position. Default `0`.
  + `width` (String|Number) - A relative or absolute extent. Default `'100%'`.
  + `height` (String|Number) - A relative or absolute extent. Default `'100%'`.

  Projection Matrix Parameters

  + `projectionMode` (Enum) - the kind of projection matrix. Default `PROJECTION.PERSPECTIVE`.
  + `fov` (Number, optional) - Field of view covered by camera. Default to `75`.
  + `near` (Number, optional) - Distance of near clipping plane. Default to `1`.
  + `far` (Number, optional) - Distance of far clipping plane. Default to `100`.
  + `left`
  + `right`

  Advanced usage

  + `getProjectionMatrix` (Array[16], optional) - Function that returns a projection matrix.


## Methods

##### `equals`

Returns `true` if deck.gl can determine that the supplied `View` instance is identical (equivalent) with this view.

`View.equals(view)`

* `view` (View) - The view to compare with.

Returns:

* `true` - the given view is identical to the current one.

Note: For speed, deck.gl uses shallow equality. This means that a value of `false` does not guarantee that the views are not equivalent.


##### `makeViewport`

```js
View.makeViewport({width, height, viewState})
```

Builds a viewport using the viewport type and props in the `View`and provided `width`, `height` and `viewState`. The contents of `viewState` needs to be compatible with the particular `View` sublass in use.


##### `getDimensions`

Returns the actual pixel position and size that this `View` will occupy in a given "canvas" size.

```js
const {x, y, width, height} = view.getDimensions({width: ..., height: ...});
```

Parameters:

* `width` (`Number`) - Dimension in CSS pixels of the deck.gl "canvas".
* `height` (`Number`) - Dimension in CSS pixels of the deck.gl "canvas".

Returns:

* `x` (`Number`) - x position in CSS pixels
* `y` (`Number`) - y position in CSS pixels
* `width` (`Number`) - width in CSS pixels
* `height` (`Number`) - height in CSS pixels


##### `getMatrix`

```js
View.getMatrix({width, height})
```

* `viewMatrix` (Array[16], optional) - View matrix. Default to identity matrix. Defaults is to create from `fov`, `near`, `far` opts (aspect is calculated).

A projection matrix depends on the aspect ratio and needs to be recalculated whenever width and height changes.


## Remarks

* The `View` class and its subclasses are perhaps best thought of as geospatially enabled counterparts of the typical `Camera` classes found in most 3D libraries.


## Source

[modules/core/src/core/views/view.js](https://github.com/uber/deck.gl/blob/5.0-release/modules/core/src/core/views/view.js)
