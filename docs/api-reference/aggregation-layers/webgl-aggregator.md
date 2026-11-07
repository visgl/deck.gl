# WebGLAggregator

The `WebGLAggregator` implements the [Aggregator](./aggregator.md) interface by performing aggregation on the GPU.

## Example

This example implements an aggregator that makes a [histogram](https://en.wikipedia.org/wiki/Histogram) that calculates "weight" distribution by "position".

```ts
import {WebGLAggregator} from '@deck.gl/aggregation-layers';

const aggregator = new WebGLAggregator(device, {
  dimensions: 1,
  channelCount: 1,
  bufferLayout: [
    {name: 'position', format: 'float32'},
    {name: 'weight', format: 'float32'}
  ],
  vs: `
    uniform float binSize;
    in float position;
    in float weight;
    void getBin(out int binId) {
      binId = int(floor(position / binSize));
    }
    void getValue(out float value) {
      value = weight;
    }`
});

const position = new Attribute(device, {id: 'position', size: 1});
position.setData({value: new Float32Array(...)});
const weight = new Attribute(device, {id: 'weight', size: 1});
position.setData({value: new Float32Array(...)});

aggregator.setProps({
  pointCount: data.length,
  binIdRange: [0, 100],
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
new WebGLAggregator(props);
```

Arguments:

- `dimensions` (number) - size of bin IDs, either 1 or 2
- `channelCount` (number) - number of channels, up to 3
- `vs` (string) - vertex shader for the aggregator. Should define the following functions:
  + `void getBin(out int binId)`, if dimensions=1 or
    `void getBin(out ivec2 binId)`, if dimensions=2
  * `void getValue(out float value)`, if channelCount=1 or
    `void getValue(out vec2 value)`, if channelCount=2 or
    `void getValue(out vec3 value)`, if channelCount=3
- `bufferLayout` (object[]) - see [ModelProps](https://github.com/visgl/luma.gl/blob/master/modules/engine/src/model/model.ts)
- `modules` (object[]) - luma.gl shader modules, see [ModelProps](https://github.com/visgl/luma.gl/blob/master/modules/engine/src/model/model.ts)
- `defines` (object) - luma.gl shader defines, see [ModelProps](https://github.com/visgl/luma.gl/blob/master/modules/engine/src/model/model.ts)

## Props

Requires all [Aggregator](./aggregator.md#setprops) props, and the following:

#### `binIdRange` (number[][]) {#binidrange}

Limits of binId defined as [start, end] for each dimension. Ids less than `start` or larger than or equal to `end` are ignored.

#### `moduleSettings` (object) {#modulesettings}

Mapped uniforms for shadertool modules, see [ModelProps](https://github.com/visgl/luma.gl/blob/master/modules/engine/src/model/model.ts)

## Outputs

`getBins()` returns a `GPUVector` with `float32` or `float32x2` bin IDs, matching
`dimensions`. `getResult(channel)` returns a scalar `float32` `GPUVector`. Each
vector has `binCount` elements. Channel vectors share interleaved storage, with
byte offset `channel * 4` and byte stride `channelCount * 4`.

Outputs are borrowed views of buffers owned by the aggregator. Pass them directly
to layer binary attributes. Retrieving these outputs does not copy data to the CPU.
Repeated calls return the same vector while its buffer and length are unchanged;
fetch outputs again after resizing, and do not use them after destroying the aggregator.
The methods return `null` before output buffers are allocated, and `getResult`
also returns `null` for a channel outside `channelCount`.

## Source

[modules/aggregation-layers/src/common/aggregator/gpu-aggregator/webgl-aggregator.ts](https://github.com/visgl/deck.gl/tree/master/modules/aggregation-layers/src/common/aggregator/gpu-aggregator/webgl-aggregator.ts)
