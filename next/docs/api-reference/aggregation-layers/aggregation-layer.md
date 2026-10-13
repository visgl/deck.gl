# AggregationLayer (Experimental)

`AggregationLayer` is the base class for all layers in `@deck.gl/aggregation-layers` module. It implements the most common tasks for aggregation with flexibility of customizations.

`AggregationLayer` extends [CompositeLayer](https://deck.gl/next/docs/api-reference/core/composite-layer.md).

## Methods[​](#methods "Direct link to Methods")

Any layer subclassing the `AggregationLayer` must implement the following methods:

#### `getAggregatorType`[​](#getaggregatortype "Direct link to getaggregatortype")

Returns a string that indicates the type of aggregator that this layer uses, for example `'gpu'`. The aggregator type is re-evaluated every time the layer updates (usually due to props or state change). If the type string does not match its previous value, any existing aggregator will be disposed,and `createAggregator` is called to create a new instance.

#### `createAggregator`[​](#createaggregator "Direct link to createaggregator")

Arguments:

* `type` (string) - return value from `getAggregatorType()`

Returns a [Aggregator](https://deck.gl/next/docs/api-reference/aggregation-layers/aggregator.md) instance. This instance will be accessible via `this.state.aggregator`.

#### `onAttributeChange`[​](#onattributechange "Direct link to onattributechange")

Arguments:

* `attributeId` (string) - the id of an attribute that has been updated

This event handler should be used to update the props of the aggregator, if needed, and call `aggregator.setNeedsUpdate` to request an update.

#### `renderLayers`[​](#renderlayers "Direct link to renderlayers")

Returns a list of sub layers.

Aggregation results can be obtained here with `aggregator.getBins`, `aggregator.getResult` and `aggregator.getResultDomain`.

## Source[​](#source "Direct link to Source")

[modules/aggregation-layers/src/common/aggregation-layer.ts](https://github.com/visgl/deck.gl/tree/master/modules/aggregation-layers/src/common/aggregation-layer.ts)
