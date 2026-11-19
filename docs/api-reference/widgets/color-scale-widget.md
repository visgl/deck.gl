# _ColorScaleWidget 🧪

import {ColorScaleWidgetDemo} from '@site/src/doc-demos/widgets';

<ColorScaleWidgetDemo />

Displays experimental legends for SQL color accessors on visible layers. The widget discovers
scales from drawable layers and their composite parents in the widget's view. It
updates after accessor evaluation completes. The legend appears when a scale resolves. It shows category swatches, numeric intervals,
or a continuous ramp and identifies the scale type.

```ts
import {_ColorScaleWidget} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';

const widgets = [new _ColorScaleWidget()];
```

Pass `widgets` to Deck or DeckGL alongside layers using SQL color scales.
The legend starts expanded. Select its heading to collapse or reopen it. The optional
`label` prop sets the heading and defaults to `Legend`.

Quantile bins appear side by side with numeric labels at their breaks. Set
`precision` to change the significant digits used for numbers. The legend starts
with two significant digits by default and uses more when needed to distinguish
nearby values.
