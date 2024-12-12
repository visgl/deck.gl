# CPUAggregator

The `CPUAggregator` implements the [Aggregator](./aggregator.md) interface by performing aggregation on the CPU.

## Example

This example implements an aggregator that makes a [histogram](https://en.wikipedia.org/wiki/Histogram) that calculates "weight" distribution by "position".

```ts
import {CPUAggregator} from '@deck.gl/aggregation-layers';

const aggregator = new CPUAggregator({
  dimensions: 1,
  getBin: {
    sources: ['position'],
    getValue: (data: {position: number}, index: number, options: {binSize: number}) =>
      [Math.floor(data.position / options.binSize)]
  },
  getValue: [
    {
      sources: ['weight'],
      getValue: (data: {weight: number}) => data.weight
    }
  ]
});

const position = new Attribute(device, {id: 'position', size: 1});
position.setData({value: new Float32Array(...)});
const weight = new Attribute(device, {id: 'weight', size: 1});
position.setData({value: new Float32Array(...)});

aggregator.setProps({
  pointCount: data.length,
  operations: ['SUM'],
  binOptions: {
    binSize: 1
  },
  attributes: {position, weight}
});

aggregator.update();
```

## Constructor

```ts
new CPUAggregator(props);
```

Arguments:

- `dimensions` (number) - size of bin IDs, either 1 or 2
- `getBin` (VertexAccessor) - accessor to map each data point to a bin ID
  + `sources` (string[]) - attribute names needed for the calculation
  + `getValue` (`(data: object, index: number, options: object) => number[] | null`) - callback to retrieve the bin ID for each data point. 
    Bin ID should be an array with [dimensions] elements; or null if the data point should be skipped
- `getValue` (VertexAccessor[]) - accessor to map each data point to a weight value, defined per channel. Each accsor should contain these fields:
  + `sources` (string[]) - attribute names needed for the calculation
  + `getValue` (`(data: object, index: number, options: object) => number`) - callback to retrieve the value for each data point. 

## Props

Requires all [Aggregator](./aggregator.md#setprops) props, and the following:

#### `customOperations` (Function[]) {#customoperations}

Overrides built-in aggregation operation with a custom reducer.
Each element can optionally be a callback with the following signature:

```ts
(pointIndices: number[], getValue: (index: number) => number) => number;
```

If a custom operation is defined, the corresponding element in the `operations` array will be ignored.

Example to calculate the median for channel 1:

```ts
function median(pointIndices: number[], getValue: (index: number) => number) {
  const values = pointIndices.map(getValue);
  values.sort((a, b) => a - b);
  return values[values.length >> 1];
}

aggregator.setProps({
  customOperations: [null, median, null]
});
```

## Source

[modules/aggregation-layers/src/common/aggregator/cpu-aggregator/cpu-aggregator.ts](https://github.com/visgl/deck.gl/tree/master/modules/aggregation-layers/src/common/aggregator/cpu-aggregator/cpu-aggregator.ts)
