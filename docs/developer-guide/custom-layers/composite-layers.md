# Composite Layers

A composite layer is a special kind of layer that creates other layers. It enables the creation of new layers by careful composition of existing layers (a primary example being the `GeoJsonLayer`). In addition, it is often convenient to change the interface and behavior of an existing layer using a composite "adaptor" layer instead of modifying the layer itself (the sample `S2Layer` is a simple adaptor on top of the `PolygonLayer`).

## Use Cases

### Adaptor Layers

Sometimes an existing layer renders the right thing, but it would be desirable that it accepts another data format, had another interface (different accessors), or performed aggregation on its data.

Examples could be:

* A `LASPointCloudLayer` that accepts `data` as an URL pointing to a [LAS](https://www.asprs.org/committee-general/laser-las-file-format-exchange-activities.html)
  file, and convert it to the format that `PointCloudLayer` consumes.
* A `TopoJSONLayer` that is like the `GeoJsonLayer`, but accepts [TopoJSON](https://github.com/topojson/topojson) provided to the `data` prop.
* Adding aggregation to an existing layer. By default, deck.gl layers render one graphical element for each element in the `data` prop. But in some cases, e.g. heatmaps, the data needs to be aggregated (or "binned") into cells before rendering. An adaptor in the form of a composite layer is one way to add this functionality.

The deck.gl layers [TextLayer](/docs/api-reference/layers/text-layer.md), [HexagonLayer](/docs/api-reference/aggregation-layers/hexagon-layer.md), [CPUGridLayer](/docs/api-reference/aggregation-layers/cpu-grid-layer.md) and few others are written as composite "adapter" layers.


### Collection Layers

Often a more complex visualization is composited from a number of layers that use a common set of props. For example:

* A `NodeLayer` that renders a text string inside a circle at each anchor position, by combining the `ScatterplotLayer` and the `TextLayer`.
* A `MapLayer` that takes a custom map data format, breaks it down to sets of geometries by type, and render them with the `PathLayer`, `SolidPolygonLayer`, and `TextLayer` respectively.

Creating a collection layer have the following advantages:

* Collect the complex code that handles a specific data format or visual configuration into one class. This helps to create a cleaner, more abstract interface for the users of this layer, and control the complexity of the compoent that renders the `Deck` instance.
* Improve memory usage by sharing the same objects/buffers cross layers. Instead of each sublayer loading and storing their own copy of the raw data, the composite layer will manage the data source and pass it down to several layers.

The deck.gl layers [GeoJsonLayer](/docs/api-reference/layers/geojson-layer.md) and [PolygonLayer](/docs/api-reference/layers/polygon-layer.md) are written as composite "collection" layers.

## Implementing A Composite Layer

Consider the following example: we need a layer that is like the `IconLayer`, but renders a text label alongside each icon.

A composite layer can be created by extending the `CompositeLayer` class:

```js
import {CompositeLayer, IconLayer, TextLayer} from 'deck.gl';

class LabeledIconLayer extends CompositeLayer {
  // TODO
}
LabeledIconLayer.layerName = 'LabeledIconLayer';
```

### Defining Composite Layer Properties

We will need to define the layer-specific properties of the new layer. In this example, the new layer's interface is a combination of that of the `IconLayer` and the `TextLayer`:

```js
LabeledIconLayer.defaultProps = {
  // Shared accessors
  getPosition: {type: 'accessor', value: x => x.position},
  // Icon properties
  iconAtlas: null,
  iconMapping: {type: 'object', value: {}, async: true},
  // Icon accessors
  getIcon: {type: 'accessor', value: x => x.icon},
  getIconSize: {type: 'accessor', value: 20},
  getIconColor: {type: 'accessor', value: [0, 0, 0, 255]},
  // Text properties
  fontFamily: DEFAULT_FONT_FAMILY,
  fontWeight: DEFAULT_FONT_WEIGHT,
  // Text accessors
  getText: {type: 'accessor', value: x => x.text},
  getTextSize: {type: 'accessor', value: 12}
  getTextColor: {type: 'accessor', value: [0, 0, 0, 255]}
}
```

### Rendering Sublayers

A composite layer should implement the `renderLayers()` method and return an array of layers ("sublayers").

In this example, the idea is to draw an `IconLayer` and a `TextLayer`, which share the same source data:

```js
class LabeledIconLayer extends CompositeLayer {
  renderLayers() {
    return [
      // the icons
      new IconLayer({
        data: this.props.data,
        // TODO
      }),
      // the labels
      new TextLayer({
        data: this.props.data,
        // TODO
      })
    ];
  }
}
```

### Mapping Properties

Because the composite layer doesn't draw directly to the canvas, it controls the rendering result by setting props of its sublayers.

Since the sublayers do not understand our custom layer's prop names, we will need to map the props of the `LabeledIconLayer` to the appropriate props of each sublayer:

```js
class LabeledIconLayer extends CompositeLayer {
  renderLayers() {
    return [
      // the icons
      new IconLayer({
        id: `${this.props.id}-icon`,
        data: this.props.data,

        iconAtlas: this.props.iconAtlas,
        iconMapping: this.props.iconMapping,

        getPosition: this.props.getPosition,
        getIcon: this.props.getIcon,
        getSize: this.props.getIconSize,
        getColor: this.props.getIconColor
      }),
      // the labels
      new TextLayer({
        id: `${this.props.id}-label`,
        data: this.props.data,

        fontFamily: this.props.fontFamily,
        fontWeight: this.props.fontWeight,

        getPosition: this.props.getPosition,
        getText: this.props.getText,
        getSize: this.props.getTextSize
        getColor: this.props.getTextColor
      })
    ];
  }
}
```

Something that needs special attention is that all layer ids must be unique, no matter whether they are nested inside other layers. This means the sublayer ids must be generated dynamically based on the id of their parent, otherwise when there are multiple instances of `LabeledIconLayer`s their sublayer ids will collide.

Finally, to make [updateTriggers](/docs/api-reference/core/layer.md#updatetriggers) work when accessors need to be recalculated, we need to remap the user's `updateTriggers` from the parent layer's prop names to the sublayers' prop names.

```js
class LabeledIconLayer extends CompositeLayer {
  renderLayers() {
    return [
      // the icons
      new IconLayer({
        ...
        updateTriggers: {
          getPosition: this.props.updateTriggers.getPosition,
          getIcon: this.props.updateTriggers.getIcon,
          getSize: this.props.updateTriggers.getIconSize,
          getColor: this.props.updateTriggers.getIconColor
        }
      }),
      // the labels
      new TextLayer({
        ...
        updateTriggers: {
          getPosition: this.props.updateTriggers.getPosition,
          getText: this.props.updateTriggers.getText,
          getSize: this.props.updateTriggers.getTextSize,
          getColor: this.props.updateTriggers.getTextColor
        }
      })
    ];
  }
}
```

### Forwarding Properties

There are a number of base `Layer` class props that are usually expected to propogate down to all sublayers, such as `pickable`, `visible`, `coordinateSystem` and `opacity`. It is desirable to just forward many of these props directly to the sublayers.

There is a method `compositeLayer.getSubLayerProps` that handles a lot of these common compliance chore that were mentioned above. When calling it with a list of prop values that we care about, the list gets wrapped/populated with additional props that will help the sublayers align with deck.gl norms.

The complete code looks like follows:

```js
class LabeledIconLayer extends CompositeLayer {
  renderLayers() {
    return [
      // the icons
      new IconLayer(this.getSubLayerProps({
        // `getSubLayerProps` will concat the parent layer id with this id
        id: 'icon',
        data: this.props.data,

        iconAtlas: this.props.iconAtlas,
        iconMapping: this.props.iconMapping,

        getPosition: this.props.getPosition,
        getIcon: this.props.getIcon,
        getSize: this.props.getIconSize,
        getColor: this.props.getIconColor,

        updateTriggers: {
          getPosition: this.props.updateTriggers.getPosition,
          getIcon: this.props.updateTriggers.getIcon,
          getSize: this.props.updateTriggers.getIconSize,
          getColor: this.props.updateTriggers.getIconColor
        }
      })),
      // the labels
      new TextLayer(this.getSubLayerProps({
        // `getSubLayerProps` will concat the parent layer id with this id
        id: 'id',
        data: this.props.data,

        fontFamily: this.props.fontFamily,
        fontWeight: this.props.fontWeight,

        getPosition: this.props.getPosition,
        getText: this.props.getText,
        getSize: this.props.getTextSize
        getColor: this.props.getTextColor,

        updateTriggers: {
          getPosition: this.props.updateTriggers.getPosition,
          getText: this.props.updateTriggers.getText,
          getSize: this.props.updateTriggers.getTextSize,
          getColor: this.props.updateTriggers.getTextColor
        }
      }))
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

  getPickingInfo({info, sourceLayer}) {
    // override info.object
    return info;
  }

}
```

For more details, read about [how picking works](/docs/developer-guide/custom-layers/picking.md).


### Transforming Data

Because deck.gl's primitive layers expect input to be a flat iteratorable data structure, some composite layers need to transform user data into a different format before passing to sublayers. This transformation may consist converting a tree to an array, filtering, sorting, etc. For example, the [GeoJsonLayer](/docs/api-reference/layers/geojson-layer.md) splits features by type and passes each to `ScatterplotLayer`, `PathLayer` or `SolidPolygonLayer` respectively. The [TextLayer](/docs/api-reference/layers/text-layer.md) breaks each text string down to multiple characters and render them with a variation of `IconLayer`.

From the user's perspective, when they specify accessors such as `getColor`, or callbacks such as `onHover`, the functions should always interface with the original data that they give the top-level layer, instead of its internal implementations. For the sublayer to reference back to the original data, we can add a reference onto every transformed datum by calling `getSubLayerRow`:

```js
class MyCompositeLayer extends CompositeLayer {
  updateState({props, changeFlags}) {
    if (changeFlags.dataChanged) {
      // data to pass to the sublayer
      const subLayerData = [];
      /*
       * input data format:
         [
           {position: [-122.45, 37.78], timestamps: [0, 1, 4, 7, 8]},
           {position: [-122.43, 38.01], timestamps: [2, 4]},
           ...
         ]
       * data format to pass to sublayer:
         [
           {timestamp: 0},
           {timestamp: 1},
           {timestamp: 4},
           {timestamp: 7},
           ...
         ]
       */
      props.data.forEach((object, index) => {
        for (const timestamp of object.timestamps) {
          // `getSubLayerRow` decorates each data row for the sub layer with a reference to the original object and index
          subLayerData.push(this.getSubLayerRow({
            timestamp
          }, object, index));
        }
      });

      this.setState({subLayerData});
    }
  }
}
```

When the sublayer receives data decorated by `getSubLayerRow`, its accessors need to know how to read the data to access the original objects. In the above example, `getPosition: d => d.position` would fail if called with `{timestamp: 0}`, while the user expects it to be called with `{position: [-122.45, 37.78], timestamps: [0, 1, 4, 7, 8]}`. This can be solved by wrapping the user-provided accessor with `getSubLayerAccessor`:

```js
  renderLayers() {
    const {subLayerData} = this.state;
    const {getPosition, getRadius, getFillColor, getLineColor, getLineWidth, updateTriggers} = this.props;

    return new ScatterplotLayer(props, this.getSubLayerProps({
      id: 'scatterplot',
      updateTriggers,

      data: this.state.subLayerData,
      getPosition: this.getSubLayerAccessor(getPosition),
      getRadius: this.getSubLayerAccessor(getRadius),
      getFillColor: this.getSubLayerAccessor(getFillColor),
      getLineColor: this.getSubLayerAccessor(getLineColor),
      getLineWidth: this.getSubLayerAccessor(getLineWidth)
    }));
  }
```

The default implementations of lifecycle methods such as `getPickingInfo` also understand how to retrieve the orignal objects from the sublayer data if they are created using `getSubLayerRow`.
