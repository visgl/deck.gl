# Alpine railway extraction report

Prepared 2026-08-26 for the `path-style-alpine-railway` example. This report describes the
checked-in launch scenes; [`manifest.json`](./manifest.json) is the machine-readable provenance
record and checksum lockfile.

## Result

Albula / Landwasser, Bernina Pass / Lago Bianco, and Brusio Spiral all pass the scene-selection
gate. Together they contain 26 complete source railway objects and 1,033 retained XYZ positions.
The launch set includes open track, bridges, tunnels, and a covered/gallery segment without
hand-drawn replacement geometry.

## Pinned sources

| Role | Product and release | Source coordinates | Pinned input |
|---|---|---|---|
| Railway | swissTLM3D Railway, swissTLM3D 2.4, published 2026-02-24 | LV95 / LN02 (`EPSG:2056 + EPSG:5728`) | `swisstlm3d_2026-02_2056_5728.shp.zip`, 3,591,345,815 bytes, SHA-256 `75086b5aa7e721f5ad2ea080e14e9e3f42d5e0afdee31c2e3c162f412fab4114` |
| Terrain | swissALTI3D, 2 m Float32 COG tiles whose IDs encode the 2023 edition | LV95 / LN02 (`EPSG:2056 + EPSG:5728`) | 27 exact tile URLs and SHA-256 values in `terrain-sources.mjs` and `manifest.json` |

The railway archive is the official [2026-02 STAC
item](https://data.geo.admin.ch/api/stac/v1/collections/ch.swisstopo.swisstlm3d/items/swisstlm3d_2026-02).
Terrain comes from the official [swissALTI3D STAC
collection](https://data.geo.admin.ch/api/stac/v1/collections/ch.swisstopo.swissalti3d).

Source: Federal Office of Topography swisstopo. See the [terms of use for free geodata and
geoservices](https://www.swisstopo.admin.ch/en/terms-of-use-free-geodata-and-geoservices).

## Railway schema audit

The pinned Shapefile's `swissTLM3D_TLM_EISENBAHN` feature class contained 56,026 3D line
features at audit time. The [swissTLM3D 2.4 object
catalogue](https://www.swisstopo.admin.ch/en/landscape-model-swisstlm3d) defines the railway
attributes; Shapefile field names may be shortened to ten characters.

| Audit question | Source field | Finding and runtime treatment |
|---|---|---|
| Rail system / gauge | `OBJEKTART` | Categories include `Normalspur` (1,435 mm), `Schmalspur` (750–1,435 mm), mixed-gauge, and small railway. All selected objects are `Schmalspur`; the category does not provide their exact numeric gauge, so `gaugeMeters` is `null`. |
| Structure | `KUNSTBAUTE` | Enumerates open/default, bridge, bridge with gallery, gallery, covered bridge, tunnel, underpass, and other structures. Selected values are mapped explicitly to `open`, `bridge`, `tunnel`, or `covered`. |
| Operational state | `AUSSER_BETRIEB` and construction-related `EROEFFUNGSDATUM` | Available in the source model but not selected into this compact runtime dataset. The example makes no operational-status claim. |
| Track count | `ANZAHL_SPUREN` (`ANZAHL_SPU` in Shapefile) | Coded as one track, two-or-more tracks, unknown, or not captured. Retained as `sourceTrackCount`; one Brusio object is not captured and remains `null`. |
| Individual / representative axis | Geometry plus `ACHSE_DKM` | The feature class records individual alignments; `ACHSE_DKM` identifies the representative digital-map axis in multi-track areas. Retained as `representativeAxis`. |
| Identity and revision | `UUID`, `DATUM_AEND` | Stable source UUID and source revision date are retained on every runtime track. |
| Name | `NAME` | Retained when supplied. `Landwasserviadukt` is the only selected feature with a source name; deterministic structure labels fill the other display names. |
| Z semantics | `Polyline Z`; product CRS LV95 / LN02 | Z is an LN02 orthometric height in metres. Horizontal coordinates are reprojected, while Z is retained without vertical transformation. |

Other source-model fields such as `MUSEUMSBAHN`, `AUF_STRASSE`, `ANSCHLUSSGLEIS`, `STUFE`,
`BETRIEBSBAHN`, `STANDSEILBAHN`, `ZAHNRADBAHN`, and `VERKEHRSMITTEL` are not required by the
renderer and are not included in the checked-in JSON.

## Extraction and scene statistics

The extraction selects complete features by UUID in the declared order. GDAL reprojects X/Y from
EPSG:2056 to WGS84 longitude/latitude while leaving LN02 Z intact. Longitude and latitude are
rounded to seven decimal places and Z to two decimal places. Exact consecutive source duplicates
are removed before rounding. There is no simplification, densification, geometry clipping, or
manual redrawing.

Length is a deterministic diagnostic calculated from the runtime coordinates: each horizontal
segment uses a haversine distance with mean Earth radius 6,371,008.8 m, then combines that distance
with its LN02 elevation delta. It is approximate, not a source survey measurement.

| Scene ID | Tracks | Coordinates | Approx. 3D length (m) | Railway Z range (m LN02) | Structures | Terrain tiles |
|---|---:|---:|---:|---:|---|---:|
| `albula-landwasser` | 11 | 157 | 1875.87 | 1016.56–1062.63 | bridge 4, open 5, tunnel 2 | 6 |
| `bernina-pass` | 9 | 504 | 4938.10 | 2211.58–2253.29 | bridge 1, covered 1, open 7 | 15 |
| `brusio-spiral` | 6 | 372 | 3245.87 | 624.21–828.02 | bridge 2, open 4 | 6 |

All 26 objects have source class `Schmalspur`. Source revisions range from 2022-11-23 through
2026-01-09. Twenty-five objects are representative axes; one Brusio object is not a representative
axis and has no captured track count.

### Selection gate

| Scene | Evidence | Verdict |
|---|---|---|
| Albula / Landwasser | A dominant curved alignment, four source-classified bridge objects including named `Landwasserviadukt`, two tunnel objects, and an oblique valley composition. | Pass; default hero. |
| Bernina Pass / Lago Bianco | Longest retained path, sparse high-alpine terrain, source-classified bridge and gallery/covered transitions, and stable long-distance repetition. | Pass; long-pattern scene. |
| Brusio Spiral | Tight self-overlap, 203.81 m railway elevation span, and two source-classified bridge objects. | Pass; curvature/depth stress scene. |

### Exact railway selections

The order below is the extraction and runtime track order. Braces and letter case are part of the
source UUID values.

**Albula / Landwasser**

```text
{61192120-C6F4-4BE4-B264-BFEE83C93600}
{5716ADA1-5D06-41A1-9048-08010D4DB448}
{9681FA77-1ADA-4368-A916-FC5F141D9C30}
{25F6BB09-E81F-4AD9-914B-6D609B7BB2E2}
{A662ED86-105D-4D6E-91BC-EDFCB8E0B001}
{3D3381EF-547C-4CC8-AA91-41C9920D2406}
{5F17FB42-8F8B-4D38-877E-D6C4F77C3F3F}
{704C0C19-C2EE-4087-A923-48C89F48210F}
{DBDFB80A-837C-41B4-8E27-871C4C2CCC64}
{A36C1760-2515-43D6-825A-B2E27E499C7D}
{4F607941-D04B-459D-9E42-F4DDE6680849}
```

**Bernina Pass / Lago Bianco**

```text
{1B57E58E-8677-4B53-A5E7-9A3096952CE0}
{702F3C38-39D9-4C3B-93E7-500B8BB80027}
{4E9D2854-9FAB-4EF2-AC8D-123EE9320351}
{9D2A98CA-D319-47C1-9441-8BEA3041FD50}
{0D13633A-91C4-4322-A3FE-6E37A7A5420D}
{819ECFBB-38AC-45C4-8573-3561D27AC1D9}
{A45EADCA-4AF3-4732-ADF4-C93D5C0B614F}
{99DE6FEF-E398-4F9E-BD53-27840057BFE3}
{8793DD2C-64AE-4324-AA15-1E0D745D9806}
```

**Brusio Spiral**

```text
{99058F3D-C885-4085-A8AF-842D1A3BEC72}
{96BD39A0-5CE4-4A15-A87E-B6E9DD998879}
{9F2D61B0-B2A1-4C07-AEC1-D276822672E1}
{3CACC011-EABF-4B70-AE56-2016C02421C5}
{FB5248A1-ECA1-4A70-9768-25F338B70950}
{9E941768-A16E-416B-8ED0-16ED6D408822}
```

## Terrain derivation

For each scene, the builder verifies the pinned 2 m swissALTI3D COGs, creates a VRT mosaic, and
cubic-warps it to the runtime WGS84 bounds at both output resolutions. It fills nodata with a
100-pixel search distance and one smoothing iteration.

- Elevation: 257 × 257, 8-bit RGB. Elevation is packed as
  `round((elevationMeters + 10000) * 10)` across the RGB channels and decoded at runtime with
  scalers `6553.6`, `25.6`, and `0.1`, plus offset `-10000`.
- Texture: 512 × 512, 8-bit grayscale. GDAL hillshade uses azimuth 315°, altitude 42°, scale
  90000, and edge computation, then maps byte range 0–255 to 30–210.

The terrain is bare earth. In particular, it is not evidence for exact bridge-deck or viaduct
surface geometry.

## Derived asset hashes

The following hashes identify the exact runtime bytes checked into this repository. The validator
also checks raster dimensions and color types.

| Scene ID | Scene JSON SHA-256 | Elevation PNG SHA-256 | Texture PNG SHA-256 |
|---|---|---|---|
| `albula-landwasser` | `f6ad3da18f1bb441e53dd2e3d1d60d69f42256355325a69b63a4a86aea87cd69` | `6f574b9256c55506b142906fe3f683b848419d1dd75e2db3f36f25fe60780a47` | `d4b080324f029de41076540bf8a82029bda6f8bcb7c809bd33787e74a508e6c6` |
| `bernina-pass` | `00984e9b04379ce436d12a87c2ef0f5f29c1ad4422247000ae41665f25cc9677` | `c563640f1b518d86684e3018f7de5b4e345cdbec00f0481586839f436e14bed8` | `8953b27037110612641867fe44ae1216c283d03a36841ce36dc9762e078da9c3` |
| `brusio-spiral` | `20b9b06a653cb4a086dfc9a617dcd2fd83b6c7f36a10e272833d677c3b0fcd08` | `c0475a36bbbc03211463720eeb2fb414343d7b4eef2fbfa8f293b5fd59ac37a8` | `c74b672011cebf8d532513ca6fb8bde3eb36d26ec6b9bdbd04bd8fe80822d208` |

## Interpretation limits

- `Schmalspur` is a category, not a numeric gauge measurement. The renderer's 1.0 m visual gauge
  is explicitly derived.
- Two illustrative rail strokes and repeated sleepers are generated from each official
  centerline at runtime. They are not individually mapped source objects.
- `sourceTrackCount` describes the source model's track-count category and must not be confused
  with the two rendered steel strokes.
- The runtime subset does not retain operational state, so it must not be used to infer whether a
  selected railway object is currently in service.
- GDAL versions may produce byte-different PNG encodings from the same inputs and recipe. The
  manifest hashes the accepted checked-in derivatives; changes require review and intentional
  regeneration.
