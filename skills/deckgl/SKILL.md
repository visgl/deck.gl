---
name: deckgl
description: Design, implement, update and debug deck.gl applications and declarative deck.gl JSON with version-aware API selection, correct base map integration (MapLibre, Mapbox, Google Maps), immutable-layer update patterns, aggregation and animation layer rules, and browser-based verification. Use when working with deck.gl or @deck.gl/* packages, single-page deck.gl maps, @deck.gl/json specs, empty or blank maps, or the visgl/deck.gl repository.
---

# deck.gl

Work from the installed packages and observable browser behavior. Do not substitute model
memory for the project's declarations: deck.gl 9 changed the integration story, the base map
modules and the rendering stack, and training data over-represents deck.gl 8 examples.

## Establish local truth

1. Identify whether the task is in a consumer application, a single self-contained HTML page,
   or the `visgl/deck.gl` repository.
2. Inspect the lockfile and installed versions: `npm ls deck.gl @deck.gl/core @deck.gl/layers`
   (or the CDN URL pinned in a `<script>` tag). Treat the installed version as authoritative.
3. Read the installed packages' TypeScript declarations for every API you use. Consult the
   documentation for the same release. For the current release read
   [deck.gl documentation](https://deck.gl/docs) and fetch only the pages relevant to the task;
   `https://deck.gl/llms.txt` indexes them with raw Markdown siblings once published.
4. State any version constraint that changes the implementation, and never silently modernize
   code to an API absent from the installed declarations, or the reverse.

## Route the task

- Choosing a version, a CDN bundle, or integrating with MapLibre, Mapbox or Google Maps: read
  [references/versions-and-integration.md](references/versions-and-integration.md).
- Writing or updating layers, data-driven styling, aggregation, animation, large data: read
  [references/layers-and-data.md](references/layers-and-data.md).
- Producing or consuming `@deck.gl/json` declarative specs, or letting an agent drive a map:
  read [references/declarative-json.md](references/declarative-json.md).
- A self-contained HTML page (an artifact, a demo, a gist): read
  [references/single-file-page.md](references/single-file-page.md).
- Work inside `visgl/deck.gl`: read the repository's root `AGENTS.md` before editing and follow
  its commands and merge-readiness checklist.

Read every reference that applies; integration and layer rules usually both matter.

## Implement

1. Pick the smallest correct surface: a base map library for the basemap, deck.gl for the data
   layers, connected through the overlay class for that library. deck.gl is not a marker-and-popup
   library; for a handful of markers on a slippy map, a plain base map library may be the better
   answer, and saying so is part of the job.
2. Treat layers as immutable. Never mutate `layer.props` or call internal state methods; create
   new layer instances with new props and pass them to `setProps` or `layers`. deck.gl diffs by
   layer `id`.
3. Use `updateTriggers` when an accessor closes over changing state.
4. For large data, pass binary attributes or a compact format, not millions of objects.
5. Prefer token-free base map styles unless the project already has a provider account.
6. Keep the first change minimal and independently verifiable.

## Verify

Run the project's typecheck and focused tests, then open the actual page in a current browser.
Collect console messages, page errors, failed network requests and a screenshot after the data
has loaded. A map with a basemap but no data is a failure, not a partial success.

When the map is empty, debug from the outside in: did the scripts load (a wrong CDN version
returns an HTML 404 that the browser blocks) → is `deck` defined → did the basemap style load →
is the layer class registered or imported → does the data URL return what the accessors expect →
are accessor values in range (radius in meters at world zoom is invisible) → is the layer
`visible` and inside the view. Do not change styling until the layer has been seen to render.

Report which browser, version and backend were actually observed. Do not claim success from a
clean process exit.
