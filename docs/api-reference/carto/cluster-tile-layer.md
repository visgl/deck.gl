# ClusterTileLayer (Experimental)

`ClusterTileLayer` is a layer for visualizing point data aggregated using the [Quadbin Spatial Index](https://docs.carto.com/data-and-analysis/analytics-toolbox-for-bigquery/key-concepts/spatial-indexes#quadbin) using clusters. 

## Usage 

```tsx
import DeckGL from '@deck.gl/react';
import {ClusterTileLayer, quadbinTableSource} from '@deck.gl/carto';

function App({viewState}) {
  const data = quadbinTableSource({
    accessToken: 'XXX',
    connectionName: 'carto_dw',
    tableName: 'carto-demo-data.demo_tables.quadbin'
  });

  const layer = new ClusterTileLayer({
    data,

    // Clustering props
    getWeight: d => d.properties.longitude_count,
    getPosition: d => [d.properties.longitude_average, d.properties.latitude_average];

    // Styling (supports all GeoJsonLayer props)
    pointType: 'circle+text',
    getPointRadius: d => d.properties.longitude_count / d.properties.stats.longitude_count,
    pointRadiusUnits: 'pixels',
    pointRadiusScale: 50,
    getText: d => d.properties.longitude_count,
    textSizeScale: 20
  });

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
import {ClusterTileLayer} from '@deck.gl/carto';
new ClusterTileLayer({});
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
new deck.carto.ClusterTileLayer({});
```

## Properties

Inherits all properties from [`TileLayer`](./tile-layer.md) and [`GeoJsonLayer`](../core/geojson-layer.md), with exceptions indicated below.

#### `data` (TilejsonResult) {#data}

Required. A valid `TilejsonResult` object.

Use one of the following [Data Sources](./data-sources.md) to fetch this from the CARTO API:

- [quadbinTableSource](./data-sources#quadbintablesource)
- [quadbinQuerySource](./data-sources#quadbinquerysource)
- [quadbinTilesetSource](./data-sources#quadbintilesetsource)

### Clustering Options

The following props control how the data is grouped into clusters. The accessor methods will be called on each quadbin cell in the data to retrieve the position and weight of the cell. All of the properties are then aggregated and made available to the `GeoJsonLayer` accessors for styling.

#### `clusterLevel` (number, optional) {#clusterlevel}

* Default: `5`

The number of aggregation levels to cluster cells by. Larger values increase the clustering radius, with an increment of `clusterLevel` doubling the radius.

#### `getPosition` ([Accessor&lt;Position&gt;](../../developer-guide/using-layers.md#accessors), optional) {#getposition}

The (average) position of points in a cell used for clustering. If not supplied the center of the quadbin cell is used.

#### `getWeight` ([Accessor&lt;number&gt;](../../developer-guide/using-layers.md#accessors)) {#getweight}

* Default: `1`

The weight of each cell used for clustering.

## Aggregated data

When using the `GeoJsonLayer` accessors to style the clusters, aggregated values will be passed to the styling accessor functions.

The type aggregation is infered based on the property name, for example `population_average` will be aggregated using a (mean) average operation across all the quadbin cells that are present in the cluster, while `age_min` will give the minimum value present in the cluster.

### Valid aggregation types

Supported aggregation types are: `any`, `average`, `count`, `min`, `max`, `sum`.

### Global aggregation

In addition to the aggregated values across the cluster, the features passed to the styling accessors contain a `stats` object which contains the same properties, but aggregated across all the data being displayed. This is useful for normalizing the values, such that the largest cluster has a constant value.

### Example

Display clusters using an `'cluster'` icon scaled between 20 and 80, switching to an icon defined by the `icon_any` property once the cluster only contains a single point.

```ts
// Data present in quadbin cell
type PropertiesType = {
  longitude_count: number; // count of points in cell
  longitude_average: number;
  latitude_average: number;
  icon_any: string;
};

const layer = new ClusterTileLayer<PropertiesType>({
  data, // Defined using `quadbinTableSource` or similar

  // Clustering props
  getWeight: d => d.properties.longitude_count,
  getPosition: d => [d.properties.longitude_average, d.properties.latitude_average];
  
  // Style
  pointType: 'icon',
  iconAtlas,
  iconMapping,
  getIcon: d => d.longitude_count > 1 : 'cluster' : d.icon_any,
  getIconSize: d => 20 + 80 * d.properties.longitude_count / d.properties.stats.longitude_count
});
```
