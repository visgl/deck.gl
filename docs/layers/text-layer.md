<!-- INJECT:"TextLayerDemo" -->

<p class="badges">
  <img src="https://img.shields.io/badge/64--bit-support-blue.svg?style=flat-square" alt="64-bit" />
</p>

# Text Layer

The text layer renders text labels on the map using texture mapping. This Layer is extended based on [Icon Layer](/docs/layers/icon-layer.md) and wrapped using [Composite Layer](/docs/api-reference/composite-layer.md).

```js
import DeckGL from 'deck.gl';
import TextLayer from './text-layer';

const App = ({data, viewport}) => {
  /**
   * Data format:
   * [
   *   {name: 'Colma (COLM)', address: '365 D Street, Colma CA 94014', coordinates: [-122.466233, 37.684638]},
   *   ...
   * ]
   */

  const layers = [
    new TextLayer({
      id: 'text-layer',
      data,
      pickable: true,
      sizeScale: 32,
      getPosition: d => d.coordinates,
      getText: d => d.name,
      getSize: d => 1,
      onHover: ({object}) => setTooltip(`${object.name}\n${object.address}`)
    })
  ];

  return <DeckGL {...viewport} layers={[layer]} />;
};
```

## Properties

### Data Accessors

##### `getText` (Function, optional)

* Default: `x => x.text`

Method called to retrieve the content of each text label.

##### `getPosition` (Function, optional)

* Default: `x => x.position || x.coordinates`

Method called to retrieve the location of each text label.

### Rendering Options

##### `getSize` (Function, optional)

* Default: `x => x.size || 32`

Method called to retrieve the size of each text label. Default value is 32 in pixel.

##### `getColor` (Function, optional)

* Default: `x => x.color || [0, 0, 0, 255]`

Method called to retrieve the color of each text label. Default value is black.

##### `getAngle` (Function, optional)

* Default: `x => x.angle || 0`

Method called to retrieve the angle to rotate (CCW) of each text label. Default value is 0.

##### `sizeScale` (Number, optional)

* Default: 1

Text size multiplier.

##### `fp64` (Boolean, optional)

* Default: `false`

Whether the layer should be rendered in high-precision 64-bit mode.

##### `fontFamily` (String, optional)

* Default: `'Monaco, monospace'`

Specifies a prioritized list of one or more font family names and/or generic family names. Follow the specs for CSS [font-family](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family).

##### `characterSet` (Array | String, optional)

Specifies a list of characters to include in the font. By default, only characters in the Ascii code range 32-128 are included. Use this prop if you need to display special characters.

### Text Alignment Options

##### `getTextAnchor` (Function, optional)

* Default: `x => x.textAnchor || 'middle'`

Method called to specify the text anchor. Available options include `'start'`, `'middle'` and `'end'`.

##### `getAlignmentBaseline` (Function, optional)

* Default: `x => x.alignmentBaseline || 'center'`

Method called to specify the alignment baseline. Available options include `'top'`, `'center'` and `'bottom'`.

##### `getPixelOffset` (Function, optional)

* Default: `x.pixelOffset || [0, 0]`

Method called to specify screen space offset relative to the `coordinates` in pixel unit. This function is rarely used in common cases.


## Source

[modules/core/src/core-layers/text-layer](https://github.com/uber/deck.gl/tree/5.2-release/modules/core/src/core-layers/text-layer)


