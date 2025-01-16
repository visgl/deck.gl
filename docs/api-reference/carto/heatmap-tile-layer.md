# HeatmapTileLayer

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
    getWeight: d => d.properties.count,
    // Customize appearance
    radiusPixels: 30,
    intensity: 1.5,
    colorDomain: [0, 2],
    // Optional: Track density changes
    onMaxDensityChange: (density) => console.log('Max density:', density)
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
* Range: `[0, 100]`

Radius of the heatmap blur in pixels, to which the weight of a cell is distributed. Larger values create a smoother heatmap but may impact performance.

#### `colorDomain` (number[2], optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#colordomain}

* Default: `[0, 1]`

Controls how weight values are mapped to the `colorRange`, as an array of two numbers [`minValue`, `maxValue`]. The values are normalized, with a value of `1` corresponding to the maximum density present in the viewport.

When `colorDomain` is specified:
- Values below `minValue` are gradually faded out (alpha transitions from 0 to 1)
- Values between `minValue` and `maxValue` are linearly mapped to colors in `colorRange`
- Values above `maxValue` are capped to the last color in `colorRange`

#### `colorRange` (Color[], optional) {#colorrange}

* Default: [colorbrewer](http://colorbrewer2.org/#type=sequential&scheme=YlOrRd&n=6) `6-class YlOrRd` <img src="https://deck.gl/images/colorbrewer_YlOrRd_6.png"/>

The color palette used in the heatmap, as an array of colors [color1, color2, ...]. Each color is in the format of `[r, g, b]` or `[r, g, b, a]`. Each channel is a number between 0-255.

#### `intensity` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#intensity}

* Default: `1`

Value that is multiplied with the total weight at a pixel to obtain the final weight:
- Values > 1 emphasize high-density areas
- Values < 1 emphasize low-density areas
- Value of 1 provides linear mapping

### Data Accessors

#### `getWeight` ([Accessor&lt;number&gt;](../../developer-guide/using-layers.md#accessors), optional) {#getweight}

* Default: `1`

Method called to retrieve weight of each quadbin cell. By default each cell will use a weight of `1`.

### Callbacks

#### `onMaxDensityChange` (Function, optional) {#onmaxdensitychange}

Function that is called when the maximum density of the displayed data changes. The units correspond to a density, such that a value of `1` is a weight of `1` across the entire world, in Mercator projection space. To obtain the density the layer invokes the `getWeight` accessor on all visible quadbin cells, normalizing by the cell area (`0.25 ** cellZ`). The value is then heurstically adjusted based on the viewport zoom to give smooth transitions when the data changes. 

- Default: `null`

##### Example

A quadbin cell at zoom level `2` with a `weight` of `1000` gives a density of `16000` (`1000 / (0.25 ** 2)`). Upon zooming in, there are different ways the data can be distributed, with the extremes are given here:

- At zoom level `3` the cell splits equally into four cells with weight `250`. The density stays at `16000` (`250 / (0.25 ** 3)`).
- The cell splits into three empty cells and one with weight `1000`. The density increases to `64000` (`1000 / (0.25 ** 3)`).
