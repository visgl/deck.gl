import {WidgetPreview} from '@site/src/doc-demos/widgets';
import {_SplitterWidget} from '@deck.gl/widgets';

# SplitterWidget (Experimental)

<img src="https://img.shields.io/badge/from-v9.2-green.svg?style=flat-square" alt="from v9.2" />

This widget renders a draggable splitter line across the deck.gl canvas to divide two views. It supports both vertical and horizontal orientations, allowing users to compare two views (e.g., two map or globe views) by dragging the splitter handle.

<WidgetPreview cls={_SplitterWidget} props={{
  orientation: 'vertical',
  initialSplit: 0.5
}}/>

```ts
import {_SplitterWidget as SplitterWidget} from '@deck.gl/widgets';
import {Deck} from '@deck.gl/core';
import {MapView} from '@deck.gl/core';

const deck = new Deck({
  views: [
    new MapView({id: 'view1', /* view settings */}),
    new MapView({id: 'view2', /* view settings */})
  ],
  layers: [
    // layers for view1 and view2
  ],
  widgets: [
    new SplitterWidget({
      viewId1: 'view1',
      viewId2: 'view2',
      orientation: 'vertical',
      initialSplit: 0.5,
      onChange: split => console.log('Split:', split),
      onDragStart: () => console.log('Drag started'),
      onDragEnd: () => console.log('Drag ended')
    })
  ]
});
```

### `SplitterWidgetProps` {#splitterwidgetprops}

The `SplitterWidget` accepts the generic [`WidgetProps`](../core/widget.md#widgetprops) and:

#### `viewId1` (string, required) {#viewid1}

The `id` of the first (resizable) view.

#### `viewId2` (string, required) {#viewid2}

The `id` of the second view to compare against.

#### `orientation` ('vertical' | 'horizontal', optional) {#orientation}

Default: `'vertical'`

Orientation of the splitter line. Use `vertical` for side-by-side comparison or `horizontal` for top-bottom.

#### `initialSplit` (number, optional) {#initialsplit}

Default: `0.5`

Initial split ratio (between 0 and 1) for the first view.

#### `onChange` (Function, optional) {#onchange}

`(newSplit: number) => void`

Callback invoked during dragging with the updated split ratio.

#### `onDragStart` (Function, optional) {#ondragstart}

`() => void`

Callback invoked when the user begins dragging the splitter.

#### `onDragEnd` (Function, optional) {#ondragend}

`() => void`

Callback invoked when the user releases the splitter.

## Source

[modules/widgets/src/splitter-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/splitter-widget.tsx)