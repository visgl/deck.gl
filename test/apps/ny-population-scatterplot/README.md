# New York population Arrow Scatterplot

Run `yarn` and `yarn build` at the repository root, then run `yarn` and
`yarn start-local` from this directory. The app uses the Manhattan dataset,
camera, OpenFreeMap basemap, and point colors from the official Scatterplot example.
Hover over a point to see its category.

The JSON table loader decodes the source rows as Arrow. The layer's `columnsQuery` uses
SQL `ARRAY` to construct positions and `PACK_UNORM8` to produce RGBA bytes.
Tooltips read `gender` from the source table.

Add `?backend=webgpu` to the URL to switch from WebGL to WebGPU.
