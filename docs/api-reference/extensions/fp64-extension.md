
# Fp64Extension

The `Fp64Extension` adds 64-bit precision to geospatial layers.

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
<script src="https://unpkg.com/deck.gl@^7.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^7.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^7.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/extensions@^7.0.0/dist.min.js"></script>
```

```js
new deck.Fp64Extension({});
```

## Constructor

```js
new Fp64Extension();
```

## Layer Properties

When added to a layer via the `extensions` prop, the `Fp64Extension` requires the `coordinateSystem` prop of the layer to be `COORDINATE_SYSTEM.LNGLAT_DEPRECATED`.


## Source

[modules/extensions/src/fp64](https://github.com/uber/deck.gl/tree/master/modules/extensions/src/fp64)
