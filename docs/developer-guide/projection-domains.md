# Projection domains and worker preprocessing

Applications written against math.gl's projection interfaces can use external projection engines through a CRS descriptor adapter. That adapter converts coordinates; it does not supply geometry clipping, antimeridian topology or triangulation. Applications that need those operations can preprocess geometry with the external engine and render the result in deck.gl's Cartesian coordinate system.

The [projection domains example](https://github.com/visgl/deck.gl/tree/master/examples/experimental/projection-domains) demonstrates two complementary recipes:

- GeoArrow IPC → Web Worker → D3 projection stream → clipping and triangulation → `SolidPolygonLayer` binary attributes
- Target-plane domain triangles → inverse projection → raster texture coordinates → `SimpleMeshLayer`

Run it with `yarn && yarn start` in the example directory. All inputs are deterministic synthetic fixtures; no remote dataset or access token is required. Select an equirectangular map, a rotated orthographic hemisphere or interrupted Mollweide, then a full-world, rotated or pole-containing raster. The outline shows the actual target-domain geometry.

## Stream whole geometries

Calling a D3 projection on individual points bypasses its stream pipeline. Use the stream when geometry must be rotated, resampled, cut at the antimeridian or clipped at a horizon. For interrupted projections, the example uses `d3-geo-polygon`'s clipping-aware factories; the corresponding point projection from `d3-geo-projection` alone does not cut polygons at internal lobe boundaries. Triangulation must consume the resulting rings, including their holes and disconnected pieces, rather than the original vertex sequence.

The example uses [@TomBor's geoarrow-deck-stream](https://github.com/AtelierCartographie/geoarrow-deck-stream), described in the [custom projection tracker](https://github.com/visgl/deck.gl/issues/10739#issuecomment-6060843120). Its worker decodes Arrow IPC, reads the geometry buffers, applies D3's stream and earcut triangulation, and transfers the output typed arrays back. Projection closures cannot cross the worker boundary: send a serializable factory name and parameters and register the same factory in the worker.

```ts
const client = createParseWorkerClient(worker);
const geometry = await client.parsePolygonsToSolid(ipcBytes, {
  projection: 'geoOrthographic',
  rotate: [-20, 30],
  scale: 140,
  translate: [0, 0]
}, {transferInput: true});

new SolidPolygonLayer({
  _normalize: false,
  data: {
    length: geometry.length,
    startIndices: geometry.polygonIndices,
    attributes: {
      getPolygon: {value: geometry.positions, size: 2},
      indices: geometry.indices
    }
  },
  coordinateSystem: COORDINATE_SYSTEM.CARTESIAN
});
```

Use an `OrthographicView` for these already projected coordinates. D3 defaults to downward-positive Y; the example uses `flipY: true`. Do not apply the geographic projection again in the layer or view.

Transferring input detaches its buffer on the sending thread. Keep the original dataset elsewhere or create fresh IPC when changing projections. IPC encoding and geometry output allocation still cost time and memory; transferring buffers does not make the entire pipeline zero-copy. The example ignores superseded results and terminates its worker when the page closes.

Clipping can create several polygons from one source row. The returned `featureIds` map output polygons back to Arrow rows; the example uses them for colors and picking. Its fixtures exercise antimeridian splitting, a hole and a polar cap. D3 uses spherical winding conventions; the adapter rewinds the example's GeoJSON-oriented input.

## Treat the domain as geometry

A CRS descriptor's `renderingBounds` describe a finite rendering envelope. They are **not a validity domain**. An orthographic horizon is curved, and interrupted projections have cuts and lobes that a bounding box cannot describe.

The example streams D3's `Sphere` through the selected projection and triangulates the resulting target-plane polygon. The same geometry supplies the domain outline and the raster mesh seed. This is an engine-specific source of domain geometry, not a universal method for deriving domains from arbitrary CRS definitions.

For the raster, the example subdivides the domain's triangles in target space, applies the inverse projection to obtain geographic coordinates, and maps them into source texture coordinates. It clips each triangle against the source image's unit square while interpolating target positions and UV attributes. Full-world texture coordinates are unwrapped locally and split at their periodic boundary before rendering. The polar source is a synthetic spherical south-polar stereographic grid whose footprint contains the pole; it is not an EPSG:3031 accuracy fixture. The rotated geographic source straddles 180°.

## Scope and remaining work

This example is a preprocessing recipe, not generic clipping support in `CustomProjectionView`, `BitmapLayer` or `TileLayer`. It adds no external projection-engine dependency to deck.gl's published modules.

The raster mesher uses bounded subdivision and piecewise-linear UV interpolation. It reports unresolved singular triangles that are omitted at the refinement limit. The domain boundary is a sampled polygon; it approximates curved horizons. It does not implement a screen-error guarantee, datum grids, COG tile selection, ellipsoidal EPSG:3031, UTM 60 or tilted perspective fixtures. These need dedicated validation before generalizing this recipe into a reusable mesher.

Target-plane inverse mapping avoids projecting source triangles across target cuts. Forward-warped source meshes instead need local phase unwrapping, seam clipping and interpolation of every carried attribute. Neither approach is replaced by point conversion or a bounding box.

Projection changes rebuild the example's geometry. Ordinary pan and zoom move the Cartesian camera without changing projection parameters. Continuously view-centered projections and animated globe–Mercator transitions require a separate strategy; this example does not claim to provide them.

See [the domain and raster feedback](https://github.com/visgl/deck.gl/issues/10739#issuecomment-6136959072) for the broader requirements.
