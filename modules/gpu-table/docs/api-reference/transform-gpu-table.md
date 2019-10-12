# transformGPUTable

`GPUTable`s are designed to be a perfect setting for GPGPU computations, e.g. through `TransformFeedback` operations. New table new columns can be generated from existing columns on the GPU by composing or processing existing columns.

```js
import {transformGPUTable} from '@deck.gl/gpu-table';

const gpuTable = transformGPUTable(gpuTable, {
  addColumns: {
    'positions': {
      type: GL.DOUBLE, // Creates a `Float64` array (i.e. two interleaved Float32Arrays with high-low values)
      size: 3,
      columns: ['longitude', 'latitude', 'height'],
      operation: 'interleave'  // Takes components from those columns and interleave them
    }
  },
  // Remove the input columns
  removeColumns: ['longitude', 'latitude', 'height']
})
```

## Function

### transformGPUTable(gpuTable : GPUTable, options : Object) : GPUTable

Modifies the GPU table by adding and/or removing columns.
