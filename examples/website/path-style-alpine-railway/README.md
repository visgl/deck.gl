# Alpine Railway

This is a standalone alternative website example for
[PathStyleExtension](../../../docs/api-reference/extensions/path-style-extension.md). It turns
official three-dimensional Swiss railway centerlines into recognizable track infrastructure:

- sleepers are square-capped, whole-path dashes measured in metres;
- two steel rails are offset copies of each shared centerline;
- tunnel and gallery sections use billboarded screen-space dashes;
- the Anatomy view adds source vertices and a justified bridge-inspection overlay;
- dash gaps remain pickable so each conceptual track is selectable.

The terrain and railway assets are checked in, so the example makes no live geodata or basemap
request and needs no access token. Its small terrain raster is decoded on the main thread to avoid
the loader's default CDN-hosted worker.

PathStyleExtension currently targets WebGL, so this example intentionally does not expose a
WebGPU device switch. The example requires the whole-path dash and explicit dash-unit APIs on this
deck.gl branch; from a repository checkout, use `yarn start-local`. A copied standalone folder
requires a deck.gl release that contains those APIs.

## Usage

From a deck.gl repository checkout, install and start against the local packages:

```bash
yarn
yarn start-local
```

After installing a deck.gl release that contains `dashMode` and `dashUnits`, the folder also uses
the conventional standalone commands:

```bash
npm install
npm start
```

## Data and visual construction

Railway positions, elevations, source UUIDs, revision dates, rail classes, and structure boundaries
come from swissTLM3D 2.4. Terrain is a clipped and downsampled derivative of the 2 m swissALTI3D
product. Both use LV95 horizontal coordinates and LN02 orthometric heights in the preparation step;
the runtime railway data is reprojected to WGS84 longitude/latitude while retaining LN02 elevation.

The source identifies the selected alignments as `Schmalspur` but does not provide their exact
gauge. The renderer therefore uses a clearly labeled 1.0 m visual gauge. Sleepers and the paired
steel strokes are generated at render time from each official centerline. Their dimensions and
placement are cartographic construction, not source-mapped individual railway objects. The
rendered track is lifted 0.8 m above the source Z only to prevent terrain z-fighting; source
coordinates remain unchanged in the checked-in scene data and Anatomy overlay.

Source: Federal Office of Topography swisstopo. See [the provenance
manifest](./data/manifest.json), [extraction report](./data/extraction-report.md), and preparation
[scripts](../../../scripts/path-style-extension/alpine-railway/README.md).
