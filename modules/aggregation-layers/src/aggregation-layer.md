# AggregationLayer

All of the layers in `@deck.gl/aggregation-layers` module perform some sort of data aggregation. All these layers perform aggregation with different parameters (CPU vs GPU, aggregation to rectangular bins vs hexagon bins, world space vs screen space, aggregation of single weight vs multiple weights etc).

`AggregationLayer` and `GridAggregationLayer` perform most of the common tasks for aggregation with flexibility of customizations. This document describes what `AggregationLayer` does and how to use it in other aggregation layers.


`AggregationLayer` is subclassed form `CompositeLayer` and all layers in `@deck.gl/aggregation-layers` are subclassed from this Layer.

### Integration with `AttributeManger`

This layer creates `AttributeManger` and makes it available for its subclasses. Any aggregation layer can add attributes to the `AttributeManager` and retrieve them using `getAttributes` method. This enables using `AttributeManager`'s features and optimization for using attributes. Also manual iteration of `data` prop can be removed and attributes can be directly set on GPU aggregation models or accessed directly for CPU aggregation.

Example: Adding attributes to an aggregation layer

```
const attributeManager = this.getAttributeManager();
attributeManager.add({
  positions: {size: 3, accessor: 'getPosition'},
  color: {size: 3, accessor: 'getColorWeight'},
  elevation: {size: 3, accessor: 'getElevationWeight'}
});
```

### updateState()

During update state, Subclasses of `AggregationLayer` must first call 'super.updateState()', which calls

- `_updateShaders(shaders)` : Subclasses can override this if they need to update shaders, for example, when performing GPU aggregation, aggregation shaders must be merged with argument of this function  to correctly apply `extensions`.

- `_updateAttributes`: This checks and updates attributes based on updated props.

### Checking if aggregation is dirty

Constructor, takes an array of props, `aggregationProps`, and a private method `_isAggregationDirty()` is provided that returns `true` when any of the props in `aggregationProps` are changed. Subclasses can customize this to desired props by providing `aggregatinProps` array.
