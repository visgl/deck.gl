# Riverfront outlines

See [setup and commands](../README.md) before running this example.

An independent Deck example of solid and pencil-like architectural edges. Run `yarn start` in
this folder after installing and building the workspace. The example runs as a standalone app.

`SketchEdgeLayer` draws borrowed, interleaved segment buffers in local meter offsets. Each row is
`start.xyz, end.xyz, featureIndex, seed` (eight float32 values). The riverfront fixture uses `makeEdgeGeometry` to extract architectural edges from the building
triangles. Compare these with the complete triangle mesh, or adjust the crease angle. The default
view has 40 buildings and 480 architectural edges.

`sketchStroke` in shadertools provides grain, width variation, centerline variation, antialiasing,
and endpoint extension. It has no Deck dependency. The shader takes normalized along-segment
coordinates and a signed transverse distance in pixels. Seeds belong to the feature geometry,
so layer replacement and data reordering do not re-randomize the marks.

The layer expands independent segments in screen space on WebGPU and WebGL2. Width, jitter, and
extension use CSS pixels. Opaque building faces supply depth occlusion; disable faces to inspect
the complete wireframe. There are no path joins, dash patterns, view-dependent silhouettes,
or terrain draping in this increment. Close strokes are clipped at the near plane.
The fixed small clip-depth bias exposes coplanar edges; extremely close surfaces can still overlap.

The scene has no animation loop. Deck redraws on camera and style changes. The application owns
segment buffers; the layer owns its corner buffer and model. Picking returns the feature indexed
by each segment. The shared Deck patch also used by the city showcase fixes WebGPU pick rectangles
and readback orientation; no city or water example files are needed here.

`yarn test:visual` renders both backends with software GPU adapters and checks visible style
changes, stable replacement, hidden-edge occlusion, picking, resize, grazing views, and cleanup.
Screenshots are written to the system temporary folder. These checks are not hardware benchmarks.

To exercise a production build with the same visual checks, run `yarn serve` and set
`SKETCH_EXAMPLE_URL=http://localhost:4173/` when invoking
`yarn test:visual`. See the parent README for setup and standalone build commands.
