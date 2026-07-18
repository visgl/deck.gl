# deck.gl Discussions — draft answers

Draft answers for open Q&A [Discussions](https://github.com/visgl/deck.gl/discussions)
that currently have **no marked answer**. Each file is a self-contained draft for
a maintainer to review and post (or, where a good reply already exists, to simply
mark as the accepted answer).

These were written against deck.gl **v9.3 / v9.4** (repo version `9.3.0-beta.2`,
`docs/whats-new.md` documents v9.4, July 2026). Verify version-specific advice
before posting if the target thread predates v9.

> Note: posting/marking answers could not be done automatically from the session
> that produced these — the GitHub Discussions API is not exposed to the tooling
> here — so every item below is a recommendation, not an action taken.

| # | Title | Recommended action | One-line answer |
|---|-------|--------------------|-----------------|
| [9898](./9898-disable-hover-picking.md) | Disable on-hover events (keep click) | DRAFT NEW | Hover & click picking are both gated by `pickable`; there's no separate hover toggle. The CPU spike is the known 9.2 picking regression — upgrade to 9.4 (picking optimized) and keep `pickingRadius: 0`. |
| [10009](./10009-datafilterextension-filterenabled-perf.md) | DataFilterExtension perf w/ `filterEnabled:false` | DRAFT NEW | `getFilterValue` is an accessor evaluated only when data/`updateTriggers` change, not per frame; `filterEnabled` is a cheap shader uniform. Keep one layer and toggle `filterEnabled` — don't use two layers. |
| [10220](./10220-datadiff-large-polygonlayer.md) | `_dataDiff` with ~100k PolygonLayer, insert/delete | DRAFT NEW | Use a stable array + `_dataDiff` for edited ranges; deletions shift indices so prefer a fixed-slot / visibility-flag pattern for frequent deletes. |
| [7977](./7977-composite-icons-geticon.md) | Composite icons in `getIcon` | MARK EXISTING (@c6p) + addendum | `getIcon` returns one image; composite beforehand into an SVG/canvas data-URI and return it as `getIcon(d).url`. |
| [9931](./9931-custom-data-fetch.md) | Custom layer `data` without full-URL fetch | MARK EXISTING (@ibgreen) + addendum | Override loading with the layer `fetch` prop (or `loadOptions`), or pass a non-URL `data` object so deck.gl never auto-fetches. |
| [9601](./9601-iconlayer-clipping-through-map.md) | IconLayer clipping through map | DRAFT NEW | Google Maps vector mode shares a 3D depth buffer; disable depth testing on the layer with `parameters: {depthCompare: 'always'}`. |
| [4324](./4324-getradius-columnlayer.md) | `getRadius` in ColumnLayer | MARK EXISTING (@Pessimistress) + addendum | ColumnLayer `radius` is a single uniform, not per-object. Use `SimpleMeshLayer` for per-object scale today; per-object radius is being added (PR #9933). |
| [9968](./9968-pixel-screen-space-layer.md) | Pixel-based / screen-space layer | DRAFT NEW | For constant pixel *size*, use `sizeUnits/radiusUnits: 'pixels'` (no custom layer). For screen-*fixed* UI, use the Widget API. |
