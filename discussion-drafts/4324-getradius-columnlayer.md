# getRadius in ColumnLayer?

- Discussion: https://github.com/visgl/deck.gl/discussions/4324
- **Recommended action:** MARK EXISTING (@Pessimistress's reply) + addendum with the current status

## Question

Does `ColumnLayer` have (or will it get) a `getRadius` accessor to scale each
column's radius from data, like `ScatterplotLayer`'s per-object radius?

## The existing answer to mark

@Pessimistress's reply is the correct workaround for "how do I get per-object
radius today" and can be marked as the answer:

> You can try SimpleMeshLayer with which you can control the scaling in all
> dimensions.

## Optional addendum (post as a follow-up — the situation has moved on)

Quick status for anyone landing here now:

- **Why there's no `getRadius`:** `ColumnLayer`'s [`radius`](https://deck.gl/docs/api-reference/layers/column-layer#radius)
  is a single layer-wide value (all columns share it); only height is
  data-driven, via [`getElevation`](https://deck.gl/docs/api-reference/layers/column-layer#getelevation).
  It was designed this way for efficiency.
- **Per-object radius today — `SimpleMeshLayer`:** supply a cylinder mesh and
  drive per-instance size with `getScale` (x/y = radius, z = height):

```js
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {CylinderGeometry} from '@luma.gl/engine';

new SimpleMeshLayer({
  data,
  mesh: new CylinderGeometry({radius: 1, height: 1, nradial: 12}),
  getPosition: d => d.position,
  getScale: d => [d.radius, d.radius, d.height], // per-object radius + height
  getColor: d => d.color
});
```

See [SimpleMeshLayer](https://deck.gl/docs/api-reference/mesh-layers/simple-mesh-layer).

- **Coming to `ColumnLayer` itself:** as @charlieforward9 noted, per-object radius
  is being added — see [PR #9933](https://github.com/visgl/deck.gl/pull/9933).
  Once that ships, a `getRadius` accessor on `ColumnLayer` will be the simplest
  option and this workaround won't be needed.
- If you only need a handful of distinct radii, a cheaper stopgap is one
  `ColumnLayer` per radius bucket.

## Notes for reviewer

- **Confidence: high on the workaround; the PR reference should be re-checked
  before posting** (confirm #9933 is the correct/-merged PR and adjust tense —
  the repo is at 9.3-beta, so it may already be released in the reader's version).
- Verified in `docs/api-reference/layers/column-layer.md`: `radius` is a single
  `number` prop (default 1000); `getElevation` is the per-object accessor;
  `diskResolution`/`vertices` control geometry.
- `CylinderGeometry` import path is from `@luma.gl/engine` in v9 — reviewer may
  prefer to point to the SimpleMeshLayer example's exact geometry usage.
