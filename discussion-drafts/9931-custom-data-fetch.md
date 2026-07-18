# Data prop for custom layer that doesn't attempt to fetch the full URL

- Discussion: https://github.com/visgl/deck.gl/discussions/9931
- **Recommended action:** MARK EXISTING (@ibgreen's reply) + short addendum

## Question

Building a custom GeoTIFF layer that takes a URL in `data`. deck.gl/loaders.gl
auto-fetches the whole buffer for a URL, but the asker needs custom handling
(range requests, tiled reads). Can the automatic deck.gl↔loaders.gl fetch be
turned off so they can inject their own data handling?

## The existing answer to mark

@ibgreen's reply already points to the right lever and should be marked as the
answer:

> supply a custom fetch function via deck.gl loadOptions

## Optional addendum (post as a follow-up if helpful)

There are two clean ways to stop deck.gl from doing the default whole-URL fetch,
depending on whether you want to keep passing a URL string in `data` or not:

**1. Override loading with the layer [`fetch`](https://deck.gl/docs/api-reference/core/layer#fetch) prop.**
When `data` is a URL string, deck.gl calls `props.fetch(url, context)` and uses
whatever it resolves to. Replace it and the default `load(url, ...)` never runs:

```js
new MyGeoTiffLayer({
  data: 'https://example.com/cog.tif',
  // Called instead of the default loader; return whatever your layer's data model is
  fetch: async (url, {propName, layer, signal}) => {
    // your own range-request / tiled reader here — no full-buffer download
    return openLazyGeoTiff(url, {signal});
  }
});
```

The `context` argument gives you `layer`, `propName`, `loaders`, `loadOptions`
and an `AbortSignal`. `loadOptions` (a [loaders.gl](https://loaders.gl) core
option) is the other place to inject a custom `fetch` if you'd rather configure
it there — see [`loadOptions`](https://deck.gl/docs/api-reference/core/layer#loadoptions)
and the [data loading guide](https://deck.gl/docs/developer-guide/loading-data).

**2. Don't pass a URL at all.** deck.gl only auto-fetches when `data` is a
`String`. If you pass a plain object (or a `Promise`/async iterable), deck.gl
treats it as-is and never fetches. So you can hand your layer an already-opened
handle:

```js
new MyGeoTiffLayer({
  data: {source: myLazyGeoTiffHandle, length: tileCount}  // object, not URL → no auto-fetch
});
```

A non-iterable object with a `length` field is a first-class `data` value:
deck.gl won't interpret its contents and just calls your accessors `length`
times, which is ideal for a custom source-backed layer.

## Notes for reviewer

- **Confidence: high.** Grounded in `docs/api-reference/core/layer.md`: `fetch`
  prop (default `load(url, loaders, loadOptions)`, `context` fields incl.
  `signal`); `data` auto-fetch happens only for `String` URLs; "any non-iterable
  object that contains a `length` field" is accepted as `data`.
- @ibgreen also floated collaborating on a `GeoTIFFSource`/`TileSourceLayer` —
  the addendum stays focused on the immediate question and doesn't pre-empt that.
