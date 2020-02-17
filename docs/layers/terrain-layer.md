<!-- INJECT:"TerrainLayerDemo" -->

<p class="badges">
  <img src="https://img.shields.io/badge/@deck.gl/geo--layers-lightgrey.svg?style=flat-square" alt="@deck.gl/geo-layers" />
  <img src="https://img.shields.io/badge/lighting-yes-blue.svg?style=flat-square" alt="lighting" />
</p>

# TerrainLayer

This TerrainLayer reconstructs mesh surfaces from height map images, e.g. [Mapzen Terrain Tiles](https://github.com/tilezen/joerd/blob/master/docs/formats.md), which encodes elevation into R,G,B values.

When `terrainImage` is supplied with a templated tile server URL, e.g. URL containing "{x}", it renders terrain tiles globally using the TileLayer and SimpleMeshLayer. Otherwise, supply an absolute URL to `terrainImage` and a `bounds` prop to render a any terrain image (e.g. non-Slippy map tiles) with a SimpleMeshLayer.

```js
import DeckGL from '@deck.gl/react';
import {TerrainLayer} from '@deck.gl/geo-layers';

export const App = ({viewport}) => {

  const layer = new TerrainLayer({
    minZoom: 0,
    maxZoom: 23,
    strategy: 'no-overlap',
    elevationDecoder: {
      rScaler: 256,
      gScaler: 1,
      bScaler: 1/256,
      offset: -32768
    },
    terrainImage: 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
    surfaceImage: 'https://wms.chartbundle.com/tms/1.0.0/sec/{z}/{x}/{y}.png?origin=nw'
  });
  return <DeckGL {...viewport} layers={[layer]} />;
};
```

## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/geo-layers
```

```js
import {TerrainLayer} from '@deck.gl/geo-layers';
new TerrainLayer({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^8.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^8.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^8.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/geo-layers@^8.0.0/dist.min.js"></script>
```

```js
new deck.TerrainLayer({});
```

## Properties

When in Tiled Mode, inherits from all [Tile Layer](/docs/api-reference/tile-layer.md) properties. Otherwise, inherits from all [Simple Mesh Layer](/docs/api-reference/simple-mesh-layer.md) properties.

### Data Options

##### `terrainImage` (String)

Image url that encodes height data.

- Default: `null`

Depending on the `terrainImage` string, this layer renders as a tiled layer composed of a TileLayer of SimpleMeshLayers, or as a single mesh rendered as a SimpleMeshLayer.

* Tiled `terrainImage`: https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png

  * By default, the `TileLayer` loads tiles defined by [the OSM tile index](https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames). You may override this by implementing `getTileIndices`.

* Non-Tiled `terrainImage`: https://s3.amazonaws.com/elevation-tiles-prod/terrarium/1/1/0.png

##### `surfaceImage` (String|Null, optional)

Image url to use as surface texture. Same URL parsing as `terrainImage`.

- Default: `0`


##### `meshMaxError` (Number, optional)

Martini error tolerance in meters, smaller number -> more detailed mesh.

- Default: `4.0`

##### `elevationDecoder` (Object)

Object to decode height data, from (r, g, b) to height in meters.

- Default: `{rScaler: 1, gScaler: 0, bScaler: 0, offset: 0}`


##### `bounds` (Array)

Bounding box of the terrain image, [minX, minY, maxX, maxY] in world coordinates. Must be supplied when using Non-Tiled Mode.

- Default: `[0, 0, 1, 1]`


##### `color` (Color, optional)

Color to use if surfaceImage is unavailable.

- Default: `[255, 255, 255]`

##### `wireframe` (Boolean, optional)

Same as SimpleMeshLayer wireframe.

- Default: `false`

##### `workerUrl` (String, optional)

**Advanced** Supply url to local terrain worker bundle. Only required if running offline and cannot access CDN.

- Default: `null`

# Source

[modules/geo-layers/src/terrain-layer](https://github.com/uber/deck.gl/tree/master/modules/geo-layers/src/terrain-layer)
