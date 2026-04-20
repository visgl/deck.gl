# SplitterWidget (Experimental)

<img src="https://img.shields.io/badge/from-v9.3-green.svg?style=flat-square" alt="from v9.3" />

import {SplitterWidgetDemo} from '@site/src/doc-demos/widgets';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<SplitterWidgetDemo />

This widget lets the user to stack multiple views across the deck.gl canvas, and resize them by draggable splitter handles. This widget will only work if the `views` prop of Deck is unset.

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {_SplitterWidget as SplitterWidget} from '@deck.gl/widgets';
import {Deck, OrbitView} from '@deck.gl/core';
import '@deck.gl/widgets/stylesheet.css';

new Deck({
  initialViewState: {
    front: {target: [0, 0, 0], rotationX: 0, rotationOrbit: 90, zoom: 0},
    perspective: {target: [0, 0, 0], rotationX: 45, rotationOrbit: 30, zoom: 0}
  },
  widgets: [
    new SplitterWidget({
      viewLayout: {
        orientation: 'horizontal',
        views: [
          new OrbitView({id: 'front', orbitAxis: 'Z', orthographic: true, controller: true}),
          new OrbitView({id: 'perspective', orbitAxis: 'Z', controller: true})
        ]
      }
    })
  ]
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {_SplitterWidget as SplitterWidget} from '@deck.gl/widgets';
import {Deck, OrbitView, type OrbitViewState} from '@deck.gl/core';
import '@deck.gl/widgets/stylesheet.css';

new Deck<OrbitView[]>({
  initialViewState: {
    front: {target: [0, 0, 0], rotationX: 0, rotationOrbit: 90, zoom: 0} satisfies OrbitViewState,
    perspective: {target: [0, 0, 0], rotationX: 45, rotationOrbit: 30, zoom: 0} satisfies OrbitViewState
  },
  widgets: [
    new SplitterWidget<OrbitView[]>({
      viewLayout: {
        orientation: 'horizontal',
        views: [
          new OrbitView({id: 'front', orbitAxis: 'Z', orthographic: true, controller: true}),
          new OrbitView({id: 'perspective', orbitAxis: 'Z', controller: true})
        ]
      }
    })
  ]
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React from 'react';
import DeckGL, {_SplitterWidget as SplitterWidget} from '@deck.gl/react';
import {OrbitView, type OrbitViewState} from '@deck.gl/core';
import '@deck.gl/widgets/stylesheet.css';

function App() {
  return (
    <DeckGL
      initialViewState={{
        front: {target: [0, 0, 0], rotationX: 0, rotationOrbit: 90, zoom: 0} satisfies OrbitViewState,
        perspective: {target: [0, 0, 0], rotationX: 45, rotationOrbit: 30, zoom: 0} satisfies OrbitViewState
      }}
    >
      <SplitterWidget
        viewLayout={{
          orientation: 'horizontal',
          views: [
            new OrbitView({id: 'front', orbitAxis: 'Z', orthographic: true, controller: true}),
            new OrbitView({id: 'perspective', orbitAxis: 'Z', controller: true})
          ]
        }}
      />
    </DeckGL>
  );
}
```

  </TabItem>
  <TabItem value="react-controlled" label="React Controlled">

```tsx
import React, {useState} from 'react';
import DeckGL, {_SplitterWidget as SplitterWidget} from '@deck.gl/react';
import {MapView, type MapViewState, type View} from '@deck.gl/core';
import '@deck.gl/widgets/stylesheet.css';

function App() {
  const [views, setViews] = useState<View[]>([]);
  const [viewState, setViewState] = useState<Record<string, MapViewState>>({
    left: {longitude: -122.4, latitude: 37.8, zoom: 11},
    right: {longitude: -73.97, latitude: 40.77, zoom: 11}
  });

  return (
    <DeckGL
      views={views}
      viewState={viewState}
      onViewStateChange={({viewId, viewState: vs}) => {
        setViewState(prev => ({...prev, [viewId]: vs as MapViewState}));
      }}
    >
      <SplitterWidget
        viewLayout={{
          orientation: 'horizontal',
          views: [
            new MapView({id: 'left', controller: true}),
            new MapView({id: 'right', controller: true})
          ]
        }}
        onChange={setViews}
      />
    </DeckGL>
  );
}
```

  </TabItem>
</Tabs>

## Constructor

```ts
import {_SplitterWidget as SplitterWidget, type SplitterWidgetProps} from '@deck.gl/widgets';
new SplitterWidget<ViewType[]>({} satisfies SplitterWidgetProps);
```

## Types

### `SplitterWidgetProps` {#splitterwidgetprops}

The `SplitterWidget` accepts the generic [`WidgetProps`](../core/widget.md#widgetprops) and:

#### `viewLayout` (ViewLayout, required) {#viewlayout}

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
