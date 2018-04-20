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
  + `type` (`Viewport`) - The constructor of the viewport. Default `Viewport`.

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

Returns `true` if the supplied `View` instance is identical (equivalent) with this view. A value of `false` does not guarantee that the views are not equivalent.

`View.equals(view)`

* `view` (View) - The view to compare with.

Returns:

* `true` if the given view is identical to the current one.


##### `getViewport`

```js
View.getViewport({width, height, viewState})
```

Builds a viewport using the viewport type and props in the `View` and provided `width`, `height` and `view state`.


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
