
# ClipExtension

The `ClipExtension` adds support for clipping rendered layers by rectangular bounds.

```js
import {GeoJsonLayer} from '@deck.gl/layers';
import {ClipExtension} from '@deck.gl/extensions';

const layer = new GeoJsonLayer({
  // Natural Earth countries dataset includes Antarctica, which renders stretched further to south in MapView with viewState normalization disabled
  data: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_countries.geojson',
  // clip rendered layer by Mercator bounds
  extensions: [new ClipExtension()],
  clipBounds: [-180, -85.051129, 180, 85.051129],
});
```

## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/extensions
```

```js
import {ClipExtension} from '@deck.gl/extensions';
new ClipExtension();
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^8.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^8.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/extensions@^8.0.0/dist.min.js"></script>
```

```js
new deck.ClipExtension();
```

## Constructor

```js
new ClipExtension();
```

## Layer Properties

When added to a layer via the `extensions` prop, the `ClipExtension` adds the following properties to the layer:
##### `clipBounds` (Array) {#clipbounds}

Rectangular bounds to be used for clipping the rendered region.

Supported format: `[left, bottom, right, top]`

##### `clipByInstance` (Boolean, optional) {#clipbyinstance}

`clipByInstance` controls whether an object is clipped by its anchor (e.g. icon, point) or by its geometry (e.g. path, polygon). If not specified, it is deduced from whether there is an attribute called `instancePositions`. This behavior can be overridden if:

- the anchor attribute goes by some other name
- to clip an anchored layer by geometry, like the text layer

## Source

[modules/extensions/src/clip](https://github.com/visgl/deck.gl/tree/9.0-release/modules/extensions/src/clip)
