# Alpine railway data preparation

These scripts reproduce and validate the checked-in railway centerlines and terrain used by the
`path-style-alpine-railway` website example. They are an offline preparation pipeline; the browser
loads only the derived JSON and PNG files and does not contact swisstopo.

Run all commands from the deck.gl repository root.

## Requirements

- a supported Node.js version for this repository, including built-in `fetch`;
- GDAL command-line tools: `ogr2ogr`, `gdalbuildvrt`, `gdalwarp`, `gdal_fillnodata.py`,
  `gdal_calc.py`, `gdaldem`, and `gdal_translate`;
- enough temporary disk space to extract the 3.59 GB swissTLM3D Shapefile archive and mosaic the
  required swissALTI3D tiles.

The current railway input is the swisstopo swissTLM3D 2.4 release published on 2026-02-24:

```text
https://data.geo.admin.ch/ch.swisstopo.swisstlm3d/swisstlm3d_2026-02/swisstlm3d_2026-02_2056_5728.shp.zip
SHA-256: 75086b5aa7e721f5ad2ea080e14e9e3f42d5e0afdee31c2e3c162f412fab4114
Size: 3591345815 bytes
```

The SHA-256 is decoded from the official STAC asset's `file:checksum` multihash. Download and
verify it before extraction, for example:

```bash
curl -fL \
  -o swisstlm3d_2026-02_2056_5728.shp.zip \
  https://data.geo.admin.ch/ch.swisstopo.swisstlm3d/swisstlm3d_2026-02/swisstlm3d_2026-02_2056_5728.shp.zip
printf '%s  %s\n' \
  75086b5aa7e721f5ad2ea080e14e9e3f42d5e0afdee31c2e3c162f412fab4114 \
  swisstlm3d_2026-02_2056_5728.shp.zip | shasum -a 256 --check
unzip swisstlm3d_2026-02_2056_5728.shp.zip -d swisstlm3d_2026-02
```

The source is in compound LV95/LN02 coordinates (`EPSG:2056 + EPSG:5728`). Locate the extracted
`swissTLM3D_TLM_EISENBAHN.shp` feature class, then create the three runtime scene files:

```bash
node scripts/path-style-extension/alpine-railway/extract-scenes.mjs \
  /absolute/path/to/swissTLM3D_TLM_EISENBAHN.shp
```

`extract-scenes.mjs` selects the declared source UUIDs in a stable order, reprojects horizontal
coordinates to WGS84 longitude/latitude, preserves LN02 elevation, rounds longitude/latitude to
seven decimal places and elevation to centimetres, and removes only source positions that are
exact consecutive duplicates before rounding. It does not simplify, densify, clip, or hand trace
the source lines.

Build all terrain assets with:

```bash
node scripts/path-style-extension/alpine-railway/build-terrain.mjs
```

One or more scene IDs may be supplied to rebuild a subset:

```bash
node scripts/path-style-extension/alpine-railway/build-terrain.mjs albula-landwasser
```

`terrain-sources.mjs` pins every 2 m swissALTI3D COG URL and SHA-256. The builder verifies each
download, mosaics it with GDAL, cubic-warps it to the scene's WGS84 terrain bounds, and fills
nodata. It emits a 257 × 257 Terrain-RGB elevation PNG at 0.1 m precision with a −10000 m offset,
plus a 512 × 512 grayscale hillshade using azimuth 315°, altitude 42°, scale 90000, and output
range 30–210.

Finally, regenerate the byte-level provenance lockfile and validate the complete dataset:

```bash
node scripts/path-style-extension/alpine-railway/create-manifest.mjs
node scripts/path-style-extension/alpine-railway/validate-scenes.mjs
```

The manifest uses a fixed, reviewed generation/retrieval timestamp instead of reading the wall
clock, so identical inputs produce identical manifest bytes. It records the railway archive
checksum, every terrain tile checksum, pipeline-script checksums, selected UUIDs,
transformations, derived-asset checksums, and per-scene statistics.

GDAL versions may encode equivalent derived rasters into different PNG bytes. The manifest locks
the exact files checked into this repository; after a rebuild, review any raster differences and
regenerate the manifest only when the change is intentional. The validator makes no network
requests.

## Data interpretation

The selected source features are all classified `Schmalspur`, but swissTLM3D does not provide a
numeric gauge for them. Runtime `gaugeMeters` is therefore `null`. The example's 1.0 m visual
gauge, paired steel strokes, and repeated sleepers are cartographic constructions rendered from
the official centerline, not surveyed individual rail or sleeper objects.

Terrain is the swissALTI3D bare-earth model. It provides geographic context but may not reproduce
the deck or silhouette of a bridge or viaduct.

Source: Federal Office of Topography swisstopo. Usage is governed by the [swisstopo terms for free
geodata and geoservices](https://www.swisstopo.admin.ch/en/terms-of-use-free-geodata-and-geoservices).
