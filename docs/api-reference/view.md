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


## Constructor(props : Object)

```js
const view = View(props);
const view = View({id, x, y, width, height, ...});
```

Parameters:

* `props` : Object - See documentation of props below.


Note that like layers, Views are immutable once constructed.


## Properties


##### `id : String`


##### `x : String|Number`

A relative (e.g. `'10%'`) or absolute (e.g. `200`) position. Default `0`.


##### `y : String|Number`

* `y` (String|Number) - A relative or absolute position. Default `0`.


A relative (e.g. `'10%'`) or absolute (e.g. `200`) position. Default `0`.

##### `width` (String|Number)

A relative or absolute extent. Default `'100%'`.


##### `height` (String|Number)

A relative or absolute extent. Default `'100%'`.

* `controller` (`Function` | `Boolean` | `Object`) - options for viewport interactivity.
  - `null` or `false`: this view is not interactive.
  - `true`: initiates the default controller with default options.
  - `Controller` class (not instance): initiates the provided controller with default options.
  - `Object`: controller options. This will be merged with the default controller options.
    + `controller.type`: the controller class
    + For other options, consult the documentation of [Controller](/docs/api-reference/controller.md).

Default `null`.


##### `viewState` : String | Object | `null`

The optional `viewState` property enables a `View` to specify, select or select-and-modify its view state.

`viewState` is an overloaded property that can take either just a view state id string, or an object specifying view state parameters and optionally a view state id string:

* `null` (default): Will select a view state based on `view.id`, falling back to using the first view state.
* `String`: Will attempt to match the indicated 	view state.
* `Object` (with `id` field): if the object contains an `id` field which matches a dynamic view state, the remaining fields in `View.viewState` will extend (be merged into a copy of) the selected dynamic view state.
* `Object` (with no `id` field): If no `id` is provided, the `View.viewState` object will be used directly as the view state, essentially representing a fixed or constant view state.

Note that specifying `viewState` as an object with an `id` field effectively allows the View to modify a dynamic view state by overriding some of its fields. This is useful in multiview situations where it enables having one view that fixes some parameters (eg. zoom, pitch and bearing to show an overview map).

The `viewState` property is intended to support a number of use cases:

* Sharing view states between multiple views - If a `View` id is different from the designed view state's id.
* specify a complete, constant (fixed) view state directly in the view
* Overriding a partial set of view state properties from a selected view state.


##### `clear`: Boolean | Object

Clears the contents (pixels) of the viewport. The value of the `clear` prop is passed as argument to luma.gl's `clear` function. If `true` clears color and depth buffers. If an object, behaviour is controller by the following fields:

* `color` (Boolean or Array) - if not `false`, clears all active color buffers with either the provided color or the currently set clear color.
* `depth` (Boolean)  - if `true`, clears the depth buffer.
* `stencil` (Boolean) - if `true` clears the stencil buffer.

Note that deck.gl always clears the screen before each render, and clearing, while cheap, is not totally free. This means that viewports should only specify the `clear` property if they need additional clearing, e.g. because they are rendering on top of another viewport, or want to have a different background color etc.


##### `projectionMatrix`= (`Array[16]`, optional)

Projection matrix.


## Projection Matrix Props

If `projectionMatrix` is not supplied, the `View` class will build a projection matrix from the following parameters:


##### `fovyDegrees`=`75` (`Number`)

Field of view covered by camera, in the perspective case.


##### `aspect`= (`Number`)

Aspect ratio. Defaults to the Viewport's `width/height` ratio.


##### `near`=`0.1` (`Number`)

Distance of near clipping plane.


##### `far`=`1000` (`Number`)

Distance of far clipping plane.


##### `orthographic`=`false` (`Boolean`)

Whether to create an orthographic or perspective projection matrix. Default is perspective projection.


##### `focalDistance`=`1` (`Number`)

Note: Used by orthographic projections only. The distance at which the field-of-view frustum is sampled to extract the extents of the view box. Note: lso used for pixel scale identity distance above.


##### `orthographicFocalDistance` (`Number`)

Noe: (orthographic projections only) Can be used to specify different values for pixel scale focal distance and orthographic focal distance.



## Methods

Note: most applications just create Views with the appropriate props and do not need to call the following View methods directly.


##### `equals`

Returns `true` if deck.gl can determine that the supplied `View` instance is identical (equivalent) with this view.

`View.equals(view)`

* `view` (View) - The view to compare with.

Returns:

* `true` - the given view is identical to the current one.

Note: For speed, deck.gl uses shallow equality. This means that a value of `false` does not guarantee that the views are not equivalent.


##### `makeViewport({width : Number, height : Number, viewState : Object}) : Viewport`

```js
View.makeViewport({width, height, viewState})
```

Builds a viewport using the viewport type and props in the `View`and provided `width`, `height` and `viewState`. The contents of `viewState` needs to be compatible with the particular `View` sublass in use.


##### `getDimensions({width : Number, height : Number}) : Object`

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


##### `getMatrix({width : Number, height : Number}) : Array`

```js
View.getMatrix({width, height})
```

* `viewMatrix` (Array[16], optional) - View matrix. Default to identity matrix. Defaults is to create from `fov`, `near`, `far` opts (aspect is calculated).

A projection matrix depends on the aspect ratio and needs to be recalculated whenever width and height changes.


## Remarks

* The `View` class and its subclasses are perhaps best thought of as geospatially enabled counterparts of the typical `Camera` classes found in most 3D libraries.


## Source

[modules/core/src/core/views/view.js](https://github.com/uber/deck.gl/blob/6.1-release/modules/core/src/views/view.js)
