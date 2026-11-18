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
* `attributes` ([Attribute](https://deck.gl/next/docs/api-reference/core/attribute.md)\[]) - the input data.
* `operations` (string\[]) - How to aggregate the values inside a bin, defined per channel.
* `binOptions` (object) - arbitrary settings that affect bin sorting.
* `onNeedsRedraw` (() => void, optional; default: undefined) - requests another draw, for example to retry a metadata copy.
* `onUpdate` (Function) - callback when a channel has been recalculated. Receives the following arguments:
  <!-- -->
  * `channel` (number) - the channel that just updated

#### `setShaderContext(context)` (optional)[​](#setshadercontext "Direct link to setshadercontext")

Default: undefined. Receives the layer's shader configuration after initialization and when extensions change. `context.shaders` contains plugins, modules, defines and the shader assembler. `context.getAttributeBindings()` returns current GPU attributes and buffer layouts. These bindings are borrowed. Release compiled shader resources when the context changes and in `destroy()`.

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

* A [binary attribute](https://deck.gl/next/docs/api-reference/core/layer.md#dataattributes) of the output bin IDs, or
* null, if `update` has never been called

#### `getResult`[​](#getresult "Direct link to getresult")

Get an accessor to the aggregated values of a given channel.

```
const resultAttribute = aggregator.getResult(0);
```

Arguments:

* `channel` (number) - the channel to retrieve results from

Returns:

* A [binary attribute](https://deck.gl/next/docs/api-reference/core/layer.md#dataattributes) of the output values of the given channel, or
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

#### `supportsExtensions` (boolean, optional)[​](#supportsextensions "Direct link to supportsextensions")

Default: undefined. Set to `false` to reject layer shader extensions when adopted.

#### `requiresProjectedPositions` (boolean, optional)[​](#requiresprojectedpositions "Direct link to requiresprojectedpositions")

Default: `false`. Set to `true` to require borrowed position vectors to already use the view coordinate system. Accessor inputs can use the layer's CPU preprojection.

#### `binCount` (number)[​](#bincount "Direct link to bincount")

The number of bins in the aggregated result.

## Source[​](#source "Direct link to Source")

[modules/aggregation-layers/src/common/aggregator/aggregator.ts](https://github.com/visgl/deck.gl/tree/master/modules/aggregation-layers/src/common/aggregator/aggregator.ts)

## Supplying an aggregator to a layer[​](#supplying-an-aggregator-to-a-layer "Direct link to Supplying an aggregator to a layer")

`ScreenGridLayer`, `GridLayer`, `HexagonLayer`, and `ContourLayer` accept an optional `aggregator` instance. When omitted, the layer creates its default aggregator using the existing layer settings.

```
new ScreenGridLayer({

  data,

  aggregator: new CustomAggregator()

});
```

The layer owns the supplied instance and destroys it when replaced or finalized. Keep the same instance across layer updates; do not share it between layers or reuse it after disposal. An optional `initialize(device)` method is called when the layer adopts the instance, before `setProps`, so the constructor need not have access to a device. Extension changes mark the same custom instance dirty without destroying or reinitializing it. The default implementations are still recreated on extension changes.

Custom implementations receive `binIdRange`, `binOptions`, operations, and projection/extension settings through `setProps`. Accessor inputs remain available as `Attribute` objects; `Attribute.getGPUVector()` exposes their typed GPU columns. Allocate outputs in `update()` before sublayers are built, and encode GPU work in `preDraw()` before those sublayers draw. Notify `onUpdate` when a channel's output changes, following the existing aggregator lifecycle.

### GPU column results[​](#gpu-column-results "Direct link to GPU column results")

`getBins()` and `getResult(channel)` may return either the existing `BinaryAttribute` or a borrowed `GPUVector`. Cell rendering uses the same AttributeManager/`GPUVectorModel` path as accessor-backed layers, including ArcLayer. The vector adapter preserves offsets and strides without uploading, copying, or reading the buffer. Results require one concrete buffer chunk: `float32x2` bin IDs and `float32` channel values. Result vectors and buffers remain owned by the aggregator, and must stay valid through sublayer drawing.

Domains are returned as JavaScript arrays by `getResultDomain()`. Supplying explicit color/elevation domains and omitting domain callbacks avoids automatic domain readback for custom aggregators. Explicit domain callbacks receive the aggregation domain through `getResultDomain()`.

Percentile and ordinal scales access results on the CPU. Picking uses `getBin()`. ContourLayer uses CPU-readable results for marching squares.

### Asynchronous result metadata[​](#asynchronous-result-metadata "Direct link to Asynchronous result metadata")

Picking and percentile scales need results on the CPU. An aggregator can copy its GPU results asynchronously and return the copy from `getResultValues(channel)`. Set `isLoaded` to false while the copy is pending, then call `onUpdate` when it is ready. Rendering continues to use the GPU buffers returned by `getResult()`.

### Comparing GPU and CPU aggregation with the same inputs[​](#comparing-gpu-and-cpu-aggregation-with-the-same-inputs "Direct link to Comparing GPU and CPU aggregation with the same inputs")

[`ReadbackAggregator`](https://deck.gl/next/docs/api-reference/aggregation-layers/cpu-aggregator.md#readbackaggregator) aggregates GPU column inputs on the CPU, so you can compare CPU and GPU aggregation on the same buffers. It copies the columns back first, and the layer reports `isLoaded: false` until aggregation finishes. Columns need `COPY_SRC` usage. See the [constructor docs](https://deck.gl/next/docs/api-reference/aggregation-layers/cpu-aggregator.md#readbackaggregator) for accepted formats. Strided and interleaved columns work.

For Cartesian GridLayer inputs, compare the native WebGPU aggregator with the CPU adapter. Both branches use the same WebGPU device; WebGL does not accept these borrowed columns:

```
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

* `getBin` receives untransformed positions. Project other coordinate systems in `getBin`.
* Layer extensions do not apply. Picking returns bins, not original JavaScript objects.
* The layer destroys removed adapters. Create a new one for each switch to CPU.
* After writing to a buffer in place, call the adapter's `setNeedsUpdate()`.
* CPU timings include readback. Compare end-to-end frame times.

### \_GraphScreenGridAggregator[​](#graphscreengridaggregator "Direct link to _GraphScreenGridAggregator")

`_GraphScreenGridAggregator` is an experimental alternative for applications that want to customize or extend ScreenGrid aggregation using GPU graphs. For ordinary `ScreenGridLayer` usage, keep the default `gpuAggregation: true` backend; this alternative does not add rendering features.

```
import {ScreenGridLayer, _GraphScreenGridAggregator} from '@deck.gl/aggregation-layers';



new ScreenGridLayer({

  data,

  getPosition: d => d.position,

  aggregator: new _GraphScreenGridAggregator(),

  colorDomain: [0, 100]

});
```

It requires a WebGPU device and supports COUNT, SUM, MIN, MAX and MEAN. Picking and automatic domains update asynchronously. Extensions require accessor inputs; borrowed position vectors must already use the view coordinate system. The layer initializes and destroys the aggregator. Create a new instance after removing or replacing it. Its experimental API may change.
