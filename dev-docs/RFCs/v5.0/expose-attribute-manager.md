# RFC: Property Animation

* **Authors**: Ib Green
* **Date**: Aug 2017
* **Status**: Ready for formal review

Notes:


## Motivation

Some application may also just want to front-load the attribute generation cost, or perhaps wire up a worker to generate the attributes.

The current problem is that while deck.gl 4.1 already allows an the application to generate and supply vertex attributes, it offers no support for generating those, needs to understand the structure of

## Overview

The deck.gl `AttributeManager` already has a well-defined [public API]() By making each layer's `AttributeManager` accessible to the application, so that it can run data arrays through the attribute manager and "harvest" and store the resulting typed arrays for quick animation later


## Use Cases

* **Controlling When Attribute Generation Happens** - AttributeManager access allows the application (rather than deck.gl) to decide when to do heavy processing. Perhaps during initialization the app needs to wait for a couple of big data loads, and has plenty of idle time to do processing.

* **Move Attribute Generation to Workers** - In certain cases, generating attributes for very big data sets can lock up the main thread for a significant fraction of a second (or more), making it desirable to do this processing on a worker. In addition, typed arrays can be transferred out of workers very efficiently (without copying). 

* **Attribute Reuse** - Some applications will load data and display it multiple times, perhaps as part of an animation loop. If they keep feeding in the original data arrays to the layer in the loop, the layer will keep regenerating vertex attributes again and again.

Related RFCs:
* [**Off-thread attribute generation**](v5.0/off-thread-attribute-generation.md) - The implementation of that RFC might benefit from this feature being in place.


## Application API Example


```js
// Pregenerate PointCloud attributes using the `PointCloudLayer`'s `AttributeManager`
const pointCloudAttributes = PointCloudLayer
  .getAttributeManager()
  .updateFromProps({
    data: dataSamples.getPointCloud(),
    numInstances: dataSamples.getPointCloud().length,
    getPosition: d => d.position,
    getNormal: d => d.normal,
    getColor: d => d.color
  })
  .getTypedArrays();

// Later, use the attributes to instantiate the layer
new PointCloudLayer = {
  id: 'pointCloudLayer',
  ...
  pickable: true,
  // Pregenerated attributes,
  ...pointCloudAttributes
};
```



## Detailed Proposal

`AttributeManager` New Methods:
* `AttributeManager.updateFromProps({...props})` - the current `update` method has a clunky API, this would only take props.
* `AttributeManager.getTypedArrays` - gets the updated arrays
Q: Join into one?

`Layer` Changes:
* New static method `getAttributeManager`


Changes requires in each layer:
* New static method `getAttributeManager` - The layers need to move their attribute manager creation into a static method


## Supplementary Code Examples

```js
ScatterplotLayer.getAttributeManager = attributeManager => {
  return Layer.getAttributeManager(attributeManager || 'scatterplot-attributes')
  .addInstanced({
    instancePositions: {size: 3, accessor: 'getPosition', update: calculateInstancePositions},
    instancePositions64xyLow: {size: 2, accessor: 'getPosition', update: calculateInstancePositions64xyLow},
    instanceRadius: {size: 1, accessor: 'getRadius', defaultValue: 1, update: calculateInstanceRadius},
    instanceColors: {size: 4, type: GL.UNSIGNED_BYTE, accessor: 'getColor', update: calculateInstanceColors}
  });
};
```

```js
ScatterplotLayer.getAttributeManager = ({id = 'scatterplot-attributes'} = {}) => {
  return Layer.getAttributeManager(id)
  	.addInstanced({
      instancePositions: {size: 3, accessor: 'getPosition', update: calculateInstancePositions},
      instancePositions64xyLow: {size: 2, accessor: 'getPosition', update: calculateInstancePositions64xyLow},
      instanceRadius: {size: 1, accessor: 'getRadius', defaultValue: 1, update: calculateInstanceRadius},
      instanceColors: {size: 4, type: GL.UNSIGNED_BYTE, accessor: 'getColor', update: calculateInstanceColors}
    });
};
```

```js
  initializeState() {
    const {gl} = this.context;
    this.setState({model: this._getModel(gl)});
    this.constructor.getAttributeManager(this.state.attributeManager);
  }
```
Question - inheritance of `initializeState`? Should the call to getAttributeManager be built into `LayerManager` and no longer be called by the layer? (LM should check that the function is defined before calling it, of course, to avoid breaking old layers).


Also to make this work, the attribute updaters need to be moved out of the `Layer` subclass:
```js
// ATTRIBUTE MANAGEMENT

const calculateInstancePositions = ({value}, {props}) => {
  const {data, getPosition} = props;
  let i = 0;
  for (const point of data) {
    const position = getPosition(point);
    value[i++] = get(position, 0);
    value[i++] = get(position, 1);
    value[i++] = get(position, 2) || 0;
  }
};

...
```

`Layer` Code Changes
```js
/**
 * Creates and initializes an attribute manager
 * If the argument is an attributeManager, initializes it.
 * If the argument is a string, uses it as the id when creating a new manager
 * returns the newly created and initialized AttributeManager
 */
Layer.getAttributeManager = attributeManager => {
  // Create a new attribute manager unless already supplied
  attributeManager = attributeManager || 'attribute-manager';
  if (typeof attributeManager === 'string') {
    attributeManager = new AttributeManager({id: attributeManager});
  }

  // All instanced layers get instancePickingColors attribute by default
  // Their shaders can use it to render a picking scene
  // TODO - this slows down non instanced layers
  // TODO - share this buffer between layers
  return attributeManager.addInstanced({
    /* eslint-disable max-len */
    instancePickingColors: {size: 3, type: GL.UNSIGNED_BYTE, update: calculateInstancePickingColors}
    /* eslint-enable max-len */
  });
};
```


## Considerations

### Backwards Compatibility

`getAttributeManager` is a new function that will only work on participating (i.e. updated) layers. The function will simply not be defined on old layers, generating an "undefined function" exception when being called.


## Questions

* **Disposing** of the the created attributes: by default an attribute manager will cache any created attributes. preventing them from being garbage collected. Releasing references to the `AttributeManager` will obviously prevent this, but if the `AttributeManager` is used in global scope...

Add `AttributeManager.destroy()`?

