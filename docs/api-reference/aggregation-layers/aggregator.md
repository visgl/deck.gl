# Aggregator Interface

The `Aggregator` interface describes a type of class that performs aggregation.

## Terminology[​](#terminology "Direct link to Terminology")

*Aggregation* is a 2-step process:

1. **Sort**: Group a collection of *data points* by some property into *bins*.
2. **Aggregate**: for each *bin*, calculate a numeric output (*result*) from some metrics (*values*) from all its members. Multiple results can be obtained independently (*channels*).

An implementation of the *Aggregator* interface takes the following inputs:

* The number of data points
* The group that each data point belongs to, by mapping each data point to a *binId* (array of integers)
* The values to aggregate, by mapping each data point in each channel to one *value* (number)
* The method (*operation*) to reduce a list of values to one number, such as SUM

And yields the following outputs:

* A list of *binIds* that data points get sorted into
* The aggregated values (*result*) as a list of numbers, comprised of one number per bin per channel
* The \[min, max] among all aggregated values (*domain*) for each channel

### Example[​](#example "Direct link to Example")

Consider the task of making a [histogram](https://en.wikipedia.org/wiki/Histogram) that shows the result of a survey by age distribution.

1. The *data points* are the list of participants, and we know the age of each person.

2. Suppose we want to group them by 5-year intervals. A 21-year-old participant is assigned to the bin of age 20-25, with *binId* `[20]`. A 35-year-old participant is assigned to the bin of age 35-40, with *binId* `[35]`, and so on.

3. For each bin (i.e. age group), we calculate 2 *values*:

   <!-- -->

   * The first *channel* is "number of participants". Each participant in this group yields a *value* of 1, and the result equals all values added together (*operation*: SUM).
   * The second *channel* is "average score". Each participant in this group yields a *value* that is their test score, and the result equals the sum of all scores divided by the number of participants (*operation*: MEAN).

4. As the outcome of the aggregation, we have:

   <!-- -->

   * Bins: `[15, 20, 25, 30, 35, 40]`
   * Channel 0 result: `[1, 5, 12, 10, 8, 3]`
   * Channel 0 domain: `[1, 12]`
   * Channel 1 result: `[6, 8.2, 8.5, 7.9, 7.75, 8]`
   * Channel 1 domain: `[6, 8.5]`

## Methods[​](#methods "Direct link to Methods")

An implementation of `Aggregator` should expose the following methods:

#### `setProps`[​](#setprops "Direct link to setprops")

Set runtime properties of the aggregation.

```
aggregator.setProps({

  pointCount: 10000,

  attributes: {...},

  operations: ['SUM', 'MEAN'],

  binOptions: {groupSize: 5}

});
```

Arguments:

* `pointCount` (number) - number of data points.
* `attributes` ([Attribute](https://deck.gl/docs/api-reference/core/attribute.md)\[]) - the input data.
* `operations` (string\[]) - How to aggregate the values inside a bin, defined per channel.
* `binOptions` (object) - arbitrary settings that affect bin sorting.
* `onUpdate` (Function) - callback when a channel has been recalculated. Receives the following arguments:
  <!-- -->
  * `channel` (number) - the channel that just updated

#### `setNeedsUpdate`[​](#setneedsupdate "Direct link to setneedsupdate")

Flags a channel to need update. This could be a result of change in the input data or bin options.

```
aggregator.setNeedsUpdate(0);
```

Arguments:

* `channel` (number, optional) - mark the given channel as dirty. If not provided, all channels will be updated.

#### `update`[​](#update "Direct link to update")

Called after all props are set and before results are accessed. The aggregator should allocate resources and redo aggregations if needed at this stage.

```
aggregator.update();
```

#### `preDraw`[​](#predraw "Direct link to predraw")

Called before the result buffers are drawn to screen. Certain types of aggregations are dependent on render time context and this is alternative opportunity to update just-in-time.

```
aggregator.preDraw();
```

#### `getBin`[​](#getbin "Direct link to getbin")

Get the information of a given bin.

```
const bin = aggregator.getBin(100);
```

Arguments:

* `index` (number) - index of the bin to locate it in `getBins()`

Returns:

* `id` (number\[]) - Unique bin ID.
* `value` (number\[]) - Aggregated values by channel.
* `count` (number) - Number of data points in this bin.
* `pointIndices` (number\[] | undefined) - Indices of data points in this bin if available. This field may not be populated when using GPU-based implementations.

#### `getBins`[​](#getbins "Direct link to getbins")

Get an accessor to all bin IDs.

```
const binIdsAttribute = aggregator.getBins();
```

Returns:

* A [binary attribute](https://deck.gl/docs/api-reference/core/layer.md#dataattributes) of the output bin IDs, or
* null, if `update` has never been called

#### `getResult`[​](#getresult "Direct link to getresult")

Get an accessor to the aggregated values of a given channel.

```
const resultAttribute = aggregator.getResult(0);
```

Arguments:

* `channel` (number) - the channel to retrieve results from

Returns:

* A [binary attribute](https://deck.gl/docs/api-reference/core/layer.md#dataattributes) of the output values of the given channel, or
* null, if `update` has never been called

#### `getResultDomain`[​](#getresultdomain "Direct link to getresultdomain")

Get the \[min, max] of aggregated values of a given channel.

```
const [min, max] = aggregator.getResultDomain(0);
```

Arguments:

* `channel` (number) - the channel to retrieve results from

Returns the domain (\[number, number]) of the aggregated values of the given channel.

#### `destroy`[​](#destroy "Direct link to destroy")

Dispose all allocated resources.

```
aggregator.destroy();
```

## Members[​](#members "Direct link to Members")

An implementation of `Aggregator` should expose the following members:

#### `binCount` (number)[​](#bincount "Direct link to bincount")

The number of bins in the aggregated result.

## Source[​](#source "Direct link to Source")

[modules/aggregation-layers/src/common/aggregator/aggregator.ts](https://github.com/visgl/deck.gl/tree/9.4-release/modules/aggregation-layers/src/common/aggregator/aggregator.ts)
