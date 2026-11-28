# Website

## Example catalogs

The website publishes Examples at `/examples` and Examples v10 at
`/examples-v10` in the same build.

Edit their pages independently in `src/examples/` and `src/examples-v10/`.
Their sidebars are `src/examples-sidebar.js` and `src/examples-v10-sidebar.js`.
Demo implementations live in the repository's corresponding `examples/` and
`examples-v10/` directories. Shared website components provide layout and controls.

The catalog configuration is in `scripts/example-catalogs.cjs`. The v10 catalog's manifest
selects embedded demos from `examples-v10/proposals/` and `examples-v10/gpu-graph/`.

The homepage highlights demos from both catalogs. The Playground, Pydeck, and scripting
gallery use `examples/`.

## Homepage taxi map

`src/components/home/hero-map.jsx` shows the responsive captures in `static/images/home/`
until `taxi-scene.js` renders the live map. Keep the desktop and mobile capture dimensions
and starting camera aligned with the live scene when replacing these images. The static
WebP frames support reduced motion. The [fixture notes](static/data/home/README.md) record
the sources and licenses of the trip and building data.

The view switcher derives connection arcs and pickup columns from the same trip fixture.
It loads those layers when a visitor selects either view.

Run `yarn test-website` from the repository root to build the homepage and both catalogs.
Check that the homepage plays and pauses its previews, reveals the live map, and still
shows a preview when WebGL is unavailable.
