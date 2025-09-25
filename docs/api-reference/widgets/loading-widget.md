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

The `LoadingWidget` accepts the generic [`WidgetProps`](../core/widget.md#widgetprops):

- `id` (default `'loading'`) -  Unique id for this widget
- `placement` (default `'top-left'`) - Widget position within the view relative to the map container
- `viewId` (default `null`) - The `viewId` prop controls how a widget interacts with views. 
- `style` (default `{}`) - Additional inline styles on the top HTML element.
- `className` (default `''`) - Additional classnames on the top HTML element.

## Props

#### `id` (string, optional) {#id}

Default: `'loading'`

The `id` must be unique among all your widgets at a given time. 

Note: It is necessary to set `id` explicitly if you have more than once instance of the same widget.

#### `placement` (string, optional) {#placement}

Default: `'top-left'`

Widget position within the view relative to the map container. Valid options are `top-left`, `top-right`, `bottom-left`, `bottom-right`, or `fill`.

#### `label` (string, optional) {#label}

Tooltip message displayed while hovering a mouse over the widget.

Default: `'Loading data'`

## Source

[modules/widgets/src/loading-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/loading-widget.tsx)
