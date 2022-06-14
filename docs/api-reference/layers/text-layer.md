import {TextLayerDemo} from 'website-components/doc-demos/layers';

<TextLayerDemo />

# TextLayer

The text layer renders text labels on the map using texture mapping. This Layer is extended based on [Icon Layer](/docs/api-reference/layers/icon-layer.md) and wrapped using [Composite Layer](/docs/api-reference/core/composite-layer.md).

Auto pack required `characterSet` into a shared texture `fontAtlas`.

TextLayer is a [CompositeLayer](/docs/api-reference/core/composite-layer.md).


```js
import DeckGL from '@deck.gl/react';
import {TextLayer} from '@deck.gl/layers';

function App({data, viewState}) {  /**
   * Data format:
   * [
   *   {name: 'Colma (COLM)', address: '365 D Street, Colma CA 94014', coordinates: [-122.466233, 37.684638]},
   *   ...
   * ]
   */

  const layer = new TextLayer({
    id: 'text-layer',
    data,
    pickable: true,
    getPosition: d => d.coordinates,
    getText: d => d.name,
    getSize: 32,
    getAngle: 0,
    getTextAnchor: 'middle',
    getAlignmentBaseline: 'center'
  });

  return <DeckGL viewState={viewState}
    layers={[layer]}
    getTooltip={({object}) => object && `${object.name}\n${object.address}`} />;
}
```


## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers
```

```js
import {TextLayer} from '@deck.gl/layers';
new TextLayer({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^8.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^8.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^8.0.0/dist.min.js"></script>
```

```js
new deck.TextLayer({});
```

## Properties

Inherits from all [Base Layer](/docs/api-reference/core/layer.md) and [CompositeLayer](/docs/api-reference/core/composite-layer.md) properties.

### Rendering Options

##### `sizeScale` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: 1

Text size multiplier.

##### `sizeUnits` (String, optional)

* Default: `pixels`

The units of the size, one of `'meters'`, `'common'`, and `'pixels'`. See [unit system](/docs/developer-guide/coordinate-systems.md#supported-units).

##### `sizeMinPixels` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `0`

The minimum size in pixels. When using non-pixel `sizeUnits`, this prop can be used to prevent the icon from getting too small when zoomed out.

##### `sizeMaxPixels` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `Number.MAX_SAFE_INTEGER`

The maximum size in pixels. When using non-pixel `sizeUnits`, this prop can be used to prevent the icon from getting too big when zoomed in.

##### `billboard` (Boolean, optional)

- Default: `true`

If `true`, the text always faces camera. Otherwise the text faces up (z).

##### `background` (Boolean, optional)

- Default `false`

Whether to render background for the text blocks.

##### `backgroundPadding` (Array, optional)

- Default `[0, 0, 0, 0]`

The padding of the background, an array of either 2 or 4 numbers.

+ If an array of 2 is supplied, it is interpreted as `[padding_x, padding_y]` in pixels.
+ If an array of 4 is supplied, it is interpreted as `[padding_left, padding_top, padding_right, padding_bottom]` in pixels.

##### `fontFamily` (String, optional)

* Default: `'Monaco, monospace'`

Specifies a prioritized list of one or more font family names and/or generic family names. Follow the specs for CSS [font-family](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family).

See the [remarks](#remarks) section below for tips on using web fonts.

##### `characterSet` (Array | Set | String, optional)

* Default: ASCII characters 32-128

Specifies a list of characters to include in the font.

- If set to `'auto'`, automatically detects the characters used in the data. This option has a performance overhead and may cause the layer to take longer to load if the data is very large.
- If set to an array or set of characters, the generated font will be limited to these characters. If you already know all the characters that are needed (e.g. numbers, latin alphabet), using this option provides better performance. If a character outside of the specified range is referenced by `getText`, a warning will be logged to the JavaScript console.

Note that there is a limit to the number of unique characters supported by a single layer. The maximum number subjects to `fontSettings.fontSize` and the [MAX_TEXTURE_SIZE](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices#understand_system_limits) of the device/browser.

##### `fontWeight` (Number | String, optional)

* Default: `normal`.

css `font-weight`.

##### `lineHeight` (Number, optional)

* Default: `1.0`.

A unitless number that will be multiplied with the current font size to set the line height.

##### `fontSettings` (Object, optional)

Advance options for fine tuning the appearance and performance of the generated shared `fontAtlas`.

Options:

* `fontSize` (Number): Font size in pixels. Default is `64`. This option is only applied for generating `fontAtlas`, it does not impact the size of displayed text labels. Larger `fontSize` will give you a sharper look when rendering text labels with very large font sizes. But larger `fontSize` requires more time and space to generate the `fontAtlas`.
* `buffer` (Number): Whitespace buffer around each side of the character. Default is `4`. In general, bigger `fontSize` requires bigger `buffer`. Increase `buffer` will add more space between each character when layout `characterSet` in `fontAtlas`. This option could be tuned to provide sufficient space for drawing each character and avoiding overlapping of neighboring characters.
* `sdf` (Boolean): Flag to enable / disable `sdf`. Default is `false`. [`sdf` (Signed Distance Fields)](http://cs.brown.edu/people/pfelzens/papers/dt-final.pdf) will provide a sharper look when rendering with very large or small font sizes. `TextLayer` integrates with [`TinySDF`](https://github.com/mapbox/tiny-sdf) which implements the `sdf` algorithm.
* `radius` (Number): How many pixels around the glyph shape to use for encoding distance. Default is `12`. Bigger radius yields higher quality outcome. Only applies when `sdf: true`.
* `cutoff` (Number): How much of the radius (relative) is used for the inside part the glyph. Default is `0.25`. Bigger `cutoff` makes character thinner. Smaller `cutoff` makes character look thicker. Only applies when `sdf: true`.
* `smoothing` (Number): How much smoothing to apply to the text edges. Default `0.1`. Only applies when `sdf: true`.

##### `wordBreak` (String, optional)

* Default: `break-word`

Available options are `break-all` and `break-word`. A valid `maxWidth` has to be provided to use `wordBreak`.

##### `maxWidth` (Number, optional)

* Default: `-1`

`maxWidth` is used together with `break-word` for wrapping text. The value of `maxWidth` specifies the width limit to break the text into multiple lines.

##### `outlineWidth` (Number, optional)

* Default: `0`

Width of outline around the text, relative to the font size. Only effective if `fontSettings.sdf` is `true`.

##### `outlineColor` (Array, optional)

* Default: `[0, 0, 0, 255]`

Color of outline around the text, in `[r, g, b, [a]]`. Each channel is a number between 0-255 and `a` is 255 if not supplied.


### Data Accessors

##### `getText` ([Function](/docs/developer-guide/using-layers.md#accessors), optional)

* Default: `x => x.text`

Method called to retrieve the content of each text label.

##### `getPosition` ([Function](/docs/developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `x => x.position`

Method called to retrieve the location of each text label.


##### `getSize` ([Function](/docs/developer-guide/using-layers.md#accessors)|Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `32`

The font size of each text label, in units specified by `sizeUnits` (default pixels).

* If a number is provided, it is used as the size for all objects.
* If a function is provided, it is called on each object to retrieve its size.


##### `getColor` ([Function](/docs/developer-guide/using-layers.md#accessors)|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `[0, 0, 0, 255]`

The rgba color is in the format of `[r, g, b, [a]]`. Each channel is a number between 0-255 and `a` is 255 if not supplied.

* If an array is provided, it is used as the color for all objects.
* If a function is provided, it is called on each object to retrieve its color.


##### `getAngle` ([Function](/docs/developer-guide/using-layers.md#accessors)|Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `0`

The rotating angle of each text label, in degrees.

* If a number is provided, it is used as the angle for all objects.
* If a function is provided, it is called on each object to retrieve its angle.


##### `getTextAnchor` ([Function](/docs/developer-guide/using-layers.md#accessors)|String, optional)

* Default: `'middle'`

The text anchor. Available options include `'start'`, `'middle'` and `'end'`.

* If a string is provided, it is used as the text anchor for all objects.
* If a function is provided, it is called on each object to retrieve its text anchor.


##### `getAlignmentBaseline` ([Function](/docs/developer-guide/using-layers.md#accessors)|String, optional)

* Default: `'center'`

The alignment baseline. Available options include `'top'`, `'center'` and `'bottom'`.

* If a string is provided, it is used as the alignment baseline for all objects.
* If a function is provided, it is called on each object to retrieve its alignment baseline.


##### `getPixelOffset` ([Function](/docs/developer-guide/using-layers.md#accessors)|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `[0, 0]`

Screen space offset relative to the `coordinates` in pixel unit.

* If an array is provided, it is used as the offset for all objects.
* If a function is provided, it is called on each object to retrieve its offset.


##### `getBackgroundColor` ([Function](/docs/developer-guide/using-layers.md#accessors)|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `[255, 255, 255, 255]`

The background color. Only effective if `background: true`.

The rgba color is in the format of `[r, g, b, [a]]`. Each channel is a number between 0-255 and `a` is 255 if not supplied.

* If an array is provided, it is used as the background color for all objects.
* If a function is provided, it is called on each object to retrieve its background color.

##### `getBorderColor` ([Function](/docs/developer-guide/using-layers.md#accessors)|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `[0, 0, 0, 255]`

The border color of the background. Only effective if `background: true`.

The rgba color is in the format of `[r, g, b, [a]]`. Each channel is a number between 0-255 and `a` is 255 if not supplied.

* If an array is provided, it is used as the border color for all objects.
* If a function is provided, it is called on each object to retrieve its border color.


##### `getBorderWidth` ([Function](/docs/developer-guide/using-layers.md#accessors)|Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `0`

The border thickness of each text label, in pixels. Only effective if `background: true`.

* If a number is provided, it is used as the border thickness for all objects.
* If a function is provided, it is called on each object to retrieve its border thickness.


## Sub Layers

The TextLayer renders the following sublayers:

* `characters` - an `IconLayer` rendering all the characters.
* `background` - the background for each text block, if `background: true`.


## Use binary attributes

This section is about the special requirements when [supplying attributes directly](/docs/developer-guide/performance.md#supply-attributes-directly) to a `TextLayer`.

Because each text string has a different number of characters, when `data.attributes.getText` is supplied, the layer also requires an array `data.startIndices` that describes the character index at the start of each text object. For example, if there are 3 text objects of 2, 3, and 4 characters each, `startIndices` should be `[0, 2, 5, 9]`.

Additionally, all other attributes (`getColor`, `getWidth`, etc.), if supplied, must contain the same layout (number of characters) as the `getText` buffer.

Example use case:

```js
// USE PLAIN JSON OBJECTS
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
  }
  ...
];

new TextLayer({
  data: TEXT_DATA,
  getText: d => d.text,
  getPosition: d => d.position,
  getColor: d => d.color
})
```

Convert to using binary attributes:

```js
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

```js
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
```

```css
@font-face {
  font-family: 'Material Icons';
  font-style: normal;
  font-weight: 400;
  src: url(https://fonts.gstatic.com/s/materialicons/v90/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2) format('woff2');
}
```

Another way is to use the [FontFace](https://developer.mozilla.org/en-US/docs/Web/API/FontFace/FontFace) API to load a web font before adding the `TextLayer`:

```js
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
  deck.setProps({
    layers: [textLayer]
  });
}
```

### Unicode support

The TextLayer has full support for Unicode characters. To reference a Unicode character in JavaScript you can either use a string literal (`'日本語'`, `'©'`) or [escaped code point](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#unicode_code_point_escapes) (`'\u{1F436}'`).

At the moment this layer doesn't render multi-color emojis.

### Font Atlas Cache Limit

To conserve memory, DeckGL caches the most 3 used `fontAtlas` by default. Creating a `fontAtlas` is a CPU intesive operation specially if `fontSettings.sdf` is set to `true`. 
If you are using much more than 3 fonts, you might experience perforamnce hits because DeckGL constantly tries to evict the least most used `fontAtlas` from cache and recreate them when needed.

To mitigate the potential performance degradation, you can override the `fontAtlas` default cache limit by setting `TextLayer.fontAtlasCacheLimit` value:

```js
import {TextLayer} from '@deck.gl/layers';

TextLayer.fontAtlasCacheLimit = 10;

// ... rest of the application
```

It is recommended to set `fontAtlasCacheLimit` once in your application since it recreates the cache which removes existing cached `fontAtals`.

## Source

[modules/layers/src/text-layer](https://github.com/visgl/deck.gl/tree/master/modules/layers/src/text-layer)
