# View Class

> For detailed explanations and code examples about deck.gl's views system, visit the [Views and Projections](../../developer-guide/views.md) article.

The `View` class and its subclasses are used to specify where and how your deck.gl layers should be rendered. Applications typically instantiate at least one `View` subclass.

Views allow you to specify:

* A unique `id`.
* The position and extent of the view on the canvas: `x`, `y`, `width`, and `height`.
* Certain camera parameters specifying how your data should be projected into this view, e.g. field of view, near/far planes, perspective vs. orthographic, etc.
* The [controller](./controller.md) to be used for this view. A controller listens to pointer events and touch gestures, and translates user input into changes in the view state. If enabled, the camera becomes interactive.

deck.gl offers a set of `View` classes that package the camera and controller logic that you need to visualize and interact with your data. You may choose one or multiple `View` classes based on the type of data (e.g. geospatial, 2D chart) and the desired perspective (top down, first-person, etc).


## Constructor

```js
const view = new View({id, x, y, width, height, ...});
```

Parameters:

#### `id` (string, optional) {#id}

A unique id of the view. In a multi-view use case, this is important for matching view states and place contents into this view.

#### `x` (string | number, optional) {#x}

A relative (e.g. `'50%'`) or absolute position. Default `0`.


#### `y` (string | number, optional) {#y}

A relative (e.g. `'50%'`) or absolute position. Default `0`.

#### `width` (string | number, optional) {#width}

A relative (e.g. `'50%'`) or absolute extent. Default `'100%'`.

#### `height` (string | number, optional) {#height}

A relative (e.g. `'50%'`) or absolute extent. Default `'100%'`.

#### `padding` (object, optional) {#padding}

Padding around the viewport, in the shape of `{left, right, top, bottom}` where each value is either a relative (e.g. `'50%'`) or absolute pixels. This can be used to move the "look at"/target/vanishing point away from the center of the viewport rectangle.

#### `controller` (Function | boolean | object, optional) {#controller}

Options for viewport interactivity.

* `null` or `false`: this view is not interactive.
* `true`: initiates the default controller with default options.
* `Controller` class (not instance): initiates the provided controller with default options.
* `Object`: controller options. This will be merged with the default controller options.
  + `controller.type`: the controller class
  + For other options, consult the documentation of [Controller](./controller.md).

Default `null`.


#### `viewState` (string | object, optional) {#viewstate}

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


#### `clear` (boolean, optional) {#clear}

Clears the contents (pixels) of the viewport. If `true` clears color, depth, and stencil buffers. Behavior is controlled with the `clearColor`, `clearDepth`, and `clearStencil` properties.

Note that deck.gl always clears the screen before each render, and clearing, while cheap, is not totally free. This means that viewports should only clear the viewport if they need additional clearing, e.g. because they are rendering on top of another viewport, or want to have a different background color etc.

Default `false`.

#### `clearColor` (number[] | false, optional) {#clearcolor}

Specifies the color to clear the viewport with, as an array of four numbers `[r, g, b, a?]`. Each channel should be an integer between 0 and 255. For example, `[255, 0, 0, 255]` for opaque red. If `clearColor` is `false`, the depth buffer will not be cleared. If `clear` is set to `false`, this property will be ignored.

Default `[0, 0, 0, 0]` (transparent).

#### `clearDepth` (number | false, optional) {#cleardepth}

Specifies the depth buffer value to clear the viewport with, as number between `0.0` and `1.0`. If `clearDepth` is `false`, the depth buffer will not be cleared. If `clear` is set to `false`, this property will be ignored.

Default `1.0` (far plane).

#### `clearStencil` (number | false, optional) {#clearstencil}

Specifies the stencil buffer value to clear the viewport with, as number between `0` and `255`. If `clearStencil` is `false`, the depth buffer will not be cleared. If `clear` is set to `false`, this property will be ignored.

Default `0` (clear).

**Examples:**

*   Clearing to a solid color: `new View({clear: true, clearColor: [80, 120, 200, 255]})`
*   Clearing color and stencil but not depth: `new View({clear: true, clearColor: [50, 50, 50, 255], clearDepth: false})`
*   No clearing at all: `new View({})` or `new View({clear: false})`


## Methods

Note: most applications just create Views with the appropriate props and do not need to call the following View methods directly.


#### `equals` {#equals}

Returns `true` if deck.gl can determine that the supplied `View` instance is identical (equivalent) with this view.

`view.equals(otherView)`

* `otherView` (`View`) - Another view instance to compare with.

Returns:

* `true` - the given view is identical to the current one.

Note: For speed, deck.gl uses shallow equality. This means that a value of `false` does not guarantee that the views are not equivalent.


#### `clone` {#clone}

<img src="https://img.shields.io/badge/from-v9.2-green.svg?style=flat-square" alt="from v9.2" />

```js
view.clone(newProps)
```

Creates a new `View` instance by merging the existing view's props with the provided `newProps`.

Parameters:

* `newProps` (Object) - Partial view props to override on the cloned view.

Returns:

* `View` - A new view instance with merged props.

#### `makeViewport` {#makeviewport}

```js
view.makeViewport({width, height, viewState})
```

Parameters:

* `width` (`Number`) - Dimension in pixels of the target viewport.
* `height` (`Number`) - Dimension in pixels of the target viewport.
* `viewState` (`Object`) - [view state](../../developer-guide/views.md) compatible with the current `View` subclass in use. Note that any prop provided to the `View` constructor will override that inside the `viewState`.

Returns a [Viewport](./viewport.md) using the viewport type, props in the `View` and provided dimensions and view state.


#### `getDimensions` {#getdimensions}

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

[modules/core/src/views/view.ts](https://github.com/visgl/deck.gl/blob/master/modules/core/src/views/view.ts)
