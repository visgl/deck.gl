# H3HexagonLayer

<!-- -->

Edit on Codepen

The `H3HexagonLayer` renders hexagons from the [H3](https://h3geo.org/) geospatial indexing system.

`H3HexagonLayer` is a [CompositeLayer](https://deck.gl/next/docs/api-reference/core/composite-layer.md).

<!-- -->

* Classic accessors
* Arrow inputs

- JavaScript
- TypeScript
- React

```
import {Deck} from '@deck.gl/core';

import {H3HexagonLayer} from '@deck.gl/geo-layers';



const layer = new H3HexagonLayer({

  id: 'H3HexagonLayer',

  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf.h3cells.json',



  extruded: true,

  getHexagon: d => d.hex,

  getFillColor: d => [255, (1 - d.count / 500) * 255, 0],

  getElevation: d => d.count,

  elevationScale: 20,

  pickable: true

});



new Deck({

  initialViewState: {

    longitude: -122.4,

    latitude: 37.74,

    zoom: 11

  },

  controller: true,

  getTooltip: ({object}) => object && `${object.hex} count: ${object.count}`,

  layers: [layer]

});
```

```
import {Deck, PickingInfo} from '@deck.gl/core';

import {H3HexagonLayer} from '@deck.gl/geo-layers';



type DataType = {

  hex: string;

  count: number;

};



const layer = new H3HexagonLayer<DataType>({

  id: 'H3HexagonLayer',

  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf.h3cells.json',



  extruded: true,

  getHexagon: (d: DataType) => d.hex,

  getFillColor: (d: DataType) => [255, (1 - d.count / 500) * 255, 0],

  getElevation: (d: DataType) => d.count,

  elevationScale: 20,

  pickable: true

});



new Deck({

  initialViewState: {

    longitude: -122.4,

    latitude: 37.74,

    zoom: 11

  },

  controller: true,

  getTooltip: ({object}: PickingInfo<DataType>) => object && `${object.hex} count: ${object.count}`,

  layers: [layer]

});
```

```
import React from 'react';

import {DeckGL} from '@deck.gl/react';

import {H3HexagonLayer} from '@deck.gl/geo-layers';

import type {PickingInfo} from '@deck.gl/core';



type DataType = {

  hex: string;

  count: number;

};



function App() {

  const layer = new H3HexagonLayer<DataType>({

    id: 'H3HexagonLayer',

    data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf.h3cells.json',



    extruded: true,

    getHexagon: (d: DataType) => d.hex,

    getFillColor: (d: DataType) => [255, (1 - d.count / 500) * 255, 0],

    getElevation: (d: DataType) => d.count,

    elevationScale: 20,

    pickable: true

  });



  return <DeckGL

    initialViewState={{

      longitude: -122.4,

      latitude: 37.74,

      zoom: 11

    }}

    controller

    getTooltip={({object}: PickingInfo<DataType>) => object && `${object.hex} count: ${object.count}`}

    layers={[layer]}

  />;

}
```

```
import {Utf8, vectorFromArray} from 'apache-arrow';

import {H3HexagonLayer} from '@deck.gl/geo-layers';



const cells = vectorFromArray(['8928308280fffff'], new Utf8());



const layer = new H3HexagonLayer({

  getHexagon: cells,

  getFillColor: [255, 140, 0]

});
```

See [Using with Arrow](https://deck.gl/next/docs/developer-guide/using-with-arrow.md) for column layouts and mixed inputs.

## Installation[​](#installation "Direct link to Installation")

To install the dependencies from NPM:

```
npm install deck.gl

# or

npm install @deck.gl/core @deck.gl/layers @deck.gl/geo-layers
```

```
import {H3HexagonLayer} from '@deck.gl/geo-layers';

import type {H3HexagonLayerProps} from '@deck.gl/geo-layers';



new H3HexagonLayer<DataT>(...props: H3HexagonLayerProps<DataT>[]);
```

To use pre-bundled scripts:

```
<script src="https://unpkg.com/h3-js@^4.0.0"></script>

<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>

<!-- or -->

<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>

<script src="https://unpkg.com/@deck.gl/layers@^9.0.0/dist.min.js"></script>

<script src="https://unpkg.com/@deck.gl/geo-layers@^9.0.0/dist.min.js"></script>
```

```
new deck.H3HexagonLayer({});
```

Note that `h3-js` must be included before `deck.gl`.

## Properties[​](#properties "Direct link to Properties")

Inherits from all [Base Layer](https://deck.gl/next/docs/api-reference/core/layer.md), [CompositeLayer](https://deck.gl/next/docs/api-reference/core/composite-layer.md), and [PolygonLayer](https://deck.gl/next/docs/api-reference/layers/polygon-layer.md) properties, plus the following:

### Render Options[​](#render-options "Direct link to Render Options")

#### `highPrecision` (boolean, optional)[​](#highprecision "Direct link to highprecision")

* Default: `'auto'`

Each hexagon in the H3 indexing system is [slightly different in shape](https://h3geo.org/docs/core-library/coordsystems). To draw a large number of hexagons efficiently, the `H3HexagonLayer` may choose to use instanced drawing by assuming that all hexagons within the current viewport have the same shape as the one at the center of the current viewport. The discrepancy is usually too small to be visible.

There are several cases in which high-precision mode is required. In these cases, `H3HexagonLayer` may choose to switch to high-precision mode, where it trades performance for accuracy:

* The input set contains a pentagon. There are 12 pentagons world wide at each resolution, and these cells and their immediate neighbors have significant differences in shape.
* The input set is at a coarse resolution (res `0` through res `5`). These cells have larger differences in shape, particularly when using a Mercator projection.
* The input set contains hexagons with different resolutions.

Possible values:

* `'auto'`: The layer chooses the mode automatically. High-precision rendering is only used if an edge case is encountered in the data.
* `true`: Always use high-precision rendering.
* `false`: Always use instanced rendering, regardless of the characteristics of the data.

#### `coverage` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#coverage "Direct link to coverage")

* Default: `1`

Hexagon radius multiplier, between 0 - 1. When `coverage` = 1, hexagon is rendered with actual size, by specifying a different value (between 0 and 1) hexagon can be scaled down.

### Data Accessors[​](#data-accessors "Direct link to Data Accessors")

#### `getHexagon` (Accessor | arrow\.Vector, optional)[​](#gethexagon "Direct link to gethexagon")

* Default: `object => object.hexagon`

Method called to retrieve the [H3](https://h3geo.org/) hexagon index of each object. Note that all hexagons within one `H3HexagonLayer` must use the same [resolution](https://h3geo.org/docs/core-library/restable).

Each Arrow row supplies one identifier or a list of identifiers for one source feature. See [cell identifier columns](https://deck.gl/next/docs/developer-guide/using-with-arrow.md#cell-identifiers) for supported encodings and picking behavior.

#### `getFillColor` (constant | Accessor | arrow\.Vector, optional)[​](#getfillcolor "Direct link to getfillcolor")

* Default: `[0, 0, 0, 255]`

The fill color of each source feature. Accepts a constant, a row callback (Accessor), or an Arrow column in source-feature order. A value applies to all cells belonging to that feature. See [cell color columns](https://deck.gl/next/docs/developer-guide/using-with-arrow.md#cell-styling) for requirements.

#### `getLineColor` (constant | Accessor | arrow\.Vector, optional)[​](#getlinecolor "Direct link to getlinecolor")

* Default: `[0, 0, 0, 255]`

The outline color of each source feature. Accepts a constant, a row callback (Accessor), or an Arrow column in source-feature order. A value applies to all cells belonging to that feature. See [cell color columns](https://deck.gl/next/docs/developer-guide/using-with-arrow.md#cell-styling) for requirements.

#### `getLineWidth` (constant | Accessor | arrow\.Vector, optional)[​](#getlinewidth "Direct link to getlinewidth")

* Default: `1`

The outline width of each source feature. Accepts a constant, a row callback (Accessor), or an Arrow column in source-feature order. A value applies to all cells belonging to that feature. See [cell style columns](https://deck.gl/next/docs/developer-guide/using-with-arrow.md#cell-styling) for requirements.

#### `getElevation` (constant | Accessor | arrow\.Vector, optional)[​](#getelevation "Direct link to getelevation")

* Default: `1000`

The elevation of each source feature. Accepts a constant, a row callback (Accessor), or an Arrow column in source-feature order. A value applies to all cells belonging to that feature. See [cell style columns](https://deck.gl/next/docs/developer-guide/using-with-arrow.md#cell-styling) for requirements.

## Sub Layers[​](#sub-layers "Direct link to Sub Layers")

The `H3HexagonLayer` renders the following sublayers:

* `hexagon-cell-hifi` - On `highPrecision` mode, rendered by [SolidPolygonLayer](https://deck.gl/next/docs/api-reference/layers/solid-polygon-layer.md)
* `hexagon-cell` - On non `highPrecision` mode, rendered by [ColumnLayer](https://deck.gl/next/docs/api-reference/layers/column-layer.md)

## Source[​](#source "Direct link to Source")

[modules/geo-layers/src/h3-layers/h3-hexagon-layer.ts](https://github.com/visgl/deck.gl/tree/master/modules/geo-layers/src/h3-layers/h3-hexagon-layer.ts)
