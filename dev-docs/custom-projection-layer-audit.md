# Custom projection layer audit

Audit of `x/alt-proj-layer-plumbing`, September 23, 2026. This branch builds on
`x/alt-proj-custom-projection` and tests the `Viewport.preproject` contract using
`CustomProjectionViewport`.

Aggregation-layer implementation and its dedicated tests live in the next branch,
`x/alt-proj-aggregation-plumbing`. The aggregation entries below describe that
combined stack, not support provided by layer-plumbing alone.

## Position attribute wiring

Raw input positions opt into `Layer.usePositionTransforms()`. The transform applies
the layer model matrix before preprojection. Projection-signature and model-matrix
changes invalidate these attributes, including unchanged CPU-backed binary buffers.
Ordinary viewports retain their existing attribute values and GPU projection path.

| Layer family | Position path |
| --- | --- |
| ScatterplotLayer, IconLayer, PointCloudLayer, ColumnLayer, GridCellLayer | `instancePositions` |
| LineLayer, ArcLayer | `instanceSourcePositions`, `instanceTargetPositions` |
| TextLayer | Inherited IconLayer positions in MultiIconLayer; TextBackgroundLayer anchors also transformed |
| PathLayer, TripsLayer | Existing tessellator transform; TripsLayer inherits the path positions |
| SolidPolygonLayer, PolygonLayer, GeoJsonLayer | Existing tessellator transform and inherited primitive sublayers |
| BitmapLayer | Tessellate in input space, then transform each vertex; retain the source mesh for subsequent updates |
| SimpleMeshLayer, ScenegraphLayer, internal MeshLayer | Instance anchors transformed; local model geometry is not independently preprojected |
| ScreenGridLayer, GridLayer, HexagonLayer, ContourLayer | Raw aggregation `positions` transformed before binning |
| HeatmapLayer | WebGL `positions` and WebGPU `instancePositions`; preserve WebGPU's XY-to-XYZ normalization without preprojection |

Unit meshes, local glTF/mesh vertices, screen-space quads, texture-space vertices,
and aggregation bin IDs are **not** input positions and must not be passed through
the projection again. Grid/hexagon cell sublayers deliberately replace the inherited
ColumnLayer position attribute with bin IDs. Screen-grid cell positions are also
already derived screen-space coordinates.

For preprojecting viewports, instanced meshes use the meter-offset shader path around
their transformed anchors, rather than adding meter-valued vertices directly to
normalized common coordinates. This is a local approximation, not mesh reprojection.

## Aggregation coordinate contract

For preprojecting viewports, aggregation takes place entirely in common space,
just like aggregation in non-geospatial views:

- GridLayer, HexagonLayer, and ContourLayer bin the transformed input positions.
  The GPU precision viewport uses Cartesian coordinates, a zero origin, and no
  model matrix: the input transform has already consumed those properties.
- `gridAggregator` / `hexagonAggregator` callbacks receive common-space positions.
  HexagonLayer's picked `object.position` stays in common space, matching the
  non-geospatial contract. Neither requires an inverse projection.
- Contour sublayers apply only their bin-to-common matrix. They do not project
  the generated contour geometry again. A custom `_subLayerProps.type` override
  must preserve this behavior when replacing those sublayers.
- HeatmapLayer's bounds, weight texture, and presentation geometry all use common
  coordinates. Geographic clipping and offset-origin conversion are bypassed.
  Projection and model-matrix changes invalidate the weight map even if camera
  bounds do not change.
- Cell sizes/radii in meters use the viewport's common-units-per-meter estimate,
  as with existing non-geospatial views; generated cells do not model spatially
  varying distortion across each footprint.

## Remaining issues and limitations

Attribute wiring is not a claim that every layer is fully supported. The following
items need dedicated rendering/interaction tests or further implementation.

| Layers | Risk / required follow-up |
| --- | --- |
| BitmapLayer | Default UVs follow the input-space tessellation and can warp with the projection. `_imageCoordinateSystem` conversions still assume longitude/latitude and Web Mercator in the shaders; after preprojection those shaders no longer have the original coordinates. Mercator-encoded imagery needs input-space UV generation. Seams and singularities also require clipping, not just tessellation. |
| TileLayer | `tileset-2d/utils.ts` selects geographic tiles from geospatial viewport bounds, and otherwise selects Cartesian tiles. Custom viewports expose common-space bounds and zoom, not geographic bounds/Mercator zoom. Geographic tile selection, culling, and LOD must be projection-aware. Preprojecting the rendered sublayer alone is insufficient. Cartesian tiles can work only when their indexing space matches the viewport's common space. |
| MVTLayer | Inherits TileLayer selection issues. Its resolution-based path can decode WGS84 geometry, but the local-coordinate path uses tile-local coordinates, a model matrix, and coordinate origin. The preprojection contract ignores coordinate origin; that path needs conversion to projection input coordinates. Picking and clipping need review too. |
| Tile3DLayer | Tileset traversal/LOD and cartographic-origin screen tests assume a geographic camera. Point clouds and meshes use local meter offsets, coordinate origins, and per-tile transforms; these are not direct input longitude/latitude. Needs explicit coordinate conversion and projected bounds/LOD, plus a strategy for mesh deformation. |
| TerrainLayer, internal MeshLayer | Tiled terrain inherits TileLayer limitations. Terrain vertices are baked using geographic/Mercator bounds and rendered through non-instanced mesh paths. Transforming an instance anchor does not reproject terrain vertices; normals and terrain-dependent picking/draping need attention. |
| GreatCircleLayer, ArcLayer with `greatCircle` | Great-circle interpolation happens in the shader from geographic endpoints. Preprojected endpoints are Cartesian, so the spherical path is not preserved. Generate intermediate geographic vertices and project them on the CPU for true great-circle rendering. Ordinary ArcLayer arcs connect projected endpoints in common space. |
| LineLayer / ArcLayer with `wrapLongitude` | The shaders still perform 180/360-degree wrapping. Those constants are invalid for preprojected common-space positions. Leave `wrapLongitude` off; implement input-space seam splitting before projection. LineLayer also draws straight projected-endpoint segments, not a densely sampled geographic path. |
| SimpleMeshLayer, ScenegraphLayer, PointCloudLayer | Instance/point anchors work when supplied in projection input coordinates. Tile-local or offset coordinates require conversion first. Mesh vertices, translations, normals, and orientations are not transformed by the projection's local Jacobian. Large meshes and non-instanced SimpleMeshLayer require per-vertex reprojection; local meter sizing uses the viewport's scale estimate. |
| ColumnLayer, GridCellLayer, extruded polygons | Anchors/base geometry are projected, but radii, cell dimensions, heights, and lighting use local common-space/meter approximations. They do not reproduce spatially varying projection distortion over a large footprint. |
| ScreenGridLayer | Raw positions are wired for CPU and GPU screen binning. End-to-end GPU render/filter/picking parity still needs custom-projection coverage; generated cell positions must stay untransformed. |
| WMSLayer | Chooses EPSG:4326/3857 from viewport resolution and requests `viewport.getBounds()`. Custom common-space bounds are not a geographic BBOX. Needs source-CRS bounds conversion and correctly warped raster imagery. |
| H3HexagonLayer | Auto high-precision mode selects polygon geometry when viewport resolution is present, which inherits polygon support. Forced low-precision mode uses viewport latitude/longitude and a representative hexagon shape; it is not safe for arbitrary custom projections. |
| CARTO ClusterTileLayer, H3TileLayer, QuadbinTileLayer, VectorTileLayer, RasterTileLayer, HeatmapTileLayer, internal SpatialIndexTileLayer | Tile selection/zoom assumptions need independent adaptation even when their point/polygon/text sublayers have transformed attributes. HeatmapTileLayer also maps viewport zoom to source resolution. |
| CARTO internal RasterLayer | RasterColumnLayer generates cell positions in the vertex shader from tile/block indices, rather than a raw position attribute. It bypasses ColumnLayer position initialization and requires a projection-aware generated mesh. |

## Composite layers inheriting primitive support

These layers do not define another raw position attribute. Their input-coordinate
geometry is handled by the underlying primitives, subject to the limitations above:

- TextLayer and MultiIconLayer; CARTO PointLabelLayer (including backgrounds).
- PolygonLayer and GeoJsonLayer (points, lines, polygons, and text).
- TripsLayer (path geometry; timestamps remain independent).
- A5Layer, S2Layer, QuadkeyLayer, GeohashLayer, H3ClusterLayer, high-precision
  H3HexagonLayer, internal GeoCellLayer, and CARTO QuadbinLayer (polygon geometry).

This audit covers the exported layers in `layers`, `geo-layers`, `mesh-layers`,
`aggregation-layers`, and `carto`, plus their internal rendering sublayers. React,
map integrations, and ArcGIS wrappers consume these layers rather than introducing
raw position attributes. Extensions using shader `geometry.worldPosition` should
be audited separately: it now contains projected coordinates. Projection seam
clipping, inverse picking failures, and GPU-only input buffers remain cross-cutting
limitations. GPU-only raw position buffers cannot run a CPU projection callback;
provide CPU-backed attributes instead.

## Regression coverage

`test/modules/layers/position-transforms.spec.ts` checks accessor and CPU-backed
binary positions with and without preprojection, model-matrix changes, projection
signature changes, input immutability, bitmap tessellation/reprojection, and mesh
offset-mode selection. These are attribute/lifecycle tests, not full visual
certification of the issue-listed layers.

`test/modules/aggregation-layers/common-space-aggregation.spec.ts` compares
preprojected aggregation with equivalent Cartesian input, checks contour output
does not invoke preprojection, GPU projection settings, heatmap bounds, and
projection-change invalidation.

`test/modules/aggregation-layers/position-transforms.spec.ts` separately covers
aggregation position attributes and HeatmapLayer's packed WebGPU layout.

`test/render/test-cases/custom-projection.spec.ts` also renders an Albers
equal-area conic grid spanning [-135, 30, -45, 75]. Its 4,186 deterministic points
form two smooth weight peaks. Contour isolines/isobands and flat, top-down
hexagons compare CPU and GPU aggregation against shared baselines; HeatmapLayer
checks the projected weight texture against the same geographic boundary.
The suite uses the existing render test configuration.
