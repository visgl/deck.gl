# Advanced Text Layer

### About

The advanced text layer renders text labels on the map using distance field fonts. This Layer is extended based on [Icon Layer](/docs/layers/icon-layer.md) and wrapped using [Composite Layer](/docs/api-reference/composite-layer.md).
This layer will (eventually) replace the text layer.

### Example

```js

import DeckGL from 'deck.gl';
import AdvancedTextLayer from './text-layer';

const App = ({data, viewport}) => {

  /**
   * Data format:
   * [
   *   {text: '#San Francisco', coordinates: [-122.425586, 37.775049]},
   *   ...
   * ]
   */

  const layers = [
    new AdvancedTextLayer({
      id: 'text-layer',
      data
    })
  ];

  return (<DeckGL {...viewport} layers={[layer]} />);
};
```

### Data Accessors

##### `getText` (Function, optional)

- Default: `x => x.text`

Method called to retrieve the content of each text label.

##### `getPosition` (Function, optional)

- Default: `x => x.coordinates`

Method called to retrieve the location of each text label.

### Rendering Options

##### `getSize` (Function, optional)

- Default: `x => x.size || 32`

Method called to retrieve the size of each text label. Default value is 32 in pixel.

##### `getColor` (Function, optional)

- Default: `x => x.color || [0, 0, 0, 255]`

Method called to retrieve the color of each text label. Default value is black.

##### `getAngle` (Function, optional)

- Default: `x => x.angle || 0`

Method called to retrieve the angle to rotate (CCW) of each text label. Default value is 0.

##### `sizeScale` (Number, optional)

- Default: 1

Text size multiplier.

##### `fp64` (Boolean, optional)

- Default: `false`

Whether the layer should be rendered in high-precision 64-bit mode.

### Text Alignment Options
Not supported right now.

##### `getTextAnchor` (Function, optional)

- Default: `x => x.textAnchor || 'middle'`

Method called to specify the text anchor. Available options include `'start'`, `'middle'` and `'end'`.

##### `getAlignmentBaseline` (Function, optional)

- Default: `x => x.alignmentBaseline || 'center'`

Method called to specify the alignment baseline. Available options include `'top'`, `'center'` and `'bottom'`.

##### `getPixelOffset` (Function, optional)

- Default: `x.pixelOffset || [0, 0]`

Method called to specify screen space offset relative to the `coordinates` in pixel unit. This function is rarely used in common cases.

### Font Style and Character Set Support
You need to provide a png and a json.

