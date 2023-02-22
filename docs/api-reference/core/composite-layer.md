# CompositeLayer Class

The `CompositeLayer` class is a subclass of the [Layer Class](./layer.md), that customizes various [layer lifecycle methods](../../developer-guide/custom-layers/layer-lifecycle.md) to help create sublayers and handle events from those layers.

If you intend to implement a layer that generates other layers, you should extend this class.

For more information consult the [Composite Layers](../../developer-guide/custom-layers/composite-layers.md) article.


## Usage

Define a composite layer that renders a set of sublayers, one of them conditionally

```js
class MyCompositeLayer extends CompositeLayer {
  renderLayers() {
    return [
      this._renderGroupOfSubLayers(), // returns an array of layers
      this.props.showScatterplot && new ScatterplotLayer(...)
    ];
  }
}
```


## Constructor

```js
new CompositeLayer(...props);
```

Parameters:

* `props` (Object) - `Layer` properties.


## Properties

Inherits from all [Base Layer](./layer.md) properties.

##### `_subLayerProps` (Object) **EXPERIMENTAL** {#_sublayerprops}

Key is the id of a sublayer and value is an object used to override the props of the sublayer. For a list of ids rendered by each composite layer, consult the *Sub Layers* section in each layer's documentation.

Example: make only the point features in a GeoJsonLayer respond to hover and click

```js
import {GeoJsonLayer} from '@deck.gl/layers';

new GeoJsonLayer({
  // ...other props
  pickable: false,
  _subLayerProps: {
    points: {
      pickable: true
    }
  }
});
```

Example: use IconLayer instead of ScatterplotLayer to render the point features in a GeoJsonLayer

```js
import {IconLayer, GeoJsonLayer} from '@deck.gl/layers';

new GeoJsonLayer({
  // ...other props
  _subLayerProps: {
    points: {
      type: IconLayer,
      iconAtlas: './icon-atlas.png',
      iconMapping: './icon-mapping.json',
      getIcon: d => d.sourceFeature.feature.properties.marker,
      getColor: [255, 200, 0],
      getSize: 32,
      updateTriggers: {
        getIcon: triggerValue
      }
    }
  }
});
```

## Members

##### `isComposite` {#iscomposite}

Always `true`.

##### `isLoaded` {#isloaded}

`true` if all asynchronous assets are loaded, and all sublayers are also loaded.

##### `parent` {#parent}

A `Layer` instance if this layer is rendered by a [CompositeLayer](./composite-layer.md)


## Methods

##### `draw` {#draw}

A composite layer does not render directly into the WebGL context. The `draw` method inherited from the base class is therefore never called.

##### `renderLayers` {#renderlayers}

Allows a layer to "render" or insert one or more deck.gl layers after itself.
Called after a layer has been updated.

Returns:

* `null`, a single `Layer` instance, or a (nested) array of layers.

The default implementation of `renderLayers` returns `null`.

`renderLayers` can return a nested arrays with `null` values. deck.gl will automatically flatten and filter the array. See usage above.


##### `filterSubLayer` {#filtersublayer}

Allows a layer to dynamically show/hide sub layers based on the render context.

Receives arguments:

- `layer` (Layer) - the sub layer to be drawn
- `viewport` (Viewport) - the current viewport
- `isPicking` (Boolean) - whether this is a picking pass
- `renderPass` (String) - the name of the current render pass. See [layerFilter](./deck.md#layerfilter) for possible values.

Returns:

`true` if the layer should be drawn.

This method achieves the same result as toggling sub layers' `visible` prop in `renderLayers`. The difference is that, `renderLayers` is only called when the layer is updated due to props or state change, and will recursively create new instances of all decendant layers, therefore is more expensive to invoke. `filterSubLayer` is evaluated before every redraw, and is intended to be a more performant solution to setting `visible` props dynamically during continuous viewport updates. Generally speaking, `filterSubLayer` is favorable if the visibilities of sub layers change frequently, and the logic to determine visibility is very cheap to compute.

An example of leveraging this method is to switch sub layers on viewport change:

```js
/*
 * A layer that renders different dataset based on zoom level
 */
// Implementation A
class LODLayer extends CompositeLayer {
  
  // Force update layer and re-render sub layers when viewport changes
  shouldUpdateState({changeFlags}) {
    return changeFlags.somethingChanged;
  }

  renderSubLayers() {
    const {lowResData, hiResData} = this.props;
    const {zoom} = this.context.viewport;
    return [
      new ScatterplotLayer({
        id: 'points-low-zoom',
        data: lowResData,
        visible: zoom < 8
      }),
      new ScatterplotLayer({
        id: 'points-high-zoom',
        data: highResData,
        visible: zoom >= 8
      })
    ]
  }
}

// Implementation B
class LODLayer extends CompositeLayer {
  renderSubLayers() {
    const {lowResData, hiResData} = this.props;
    return [
      new ScatterplotLayer({
        id: 'points-low-zoom'
        data: lowResData,
      }),
      new ScatterplotLayer({
        id: 'points-high-zoom',
        data: highResData
      })
    ]
  }

  filterSubLayer({layer, viewport}) {
    if (viewport.zoom < 8) {
      return layer.id === 'points-low-zoom';
    } else {
      return layer.id === 'points-high-zoom';
    }
  }
}
```

##### `getPickingInfo` {#getpickinginfo}

Called when a sublayer is being hovered or clicked, after the `getPickingInfo`
of the sublayer has been called.
The composite layer can override or add additional fields to the `info` object
that will be passed to the callbacks.

Parameters:

* `pickParams` (Object)
  + `pickParams.info` (Object) - The current `info` object. By default it contains the
  following fields:

    - `x` (Number) - Mouse position x relative to the viewport.
    - `y` (Number) - Mouse position y relative to the viewport.
    - `coordinate` ([Number, Number]) - Mouse position in world coordinates. Only applies if the
      [`coordinateSystem`](./layer.md#coordinatesystem)
      prop is set to `COORDINATE_SYSTEM.LNGLAT`.
    - `color` (Number[4]) - The color of the pixel that is being picked. It represents a
      "picking color" that is encoded by
      [`layer.encodePickingColor()`](./layer.md#encodepickingcolor).
    - `index` (Number) - The index of the object that is being picked. It is the returned
      value of
      [`layer.decodePickingColor()`](./layer.md#decodepickingcolor).
    - `picked` (Boolean) - `true` if `index` is not `-1`.
  + `pickParams.mode` (String) - One of `hover` and `click`
  + `pickParams.sourceLayer` (Layer) - the sublayer instance where this event originates from.

Returns:

* An `info` object with optional fields about what was picked. This object will be passed to the layer's `onHover` or `onClick` callbacks.
* `null`, if the corresponding event should be cancelled with no callback functions called.

The default implementation returns `pickParams.info` without any change.


##### `getSubLayerProps` {#getsublayerprops}

This utility method helps create sublayers that properly inherit a composite layer's basic props. For example, it creates a unique id for the sublayer, and makes sure the sublayer's `coordinateSystem` is set to be the same as the parent.

Parameters:

* `subLayerProps` (Object)
  + `id` (String, required) - an id that is unique among all the sublayers generated by this composite layer.
  + `updateTriggers` (Object) - the sublayer's update triggers.
  + Any additional props are optional.

Returns a properties object used to generate a sublayer, with the following keys:

* `id` - a unique id for the sublayer, by prepending the parent layer id to the sublayer id.
* `updateTriggers` - merged object of the parent layer update triggers and the sublayer update triggers.
* Base layer props that are directly forwarded from the base layer:
  + `opacity`
  + `pickable`
  + `visible`
  + `parameters`
  + `getPolygonOffset`
  + `highlightedObjectIndex`
  + `autoHighlight`
  + `highlightColor`
  + `coordinateSystem`
  + `coordinateOrigin`
  + `wrapLongitude`
  + `positionFormat`
  + `modelMatrix`
* Any other additional props from the input parameter are directly forwarded.
* Any overriding props specified in `_subLayerProps`.


##### `shouldRenderSubLayer` {#shouldrendersublayer}

Called to determine if a sublayer should be rendered.
A composite layer can override this method to change the default behavior.

Parameters:

* `id` (String) - the sublayer id
* `data` (Array) - the sublayer data

Returns `true` if the sublayer should be rendered. The base class implementation returns `true` if `data` is not empty.


##### `getSubLayerClass` {#getsublayerclass}

Called to retrieve the constructor of a sublayer.
A composite layer can override this method to change the default behavior.

Parameters:

* `id` (String) - the sublayer id
* `DefaultLayerClass` - the default constructor used for this sublayer.

Returns:

Constructor for this sublayer. The base class implementation checks if `type` is specified for the sublayer in `_subLayerProps`, otherwise returns the default.

##### `getSubLayerRow` {#getsublayerrow}

Used by [adapter layers](../../developer-guide/custom-layers/composite-layers.md#transforming-data)) to decorate transformed data with a reference to the original object.

Parameters:

* `row` (Object) - a custom data object to pass to a sublayer.
* `sourceObject` (Object) - the original data object provided by the user
* `sourceObjectIndex` (Object) - the index of the original data object provided by the user

Returns:

The `row` object, decorated with a reference.


##### `getSubLayerAccessor` {#getsublayeraccessor}

Used by [adapter layers](../../developer-guide/custom-layers/composite-layers.md#transforming-data)) to allow user-provided accessors to read the original objects from transformed data.

Parameters:

* `accessor` (Function|Any) - the accessor provided to the current layer.

Returns:

* If `accessor` is a function, returns a new accessor function.
* If `accessor` is a constant value, returns it as is.

## Source

[modules/core/src/lib/composite-layer.ts](https://github.com/visgl/deck.gl/blob/master/modules/core/src/lib/composite-layer.ts)
