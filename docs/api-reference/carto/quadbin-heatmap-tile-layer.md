# QuadbinHeatmapTileLayer (Experimental)

`QuadbinHeatmapTileLayer` is a layer for visualizing tiled data indexed with a [Quadbin Spatial Index](https://docs.carto.com/data-and-analysis/analytics-toolbox-for-bigquery/key-concepts/spatial-indexes#quadbin) using a heatmap. 

## Usage 

```tsx
import DeckGL from '@deck.gl/react';
import {QuadbinHeatmapTileLayer, quadbinTableSource} from '@deck.gl/carto';

function App({viewState}) {
  const data = quadbinTableSource({
    accessToken: 'XXX',
    connectionName: 'carto_dw',
    tableName: 'carto-demo-data.demo_tables.quadbin'
  });

  const layer = new QuadbinHeatmapTileLayer({
    data,
    getWeight: d => d.properties.count
  })

  return <DeckGL viewState={viewState} layers={[layer]} />;
}
```

## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/carto
```

```js
import {QuadbinHeatmapTileLayer} from '@deck.gl/carto';
new QuadbinHeatmapTileLayer({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/carto@^9.0.0/dist.min.js"></script>

<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/geo-layers@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/carto@^9.0.0/dist.min.js"></script>
```

```js
new deck.carto.QuadbinHeatmapTileLayer({});
```

## Properties

Inherits from all [Base Layer](../core/layer.md) and [CompositeLayer](../core/composite-layer.md) properties.

#### `data` (TilejsonResult) {#data}

Required. A valid `TilejsonResult` object.

Use one of the following [Data Sources](./data-sources.md) to fetch this from the CARTO API:

- [quadbinTableSource](./data-sources#quadbintablesource)
- [quadbinQuerySource](./data-sources#quadbinquerysource)
- [quadbinTilesetSource](./data-sources#quadbintilesetsource)

### Render Options

#### `radiusPixels` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#radiuspixels}

* Default: `20`

Radius of the heatmap blur in pixels, to which the weight of a cell is distributed.

#### `colorDomain` (number[2], optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#colordomain}

* Default: `[0, 1]`

Controls how weight values are mapped to the `colorRange`, as an array of two numbers [`minValue`, `maxValue`].

When `colorDomain` is specified, a pixel with `minValue` is assigned the first color in `colorRange`, a pixel with `maxValue` is assigned the last color in `colorRange`, and any value in between is linearly interpolated. Pixels with weight less than `minValue` gradually fade out by reducing alpha, until 100% transparency representing `0`. Pixels with weight more than `maxValue` are capped to the last color in `colorRange`.

#### `colorRange` (Color[], optional) {#colorrange}

* Default: [colorbrewer](http://colorbrewer2.org/#type=sequential&scheme=YlOrRd&n=6) `6-class YlOrRd` <img src="https://deck.gl/images/colorbrewer_YlOrRd_6.png"/>

The color palette used in the heatmap, as an array of colors [color1, color2, ...]. Each color is in the format of `[r, g, b]`. Each channel is a number between 0-255.


### Data Accessors

#### `getWeight` ([Accessor&lt;number&gt;](../../developer-guide/using-layers.md#accessors), optional) {#getweight}

* Default: `1`

Method called to retrieve weight of each quadbin cell. By default each cell will use a weight of `1`.


