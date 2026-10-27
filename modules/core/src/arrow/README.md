# Arrow conversion prototype

This optional core subpath exposes conversion code intended for eventual upstreaming to luma.gl. It has no
layer dependency. Existing layer helper paths re-export the shared implementations here.

Import `ArrowConverter` and `registerArrowConverter` from `@deck.gl/core/arrow`.
The main `@deck.gl/core` entry does not import Apache Arrow or `@luma.gl/arrow`; these are
optional peers required only by this subpath.

`ArrowConverter` binds a device to luma.gl's conversion planner/executor. `position` and
`scalar` are numeric semantic aliases; positions default to Float32 XY/XYZ, scalars to
Float32, and colors to normalized RGBA8. Explicit formats and luma conversion policies,
including CPU/GPU preferences, remain available. Position conversion changes storage,
not coordinate systems. Nulls are rejected by default, including nested child nulls;
`nullPolicy: 'preserve'` retains validity for consumers that understand it.

```ts
const converter = new ArrowConverter(device);
const prepared = await converter.convert(positions, {semantic: 'position'});
try {
  useGPUVector(prepared.vector);
} finally {
  prepared.destroy();
}
```

The synchronous `uploadColumn` method preserves the existing strict direct-upload contract
used by ArrowScatterplotLayer. It accepts a materialized Table/RecordBatch plus a named or
direct Vector selector. Other adapters retain their existing helper imports.

```ts
for await (const batch of converter.convertBatches(recordBatchIterator, {
  positions: {source: 'geometry', semantic: 'position'},
  colors: {source: 'color', semantic: 'color'},
  radii: {source: 'radius', semantic: 'scalar'}
}, {signal})) {
  try {
    await consumeBatch(batch.columns, batch.rowOffset, batch.length);
  } finally {
    batch.destroy();
  }
}
```

`convertVectors` similarly accepts vectors. Both streaming APIs accept async iterables,
bare async iterators, and synchronous iterables. They pull one source item per requested
output, never concatenate earlier outputs, validate output-format stability, and close the
source on early exit or failure. Abort cancels a pending input read even when an iterator's
`return()` cannot settle until that read finishes. Already yielded results stay caller-owned;
failed or aborted conversions release their own partial allocations. Release results only
after their last GPU use. The converter retains no results and needs no disposal method.
