# View Class

The `View` class and it subclasses are used to specify where and how your deck.gl layers should be rendered. Applications typically instantitate at least one `View` subclass.

Views allow you to specify:

* Relative dimensions of viewports
* Projection Matrix

For more information, consult the [Views](/docs/developer-guide/views.md) article.


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

* `id` (String)
* `x` (String|Number) - A relative or absolute position. Default `0`.
* `y` (String|Number) - A relative or absolute position. Default `0`.
* `width` (String|Number) - A relative or absolute extent. Default `'100%'`.
* `height` (String|Number) - A relative or absolute extent. Default `'100%'`.

Projection Matrix Parameters

* `projectionMatrix`= (`Array[16]`, optional) - Projection matrix.

If `projectionMatrix` is not supplied, `Viewport` will build a matrix from the following parameters:

* `fovyDegrees`=`75` (`Number`) - Field of view covered by camera, in the perspective case.
* `aspect`= (`Number`) - Aspect ratio. Defaults to the Viewport's `width/height` ratio.
* `near`=`0.1` (`Number`) - Distance of near clipping plane.
* `far`=`1000` (`Number`) - Distance of far clipping plane.
* `orthographic`=`false` (`Boolean`) - whether to create an orthographic or perspective projection matrix. Default is perspective projection.
* `focalDistance`=`1` (`Number`) - (orthographic projections only) The distance at which the field-of-view frustum is sampled to extract the extents of the view box. Note: lso used for pixel scale identity distance above.
* `orthographicFocalDistance` (`Number`) - (orthographic projections only) Can be used to specify different values for pixel scale focal distance and orthographic focal distance.


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

[modules/core/src/core/views/view.js](https://github.com/uber/deck.gl/blob/5.2-release/modules/core/src/core/views/view.js)
