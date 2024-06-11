# HeatmapTileLayer (Experimental)

`HeatmapTileLayer` is a layer for visualizing point data aggregated using the [Quadbin Spatial Index](https://docs.carto.com/data-and-analysis/analytics-toolbox-for-bigquery/key-concepts/spatial-indexes#quadbin) using a heatmap. 

## Usage 

```tsx
import DeckGL from '@deck.gl/react';
import {HeatmapTileLayer, quadbinTableSource} from '@deck.gl/carto';

function App({viewState}) {
  const data = quadbinTableSource({
    accessToken: 'XXX',
    connectionName: 'carto_dw',
    tableName: 'carto-demo-data.demo_tables.quadbin'
  });

  const layer = new HeatmapTileLayer({
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
import {HeatmapTileLayer} from '@deck.gl/carto';
new HeatmapTileLayer({});
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
new deck.carto.HeatmapTileLayer({});
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

Controls how weight values are mapped to the `colorRange`, as an array of two numbers [`minValue`, `maxValue`]. The values are normalized, with a value of `1` corresponding to the maximum density present in the viewport.

When `colorDomain` is specified, a pixel with `minValue` is assigned the first color in `colorRange`, a pixel with `maxValue` is assigned the last color in `colorRange`, and any value in between is interpolated. Pixels in the bottom 10% of the range defined by `colorDomain` are gradually faded out by reducing alpha, until 100% transparency at `minValue`. Pixels with weight more than `maxValue` are capped to the last color in `colorRange`.

#### `colorRange` (Color[], optional) {#colorrange}

* Default: [colorbrewer](http://colorbrewer2.org/#type=sequential&scheme=YlOrRd&n=6) `6-class YlOrRd` <img src="https://deck.gl/images/colorbrewer_YlOrRd_6.png"/>

The color palette used in the heatmap, as an array of colors [color1, color2, ...]. Each color is in the format of `[r, g, b]`. Each channel is a number between 0-255.

#### `intensity` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#intensity}

* Default: `1`

Value that is multiplied with the total weight at a pixel to obtain the final weight. A value larger than `1` biases the output color towards the higher end of the spectrum, and a value less than `1` biases the output color towards the lower end of the spectrum.

### Data Accessors

#### `getWeight` ([Accessor&lt;number&gt;](../../developer-guide/using-layers.md#accessors), optional) {#getweight}

* Default: `1`

Method called to retrieve weight of each quadbin cell. By default each cell will use a weight of `1`.

### Callbacks

#### `onMaxDensityChange` (Function, optional) {#onmaxdensitychange}

`onMaxDensityChange` is a function that is called when maximum density of the displayed data changes. The units correspond to a density, such that a value of `1` is a single entity across the entire world, in Mercator projection space. 

- Default: `null`
