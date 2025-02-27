# TextLayer

import {TextLayerDemo} from '@site/src/doc-demos/layers';

<TextLayerDemo />

The `TextLayer` renders text labels at given coordinates.

TextLayer is a [CompositeLayer](../core/composite-layer.md) that wraps around the [IconLayer](./icon-layer.md). It automatically creates an atlas texture from the specified font settings and `characterSet`.


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';
import {TextLayer} from '@deck.gl/layers';

const layer = new TextLayer({
  id: 'TextLayer',
  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart-stations.json',

  getPosition: d => d.coordinates,
  getText: d => d.name,
  getAlignmentBaseline: 'center',
  getColor: [255, 128, 0],
  getSize: 16,
  getTextAnchor: 'middle',
  pickable: true
});

new Deck({
  initialViewState: {
    longitude: -122.4,
    latitude: 37.74,
    zoom: 11
  },
  controller: true,
  getTooltip: ({object}) => object && object.name,
  layers: [layer]
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck, PickingInfo} from '@deck.gl/core';
import {TextLayer} from '@deck.gl/layers';

type BartStation = {
  name: string;
  coordinates: [longitude: number, latitude: number];
};

const layer = new TextLayer<BartStation>({
  id: 'TextLayer',
  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart-stations.json',

  getPosition: (d: BartStation) => d.coordinates,
  getText: (d: BartStation) => d.name,
  getAlignmentBaseline: 'center',
  getColor: [255, 128, 0],
  getSize: 16,
  getTextAnchor: 'middle',
  pickable: true
});

new Deck({
  initialViewState: {
    longitude: -122.4,
    latitude: 37.74,
    zoom: 11
  },
  controller: true,
  getTooltip: ({object}: PickingInfo<BartStation>) => object && object.name,
  layers: [layer]
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React from 'react';
import DeckGL from '@deck.gl/react';
import {} from '@deck.gl/layers';
import type {PickingInfo} from '@deck.gl/core';

type BartStation = {
  name: string;
  coordinates: [longitude: number, latitude: number];
};

function App() {
  const layer = new TextLayer<BartStation>({
    id: 'TextLayer',
    data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart-stations.json',

    getPosition: (d: BartStation) => d.coordinates,
    getText: (d: BartStation) => d.name,
    getAlignmentBaseline: 'center',
    getColor: [255, 128, 0],
    getSize: 16,
    getTextAnchor: 'middle',
    pickable: true
  });

  return <DeckGL
    initialViewState={{
      longitude: -122.4,
      latitude: 37.74,
      zoom: 11
    }}
    controller
    getTooltip={({object}: PickingInfo<BartStation>) => object && object.name}
    layers={[layer]}
  />;
}
```

  </TabItem>
</Tabs>


## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers
```

```ts
import {TextLayer} from '@deck.gl/layers';
import type {TextLayerProps} from '@deck.gl/layers';

new TextLayer<DataT>(...props: TextLayerProps<DataT>[]);
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^9.0.0/dist.min.js"></script>
```

```js
new deck.TextLayer({});
```

## Properties

Inherits from all [Base Layer](../core/layer.md) and [CompositeLayer](../core/composite-layer.md) properties.

### Rendering Options

#### `sizeScale` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#sizescale}

* Default: 1

Text size multiplier.

#### `sizeUnits` (string, optional) {#sizeunits}

* Default: `pixels`

The units of the size, one of `'meters'`, `'common'`, and `'pixels'`. See [unit system](../../developer-guide/coordinate-systems.md#supported-units).

#### `sizeMinPixels` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#sizeminpixels}

* Default: `0`

The minimum size in pixels. When using non-pixel `sizeUnits`, this prop can be used to prevent the icon from getting too small when zoomed out.

#### `sizeMaxPixels` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#sizemaxpixels}

* Default: `Number.MAX_SAFE_INTEGER`

The maximum size in pixels. When using non-pixel `sizeUnits`, this prop can be used to prevent the icon from getting too big when zoomed in.

#### `billboard` (boolean, optional) {#billboard}

- Default: `true`

If `true`, the text always faces camera. Otherwise the text faces up (z).

#### `background` (boolean, optional) {#background}

- Default `false`

Whether to render background for the text blocks.

#### `backgroundBorderRadius` (number | number[4], optional) {#backgroundBorderRadius}

- Default `0`

The border-radius of the background, a number or an array of 4 numbers.

+ If a number is supplied, it is the same border radius in pixel for all corners.
+ If an array of 4 is supplied, it is interpreted as `[bottom_right_corner, top_right_corner, bottom_left_corner, top_left_corner]` border radius in pixel.


#### `backgroundPadding` (number[4], optional) {#backgroundpadding}

- Default `[0, 0, 0, 0]`

The padding of the background, an array of either 2 or 4 numbers.

+ If an array of 2 is supplied, it is interpreted as `[padding_x, padding_y]` in pixels.
+ If an array of 4 is supplied, it is interpreted as `[padding_left, padding_top, padding_right, padding_bottom]` in pixels.

#### `fontFamily` (string, optional) {#fontfamily}

* Default: `'Monaco, monospace'`

Specifies a prioritized list of one or more font family names and/or generic family names. Follow the specs for CSS [font-family](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family).

See the [remarks](#remarks) section below for tips on using web fonts.

#### `characterSet` (string[] | Set&lt;string&gt; | string, optional) {#characterset}

* Default: ASCII characters 32-128

Specifies a list of characters to include in the font.

- If set to `'auto'`, automatically detects the characters used in the data. This option has a performance overhead and may cause the layer to take longer to load if the data is very large.
- If set to an array or set of characters, the generated font will be limited to these characters. If you already know all the characters that are needed (e.g. numbers, latin alphabet), using this option provides better performance. If a character outside of the specified range is referenced by `getText`, a warning will be logged to the JavaScript console.

Note that there is a limit to the number of unique characters supported by a single layer. The maximum number subjects to `fontSettings.fontSize` and the [MAX_TEXTURE_SIZE](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices#understand_system_limits) of the device/browser.

#### `fontWeight` (number | string, optional) {#fontweight}

* Default: `normal`.

css `font-weight`.

#### `lineHeight` (number, optional) {#lineheight}

* Default: `1.0`.

A unitless number that will be multiplied with the current font size to set the line height.

#### `fontSettings` (object, optional) {#fontsettings}

Advance options for fine tuning the appearance and performance of the generated shared `fontAtlas`.

Options:

* `fontSize` (number): Font size in pixels. Default is `64`. This option is only applied for generating `fontAtlas`, it does not impact the size of displayed text labels. Larger `fontSize` will give you a sharper look when rendering text labels with very large font sizes. But larger `fontSize` requires more time and space to generate the `fontAtlas`.
* `buffer` (number): Whitespace buffer around each side of the character. Default is `4`. In general, bigger `fontSize` requires bigger `buffer`. Increase `buffer` will add more space between each character when layout `characterSet` in `fontAtlas`. This option could be tuned to provide sufficient space for drawing each character and avoiding overlapping of neighboring characters.
* `sdf` (boolean): Flag to enable / disable `sdf`. Default is `false`. [`sdf` (Signed Distance Fields)](http://cs.brown.edu/people/pfelzens/papers/dt-final.pdf) will provide a sharper look when rendering with very large or small font sizes. `TextLayer` integrates with [`TinySDF`](https://github.com/mapbox/tiny-sdf) which implements the `sdf` algorithm.
* `radius` (number): How many pixels around the glyph shape to use for encoding distance. Default is `12`. Bigger radius yields higher quality outcome. Only applies when `sdf: true`.
* `cutoff` (number): How much of the radius (relative) is used for the inside part the glyph. Default is `0.25`. Bigger `cutoff` makes character thinner. Smaller `cutoff` makes character look thicker. Only applies when `sdf: true`.
* `smoothing` (number): How much smoothing to apply to the text edges. Default `0.1`. Only applies when `sdf: true`.

#### `wordBreak` (string, optional) {#wordbreak}

* Default: `break-word`

Available options are `break-all` and `break-word`. A valid `maxWidth` has to be provided to use `wordBreak`.

#### `maxWidth` (number, optional) {#maxwidth}

* Default: `-1`

A unitless number that will be multiplied with the current text size to set the width limit of a string. If specified, when the text is longer than the width limit, it will be wrapped into multiple lines using the strategy of `wordBreak`.

For example, `maxWidth: 10.0` used with `getSize: 12` is roughly the equivalent of `max-width: 120px` in CSS.

#### `outlineWidth` (number, optional) {#outlinewidth}

* Default: `0`

Width of outline around the text, relative to the font size. Only effective if `fontSettings.sdf` is `true`.

#### `outlineColor` (Color, optional) {#outlinecolor}

* Default: `[0, 0, 0, 255]`

Color of outline around the text, in `[r, g, b, [a]]`. Each channel is a number between 0-255 and `a` is 255 if not supplied.


### Data Accessors

#### `getText` ([Accessor&lt;string&gt;](../../developer-guide/using-layers.md#accessors), optional) {#gettext}

* Default: `x => x.text`

Method called to retrieve the content of each text label.

#### `getPosition` ([Accessor&lt;Position&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getposition}

* Default: `x => x.position`

Method called to retrieve the location of each text label.


#### `getSize` ([Accessor&lt;number&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getsize}

* Default: `32`

The font size of each text label, in units specified by `sizeUnits` (default pixels).

* If a number is provided, it is used as the size for all objects.
* If a function is provided, it is called on each object to retrieve its size.


#### `getColor` ([Accessor&lt;Color&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getcolor}

* Default: `[0, 0, 0, 255]`

The rgba color is in the format of `[r, g, b, [a]]`. Each channel is a number between 0-255 and `a` is 255 if not supplied.

* If an array is provided, it is used as the color for all objects.
* If a function is provided, it is called on each object to retrieve its color.


#### `getAngle` ([Accessor&lt;number&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getangle}

* Default: `0`

The rotating angle of each text label, in degrees.

* If a number is provided, it is used as the angle for all objects.
* If a function is provided, it is called on each object to retrieve its angle.


#### `getTextAnchor` ([Accessor&lt;string&gt;](../../developer-guide/using-layers.md#accessors), optional) {#gettextanchor}

* Default: `'middle'`

The text anchor. Available options include `'start'`, `'middle'` and `'end'`.

* If a string is provided, it is used as the text anchor for all objects.
* If a function is provided, it is called on each object to retrieve its text anchor.


#### `getAlignmentBaseline` ([Accessor&lt;string&gt;](../../developer-guide/using-layers.md#accessors), optional) {#getalignmentbaseline}

* Default: `'center'`

The alignment baseline. Available options include `'top'`, `'center'` and `'bottom'`.

* If a string is provided, it is used as the alignment baseline for all objects.
* If a function is provided, it is called on each object to retrieve its alignment baseline.


#### `getPixelOffset` ([Accessor&lt;number[2]&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getpixeloffset}

* Default: `[0, 0]`

Screen space offset relative to the `coordinates` in pixel unit.

* If an array is provided, it is used as the offset for all objects.
* If a function is provided, it is called on each object to retrieve its offset.


#### `getBackgroundColor` ([Accessor&lt;Color&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getbackgroundcolor}

* Default: `[255, 255, 255, 255]`

The background color. Only effective if `background: true`.

The rgba color is in the format of `[r, g, b, [a]]`. Each channel is a number between 0-255 and `a` is 255 if not supplied.

* If an array is provided, it is used as the background color for all objects.
* If a function is provided, it is called on each object to retrieve its background color.

#### `getBorderColor` ([Accessor&lt;Color&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getbordercolor}

* Default: `[0, 0, 0, 255]`

The border color of the background. Only effective if `background: true`.

The rgba color is in the format of `[r, g, b, [a]]`. Each channel is a number between 0-255 and `a` is 255 if not supplied.

* If an array is provided, it is used as the border color for all objects.
* If a function is provided, it is called on each object to retrieve its border color.


#### `getBorderWidth` ([Accessor&lt;number&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getborderwidth}

* Default: `0`

The border thickness of each text label, in pixels. Only effective if `background: true`.

* If a number is provided, it is used as the border thickness for all objects.
* If a function is provided, it is called on each object to retrieve its border thickness.


## Sub Layers

The TextLayer renders the following sublayers:

* `characters` - an `IconLayer` rendering all the characters.
* `background` - the background for each text block, if `background: true`.


## Use binary attributes

This section is about the special requirements when [supplying attributes directly](../../developer-guide/performance.md#supply-attributes-directly) to a `TextLayer`.

Because each text string has a different number of characters, when `data.attributes.getText` is supplied, the layer also requires an array `data.startIndices` that describes the character index at the start of each text object. For example, if there are 3 text objects of 2, 3, and 4 characters each, `startIndices` should be `[0, 2, 5, 9]`.

Additionally, all other attributes (`getColor`, `getWidth`, etc.), if supplied, must contain the same layout (number of characters) as the `getText` buffer.

Example use case:

```ts title="Use plain JSON array"
const TEXT_DATA = [
  {
    text: 'Hello',
    position: [-122.4, 37.7],
    color: [255, 0, 0]
  },
  {
    text: 'World',
    position: [-122.5, 37.8],
    color: [0, 0, 255]
  },
  // ...
];

new TextLayer({
  data: TEXT_DATA,
  getText: d => d.text,
  getPosition: d => d.position,
  getColor: d => d.color
})
```

The equivalent binary attributes would be:

```ts title="Use binary attributes"
// USE BINARY
// Flatten the text by converting to unicode value
// Non-Latin characters may require Uint16Array
// [72, 101, 108, 108, 111, ...]
const texts = new Uint8Array(TEXT_DATA.map(d => Array.from(d.text).map(char => char.charCodeAt(0))).flat());
// The position attribute must supply one position for each character
// [-122.4, 37.7, -122.4, 37.7, -122.4, 37.7, ...]
const positions = new Float64Array(TEXT_DATA.map(d => Array.from(d.text).map(_ => d.position)).flat(2));
// The color attribute must supply one color for each character
// [255, 0, 0, 255, 0, 0, 255, 0, 0, ...]
const colors = new Uint8Array(TEXT_DATA.map(d => Array.from(d.text).map(_ => d.color)).flat(2));

// The "layout" that tells TextLayer where each string starts
const startIndices = new Uint16Array(TEXT_DATA.reduce((acc, d) => {
  const lastIndex = acc[acc.length - 1];
  acc.push(lastIndex + d.text.length);
  return acc;
}, [0]));

new TextLayer({
  data: {
    length: TEXT_DATA.length,
    startIndices: startIndices, // this is required to render the texts correctly!
    attributes: {
      getText: {value: texts},
      getPosition: {value: positions, size: 2},
      getColor: {value: colors, size: 3}
    }
  }
})
```

### Use binary attributes with background

To use `background: true` with binary data, the background attributes must be supplied separately via `data.attributes.background`. Each attribute is packed with *one vertex* per object.

`data.attributes.background` may contain the following keys:

- `getPosition`: corresponds to the `getPosition` accessor
- `getAngle`: corresponds to the `getAngle` accessor
- `getSize`: corresponds to the `getSize` accessor
- `getPixelOffset`: corresponds to the `getPixelOffset` accessor
- `getFillColor`: corresponds to the `getBackgroundColor` accessor
- `getLineColor`: corresponds to the `getBorderColor` accessor
- `getLineWidth`: corresponds to the `getBorderWidth` accessor

Following the above example, additional attributes are required to render the background:

```ts
// The background position attribute supplies one position for each text block
const backgroundPositions = new Float64Array(TEXT_DATA.map(d => d.position).flat());
// The background color attribute supplies one color for each text block
const backgroundColors = new Uint8Array(TEXT_DATA.map(d => d.bgColor).flat());

new TextLayer({
  data: {
    length: TEXT_DATA.length,
    startIndices: startIndices, // this is required to render the texts correctly!
    attributes: {
      getText: {value: texts},
      getPosition: {value: positions, size: 2},
      getColor: {value: colors, size: 3},
      background: {
        getPosition: {value: backgroundPosition, size: 2},
        getFillColor: {value: backgroundColors, size: 3}
      }
    }
  },
  background: true
})
```


## Remarks

### Use web fonts

The `TextLayer` creates a font texture when it is first added with the [fillText](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillText) API. If the font specified by `fontFamily` is not loaded at this point, it will fall back to using the default font just like regular CSS behavior. The loading sequence may become an issue when a web font is used, due to [lazy loading](https://developer.mozilla.org/en-US/docs/Web/Performance/Lazy_loading#fonts).

One way to force a web font to load before the script execution is to preload the font resource:

```html
<link rel="preload" href="https://fonts.gstatic.com/s/materialicons/v90/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2" as="font" crossorigin="anonymous" type="font/woff2" />
<style>
  @font-face {
    font-family: 'Material Icons';
    font-style: normal;
    font-weight: 400;
    src: url(https://fonts.gstatic.com/s/materialicons/v90/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2) format('woff2');
  }
</style>
```

Another way is to use the [FontFace](https://developer.mozilla.org/en-US/docs/Web/API/FontFace/FontFace) API to load a web font before adding the `TextLayer`:

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck} from '@deck.gl/core';
import {TextLayer} from '@deck.gl/layers';

const deckInstance = new Deck({...});
renderLayers();

async function renderLayers() {
  const font = new FontFace('Material Icons', 'url(https://fonts.gstatic.com/s/materialicons/v90/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2)');
  // wait for font to be loaded
  await font.load();
  // add font to document
  document.fonts.add(font);
  // add TextLayer
  const textLayer = new TextLayer({
    fontFamily: 'Material Icons',
    // ...
  });
  deckInstance.setProps({
    layers: [textLayer]
  });
}
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React, {useState, useEffect} from 'react';
import DeckGL from '@deck.gl/react';
import {TextLayer} from '@deck.gl/layers';

function App() {
  const [fontLoaded, setFontLoaded] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const font = new FontFace('Material Icons', 'url(https://fonts.gstatic.com/s/materialicons/v90/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2)');
      // wait for font to be loaded
      await font.load();
      // add font to document
      document.fonts.add(font);
      setFontLoaded(true);
    })();
  }, []);

  const textLayer = fontLoaded && new TextLayer({
    fontFamily: 'Material Icons',
    // ...
  });

  return <DeckGL
    // ...
    layers={[textLayer]}
  />;
}
```

  </TabItem>
</Tabs>


### Unicode support

The TextLayer has full support for Unicode characters. To reference a Unicode character in JavaScript you can either use a string literal (`'日本語'`, `'©'`) or [escaped code point](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#unicode_code_point_escapes) (`'\u{1F436}'`).

At the moment this layer doesn't render multi-color emojis.

### Font Atlas Cache Limit

To conserve memory, DeckGL caches the most 3 used `fontAtlas` by default. Creating a `fontAtlas` is a CPU intesive operation specially if `fontSettings.sdf` is set to `true`. 
If you are using much more than 3 fonts, you might experience perforamnce hits because DeckGL constantly tries to evict the least most used `fontAtlas` from cache and recreate them when needed.

To mitigate the potential performance degradation, you can override the `fontAtlas` default cache limit by setting `TextLayer.fontAtlasCacheLimit` value:

```ts
import {TextLayer} from '@deck.gl/layers';

TextLayer.fontAtlasCacheLimit = 10;

// ... rest of the application
```

It is recommended to set `fontAtlasCacheLimit` once in your application since it recreates the cache which removes existing cached `fontAtlas`.

## Source

[modules/layers/src/text-layer](https://github.com/visgl/deck.gl/tree/master/modules/layers/src/text-layer)
