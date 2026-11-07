
# Fp64Extension

The `Fp64Extension` adds extended-precision Mercator projection to geospatial layers. It represents coordinates as high and low `f32` terms using luma.gl's `fp64` shader module; this is emulated double-single arithmetic, not native IEEE 754 binary64.

> Note: This extension is the equivalent of the `fp64` prop from older deck.gl versions. As of v6.3, the fp64 mode was deprecated in favor of the new default 32-bit projection mode that is comparable in precision but considerably more performant.

```js
import {GeoJsonLayer} from '@deck.gl/layers';
import {Fp64Extension} from '@deck.gl/extensions';

const layer = new GeoJsonLayer({
  id: 'geojson-layer',
  data: GEOJSON,
  ...
  extensions: [new Fp64Extension()]
});
```

## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/extensions
```

```js
import {Fp64Extension} from '@deck.gl/extensions';
new Fp64Extension({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/extensions@^9.0.0/dist.min.js"></script>
```

```js
new deck.Fp64Extension({});
```

## Constructor

```js
new Fp64Extension();
```

## Layer Properties

When added to a layer via the `extensions` prop, the `Fp64Extension` uses WGS84 position attributes. Set [`coordinateSystem`](../core/layer.md#coordinatesystem) to `'lnglat'`, an alias such as `'EPSG:4326'`, or a CRS definition that is preprojected to WGS84.

## Limitations

Only `MapView` and other Web Mercator based viewports are supported. `GlobeView`, custom projections, and non-geospatial views such as `OrthographicView` and `OrbitView` are not supported. The default projection remains recommended for most applications because it is substantially faster.

Software WebGPU adapters such as SwiftShader are not validated for high-zoom fp64 precision.

## Source

[modules/extensions/src/fp64](https://github.com/visgl/deck.gl/tree/master/modules/extensions/src/fp64)
