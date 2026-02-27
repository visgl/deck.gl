# SplitterWidget (Experimental)

<img src="https://img.shields.io/badge/from-v9.3-green.svg?style=flat-square" alt="from v9.3" />

import {SplitterWidgetDemo} from '@site/src/doc-demos/widgets';

<SplitterWidgetDemo />

This widget lets the user to resize multiple views (e.g., two map or globe views) across the deck.gl canvas, by draggable splitter handles between them. This widget will overwrite the `views` prop passed to Deck.

## Usage

```ts
import {_SplitterWidget as SplitterWidget} from '@deck.gl/widgets';
import {Deck} from '@deck.gl/core';
import {MapView} from '@deck.gl/core';

const deck = new Deck({
  layers: [],
  widgets: [
    new SplitterWidget({
      // style: DarkTheme,
      viewLayout: {
        orientation: 'horizontal',
        views: [
          new MapView({id: 'left', controller: true}),
          {
            orientation: 'vertical',
            views: [
              new MapView({id: 'right-top', controller: true}),
              new MapView({id: 'right-bottom', controller: true}),
            ],
          }
        ],
      }
    }),
  ]
});
```

### `SplitterWidgetProps` {#splitterwidgetprops}

The `SplitterWidget` accepts the generic [`WidgetProps`](../core/widget.md#widgetprops) and:

#### `viewLayout` (ViewLayout, required)

Layout descriptor of how views are arranged on the canvas. Contains the following fields:

- `views` ([View](../core/view.md)[]) - two view instances used to compose this layout. `x`, `y`, `width` and `height` of the views' props at render time will be resolved according to the following settings as well as user input.
- `orientation` (string, required) - the stacking orientation of the views. one of `'vertical'`, `'horizontal'`.
- `initialSplit` (number, optional) - The ratio of view1's share over the whole available height (vertical) or width (horizontal). Between 0-1. Default `0.5`.
- `editable` (boolean, optional) - Whether the split can be changed by dragging the border between the two views. Default `true`.
- `minSplit` (number, optional) - Min value of the split. The user cannot make the first view smaller than this ratio. Default `0.05`.
- `maxSplit` (number, optional) - Max value of the split. The user cannot make the first view larger than this ratio. Default `0.95`.

You may also replace one or both item in `views` with a `ViewLayout` object, composing more than two views into a complex layout.


#### `onChange` (Function, optional) {#onchange}

```ts
(views: View[]) => void
```

* Default: `() => {}`

Callback invoked during dragging with the updated view instances

#### `onDragStart` (Function, optional) {#ondragstart}

```ts
() => void
```

* Default: `() => {}`

Callback invoked when the user begins dragging the splitter.

#### `onDragEnd` (Function, optional) {#ondragend}

```ts
() => void
```

* Default: `() => {}`

Callback invoked when the user releases the splitter.

## Source

[modules/widgets/src/splitter-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/splitter-widget.tsx)