# \_ColorScaleWidget 🧪

<!-- -->

Displays experimental legends for SQL color accessors on visible layers. The widget discovers scales from drawable layers and their composite parents in the widget's view. It updates after accessor evaluation completes. The legend appears when a scale resolves. It shows category swatches, numeric intervals, or a continuous ramp with labels beside the scales. Hover over a ramp or quantile bin to see its value or range, color, and scale type.

```
import {_ColorScaleWidget} from '@deck.gl/widgets';

import '@deck.gl/widgets/stylesheet.css';



const widgets = [new _ColorScaleWidget()];
```

Pass `widgets` to Deck or DeckGL alongside layers using SQL color scales. The legend starts expanded. Select its heading to collapse or reopen it.

## Constructor[​](#constructor "Direct link to Constructor")

```
import {_ColorScaleWidget, type ColorScaleWidgetProps} from '@deck.gl/widgets';



new _ColorScaleWidget({categoricalLayout: 'wrap'} satisfies ColorScaleWidgetProps);
```

## Types[​](#types "Direct link to Types")

### `ColorScaleWidgetProps`[​](#colorscalewidgetprops "Direct link to colorscalewidgetprops")

The widget accepts the generic [`WidgetProps`](https://deck.gl/next/docs/api-reference/core/widget.md#widgetprops) and these options.

#### `label` (string, optional)[​](#label "Direct link to label")

* Default: `'Legend'`

Heading displayed above the scales.

#### `placement` (WidgetPlacement, optional)[​](#placement "Direct link to placement")

* Default: `'bottom-right'`

Position of the legend within its view.

#### `viewId` (string | null, optional)[​](#viewid "Direct link to viewid")

* Default: `null`

Limits the legend to the specified view. Use `null` to include scales from all views.

#### `precision` (number, optional)[​](#precision "Direct link to precision")

* Default: `2`

Starting number of significant digits for numeric labels and hover values, from 1 to 21. The legend uses more digits when needed to distinguish nearby breaks.

#### `categoricalLayout` ('vertical' | 'wrap', optional)[​](#categoricallayout "Direct link to categoricallayout")

* Default: `'vertical'`

Use `'vertical'` to show one swatch per row. Use `'wrap'` to place swatches side by side and start a new row when they run out of space.

## Source[​](#source "Direct link to Source")

[modules/widgets/src/color-scale-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/color-scale-widget.tsx)
