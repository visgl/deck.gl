<!-- INJECT:"TextLayerDemo" -->

<p class="badges">
  <img src="https://img.shields.io/badge/@deck.gl/layers-lightgrey.svg?style=flat-square" alt="@deck.gl/layers" />
</p>

# TextLayer

The text layer renders text labels on the map using texture mapping. This Layer is extended based on [Icon Layer](/docs/layers/icon-layer.md) and wrapped using [Composite Layer](/docs/api-reference/composite-layer.md).

Auto pack required `characterSet` into a shared texture `fontAtlas`.

TextLayer is a [CompositeLayer](/docs/api-reference/composite-layer.md).


```js
import DeckGL from '@deck.gl/react';
import {TextLayer} from '@deck.gl/layers';

const App = ({data, viewport}) => {
  /**
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
    getAlignmentBaseline: 'center',
    onHover: ({object, x, y}) => {
      const tooltip = `${object.name}\n${object.address}`;
      /* Update tooltip
         http://deck.gl/#/documentation/developer-guide/adding-interactivity?section=example-display-a-tooltip-for-hovered-object
      */
    }
  });

  return <DeckGL {...viewport} layers={[layer]} />;
};
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
<script src="https://unpkg.com/deck.gl@^7.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^7.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^7.0.0/dist.min.js"></script>
```

```js
new deck.TextLayer({});
```

## Properties

Inherits from all [Base Layer](/docs/api-reference/layer.md) and [CompositeLayer](/docs/api-reference/composite-layer.md) properties.

### Rendering Options

##### `sizeScale` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: 1

Text size multiplier.

##### `sizeUnits` (String, optional)

* Default: `pixels` 

The units of the size specified by `getSize`, one of `'meters'`, `'pixels'`. When zooming in and out, meter sizes scale with the base map, and pixel sizes remain the same on screen.

##### `sizeMinPixels` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `0`

The minimum size in pixels.

##### `sizeMaxPixels` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `Number.MAX_SAFE_INTEGER`

The maximum size in pixels.

##### `billboard` (Boolean, optional)

- Default: `true`

If on, the text always faces camera. Otherwise the text faces up (z).

##### `fontFamily` (String, optional)

* Default: `'Monaco, monospace'`

Specifies a prioritized list of one or more font family names and/or generic family names. Follow the specs for CSS [font-family](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family).

##### `characterSet` (Array | String, optional)

Specifies a list of characters to include in the font. By default, only characters in the Ascii code range 32-128 are included. Use this prop if you need to display special characters.

##### `fontWeight` (Number | String, optional)

* Default: `normal`.

css `font-weight`.

##### `lineHeight` (Number, optional)

* Default: 1.0.

A unitless number that will be multiplied with the current font-size to set the line height.

##### `fontSettings` (Object, optional)

Advance options for fine tuning the appearance and performance of the generated shared `fontAtlas`.

Options:

* `fontSize` (Number): Font size in pixels. Default is `64`. This option is only applied for generating `fontAtlas`, it does not impact the size of displayed text labels. Larger `fontSize` will give you a sharper look when rendering text labels with very large font sizes. But larger `fontSize` requires more time and space to generate the `fontAtlas`.
* `buffer` (Number): Whitespace buffer around each side of the character. Default is `2`. In general, bigger `fontSize` requires bigger `buffer`. Increase `buffer` will add more space between each character when layout `characterSet` in `fontAtlas`. This option could be tuned to provide sufficient space for drawing each character and avoiding overlapping of neighboring characters. But the cost of bigger `buffer` is more time and space to generate `fontAtlas`.
* `sdf` (Boolean): Flag to enable / disable `sdf`. Default is `false`. [`sdf` (Signed Distance Fields)](http://cs.brown.edu/people/pfelzens/papers/dt-final.pdf) will provide a sharper look when rendering with very large or small font sizes. `TextLayer` integrates with [`TinySDF`](https://github.com/mapbox/tiny-sdf) which implements the `sdf` algorithm.
* `radius` (Number): How many pixels around the glyph shape to use for encoding distance. Default is `3`. Bigger radius can have more halo effect.
* `cutoff` (Number): How much of the radius (relative) is used for the inside part the glyph. Default is `0.25`. Bigger `cutoff` makes character thinner. Smaller `cutoff` makes character look thicker.

`radius` and `cutoff` will be applied only when `sdf` enabled.

### Data Accessors

##### `getText` ([Function](/docs/developer-guide/using-layers.md#accessors), optional)

* Default: `x => x.text`

Method called to retrieve the content of each text label.

##### `getPosition` ([Function](/docs/developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `x => x.position || x.coordinates`

Method called to retrieve the location of each text label.


##### `getSize` ([Function](/docs/developer-guide/using-layers.md#accessors)|Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `32`

The font size of each text label, in units specified by `sizeUnits` (default pixels).

* If a number is provided, it is used as the size for all objects.
* If a function is provided, it is called on each object to retrieve its size.


##### `getColor` ([Function](/docs/developer-guide/using-layers.md#accessors)|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `[0, 0, 0, 255]`

The rgba color of each text label, in `r, g, b, [a]`. Each component is in the 0-255 range.

* If an array is provided, it is used as the color for all objects.
* If a function is provided, it is called on each object to retrieve its color.


##### `getAngle` ([Function](/docs/developer-guide/using-layers.md#accessors)|Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `0`

The rotating angle of each text label, in degrees.

* If a number is provided, it is used as the angle for all objects.
* If a function is provided, it is called on each object to retrieve its angle.

### Text Alignment Options

##### `getTextAnchor` ([Function](/docs/developer-guide/using-layers.md#accessors)|String, optional)

* Default: `x => x.textAnchor || 'middle'`

The text anchor. Available options include `'start'`, `'middle'` and `'end'`.

* If a string is provided, it is used as the text anchor for all objects.
* If a function is provided, it is called on each object to retrieve its text anchor.


##### `getAlignmentBaseline` ([Function](/docs/developer-guide/using-layers.md#accessors)|String, optional)

* Default: `x => x.alignmentBaseline || 'center'`

The alignment baseline. Available options include `'top'`, `'center'` and `'bottom'`.

* If a string is provided, it is used as the alignment baseline for all objects.
* If a function is provided, it is called on each object to retrieve its alignment baseline.


##### `getPixelOffset` ([Function](/docs/developer-guide/using-layers.md#accessors)|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `x.pixelOffset || [0, 0]`

Screen space offset relative to the `coordinates` in pixel unit.

* If an array is provided, it is used as the offset for all objects.
* If a function is provided, it is called on each object to retrieve its offset.


## Sub Layers

The TextLayer renders the following sublayers:

* `characters` - an `IconLayer` rendering all the characters.


## Source

[modules/layers/src/text-layer](https://github.com/uber/deck.gl/tree/master/modules/layers/src/text-layer)
