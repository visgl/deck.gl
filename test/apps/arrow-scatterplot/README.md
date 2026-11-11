# Arrow Scatterplot

Run `yarn` and `yarn build` from the repository root, then run `yarn` and `yarn start-local` from
this directory. The app displays Paris street trees from the same CSV as the Zoom Bands example.
The app displays up to 20,000 rows to keep hover picking responsive, including on software GPUs.
Pan and zoom over the OpenFreeMap Positron basemap, and hover over a point to read the tree's name.

The CSV loader returns an Arrow table. The app passes expression and predicate ASTs directly
to `columnsQuery`. The query filters and limits rows,
combines longitude and latitude into fixed-size XY lists, and computes radii. Tooltips read the tree label from the source table.

The default backend is WebGL. Open `/?backend=webgpu` on the same server to use WebGPU.
