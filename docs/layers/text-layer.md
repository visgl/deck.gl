<!-- INJECT:"TextLayerDemo" -->

<p class="badges">
  <img src="https://img.shields.io/badge/64--bit-support-blue.svg?style=flat-square" alt="64-bit" />
</p>

# TextLayer

The text layer renders text labels on the map using texture mapping. This Layer is extended based on [Icon Layer](/docs/layers/icon-layer.md) and wrapped using [Composite Layer](/docs/api-reference/composite-layer.md).

Auto pack required `characterSet` into a shared texture `fontAtlas`.

TextLayer is a [CompositeLayer](/docs/api-reference/composite-layer.md).


## Example

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

## Example: rendering with sdf (Signed Distance Fields)

You may consider using [`sdf` (Signed Distance Fields)](http://cs.brown.edu/people/pfelzens/papers/dt-final.pdf)
option when rendering with very large or small font sizes, which will provide a sharper look. `TextLayer` integrates 
with [`TinySDF`](https://github.com/mapbox/tiny-sdf) which implements the `sdf` algorithm. You can enable `sdf` by 
setting `sdf` to true or pass customized options, which will be used in `TinySDF`.

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

  const layer = new TextLayer({
    id: 'text-layer',
    data,
   
   // sdf object will be used to construct `TinySDF` instance
   // https://github.com/mapbox/tiny-sdf
    sdf: {
      fontSize: 64,
      buffer: 1,
      radius: 3,
      cutoff: 0.25,
      fontWeight: 'normal'
    },

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

## Properties

Inherits from all [Base Layer](/docs/api-reference/layer.md) and [CompositeLayer](/docs/api-reference/composite-layer.md) properties.

### Rendering Options

##### `sizeScale` (Number, optional)

* Default: 1

Text size multiplier.

##### `fp64` (Boolean, optional)

* Default: `false`

Whether the layer should be rendered in high-precision 64-bit mode. Note that since deck.gl v6.1, the default 32-bit projection uses a hybrid mode that matches 64-bit precision with significantly better performance.

##### `fontFamily` (String, optional)

* Default: `'Monaco, monospace'`

Specifies a prioritized list of one or more font family names and/or generic family names. Follow the specs for CSS [font-family](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family).

##### `characterSet` (Array | String, optional)

Specifies a list of characters to include in the font. By default, only characters in the Ascii code range 32-128 are included. Use this prop if you need to display special characters.

##### `sdf` (Boolean | Object, optional)

* Default: `false`

To use [`sdf` (Signed Distance Fields)](http://cs.brown.edu/people/pfelzens/papers/dt-final.pdf) to 
generate font, set `sdf` to be true or use customized parameters. The parameters will be used in constructing
[`TinySDF`](https://github.com/mapbox/tiny-sdf) instance.  

Default `sdf` preset is

```js
{
 fontSize: 64,
 buffer: 2,
 radius: 3,
 cutoff: 0.25,
 
 fontFamily: props.fontFamily, // from layer property 
 fontWeight: 'normal'
}
```

### Data Accessors

##### `getText` (Function, optional)

* Default: `x => x.text`

Method called to retrieve the content of each text label.

##### `getPosition` (Function, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `x => x.position || x.coordinates`

Method called to retrieve the location of each text label.


##### `getSize` (Function|Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `32`

The font size of each text label, in pixels.

* If a number is provided, it is used as the size for all objects.
* If a function is provided, it is called on each object to retrieve its size.


##### `getColor` (Function|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `[0, 0, 0, 255]`

The rgba color of each text label, in `r, g, b, [a]`. Each component is in the 0-255 range.

* If an array is provided, it is used as the color for all objects.
* If a function is provided, it is called on each object to retrieve its color.


##### `getAngle` (Function|Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `0`

The rotating angle of each text label, in degrees.

* If a number is provided, it is used as the angle for all objects.
* If a function is provided, it is called on each object to retrieve its angle.

### Text Alignment Options

##### `getTextAnchor` (Function|String, optional)

* Default: `x => x.textAnchor || 'middle'`

The text anchor. Available options include `'start'`, `'middle'` and `'end'`.

* If a string is provided, it is used as the text anchor for all objects.
* If a function is provided, it is called on each object to retrieve its text anchor.


##### `getAlignmentBaseline` (Function|String, optional)

* Default: `x => x.alignmentBaseline || 'center'`

The alignment baseline. Available options include `'top'`, `'center'` and `'bottom'`.

* If a string is provided, it is used as the alignment baseline for all objects.
* If a function is provided, it is called on each object to retrieve its alignment baseline.


##### `getPixelOffset` (Function|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `x.pixelOffset || [0, 0]`

Screen space offset relative to the `coordinates` in pixel unit.

* If an array is provided, it is used as the offset for all objects.
* If a function is provided, it is called on each object to retrieve its offset.


## Sub Layers

The TextLayer renders the following sublayers:

* `characters` - a `MultiIconLayer` rendering all the characters.


## Source

[modules/layers/src/text-layer](https://github.com/uber/deck.gl/tree/master/modules/layers/src/text-layer)
