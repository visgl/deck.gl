
# Tagmap Layer

The tagmap layer generates and visualizes [an occlusion-free label layout on map](https://github.com/rivulet-zhang/tagmap.js).

```js
import DeckGL from '@deck.gl/react';
import TagmapLayer from './tagmap-layer';

const App = ({data, viewport}) => {

  /**
   * Data format:
   * [
   *   {label: '#San Francisco', coordinates: [-122.425586, 37.775049], weight: 1},
   *   ...
   * ]
   */

  const layers = [
    new TagmapLayer({
      id: 'tagmap-layer',
      data
    })
  ];

  return (<DeckGL {...viewport} layers={[layer]} />);
};
```

## Properties

Tagmap Layer is extended based on [Composite Layer](/docs/api-reference/composite-layer.md).

### Render Options

##### `maxFontSize` (Number, optional)

- Default: `32`

The font size for the label of the maximal (aggregated) weight. Unit is pixel.

##### `minFontSize` (Number, optional)

- Default: `14`

The font size for the label of the minimal (aggregated) weight. Unit is pixel.

##### `weightThreshold` (Number, optional)

- Default: `1`

The minimal (aggregated) weight for labels to be visible on map.

##### `colorScheme` (Array, optional)

- Default: `['#1d91c0', '#41b6c4', '#7fcdbb', '#c7e9b4', '#edf8b1']`

(A sequential scheme from [ColorBrewer](http://colorbrewer2.org/) that looks OKAY with a dark map background)

A color scheme in hex format that is used to color-encode the (aggregated) weight of labels.

### Data Accessors

##### `getLabel` (Function, optional)

- Default: `x => x.label`

Method called to retrieve the label of each label.

##### `getWeight` (Function, optional)

- Default: `x => x.weight`

Method called to retrieve the weight of each label.

##### `getPosition` (Function, optional)

- Default: `x => x.coordinates`

Method called to retrieve the location of each label.
