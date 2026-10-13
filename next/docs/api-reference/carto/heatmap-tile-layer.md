# HeatmapTileLayer

`HeatmapTileLayer` is a layer for visualizing point data aggregated using spatial indexes like [Quadbin](https://docs.carto.com/data-and-analysis/analytics-toolbox-for-bigquery/key-concepts/spatial-indexes#quadbin) or [H3](https://docs.carto.com/data-and-analysis/analytics-toolbox-for-bigquery/key-concepts/spatial-indexes#h3) using a heatmap. The layer automatically detects the spatial index type and renders cells accordingly.

## Usage[​](#usage "Direct link to Usage")

```
import {DeckGL} from '@deck.gl/react';

import {HeatmapTileLayer} from '@deck.gl/carto';

import {quadbinTableSource} from '@carto/api-client';



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

## Installation[​](#installation "Direct link to Installation")

To install the dependencies from NPM:

```
npm install deck.gl

# or

npm install @deck.gl/core @deck.gl/layers @deck.gl/carto
```

```
import {HeatmapTileLayer} from '@deck.gl/carto';

new HeatmapTileLayer({});
```

To use pre-bundled scripts:

```
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>

<script src="https://unpkg.com/@deck.gl/carto@^9.0.0/dist.min.js"></script>



<!-- or -->

<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>

<script src="https://unpkg.com/@deck.gl/layers@^9.0.0/dist.min.js"></script>

<script src="https://unpkg.com/@deck.gl/geo-layers@^9.0.0/dist.min.js"></script>

<script src="https://unpkg.com/@deck.gl/carto@^9.0.0/dist.min.js"></script>
```

```
new deck.carto.HeatmapTileLayer({});
```

## Properties[​](#properties "Direct link to Properties")

Inherits from all [Base Layer](https://deck.gl/next/docs/api-reference/core/layer.md) and [CompositeLayer](https://deck.gl/next/docs/api-reference/core/composite-layer.md) properties.

#### `data` (TilejsonResult)[​](#data "Direct link to data")

Required. A valid `TilejsonResult` object.

Use one of the following [Data Sources](https://deck.gl/next/docs/api-reference/carto/data-sources.md) to fetch this from the CARTO API:

**Quadbin sources:**

* [quadbinTableSource](https://deck.gl/next/docs/api-reference/carto/data-sources.md#quadbintablesource)
* [quadbinQuerySource](https://deck.gl/next/docs/api-reference/carto/data-sources.md#quadbinquerysource)
* [quadbinTilesetSource](https://deck.gl/next/docs/api-reference/carto/data-sources.md#quadbintilesetsource)

**H3 sources:**

* [h3TableSource](https://deck.gl/next/docs/api-reference/carto/data-sources.md#h3tablesource)
* [h3QuerySource](https://deck.gl/next/docs/api-reference/carto/data-sources.md#h3querysource)
* [h3TilesetSource](https://deck.gl/next/docs/api-reference/carto/data-sources.md#h3tilesetsource)

### Render Options[​](#render-options "Direct link to Render Options")

#### `radiusPixels` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#radiuspixels "Direct link to radiuspixels")

* Default: `20`
* Range: `[0, 100]`

Radius of the heatmap blur in pixels, to which the weight of a cell is distributed. Larger values create a smoother heatmap but may impact performance.

#### `colorDomain` (number\[2], optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#colordomain "Direct link to colordomain")

* Default: `[0, 1]`

Controls how weight values are mapped to the `colorRange`, as an array of two numbers \[`minValue`, `maxValue`]. The values are normalized, with a value of `1` corresponding to the maximum density present in the viewport.

When `colorDomain` is specified:

* Values below `minValue` are gradually faded out (alpha transitions from 0 to 1)
* Values between `minValue` and `maxValue` are linearly mapped to colors in `colorRange`
* Values above `maxValue` are capped to the last color in `colorRange`

#### `colorRange` (Color\[], optional)[​](#colorrange "Direct link to colorrange")

* Default: [colorbrewer](http://colorbrewer2.org/#type=sequential\&scheme=YlOrRd\&n=6) `6-class YlOrRd` ![](https://deck.gl/images/colorbrewer_YlOrRd_6.png)

The color palette used in the heatmap, as an array of colors \[color1, color2, ...]. Each color is in the format of `[r, g, b]` or `[r, g, b, a]`. Each channel is a number between 0-255.

#### `intensity` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#intensity "Direct link to intensity")

* Default: `1`

Value that is multiplied with the total weight at a pixel to obtain the final weight:

* Values > 1 emphasize high-density areas
* Values < 1 emphasize low-density areas
* Value of 1 provides linear mapping

### Data Accessors[​](#data-accessors "Direct link to Data Accessors")

#### `getWeight` ([Accessor\<number>](https://deck.gl/next/docs/developer-guide/using-layers.md#accessors), optional)[​](#getweight "Direct link to getweight")

* Default: `1`

Method called to retrieve weight of each spatial index cell (quadbin or H3). By default each cell will use a weight of `1`.

### Callbacks[​](#callbacks "Direct link to Callbacks")

#### `onMaxDensityChange` (Function, optional)[​](#onmaxdensitychange "Direct link to onmaxdensitychange")

Function that is called when the maximum density of the displayed data changes. The units correspond to a density, such that a value of `1` is a weight of `1` across the entire world, in Mercator projection space. To obtain the density the layer invokes the `getWeight` accessor on all visible quadbin cells, normalizing by the cell area (`0.25 ** cellZ`). The value is then heurstically adjusted based on the viewport zoom to give smooth transitions when the data changes.

* Default: `null`

##### Example[​](#example "Direct link to Example")

A quadbin cell at zoom level `2` with a `weight` of `1000` gives a density of `16000` (`1000 / (0.25 ** 2)`). Upon zooming in, there are different ways the data can be distributed, with the extremes are given here:

* At zoom level `3` the cell splits equally into four cells with weight `250`. The density stays at `16000` (`250 / (0.25 ** 3)`).
* The cell splits into three empty cells and one with weight `1000`. The density increases to `64000` (`1000 / (0.25 ** 3)`).
