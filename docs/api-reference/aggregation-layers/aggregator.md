# Aggregator Interface

The `Aggregator` interface describes a type of class that performs aggregation.

## Terminology

_Aggregation_ is a 2-step process:

1. **Sort**: Group a collection of _data points_ by some property into _bins_.
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
- `attributes` ([Attribute](../core/attribute.md)[]) - the input data.
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
aggregator.preDraw();
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

## Supplying an aggregator to a layer

`ScreenGridLayer`, `GridLayer`, `HexagonLayer`, and `ContourLayer` accept an optional
`aggregator` instance. When omitted, the layer creates its default aggregator using the
existing layer settings.

```typescript
new ScreenGridLayer({
  data,
  aggregator: new CustomAggregator()
});
```

The layer owns the supplied instance and destroys it when replaced or finalized. Keep the
same instance across layer updates; do not share it between layers or reuse it after disposal.
An optional `initialize(device)` method is called when the layer adopts the instance, before
`setProps`, so the constructor need not have access to a device. Extension changes mark the
same custom instance dirty without destroying or reinitializing it. The default implementations
are still recreated on extension changes.

Custom implementations receive `binIdRange`, `binOptions`, operations, and projection/extension
settings through `setProps`. Accessor inputs remain available as `Attribute` objects; `Attribute.getGPUVector()`
exposes their typed GPU columns. Allocate outputs in `update()` before sublayers are built,
and encode GPU work in `preDraw()` before those sublayers draw. Notify `onUpdate` when a
channel's output changes, following the existing aggregator lifecycle.

### GPU column inputs

The optional `positions` and `weights` props pass borrowed luma `GPUVector` columns directly
to a custom aggregator, bypassing accessor generation. `positions.length` determines the
input count unless `numInstances` explicitly selects a shorter prefix. `weights` contains one
column for ScreenGridLayer/ContourLayer, or two columns
(color then elevation) for GridLayer/HexagonLayer. Each weight column must have the same
length as positions. The custom aggregator defines supported input formats and chunking.
GridLayer, HexagonLayer, and ContourLayer also require `dataBounds: [min, max]` in input
coordinates because GPU-only positions cannot supply CPU bounds.

Position columns remain in their input coordinate system. The custom aggregator is responsible
for converting them into the binning coordinate system, including any custom projection.
Projection settings retain the layer's coordinate system, origin, and model matrix for these
columns; accessor-generated position attributes have already applied CPU preprojection.

```typescript
new ScreenGridLayer({
  positions: positionVector,
  weights: [weightVector],
  aggregator: new CustomAggregator(),
  colorDomain: [0, 100]
});
```

Input columns remain caller-owned. Replace column references when their data changes, or
explicitly invalidate the aggregator when updating storage in place. GPU column inputs require
a custom aggregator, except for the built-in [ScreenGrid](./screen-grid-layer.md#compute-aggregation) and
[Grid](./grid-layer.md#compute-aggregation) compute paths,
and do not support layer extensions or accessor fallbacks.

### GPU column results

`getBins()` and `getResult(channel)` may return either the existing `BinaryAttribute` or a
borrowed `GPUVector`. Cell rendering uses the same AttributeManager/`GPUVectorModel` path as
accessor-backed layers, including ArcLayer. The vector adapter preserves offsets and strides
without uploading, copying, or reading the buffer. Results require one concrete
buffer chunk: `float32x2` bin IDs and `float32` channel values. Result vectors and
buffers remain owned by the aggregator, and must stay valid through sublayer drawing.

Domains are returned as JavaScript arrays by `getResultDomain()`. Supplying explicit
color/elevation domains and omitting domain callbacks avoids automatic domain readback for
custom aggregators. Explicit domain callbacks receive the aggregation domain through
`getResultDomain()`.

Percentile and ordinal scales access results on the CPU. Picking uses `getBin()`.
ContourLayer uses CPU-readable results for marching squares.

### Asynchronous result metadata

Picking and percentile scales need results on the CPU. An aggregator can copy its GPU
results asynchronously and return the copy from `getResultValues(channel)`. Set `isLoaded`
to false while the copy is pending, then call `onUpdate` when it is ready. Rendering
continues to use the GPU buffers returned by `getResult()`.

### Comparing GPU and CPU aggregation with the same inputs

[`ReadbackAggregator`](./cpu-aggregator.md#readbackaggregator) aggregates GPU column inputs
on the CPU, so you can compare CPU and GPU aggregation on the same buffers. It copies the
columns back first, and the layer reports `isLoaded: false` until aggregation finishes.
Columns need `COPY_SRC` usage. See the [constructor docs](./cpu-aggregator.md#readbackaggregator)
for accepted formats. Strided and interleaved columns work.

For Cartesian GridLayer inputs, compare the native WebGPU aggregator with the CPU adapter.
Both branches use the same WebGPU device; WebGL does not accept these borrowed columns:

```typescript
import {GridLayer, ReadbackAggregator} from '@deck.gl/aggregation-layers';
import {Deck, OrthographicView} from '@deck.gl/core';
import {luma} from '@luma.gl/core';
import {webgpuAdapter} from '@luma.gl/webgpu';

const device = await luma.createDevice({adapters: [webgpuAdapter], type: 'webgpu'});
// Create positionVector and weight vectors on this same device.

const createCPUAggregator = () => new ReadbackAggregator({
  dimensions: 2,
  weightAttributes: ['colorWeights', 'elevationWeights'],
  getBin: {
    sources: ['positions'],
    getValue: ({positions}, index, {cellSizeCommon, cellOriginCommon}) => [
      Math.floor((positions[0] - cellOriginCommon[0]) / cellSizeCommon[0]),
      Math.floor((positions[1] - cellOriginCommon[1]) / cellSizeCommon[1])
    ]
  },
  getValue: [
    {sources: ['colorWeights'], getValue: ({colorWeights}) => colorWeights},
    {sources: ['elevationWeights'], getValue: ({elevationWeights}) => elevationWeights}
  ]
});

// Keep the adapter while CPU mode is active; replace it on each switch back to CPU.
let cpuAggregator = null;
function render(useCPU) {
  if (useCPU && !cpuAggregator) cpuAggregator = createCPUAggregator();
  if (!useCPU) cpuAggregator = null;
  return new GridLayer({
    coordinateSystem: 'cartesian',
    gpuAggregation: true,
    positions: positionVector,
    weights: [colorWeightVector, elevationWeightVector],
    dataBounds,
    cellSize: 10,
    colorDomain: [0, 100],
    elevationDomain: [0, 100],
    aggregator: useCPU ? cpuAggregator : undefined
  });
}
const deck = new Deck({device, views: new OrthographicView(), layers: [render(false)]});
// Switch modes with deck.setProps({layers: [render(useCPU)]}).
```

Limitations:

- `getBin` receives untransformed positions. Project other coordinate systems in `getBin`.
- Layer extensions do not apply. Picking returns bins, not original JavaScript objects.
- The layer destroys removed adapters. Create a new one for each switch to CPU.
- After writing to a buffer in place, call the adapter's `setNeedsUpdate()`.
- CPU timings include readback. Compare end-to-end frame times.
