# Aggregator Interface

The `Aggregator` interface describes a type of class that performs aggregation.

## Terminology

_Aggregation_ is a 2-step process:

1. **Sort**: Group a collection of _data points_ by some property into bins_.
2. **Aggregate**: for each _bin_, calculate a numeric output (_result_) from some metrics (_values_) from all its members. Multiple results can be obtained independently (_channels_).

An implementation of the _Aggregator_ interface takes the following inputs:
- The number of data points
- The group that each data point belongs to, by mapping each data point to a _binId_ (array of integers)
- The values to aggregate, by mapping each data point in each channel to one _value_ (number)
- The method (_operation_) to reduce a list of values to one number, such as SUM

And yields the following outputs:
- A list of _binIds_ that data points get sorted into
- The aggregated values (_result_) as a list of numbers, comprised of one number per bin per channel
- The [min, max] among all aggregated values (_domain_) for each channel

### Example

Consider the task of making a [histogram](https://en.wikipedia.org/wiki/Histogram) that shows the result of a survey by age distribution.

1. The _data points_ are the list of participants, and we know the age of each person.
2. Suppose we want to group them by 5-year intervals. A 21-year-old participant is assigned to the bin of age 20-25, with _binId_ `[20]`. A 35-year-old participant is assigned to the bin of age 35-40, with _binId_ `[35]`, and so on.
3. For each bin (i.e. age group), we calculate 2 _values_:
    + The first _channel_ is "number of participants". Each participant in this group yields a _value_ of 1, and the result equals all values added together (_operation_: SUM).
    + The second _channel_ is "average score". Each participant in this group yields a _value_ that is their test score, and the result equals the sum of all scores divided by the number of participants (_operation_: MEAN).
4. As the outcome of the aggregation, we have:
    + Bins: `[15, 20, 25, 30, 35, 40]`
    + Channel 0 result: `[1, 5, 12, 10, 8, 3]`
    + Channel 0 domain: `[1, 12]`
    + Channel 1 result: `[6, 8.2, 8.5, 7.9, 7.75, 8]`
    + Channel 1 domain: `[6, 8.5]`


## Methods

An implementation of `Aggregator` should expose the following methods:

#### `setProps` {#setprops}

Set runtime properties of the aggregation.

```ts
aggregator.setProps({
  pointCount: 10000,
  attributes: {...},
  operations: ['SUM', 'MEAN'],
  binOptions: {groupSize: 5}
});
```

Arguments:
- `pointCount` (number) - number of data points.
- `attributes` ([attributes](../core/layer.md#dataattributes)) - the input data in binary format.
- `operations` (string[]) - How to aggregate the values inside a bin, defined per channel.
- `binOptions` (object) - arbitrary settings that affect bin sorting.
- `onUpdate` (Function) - callback when a channel has been recalculated. Receives the following arguments:
    + `channel` (number) - the channel that just updated

#### `setNeedsUpdate` {#setneedsupdate}

Flags a channel to need update. This could be a result of change in the input data or bin options.

```ts
aggregator.setNeedsUpdate(0);
```

Arguments:
- `channel` (number, optional) - mark the given channel as dirty. If not provided, all channels will be updated.

#### `update` {#update}

Called after all props are set and before results are accessed. The aggregator should allocate resources and redo aggregations if needed at this stage.

```ts
aggregator.update();
```

#### `preDraw` {#predraw}

Called before the result buffers are drawn to screen. Certain types of aggregations are dependent on render time context and this is alternative opportunity to update just-in-time.

```ts
aggregator.preDraw({moduleSettings: ...});
```

#### `getBin` {#getbin}

Get the information of a given bin.

```ts
const bin = aggregator.getBin(100);
```

Arguments:
- `index` (number) - index of the bin to locate it in `getBins()`

Returns:
- `id` (number[]) - Unique bin ID.
- `value` (number[]) - Aggregated values by channel.
- `count` (number) - Number of data points in this bin.
- `pointIndices` (number[] | undefined) - Indices of data points in this bin if available. This field may not be populated when using GPU-based implementations.

#### `getBins` {#getbins}

Get an accessor to all bin IDs.

```ts
const binIdsAttribute = aggregator.getBins();
```

Returns:
- A [binary attribute](../core/layer.md#dataattributes) of the output bin IDs, or
- null, if `update` has never been called

#### `getResult` {#getresult}

Get an accessor to the aggregated values of a given channel.

```ts
const resultAttribute = aggregator.getResult(0);
```

Arguments:
- `channel` (number) - the channel to retrieve results from

Returns:
- A [binary attribute](../core/layer.md#dataattributes) of the output values of the given channel, or
- null, if `update` has never been called

#### `getResultDomain` {#getresultdomain}

Get the [min, max] of aggregated values of a given channel.

```ts
const [min, max] = aggregator.getResultDomain(0);
```

Arguments:
- `channel` (number) - the channel to retrieve results from

Returns the domain ([number, number]) of the aggregated values of the given channel.

#### `destroy` {#destroy}

Dispose all allocated resources.

```ts
aggregator.destroy();
```


## Members

An implementation of `Aggregator` should expose the following members:

#### `binCount` (number) {#bincount}

The number of bins in the aggregated result.

## Source

[modules/aggregation-layers/src/common/aggregator/aggregator.ts](https://github.com/visgl/deck.gl/tree/master/modules/aggregation-layers/src/common/aggregator/aggregator.ts)
