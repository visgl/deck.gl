# AggregationLayer

All of the layers in `@deck.gl/aggregation-layers` module perform some sort of data aggregation. All these layers perform aggregation with different parameters (CPU vs GPU, aggregation to rectangular bins vs hexagon bins, world space vs screen space, aggregation of single weight vs multiple weights etc).

`AggregationLayer` and `GridAggregationLayer` perform most of the common tasks for aggregation with flexibility of customizations. This document describes what `AggregationLayer` does and how to use it in other aggregation layers.


`AggregationLayer` is subclassed form `CompositeLayer` and all layers in `@deck.gl/aggregation-layers` are subclassed from this Layer.

## Integration with `AttributeManager`

This layer creates `AttributeManager` and makes it available for its subclasses. Any aggregation layer can add attributes to the `AttributeManager` and retrieve them using `getAttributes` method. This enables using `AttributeManager`'s features and optimization for using attributes. Also manual iteration of `data` prop can be removed and attributes can be directly set on GPU aggregation models or accessed directly for CPU aggregation.

Example: Adding attributes to an aggregation layer

```
const attributeManager = this.getAttributeManager();
attributeManager.add({
  positions: {size: 3, accessor: 'getPosition'},
  color: {size: 3, accessor: 'getColorWeight'},
  elevation: {size: 3, accessor: 'getElevationWeight'}
});
```

## updateState()

During update state, Subclasses of `AggregationLayer` must first call 'super.updateState()', which calls

- `updateShaders(shaders)` : Subclasses can override this if they need to update shaders, for example, when performing GPU aggregation, aggregation shaders must be merged with argument of this function  to correctly apply `extensions`.

- `_updateAttributes`: This checks and updates attributes based on updated props.

## Checking if aggregation is dirty

### Dimensions

Typical aggregation, involves :
1. Group the input data points into bins
2. Compute the aggregated value for each bin

For example, when `cellSize` or `data` is changed, layer needs to perform both `1` and `2` steps, when a parameter affecting a bin's value is changed (like `getWeight` accessor), layer only need to perform step `2`.

When doing CPU Aggregation, both above steps are performed individually. But for GPU aggregation, both are merged into single render call.

To support what state is dirty, constructor takes `dimensions` object, which contains, several keyed dimensions. It must contain `data` dimension that defines, when re-aggregation needs to be performed.

### isAggregationDirty()

This helper can be used if a dimension is changed. Sublayers can defined custom dimensions and call this method to check if a dimension is changed.


### isAttributeChanged()

`AggregationLayer` tracks what attributes are changed in each update cycle. Super classes can use `isAttributeChanged()` method to check if a specific attribute is changed or any attribute is changed.
