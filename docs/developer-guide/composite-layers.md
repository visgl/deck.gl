# Composite Layers

A composite layer is a special kind of layer that creates other layers. It enables the creation of new layers by careful composition of existing layers (a primary example being the `GeoJsonLayer`). In addition, it is often convenient to change the interface and behavior of an existing layer using a composite "adaptor" layer instead of modifying the layer itself (the sample `S2Layer` is a simple adaptor on top of the `PolygonLayer`).

## Use Cases

### Adaptor Layers

Sometimes an existing layer renders the right thing, but it would be desirable that it accepts another data format, had another interface (different accessors), or performed aggregation on its data.

Examples could be:

* Creating a `LASPointCloudLayer` that accepts `data` as an ArrayBuffer object that is loaded directly from a [LAS](https://www.asprs.org/committee-general/laser-las-file-format-exchange-activities.html)
  file, and convert it to the format that `PointCloudLayer` consumes.
* Creating an `S2Layer` with an accessor that takes [S2](https://code.google.com/archive/p/s2-geometry-library/) tokens, uses the S2 library to calculates the polygons corresponding to that cell, and renders it using e.g. the PolygonLayer.
* Adding aggregation to an existing layer. By default, deck.gl layers render one graphical element for each element in the `data` prop. But in some cases, e.g. heatmaps, the data needs to be aggregated (or "binned") into cells before rendering. An adaptor in the form of a composite layer is one way to add this functionality.

In fact several core deck.gl layers, like the GeoJsonLayer and the GridLayer are written as composite "adapter" layers.

### Collection Layers

Often a more complex visualization consists of a number of layers that are rendered after breaking down a common set of props. It can be helpful to collect the code that does this breakdown into a single composite layer.


## Implementing Composite Layers

A common use case of composite layers is to augment the interface of existing layers. Consider the following example: the [ScatterplotLayer](/docs/layers/scatterplot-layer.md) either fills or outlines its circles. We need a layer that does both.

A composite layer can be created by extending the `CompositeLayer` class:

```js
import {Layer, ScatterplotLayer} from 'deck.gl';

class NiceScatterplotLayer extends CompositeLayer {
  // implementation
}
NiceScatterplotLayer.layerName = 'NiceScatterplotLayer';
```

### Defining Composite Layer Properties

We will need to define the layer-specific properties of the new layer. In this example, the new layer's interface is almost identical to that of the ScatterplotLayer, except instead of one `getColor` accessor, you need two accessors `getStrokeColor` and `getFillColor`:

```js
NiceScatterplotLayer.defaultProps = {
  ...ScatterplotLayer.defaultProps,
  getFillColor: d => [255, 255, 0],
  getStrokeColor: d => [255, 140, 0]
}
```

### Rendering Sublayers

A composite layer should implement the `renderLayers()` method and return an array of layers.

By convention, the `id` of sublayers should be the `id` of the composite layer plus a suffix, typically separated by a dash.

In this example, the idea is to draw two ScatterplotLayers, one for fill and one on top for the outline:

```js
class NiceScatterplotLayer extends CompositeLayer {
  renderLayers() {
    return [
      // the filled circles
      new ScatterplotLayer(this.getSubLayerProps({
        id: 'fill'
      }),
      // the outlines
      new ScatterplotLayer(this.getSubLayerProps({
        id: 'outline'
      })
    ];
  }
}
```

### Mapping Vs. Forwarding Properties

Because the composite layer doesn't draw directly to the canvas, it controls the rendering result by setting props of its sublayers.

In our example, we want the sublayers to share the same ScatterplotLayer properties such as `radiusScale`, `getPosition` and `getRadius`. It is also desirable to pass many of the base layer props to the sublayers, e.g. `opacity`, `fp64`, `pickable`, `visible` etc.

We then want to map the user defined `getFillColor` and `getStrokeColor` accessors to each `getColor` prop of the fill layer and the outline layer.

Finally, to make [`updateTrigger`](/docs/api-reference/layer.md#-updatetriggers-object-optional-) work when colors need to be recalculated, we will map respective accessor names to `getColor`.

```js
class NiceScatterplotLayer extends CompositeLayer {

  renderLayers() {
    const {updateTriggers} = this.props;

    return [
      // the filled circles
      new ScatterplotLayer({
        ...this.props,
        id: 'fill',
        getColor: this.props.getFillColor,
        outline: false,
        updateTriggers: {
          ...updateTrigger,
          getColor: updateTrigger.getFillColor
        }
      }),
      // the outlines
      new ScatterplotLayer({
        ...this.props,
        id: 'outline',
        getColor: this.props.getStrokeColor,
        outline: true,
        updateTriggers: {
          ...updateTrigger,
          getColor: updateTrigger.getStrokeColor
        }
      })
    ];
  }
}

```

### Picking

By default, the composite layer passes the picking info from its sublayers as-is to the callbacks. However, when we implement an adaptor layer that performs data conversion or aggregation, the data that the sublayer sees may not be the same data that the user passed in.

In this case, The composite layer may intercept the event info and modify it by implementing the `getPickingInfo()` method:

```js
class AwesomeCompositeLayer extends CompositeLayer {

  ...

  getPickingInfo({info}) {
    // override info.object
    return info;
  }

}
```

For more details, read about [how picking works](/docs/developer-guide/picking.md).
