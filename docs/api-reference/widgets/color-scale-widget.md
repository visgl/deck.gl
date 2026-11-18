# ColorScaleWidget

Displays legends for SQL color accessors on visible layers. The widget discovers
scales from the rendered layers, including composite sublayers, and updates after
their accessor evaluation completes. It shows category swatches, numeric intervals,
or a continuous ramp depending on the resolved scale.

```ts
import {ColorScaleWidget} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';

const widgets = [new ColorScaleWidget({placement: 'bottom-right'})];
```

Pass `widgets` to Deck or DeckGL alongside layers using SQL color scales.
The optional `label` prop sets the legend heading and defaults to `Color scales`.
