# Primitive Layers

If you want to draw something completely different and you are comfortable around WebGL, you may consider implementing a new layer by directly extending the [`Layer`](../../api-reference/core/layer.md) class.


## Implementing the Layer Lifecycle Functions

To describe how a layer's properties relate to WebGL attributes and uniforms you need to implement the layer's [lifecycle functions](./layer-lifecycle.md).


### Initializing Layer

[`initializeState()`](../../api-reference/core/layer.md#initializestate) - This is the one method that you must implement to create any WebGL resources you need for rendering your layer.


#### Creating The Model

A layer should create its model during this phase. A model is a [luma.gl](https://github.com/visgl/luma.gl) [Model](https://github.com/visgl/luma.gl/blob/8.0-release/docs/api-reference/engine/model.md) instance that defines what will be drawn to the WebGL context.

Most layers are **Single-model layers** - this is the predominant form among all core layers that deck.gl currently provides. In these layers, a single geometry model is created for each layer and saved to `state.model` during initialization. The default implementation of the rest of the lifecycle methods will then look for this model for rendering and picking etc., meaning that you don't have to do anything more to get a working layer.

```js
import {Layer} from '@deck.gl/core';

export default class CubeLayer extends Layer {

  initializeState() {
    const {gl} = this.context;
    this.setState({
      model: this._getModel(gl)
    });
  }

  _getModel(gl) {
    // TODO: create Model here
  }

}
```

A choice to make is whether your WebGL primitives (draw calls) should be instanced, or use dynamic geometry:

* **Instanced layer** - This type of layer renders the same geometry many times. Usually the simplest way to go when creating a layer that renders a lot of similar objects (think ScatterplotLayer, ArcLayers etc).

```js
import {Model, CubeGeometry} from '@luma.gl/core';

export default class CubeLayer extends Layer {
  ...
  _getModel(gl) {
    return new Model(gl, Object.assign({}, this.getShaders(), {
      id: this.props.id,
      geometry: new CubeGeometry(),
      isInstanced: true
    }));
  }
}
```

* **Dynamic geometry layer** - This is needed when dealing with data that needs to be rendered using multiple similar but unique geometries, such as polygons (i.e. the geometries are not copies of each other that that only differ in terms of parameters).

```js
import {Model, Geometry} from '@luma.gl/core';

export default class MyLayer extends Layer {
  ...
  _getModel(gl) {
    return new Model(gl, Object.assign({}, this.getShaders(), {
      id: this.props.id,
      geometry: new Geometry({
        id: this.props.id,
        topology: 'line-list',
      }),
      vertexCount: 0,
      isIndexed: true
    });
  }
}
```

It is sometimes desirable to have a single layer render using multiple geometry primitives (e.g both circles and lines, or triangles and textured meshes etc), rather than creating separate layers. The custom [AxesLayer example](https://github.com/visgl/deck.gl/tree/master/examples/website/plot/plot-layer/axes-layer.js) uses this technique to share attributes between grids and labels.


#### Defining Attributes

A layer should also define its attributes during initialization. This allows the [`attribute manager`](../../api-reference/core/attribute-manager.md) to do the heavy lifting for [Attribute Management](./attribute-management.md).

Define attributes by calling [`attributeManager.add`](../../api-reference/core/attribute-manager.md#add):

```js
initializeState() {
  const {gl} = this.context;
  this.setState({
    model: this._getModel(gl)
  });

  this.state.attributeManager.add({
    /* this attribute is automatically filled by the return value of `props.getPosition` */
    instancePositions: {size: 3, accessor: 'getPosition'},
    /* this attribute is populated by calling `layer.calculateInstanceColors` */
    instanceColors: {size: 4, type: GL.UNSIGNED_BYTE, accessor: 'getColor', update: this.calculateInstanceColors}
  });
}
```

### Handling property updates

[`updateState()`](../../api-reference/core/layer.md#updatestate) - This is the method that you may want to implement to handle property changes.

The key to writing good, performant deck.gl layers lies in understanding how to minimize updates of any calculated data, such as WebGL.

The ideas used here are very similar to (and directly inspired by) those used in the React/Redux/Flux/Immutable.js communities, and learning more about those frameworks can be helpful as a way to get a better understanding of how to use these concepts in the best way.

* `data` - Typically if a layer is re-rendered with a changed `data` prop, all WebGL attributes must be regenerated and the layer needs to be redrawn. The default is to do exactly that, but sometimes a layer can be smarter and limit updates, or more work needs to be done.

* If the viewport has changed, the layer will automatically be re-rendered. Many layers can thus ignore viewport changes, however, if the layer has any dependencies on the viewport (such as a layer that calculates extents or positions in screen space rather than world space) it would need to update state or uniforms whenever the viewport changes.

* If other props change, it would typically mean that the layer needs to update some uniform or state so that rendering is affected appropriately.


### Rendering Layer

[`draw()`](../../api-reference/core/layer.md#draw) - If you want to use custom uniforms or settings when drawing, you would typically implement the `draw` method and pass those to your render call. Note that `draw` is called with viewport uniforms that you need to pass to your shader, but you can of course add any layer specific uniforms to that.

Note: the reason that the supplied uniforms need to be passed on to your shaders is to enable your shader to use deck.gl's GLSL shaderlibs (such as `project` or `project64` etc.). If you don't use these shaderlibs, you would obviously not need to supply these uniforms, but you would have to implement features like cartographic projection etc. on your own.


### Destroying Layer

[`finalizeState()`](../../api-reference/core/layer.md#finalizestate) - If implemented, this method is called when your layer state is discarded. This is a good time to destroy non-shared WebGL resources directly, rather than waiting for the garbage collector to do it.


## Handling Coordinate Systems

While you have the freedom to create any type of layer you want, with any type of coordinate system that suits your application, a common characteristic of the layers provided by deck.gl is that they work seamlessly as map overlays, both with positions specified as longitude and latitude coordinates, as well as with positions specified in meters.

### Making Shaders Work with deck.gl's Coordinate Systems

By supplying the `modules: ['project']` parameter when you create your layer's luma.gl `Model` you get access to deck.gl's [family of GLSL projection methods](./writing-shaders.md#projection) that support all three deck.gl projection modes: latlon (default), meters and neutral.

By always using the following shader functions for handling projections and scaling, a single layer class can support all projection modes for free:

* All positions must be passed through the `project_position` function (available both in JavaScript and GLSL) to convert non-linear web-mercator coordinates to linear mercator "world" or "pixel" coordinates, that can be passed to the projection matrix.

* All offsets must be passed through the `project_scale` function (available both in JavaScript and GLSL) to convert distances to world coordinates. Note that that distance scales are latitude dependent under web mercator projection (see [http://wiki.openstreetmap.org/wiki/Zoom_levels](http://wiki.openstreetmap.org/wiki/Zoom_levels) for more details), so scaling will depend on the viewport center and should only be expected to be locally correct.


## Implement Picking

If your layer is instanced (`data` prop is an array and each element is rendered as one primitive), then you may take advantage of the default implementation of the [layer picking methods](../../api-reference/core/layer.md#layer-picking-methods).

By default, each layer creates an `instancePickingColors` attribute and automatically calculates it using the length of the `data` array.

For custom picking, read about [Implementing Custom Picking](./picking.md#implementing-custom-picking).
