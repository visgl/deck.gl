# IconClusterLayer

A composite layer that clusters points and displays them with text-based count labels.

## Features

- **Automatic clustering** using Supercluster algorithm
- **Dynamic text labels** showing actual cluster counts (not pre-fab icons)
- **Globe support** with billboard text rendering and depthTest disabled
- **Customizable styling** for clusters and individual points
- **Type-safe** implementation without generic types

## Usage

```typescript
import {IconClusterLayer} from '@deck.gl/layers';

const layer = new IconClusterLayer({
  id: 'icon-cluster',
  data: myData,
  getPosition: d => d.coordinates,

  // Clustering
  clusterRadius: 80,
  clusterMaxZoom: 16,

  // Cluster styling
  clusterFillColor: [51, 102, 204, 200],
  clusterTextColor: [255, 255, 255, 255],
  clusterRadiusScale: 1,
  clusterRadiusMinPixels: 20,
  clusterRadiusMaxPixels: 100,

  // Individual point styling
  pointFillColor: [255, 140, 0, 200],
  pointRadiusMinPixels: 8,
  pointRadiusMaxPixels: 20,

  // Text styling
  fontFamily: 'Monaco, monospace',
  fontWeight: 'bold',

  pickable: true
});
```

## Example with GeoJSON

```typescript
import {IconClusterLayer} from '@deck.gl/layers';

const layer = new IconClusterLayer({
  id: 'global-data-points',
  data: features.map(feature => ({
    type: 'Feature',
    geometry: feature.geometry,
    properties: feature.properties
  })),
  sizeMinPixels: 20,
  sizeMaxPixels: 30,
  sizeScale: 40,
  opacity: 1,
  getPosition: d => d.geometry.coordinates,
  parameters: {
    depthTest: false // Ensures visibility on globe
  }
});
```

## Globe Support

The layer automatically handles globe projections:
- Text labels use billboard rendering to face the camera
- `depthTest: false` ensures icons remain visible regardless of sphere curvature
- Works seamlessly with both flat and globe views

## Picking

When picking a cluster, the layer returns:
- `object`: The cluster or point properties
- `objects`: Array of all points in the cluster (only for clusters, not on hover)

```typescript
layer.onClick = (info) => {
  if (info.objects) {
    console.log('Cluster with', info.objects.length, 'points');
  } else if (info.object) {
    console.log('Individual point:', info.object);
  }
};
```
