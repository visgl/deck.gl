# TileLayer

This TileLayer takes in a function `getTileData` that fetches tiles, and renders it in a GeoJsonLayer or with the layer returned in `renderSubLayers`.

```js
import DeckGL from 'deck.gl';
import TileLayer from '@deck.gl/experimental-layers/tile-layer/tile-layer';
import {VectorTile} from '@mapbox/vector-tile';
import Protobuf from 'pbf';

export const App = ({viewport}) => {
  function getTileData({x, y, z}) {
    const mapSource = `https://a.tiles.mapbox.com/v4/mapbox.mapbox-streets-v7/${z}/${x}/${y}.vector.pbf?access_token=${MAPBOX_TOKEN}`;
    return fetch(mapSource)
      .then(response => response.arrayBuffer())
      .then(buffer => vectorTileToGeoJSON(buffer, x, y, z));
  }

  function vectorTileToGeoJSON(buffer, x, y, z) {
    const tile = new VectorTile(new Protobuf(buffer));
    const features = [];
    for (const layerName in tile.layers) {
      const vectorTileLayer = tile.layers[layerName];
      for (let i = 0; i < vectorTileLayer.length; i++) {
        const vectorTileFeature = vectorTileLayer.feature(i);
        const feature = vectorTileFeature.toGeoJSON(x, y, z);
        features.push(feature);
      }
    }
    return features;
  }
  const layer = new TileLayer({
    stroked: false,
    getLineColor: [192, 192, 192],
    getFillColor: [140, 170, 180],
    getTileData
  });
  return <DeckGL {...viewport} layers={[layer]} />;
};
```

## Properties

Inherits from all [Base Layer](/docs/api-reference/layer.md) properties, along with `renderSubLayer`
and `getTileData`

### Render Options

##### `filled` (Boolean, optional)

- Default: `true`

Whether to draw filled polygons (solid fill). Note that for each polygon,
only the area between the outer polygon and any holes will be filled. This
prop is effective only when the polygon is NOT extruded.

##### `stroked` (Boolean, optional)

- Default: `false`

Whether to draw an outline around polygons (solid fill). Note that
for complex polygons, both the outer polygon as well the outlines of
any holes will be drawn.

##### `extruded` (Boolean, optional)

Extrude Polygon and MultiPolygon features along the z-axis if set to
true. The height of the drawn features is obtained using the `getElevation` accessor.

- Default: `false`

##### `wireframe` (Boolean, optional)

- Default: `false`

Whether to generate a line wireframe of the hexagon. The outline will have
"horizontal" lines closing the top and bottom polygons and a vertical line
(a "strut") for each vertex on the polygon.

Remarks:

- These lines are rendered with `GL.LINE` and will thus always be 1 pixel wide.
- Wireframe and solid extrusions are exclusive, you'll need to create two layers
  with the same data if you want a combined rendering effect.
- This is only effective if the `extruded` prop is set to true.

##### `lineWidthScale` (Boolean, optional)

- Default: `1`

The line width multiplier that multiplied to all lines, including the `LineString`
and `MultiLineString` features and also the outline for `Polygon` and `MultiPolygon`
features if the `stroked` attribute is true.

##### `lineWidthMinPixels` (Number, optional)

- Default: `0`

The minimum line width in pixels.

##### `lineWidthMaxPixels` (Number, optional)

- Default: Number.MAX_SAFE_INTEGER

The maximum line width in pixels.

##### `lineJointRounded` (Boolean, optional)

- Default: `false`

Type of joint. If `true`, draw round joints. Otherwise draw miter joints.

##### `lineMiterLimit` (Number, optional)

- Default: `4`

The maximum extent of a joint in ratio to the stroke width.
Only works if `lineJointRounded` is `false`.

##### `elevationScale` (Number, optional)

- Default: `1`

Elevation multiplier. The final elevation is calculated by
`elevationScale * getElevation(d)`. `elevationScale` is a handy property to scale
all polygon elevation without updating the data.

##### `pointRadiusScale` (Number, optional)

- Default: `1`

A global radius multiplier for all points.

##### `pointRadiusMinPixels` (Number, optional)

- Default: `0`

The minimum radius in pixels.

##### `pointRadiusMaxPixels` (Number, optional)

- Default: `Number.MAX_SAFE_INTEGER`

The maximum radius in pixels.

##### `lineDashJustified` (Boolean, optional)

- Default: `false`

Justify dashes together.
Only works if `getLineDashArray` is specified.

##### `fp64` (Boolean, optional)

- Default: `false`

Whether the layer should be rendered in high-precision 64-bit mode. Note that since deck.gl v6.1, the default 32-bit projection uses a hybrid mode that matches 64-bit precision with significantly better performance.

##### `lightSettings` (Object, optional) **EXPERIMENTAL**

This is an object that contains light settings for extruded polygons.
Be aware that this prop will likely be changed in the future versions of
deck.gl.

### Data Accessors

##### `getLineColor` (Function|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

- Default: `[0, 0, 0, 255]`

The rgba color of line string and/or the outline of polygon for a GeoJson feature, depending on its type.
Format is `r, g, b, [a]`. Each component is in the 0-255 range.

- If an array is provided, it is used as the line color for all features.
- If a function is provided, it is called on each feature to retrieve its line color.

##### `getFillColor` (Function|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

- Default: `[0, 0, 0, 255]`

The solid color of the polygon and point features of a GeoJson.
Format is `r, g, b, [a]`. Each component is in the 0-255 range.

- If an array is provided, it is used as the fill color for all features.
- If a function is provided, it is called on each feature to retrieve its fill color.

Note: This accessor is only called for `Polygon` and `MultiPolygon` and `Point` features.

##### `getRadius` (Function|Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

- Default: `1`

The radius of `Point` and `MultiPoint` feature, in meters.

- If a number is provided, it is used as the radius for all point features.
- If a function is provided, it is called on each point feature to retrieve its radius.

##### `getLineWidth` (Function|Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

- Default: `1`

The width of line string and/or the outline of polygon for a GeoJson feature, depending on its type. Unit is meters.

- If a number is provided, it is used as the line width for all features.
- If a function is provided, it is called on each feature to retrieve its line width.

Note: This accessor is called for `LineString` and `MultiLineString`
features. It is called for `Polygon` and `MultiPolygon` features if the
`stroked` attribute is true.

##### `getElevation` (Function|Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

- Default: `1000`

The elevation of a polygon feature (when `extruded` is true).

If a cartographic projection mode is used, height will be interpreted as meters,
otherwise will be in unit coordinates.

- If a number is provided, it is used as the elevation for all polygon features.
- If a function is provided, it is called on each polygon feature to retrieve its elevation.

Note: This accessor is only called for `Polygon` and `MultiPolygon` features.

##### `getLineDashArray` (Function|Array, optional)

- Default: `null`

The dash array to draw each outline path with: `[dashSize, gapSize]` relative to the width of the line. (See PathLayer)

- If an array is provided, it is used as the dash array for all paths.
- If a function is provided, it is called on each path to retrieve its dash array. Return `[0, 0]` to draw the path in solid line.
- If this accessor is not specified, all paths are drawn as solid lines.

##### `getTileData` (Function)

`getTileData` is a function that takes `{x, y, z}` as parameters, and returns a promise, which resolves to data in tile z-x-y.

##### `renderSubLayer` (Function)

Renders a sub-layer with the `data` prop being the resolved value of `getTileData`, and other props that are passed in the `TileLayer`

- Default: `props => new GeoJsonLayer(props)`
