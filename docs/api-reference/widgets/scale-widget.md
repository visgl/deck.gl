import {WidgetPreview} from '@site/src/doc-demos/widgets';
import {_ScaleWidget} from '@deck.gl/widgets';

# ScaleWidget (Experimental)

<img src="https://img.shields.io/badge/from-v9.2-green.svg?style=flat-square" alt="from v9.2" />

This widget displays a dynamic cartographic scale bar that updates as the map view changes. It shows a horizontal line with end tick marks and a distance label, reflecting the current map scale based on zoom level and latitude.

## Usage

<WidgetPreview cls={_ScaleWidget}/>

```ts
import {_ScaleWidget as ScaleWidget} from '@deck.gl/widgets';
import {Deck} from '@deck.gl/core';

const deck = new Deck({
  widgets: [new ScaleWidget({placement: 'bottom-left', label: 'Scale'})]
});
```

# Types

### `ResetViewWidgetProps` {#resetviewwidgetprops}

The `ResetViewWidget` accepts the generic [`WidgetProps`](../core/widget.md#widgetprops) and:

#### `label` (string, optional) {#label}

* Default: `'Scale'`

Tooltip label for the widget.

## Source

[modules/widgets/src/scale-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/scale-widget.tsx)