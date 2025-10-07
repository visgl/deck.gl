import {WidgetPreview} from '@site/src/doc-demos/widgets';
import {_LoadingWidget} from '@deck.gl/widgets';

# LoadingWidget (Experimental)

<img src="https://img.shields.io/badge/from-v9.2-green.svg?style=flat-square" alt="from v9.2" />

This widget shows a spinning indicator while any deck.gl layers are loading data.

## Usage

<WidgetPreview cls={_LoadingWidget}/>

```ts
import {Deck} from '@deck.gl/core';
import {_LoadingWidget as LoadingWidget} from '@deck.gl/widgets';

new Deck({
  widgets: [new LoadingWidget()]
});
```

## Types

### `LoadingWidgetProps` {#loadingwidgetprops}

The `InfoWidget` accepts the generic [`WidgetProps`](../core/widget.md#widgetprops) and:

#### `label` (string, optional) {#label}

* Default: `'Loading data'`

Tooltip message displayed while hovering a mouse over the widget.

## Source

[modules/widgets/src/loading-widget.tsx](https://github.com/visgl/deck.gl/tree/9.2-release/modules/widgets/src/loading-widget.tsx)
