# View Class

The `View` class is used to specify how one view of your deck.gl layers should be rendered. Ap[plications typically want at least one `View` subclass to make sure that something is rendered on the screencombines a number of responsibilities:

> The `View` class is normally not instantiated directly but rather one of its subclasses is used. However, in cases where the application needs to use "externally" generated view or projection matrices (such as WebVR), the `View` class can be used directly.

For more information, consult the [Views](/docs/advanced/views.md) article.


## Usage

```js
const view = new View({});
```

## Methods

### constructor

`View({id, ...})`
* `id` (String)
* `x`=`0` (String|Number) - A relative or absolute position
* `y`=`0` (String|Number) - A relative or absolute position
* `width`=`'100%'` (String|Number) - A relative or absolute extent
* `height`=`'100%'` (String|Number) - A relative or absolute extent

* `type`=`Viewport` (`Viewport`) -
* `viewMatrix` (Array[16], optional) - View matrix. Default to identity matrix.
* `props.projectionMatrix` (Array[16], optional) - Projection matrix. Defaults is to create from `fov`, `near`, `far` opts (aspect is calculated).
* `fov` (Number, optional) - Field of view covered by camera. Default to `75`.
* `aspect` (Number, optional) - Aspect ratio. Defaults to the view's `width/height`.
* `near` (Number, optional) - Distance of near clipping plane. Default to `1`.
* `far` (Number, optional) - Distance of far clipping plane. Default to `100`.


### equals

Returns `true` if the supplied `View` instance is identical (equivalent) with this view. A value of `false` does not guarantee that the views are not equivalent.

`View.equals(view)`
- `view` (View) - The view to compare with.

Returns:
- `true` if the given view is identical to the current one.


### getViewport

`View.getViewport({width, height, viewState})`

Builds a viewport using the viewport type and props in the `View` and provided `width`, `height` and `view state`.


### getMatrix

`View.getMatrix({width, height})`

A projection matrix depends on the aspect ratio and needs to be recalculated whenever width and height changes.


## Remarks

* The `View` class and its subclasses are perhaps best thought of as geospatially enabled counterparts of the typical `Camera` classes found in most 3D libraries.


## Source

[src/core/views/view.js](https://github.com/uber/deck.gl/blob/5.0-release/src/core/views/view.js)
