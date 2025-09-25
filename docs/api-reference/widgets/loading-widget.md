import {WidgetPreview} from '@site/src/doc-demos/widgets';
import {_LoadingWidget} from '@deck.gl/widgets';

# LoadingWidget (Experimental)

<img src="https://img.shields.io/badge/from-v9.2-green.svg?style=flat-square" alt="from v9.2" />

This widget shows a spinning indicator while any deck.gl layers are loading data.

<WidgetPreview cls={_LoadingWidget}/>

```ts
import {_LoadingWidget as LoadingWidget} from '@deck.gl/widgets';
import {Deck} from '@deck.gl/core';

const deck = new Deck({
  widgets: [new LoadingWidget()]
});
```

## Types

### `LoadingWidgetProps` {#loadingwidgetprops}

The `InfoWidget` accepts the generic [`WidgetProps`](../core/widget.md#widgetprops) and:

#### `label` (string, optional) {#label}

Tooltip message displayed while hovering a mouse over the widget.

Default: `'Loading data'`

## Source

[modules/widgets/src/loading-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/loading-widget.tsx)
