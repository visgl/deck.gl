# US states render fixture

`us-states.geo.json` contains all 50 states, including Alaska (with Aleutian Islands) and Hawaii. Coordinates remain longitude/latitude in EPSG:4326. No state is relocated, rescaled or converted to an inset.

Source: [US Census Bureau TIGERweb USLandmass, States layer](https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/USLandmass/MapServer/0), January 1, 2026 vintage. Census Bureau geographic data is public-domain US government data. Retrieved September 22, 2026.

The GeoJSON was exported using the layer's `/query` endpoint with these parameters:

```text
where=STATE <= '56' AND STATE <> '11'
outFields=STATE,NAME,STUSAB
outSR=4326
maxAllowableOffset=0.04
geometryPrecision=4
orderByFields=STATE
f=geojson
```

The query excludes DC and territories. Server-side simplification to 0.04 degrees and four decimal places keeps the fixture small; it is intended for render regression tests, not boundary analysis. The only local change is formatting one feature per line. The checked-in file makes test runs independent of the Census service.

The [custom projection render suite](../render/test-cases/custom-projection.spec.ts) uses [EPSG:5070, NAD83 / Conus Albers](https://epsg.io/5070), through the existing `@math.gl/proj4` dependency. Alaska and Hawaii are deliberately rendered outside the CRS's continental-US area of use to exercise distant multipart geometry in the same projection. This is a rendering test, not an accuracy claim for those regions.

The suite compares top-down and pitched full-country maps, including Alaska, on WebGL and WebGPU. Filled state polygons, state outlines and the existing state-capital circle fixture exercise the polygon, path and scatterplot sublayers. WebGL picking assertions verify Alaska and Colorado independently of the golden images; synchronous picking is not available on WebGPU.
