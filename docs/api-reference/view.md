# View Class

> For detailed explanations and code examples about deck.gl's views system, visit the [Views and Projections](/docs/developer-guide/views.md) article.

The `View` class and its subclasses are used to specify where and how your deck.gl layers should be rendered. Applications typically instantiate at least one `View` subclass.

Views allow you to specify:

* A unique `id`.
* The position and extent of the view on the canvas: `x`, `y`, `width`, and `height`.
* Certain camera parameters specifying how your data should be projected into this view, e.g. field of view, near/far planes, perspective vs. orthographic, etc.
* The [controller](/docs/api-reference/controller.md) to be used for this view. A controller listens to pointer events and touch gestures, and translates user input into changes in the view state. If enabled, the camera becomes interactive.

deck.gl offers a set of `View` classes that package the camera and controller logic that you need to visualize and interact with your data. You may choose one or multiple `View` classes based on the type of data (e.g. geospatial, 2D chart) and the desired perspective (top down, first-person, etc).


## Constructor(props : Object)

```js
const view = new View({id, x, y, width, height, ...});
```

Parameters:

##### `id` (String, optional)

A unique id of the view. In a multi-view use case, this is important for matching view states and place contents into this view.

##### `x` (String|Number, optional)

A relative (e.g. `'50%'`) or absolute position. Default `0`.


##### `y` (String|Number, optional)

A relative (e.g. `'50%'`) or absolute position. Default `0`.

##### `width` (String|Number, optional)

A relative (e.g. `'50%'`) or absolute extent. Default `'100%'`.

##### `height` (String|Number, optional)

A relative (e.g. `'50%'`) or absolute extent. Default `'100%'`.

##### `controller` (Function|Boolean|Object, optional)

Options for viewport interactivity.

* `null` or `false`: this view is not interactive.
* `true`: initiates the default controller with default options.
* `Controller` class (not instance): initiates the provided controller with default options.
* `Object`: controller options. This will be merged with the default controller options.
  + `controller.type`: the controller class
  + For other options, consult the documentation of [Controller](/docs/api-reference/controller.md).

Default `null`.


##### `viewState` (String|Object, optional)

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


##### `clear` (Boolean|Object, optional)

Clears the contents (pixels) of the viewport. The value of the `clear` prop is passed as an argument to luma.gl's `clear` function. If `true` clears color and depth buffers. If an object, behaviour is controlled by the following fields:

* `color` (Boolean or Array) - if not `false`, clears all active color buffers with either the provided color or the currently set clear color.
* `depth` (Boolean)  - if `true`, clears the depth buffer.
* `stencil` (Boolean) - if `true` clears the stencil buffer.

Note that deck.gl always clears the screen before each render, and clearing, while cheap, is not totally free. This means that viewports should only specify the `clear` property if they need additional clearing, e.g. because they are rendering on top of another viewport, or want to have a different background color etc.

Default `false`.

##### `projectionMatrix` (`Array[16]`, optional)

Projection matrix.

If `projectionMatrix` is not supplied, the `View` class will build a projection matrix from the following parameters:

##### `fovy` (`Number`, optional)

Field of view covered by camera, in the perspective case. In degrees. Default `75`.

##### `aspect` (`Number`, optional)

Aspect ratio. Defaults to the Viewport's `width/height` ratio.

##### `near` (`Number`, optional)

Distance of near clipping plane. Default `0.1`.

##### `far` (`Number`, optional)

Distance of far clipping plane. Default `1000`.

##### `orthographic` (`Boolean`)

Whether to create an orthographic or perspective projection matrix. Default is `false` (perspective projection).


##### `focalDistance` (`Number`, optional)

Modifier of viewport scale. Corresponds to the number of pixels per meter. Default `1`.


## Methods

Note: most applications just create Views with the appropriate props and do not need to call the following View methods directly.


##### `equals`

Returns `true` if deck.gl can determine that the supplied `View` instance is identical (equivalent) with this view.

`view.equals(otherView)`

* `otherView` (`View`) - Another view instance to compare with.

Returns:

* `true` - the given view is identical to the current one.

Note: For speed, deck.gl uses shallow equality. This means that a value of `false` does not guarantee that the views are not equivalent.


##### `makeViewport`

```js
view.makeViewport({width, height, viewState})
```

Parameters:

* `width` (`Number`) - Dimension in pixels of the target viewport.
* `height` (`Number`) - Dimension in pixels of the target viewport.
* `viewState` (`Object`) - [view state](/docs/developer-guide/views.md) compatible with the current `View` subclass in use. Note that any prop provided to the `View` constructor will override that inside the `viewState`.

Returns a [Viewport](/docs/api-reference/viewport.md) using the viewport type, props in the `View` and provided dimensions and view state.


##### `getDimensions`

Returns the actual pixel position and size that this `View` will occupy in a given "canvas" size.

```js
const {x, y, width, height} = view.getDimensions({width, height});
```

Parameters:

* `width` (`Number`) - Dimension in CSS pixels of the deck.gl "canvas".
* `height` (`Number`) - Dimension in CSS pixels of the deck.gl "canvas".

Returns an object containing the following fields:

* `x` (`Number`) - x position in CSS pixels
* `y` (`Number`) - y position in CSS pixels
* `width` (`Number`) - width in CSS pixels
* `height` (`Number`) - height in CSS pixels


## Remarks

* The `View` class and its subclasses are perhaps best thought of as geospatially enabled counterparts of the typical `Camera` classes found in most 3D libraries.


## Source

[modules/core/src/views/view.js](https://github.com/uber/deck.gl/blob/master/modules/core/src/views/view.js)
