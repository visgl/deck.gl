# View Class

The `View` class and it subclasses are used to specify where and how your deck.gl layers should be rendered. Applications typically instantitate at least one `View` subclass.

For more information, consult the [Views](/docs/advanced/views.md) article.


## Usage

```js
const view = new View({});
```

## Types

| `PROJECTION`      | Description |
| ---               | ---         |
| `PERSPECTIVE`     | Builds perspective projection from `fovy`, `near` and `far` parameters. `aspect` is extracted from the view state. |
| `ORTHOGRAPHIC_3D` | Builds orthographic projection from `fovy`, `near` and `far` parameters. `aspect` and `distance` are extracted from the view state. |
| `ORTHOGRAPHIC_2D` | Builds orthographic projection from `left`, `right`, `top`, `bottom`, `near` and `far` parameters. |


## Methods

### constructor

`View({id, x, y, width, height, })`

* `id` (String)

* `x`=`0` (String|Number) - A relative or absolute position
* `y`=`0` (String|Number) - A relative or absolute position
* `width`=`'100%'` (String|Number) - A relative or absolute extent
* `height`=`'100%'` (String|Number) - A relative or absolute extent

* `type`=`Viewport` (`Viewport`) -

Projection Matrix Parameters
* `projectionMode`=`PROJECTION.PERSPECTIVE` (Enum) - the kind of projection matrix
* `fov` (Number, optional) - Field of view covered by camera. Default to `75`.
* `near` (Number, optional) - Distance of near clipping plane. Default to `1`.
* `far` (Number, optional) - Distance of far clipping plane. Default to `100`.

* `left`
* `right`

Advanced usage
* `getProjectionMatrix` (Array[16], optional) - Function that returns a projection matrix.


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

* `viewMatrix` (Array[16], optional) - View matrix. Default to identity matrix.
Defaults is to create from `fov`, `near`, `far` opts (aspect is calculated).

A projection matrix depends on the aspect ratio and needs to be recalculated whenever width and height changes.


## Remarks

* The `View` class and its subclasses are perhaps best thought of as geospatially enabled counterparts of the typical `Camera` classes found in most 3D libraries.


## Source

[src/core/views/view.js](https://github.com/uber/deck.gl/blob/5.0-release/src/core/views/view.js)
