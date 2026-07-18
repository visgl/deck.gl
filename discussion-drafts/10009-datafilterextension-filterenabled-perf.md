# DataFilterExtension performance with large datasets

- Discussion: https://github.com/visgl/deck.gl/discussions/10009
- **Recommended action:** DRAFT NEW (unanswered)

## Question

With a 1M+ point `PointCloudLayer`, the app has a "live playback" mode (no
filtering) and a "paused" mode (spatial filtering). Does `getFilterValue` run for
every point when `filterEnabled: false`, and is it better to keep one layer with
the extension attached or to swap between two layers?

## Draft answer

Keep a single layer and just toggle
[`filterEnabled`](https://deck.gl/docs/api-reference/extensions/data-filter-extension#filterenabled)
— that's the cheapest option, and there's no per-frame `getFilterValue` cost to
worry about.

Two things to separate:

- **`getFilterValue` is an [accessor](https://deck.gl/docs/developer-guide/using-layers#accessors), not a per-frame callback.**
  Like `getPosition`/`getColor`, it's evaluated on the CPU only when the
  attribute is (re)built — i.e. when `data` changes, or when you bump its
  [`updateTriggers`](https://deck.gl/docs/api-reference/core/layer#updatetriggers)
  — and the result is uploaded to the GPU as a buffer. It does **not** run again
  on every frame, and it does **not** re-run when you flip `filterEnabled`. So
  for your 1M points it runs once up front (or whenever the data changes), full
  stop.
- **`filterEnabled` is a GPU uniform.** Toggling it just tells the shader whether
  to apply the range test; the docs note this class of prop "can be updated on
  user input or animation with very little cost." When `false`, all objects
  render.

So the overhead of leaving the extension attached during live playback is
essentially just the one-time filter attribute in GPU memory (a few MB for one
`filterSize: 1` float per point) — not recurring CPU work.

```js
const extension = new DataFilterExtension({filterSize: 1});

new PointCloudLayer({
  data,                          // your 1M points
  extensions: [extension],
  filterEnabled: isPaused,       // cheap uniform flip; getFilterValue does NOT re-run
  filterRange: selectionRange,   // update freely, also cheap
  getFilterValue: d => d.z,      // evaluated once on data change, not per frame
  // If the *meaning* of getFilterValue changes without data changing, use:
  // updateTriggers: {getFilterValue: someKey}
});
```

Prefer this over two separate layers: swapping layers forces deck.gl to discard
and rebuild all GPU attributes for 1M points on every mode switch (and doubles
memory if both exist at once), whereas toggling `filterEnabled` reuses the
already-uploaded buffers.

More background: [DataFilterExtension](https://deck.gl/docs/api-reference/extensions/data-filter-extension)
and the [Performance guide](https://deck.gl/docs/developer-guide/performance).

## Notes for reviewer

- **Confidence: high.** Grounded in `docs/api-reference/extensions/data-filter-extension.md`
  (`filterEnabled` default `true`, "all objects are rendered" when disabled;
  `filterRange` "updated ... with very little cost") and deck.gl's standard
  accessor→attribute model (`docs/api-reference/core/layer.md` `updateTriggers`).
- Worth confirming for the asker: if they need the *live* mode to also avoid the
  one-time attribute build, they can add the extension only when entering paused
  mode — but that reintroduces an attribute rebuild on each toggle, so it's only
  worth it if live sessions are long and pausing is rare.
